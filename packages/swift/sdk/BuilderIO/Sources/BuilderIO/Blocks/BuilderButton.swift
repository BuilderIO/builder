import SwiftUI
import WebKit

@available(iOS 15.0, macOS 10.15, *)
struct BuilderButton: View {
    var text: String
    var urlStr: String?
    var openInNewTab: Bool = false
    var responsiveStyles: BuilderBlockResponsiveStyles? = BuilderBlockResponsiveStyles() // for outer style of the component

    @State private var showWebView = false
    
    // TODO: actually handle HTML
    func getTextWithoutHtml(_ text: String) -> String {
        if let regex = try? NSRegularExpression(pattern: "<.*?>") { // TODO: handle decimals
            let newString = regex.stringByReplacingMatches(in: text, options: .withTransparentBounds, range: NSMakeRange(0, text.count ), withTemplate: "")
            
            return newString
        }
        
        return ""
    }
    
    var body: some View {
        HStack(spacing: 0) {
            Button(action: {
                print(getTextWithoutHtml(text))
                // print("responsiveStyles = \(String(describing: responsiveStyles))")
                if let str = urlStr, let url = URL(string: str) {
                    self.showWebView = !openInNewTab
                    if openInNewTab == true {
                        UIApplication.shared.open(url)
                    }
                }
            }) {
                Text(getTextWithoutHtml(text))
            }
            .padding(EdgeInsets(top: 15, leading: 45, bottom: 15, trailing: 45)) // margin
            .sheet(isPresented: $showWebView) {
                if let str = urlStr, let url = URL(string: str) {
                    WebView(url: url)
                }
            }
//            .frame(maxWidth: .infinity)
        }
//        .frame(maxWidth: .infinity)
    }
}

@available(iOS 15.0, *)
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

@available(iOS 15.0, *)
struct WebView: UIViewRepresentable {
    typealias UIViewType = WKWebView

    var url: URL

    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }
}
