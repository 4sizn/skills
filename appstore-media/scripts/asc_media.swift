// App Store Connect media + featuring client (companion to appstore-aso/asc.swift — same auth env).
// Auth (env): ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY_PATH (defaults to ~/.appstoreconnect/private_keys/AuthKey_<KEY_ID>.p8).
//
// Usage:
//   swift asc_media.swift status   --bundle-id com.example.app
//   swift asc_media.swift previews --bundle-id com.example.app --locale en-US --file preview.mp4 [--type IPHONE_67] [--frame 00:00:05:00] [--replace]
//   swift asc_media.swift nominations [--state DRAFT|SUBMITTED|ARCHIVED]
//   swift asc_media.swift nominate --bundle-id com.example.app --in nomination.json [--submit]
import Foundation
import CryptoKit

// MARK: - Small helpers

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(("asc: " + message + "\n").data(using: .utf8)!)
    exit(1)
}

func base64URL(_ data: Data) -> String {
    data.base64EncodedString().replacingOccurrences(of: "+", with: "-")
        .replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "=", with: "")
}

struct Args {
    private var values: [String: String] = [:]
    let command: String
    var flags: Set<String> = []
    init() {
        var raw = Array(CommandLine.arguments.dropFirst())
        guard let command = raw.first, !command.hasPrefix("--") else { fail("usage: swift asc_media.swift <status|previews|nominations|nominate> [options]") }
        self.command = command
        raw = Array(raw.dropFirst())
        var index = 0
        while index < raw.count {
            let key = raw[index]
            guard key.hasPrefix("--") else { index += 1; continue }
            let name = String(key.dropFirst(2))
            if index + 1 < raw.count, !raw[index + 1].hasPrefix("--") {
                values[name] = raw[index + 1]; index += 2
            } else {
                flags.insert(name); index += 1
            }
        }
    }
    func value(_ name: String) -> String? { values[name] }
    func require(_ name: String) -> String {
        guard let value = values[name] else { fail("missing --\(name)") }
        return value
    }
    func has(_ name: String) -> Bool { flags.contains(name) }
}

// MARK: - Token

func makeToken() -> String {
    guard let keyID = ProcessInfo.processInfo.environment["ASC_KEY_ID"] else { fail("set ASC_KEY_ID") }
    let individual = ProcessInfo.processInfo.environment["ASC_INDIVIDUAL"] == "1"
    let issuer = ProcessInfo.processInfo.environment["ASC_ISSUER_ID"]
    if !individual && issuer == nil { fail("set ASC_ISSUER_ID (or ASC_INDIVIDUAL=1 for an individual key)") }
    let home = FileManager.default.homeDirectoryForCurrentUser.path
    let path = ProcessInfo.processInfo.environment["ASC_PRIVATE_KEY_PATH"]
        ?? "\(home)/.appstoreconnect/private_keys/AuthKey_\(keyID).p8"
    guard let pem = try? String(contentsOfFile: path, encoding: .utf8) else { fail("cannot read private key: \(path)") }
    guard let key = try? P256.Signing.PrivateKey(pemRepresentation: pem) else { fail("private key is not a valid .p8 EC key: \(path)") }

    let header: [String: Any] = ["alg": "ES256", "kid": keyID, "typ": "JWT"]
    var payload: [String: Any] = [
        "iat": Int(Date().timeIntervalSince1970),
        "exp": Int(Date().addingTimeInterval(20 * 60).timeIntervalSince1970),
        "aud": "appstoreconnect-v1",
    ]
    if individual { payload["sub"] = "user" } else { payload["iss"] = issuer! }
    let headerData = try! JSONSerialization.data(withJSONObject: header, options: [.sortedKeys])
    let payloadData = try! JSONSerialization.data(withJSONObject: payload, options: [.sortedKeys])
    let signingInput = base64URL(headerData) + "." + base64URL(payloadData)
    let signature = try! key.signature(for: Data(signingInput.utf8))
    return signingInput + "." + base64URL(signature.rawRepresentation)
}

let token = makeToken()

// MARK: - HTTP

