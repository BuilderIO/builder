import SwiftUI
import WebKit

@available(iOS 15.0, macOS 10.15, *)
struct BuilderText: View {
    var text: String
    @State var htmlText = "<html><body><h1>Hello World</h1></body></html>"
    var responsiveStyles: BuilderBlockResponsiveStyles? = BuilderBlockResponsiveStyles() // for outer style of the component
    let css = "body { background-color : #ff0000 }"
    
    // TODO: actually handle HTML
    func getTextWithoutHtml(_ text: String) -> String {
        
        if let regex = try? NSRegularExpression(pattern: "<.*?>") { // TODO: handle decimals
            let newString = regex.stringByReplacingMatches(in: text, options: .withTransparentBounds, range: NSMakeRange(0, text.count ), withTemplate: "")
            
            return newString
        }
        
        return ""
    }
    
    func getStyles(responsiveStyles:BuilderBlockResponsiveStyles) -> [String:String]? {
        let step1 = (responsiveStyles.large ?? [:]).merging(responsiveStyles.medium ?? [:]) { (_, new) in new }
        let step2 = step1.merging(responsiveStyles.small ?? [:]) { (_, new) in new }
        
        return step2
    }
    
    var body: some View {
        let js = "var style = document.createElement('style'); style.innerHTML = '\(css)'; document.head.appendChild(style);"
                
        VStack {
            WebVieww(text: $htmlText, jsString: js)
                .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, idealHeight: 400, maxHeight: .infinity, alignment: .center)
//                .padding()
        }.onAppear {
            htmlText = text
        }
        //        Text(getTextWithoutHtml(text))
        //            .frame(maxWidth: .infinity)
    }
}

@available(iOS 13.0, *)
struct WebVieww: UIViewRepresentable {
    
    @Binding var text: String
    var jsString: String
    
    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        uiView.loadHTMLString(text, baseURL: nil)
        uiView.evaluateJavaScript(jsString)
    }
    
}
//struct ContentView_Previews: PreviewProvider {
//  static var previews: some View {
//    ContentView()
//  }
//}
