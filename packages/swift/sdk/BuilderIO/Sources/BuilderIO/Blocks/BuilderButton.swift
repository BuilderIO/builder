import SwiftUI
import WebKit

@available(iOS 15.0, macOS 10.15, *)
struct BuilderButton: View {
    var text: String
    var urlStr: String?
    var openInNewTab: Bool = false
    var responsiveStyles: BuilderBlockResponsiveStyles? = BuilderBlockResponsiveStyles() // for outer style of the component

    @State private var showWebView = false
    
    var body: some View {
        
        let textAlignValue = getStyleValue("textAlign")
        let marginLeft = getFloatValue(cssString:getStyleValue("marginLeft") ?? "0px") ?? 0
        let marginTop = getFloatValue(cssString:getStyleValue("marginTop") ?? "0px") ?? 0
        let marginRight = getFloatValue(cssString:getStyleValue("marginRight") ?? "0px") ?? 0
        let marginBottom = getFloatValue(cssString:getStyleValue("marginBottom") ?? "0px") ?? 0
        let cornerRadius = getFloatValue(cssString:getStyleValue("borderRadius") ?? "0px") ?? 0
        let fontWeight = getFontWeight(weight: Int(getFloatValue(cssString:getStyleValue("fontWeight") ?? "300") ?? 30))
        let fontSize = getFloatValue(cssString:getStyleValue("fontSize") ?? "20.0") ?? 0

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
            .sheet(isPresented: $showWebView) {
                if let str = urlStr, let url = URL(string: str) {
                    WebView(url: url)
                }
            }
            .padding(EdgeInsets(top: getDirectionStyleValue("padding", "Top"), leading: getDirectionStyleValue("padding", "Left"), bottom: getDirectionStyleValue("padding", "Bottom"), trailing: getDirectionStyleValue("padding", "Right"))) // margin
            .foregroundColor(getColor(propertyName: "color"))
            .background(RoundedRectangle(cornerRadius: cornerRadius).fill(getColor(propertyName: "backgroundColor") ?? .black))
            .multilineTextAlignment(textAlignValue == "center" ? .center : textAlignValue == "right" ? .trailing : .leading)
            .font(.system(size: fontSize, weight: fontWeight, design: .default))
        }
        .padding(EdgeInsets(top: marginTop, leading: marginLeft, bottom: marginBottom, trailing: marginRight)) // margin
    }
    
    func getColor(propertyName: String) -> Color? {
        let value = getStyles()?[propertyName]
        if value != nil {
            if value == "red" {
                return Color.red
            } else if value == "blue" {
                return Color.blue
            } else if value == "white" {
                return Color.white
            } else if value == "gray" {
                return Color.gray
            } else if value == "black" {
                return Color.black
            }
            
            
            let allMatches = matchingStrings(string: value!, regex: "rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*(\\d+)\\)");
            if allMatches.count>0 {
                let matches = allMatches[0]
                
                if (matches.count > 3) {
                    return Color(red: Double(matches[1])! / 255, green: Double(matches[2])! / 255, blue: Double(matches[3])! / 255, opacity: Double(matches[4])!)
                }
            }
        } else {
            return Color.black
        }
        return nil
    }
    
    func getStyleValue(_ property: String) -> String? {
        let styles = getStyles()
        return styles?[property]
    }
    
    func getDirectionStyleValue(_ type: String, _ direction: String) -> CGFloat {
        let styles = getStyles()
        var paddingStr = styles?[type + direction]
        if (paddingStr == nil) {
            paddingStr = styles?[type] // TODO: handle muti value padding shorthand
        }
        if (paddingStr != nil) {
            if let num = getFloatValue(cssString: paddingStr!) {
                return num
            }
        }
        
        return 0
    }
    
    func getStyles() -> [String:String]? {
        let step1 = (responsiveStyles?.large ?? [:]).merging(responsiveStyles?.medium ?? [:]) { (_, new) in new }
        let step2 = step1.merging(responsiveStyles?.small ?? [:]) { (_, new) in new }
        
        return step2
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