@discardableResult
func request(_ method: String, _ url: String, body: [String: Any]? = nil,
             headers: [String: String] = [:], raw: Data? = nil, expect: Set<Int> = [200, 201, 204],
             auth: Bool = true) -> [String: Any] {
    let full = url.hasPrefix("http") ? url : "https://api.appstoreconnect.apple.com" + url
    var req = URLRequest(url: URL(string: full)!)
    req.httpMethod = method
    // Upload operations go to Apple's object storage with their own presigned headers; an ASC bearer token breaks them.
    if auth { req.setValue("Bearer " + token, forHTTPHeaderField: "Authorization") }
    if let body {
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try! JSONSerialization.data(withJSONObject: body)
    }
    if let raw { req.httpBody = raw }
    for (key, value) in headers { req.setValue(value, forHTTPHeaderField: key) }

    var result: [String: Any] = [:]
    var failure: String?
    let done = DispatchSemaphore(value: 0)
    URLSession.shared.dataTask(with: req) { data, response, error in
        defer { done.signal() }
        if let error { failure = error.localizedDescription; return }
        let code = (response as? HTTPURLResponse)?.statusCode ?? 0
        let text = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        guard expect.contains(code) else {
            failure = "HTTP \(code) on \(method) \(full)\n\(text.prefix(1200))"
            return
        }
        if let data, !data.isEmpty, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            result = json
        }
    }.resume()
    done.wait()
    if let failure { fail(failure) }
    return result
}

func list(_ url: String) -> [[String: Any]] {
    var out: [[String: Any]] = []
    var next: String? = url
    while let page = next {
        let json = request("GET", page)
        out += (json["data"] as? [[String: Any]]) ?? []
        next = ((json["links"] as? [String: Any])?["next"]) as? String
    }
    return out
}

func attributes(_ item: [String: Any]) -> [String: Any] { (item["attributes"] as? [String: Any]) ?? [:] }
func identifier(_ item: [String: Any]) -> String { (item["id"] as? String) ?? "" }

// MARK: - App lookup

func findApp(bundleID: String) -> [String: Any] {
    let apps = list("/v1/apps?filter[bundleId]=\(bundleID)&limit=200")
    guard let app = apps.first else { fail("no app with bundle ID \(bundleID) on this account — create it in App Store Connect first") }
    return app
}

/// The version that can still be edited: the one not yet released.
func editableVersion(appID: String) -> [String: Any] {
    let editable: Set<String> = ["PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED", "METADATA_REJECTED",
                                 "WAITING_FOR_REVIEW", "INVALID_BINARY", "READY_FOR_REVIEW"]
    let versions = list("/v1/apps/\(appID)/appStoreVersions?filter[platform]=IOS&limit=50")
    guard let version = versions.first(where: { editable.contains((attributes($0)["appStoreState"] as? String) ?? "") })
        ?? versions.first else { fail("no App Store version found for this app") }
    return version
}

let args = Args()

func upload(_ data: Data, operations: [[String: Any]], name: String) {
    for operation in operations {
        guard let target = operation["url"] as? String, let method = operation["method"] as? String,
              let offset = operation["offset"] as? Int, let length = operation["length"] as? Int else { fail("malformed upload operation for \(name)") }
        var headers: [String: String] = [:]
        for header in (operation["requestHeaders"] as? [[String: Any]]) ?? [] {
            if let key = header["name"] as? String, let value = header["value"] as? String { headers[key] = value }
        }
        request(method, target, headers: headers, raw: data.subdata(in: offset..<(offset + length)), expect: [200, 201, 204], auth: false)
    }
}

