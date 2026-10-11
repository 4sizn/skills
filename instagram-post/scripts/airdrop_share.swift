import AppKit
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let app = NSApplication.shared
app.setActivationPolicy(.regular)
class D: NSObject, NSSharingServiceDelegate {
  func sharingService(_ s: NSSharingService, didShareItems items: [Any]) { print("SHARED"); exit(0) }
  func sharingService(_ s: NSSharingService, didFailToShareItems items: [Any], error: Error) { print("FAILED \(error)"); exit(1) }
}
let d = D()
DispatchQueue.main.async {
  guard let svc = NSSharingService(named: .sendViaAirDrop) else { print("no airdrop"); exit(2) }
  svc.delegate = d
  app.activate(ignoringOtherApps: true)
  svc.perform(withItems: [url])
}
DispatchQueue.main.asyncAfter(deadline: .now() + 120) { print("TIMEOUT"); exit(3) }
app.run()