switch args.command {
case "status":
    let app = findApp(bundleID: args.require("bundle-id"))
    let version = editableVersion(appID: identifier(app))
    print("app: \(attributes(app)["name"] ?? "") (\(identifier(app)))")
    print("version: \(attributes(version)["versionString"] ?? "")  state: \(attributes(version)["appStoreState"] ?? "")")
    for loc in list("/v1/appStoreVersions/\(identifier(version))/appStoreVersionLocalizations?limit=50") {
        let sets = list("/v1/appStoreVersionLocalizations/\(identifier(loc))/appPreviewSets?limit=50")
        // Type plus Apple's processing state per preview, e.g. IPHONE_67[COMPLETE].
        let types = sets.map { set -> String in
            let states = list("/v1/appPreviewSets/\(identifier(set))/appPreviews?limit=10").map {
                ((attributes($0)["assetDeliveryState"] as? [String: Any])?["state"] as? String) ?? "?"
            }
            return "\((attributes(set)["previewType"] as? String) ?? "?")\(states)"
        }
        print("  \(attributes(loc)["locale"] ?? "")  previews: \(types)")
    }

case "new-version":
    // Draft only: Apple copies the previous version's localizations; nothing is submitted for review.
    let app = findApp(bundleID: args.require("bundle-id"))
    let versionString = args.require("version")
    let created = request("POST", "/v1/appStoreVersions", body: ["data": [
        "type": "appStoreVersions", "attributes": ["platform": "IOS", "versionString": versionString],
        "relationships": ["app": ["data": ["type": "apps", "id": identifier(app)]]],
    ]])
    let item = (created["data"] as? [String: Any]) ?? [:]
    print("created version \(versionString) (\(identifier(item))) state: \(attributes(item)["appStoreState"] ?? "")")

case "previews":
    let locale = args.require("locale")
    let path = args.require("file")
    let previewType = args.value("type") ?? "IPHONE_67"
    let app = findApp(bundleID: args.require("bundle-id"))
    let version = editableVersion(appID: identifier(app))
    let state = (attributes(version)["appStoreState"] as? String) ?? ""
    // Media on a version under review / released is locked; ASC would reject the change anyway.
    guard ["PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED", "METADATA_REJECTED"].contains(state) else {
        fail("version \(attributes(version)["versionString"] ?? "") is \(state) — previews can only change on a version in PREPARE_FOR_SUBMISSION (or rejected). Create the next version first.")
    }
    let localizations = list("/v1/appStoreVersions/\(identifier(version))/appStoreVersionLocalizations?limit=50")
    guard let localization = localizations.first(where: { attributes($0)["locale"] as? String == locale }) else { fail("locale \(locale) not on this version") }
    let sets = list("/v1/appStoreVersionLocalizations/\(identifier(localization))/appPreviewSets?limit=50")
    var setID: String
    if let existing = sets.first(where: { attributes($0)["previewType"] as? String == previewType }) {
        setID = identifier(existing)
        if args.has("replace") {
            for p in list("/v1/appPreviewSets/\(setID)/appPreviews?limit=10") { request("DELETE", "/v1/appPreviews/\(identifier(p))") }
            print("removed existing \(previewType) previews")
        }
    } else {
        let created = request("POST", "/v1/appPreviewSets", body: ["data": [
            "type": "appPreviewSets", "attributes": ["previewType": previewType],
            "relationships": ["appStoreVersionLocalization": ["data": ["type": "appStoreVersionLocalizations", "id": identifier(localization)]]],
        ]])
        guard let newID = (created["data"] as? [String: Any])?["id"] as? String else { fail("preview set was not created") }
        setID = newID
    }
    guard let data = FileManager.default.contents(atPath: path) else { fail("cannot read \(path)") }
    let name = URL(fileURLWithPath: path).lastPathComponent
    var attrs: [String: Any] = ["fileSize": data.count, "fileName": name, "mimeType": "video/mp4"]
    if let frame = args.value("frame") { attrs["previewFrameTimeCode"] = frame }
    let reserved = request("POST", "/v1/appPreviews", body: ["data": [
        "type": "appPreviews", "attributes": attrs,
        "relationships": ["appPreviewSet": ["data": ["type": "appPreviewSets", "id": setID]]],
    ]])
    guard let item = reserved["data"] as? [String: Any] else { fail("no reservation for \(name)") }
    upload(data, operations: (attributes(item)["uploadOperations"] as? [[String: Any]]) ?? [], name: name)
    let checksum = Insecure.MD5.hash(data: data).map { String(format: "%02x", $0) }.joined()
    request("PATCH", "/v1/appPreviews/\(identifier(item))", body: ["data": [
        "type": "appPreviews", "id": identifier(item), "attributes": ["uploaded": true, "sourceFileChecksum": checksum],
    ]])
    print("uploaded \(name) → \(previewType) / \(locale) (Apple processes the video; check status in a few minutes)")

case "nominations":
    let state = args.value("state") ?? "SUBMITTED"
    for n in list("/v1/nominations?filter[state]=\(state)&limit=50") {
        let a = attributes(n)
        print("\(identifier(n))  \(a["state"] ?? "")  \(a["type"] ?? "")  start=\(a["publishStartDate"] ?? "")  \(a["name"] ?? "")")
    }

case "nominate":
    let app = findApp(bundleID: args.require("bundle-id"))
    guard let data = FileManager.default.contents(atPath: args.require("in")),
          var attrs = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { fail("--in must be a JSON object of nomination attributes") }
    attrs["submitted"] = false
    let created = request("POST", "/v1/nominations", body: ["data": [
        "type": "nominations", "attributes": attrs,
        "relationships": ["relatedApps": ["data": [["type": "apps", "id": identifier(app)]]]],
    ]])
    guard let id = (created["data"] as? [String: Any])?["id"] as? String else { fail("nomination not created") }
    print("draft nomination \(id)")
    if args.has("submit") {
        request("PATCH", "/v1/nominations/\(id)", body: ["data": ["type": "nominations", "id": id, "attributes": ["submitted": true]]])
        print("submitted \(id)")
    }

default:
    fail("unknown command \(args.command)")
}
