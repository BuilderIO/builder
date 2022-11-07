import SwiftUI

@available(iOS 15.0, macOS 10.15, *)
struct BuilderText: View {
    var text: String
    var responsiveStyles: BuilderBlockResponsiveStyles? = BuilderBlockResponsiveStyles() // for outer style of the component

    // TODO: actually handle HTML
    func getTextWithoutHtml(_ text: String) -> String {
        if let regex = try? NSRegularExpression(pattern: "<.*?>") { // TODO: handle decimals
            let newString = regex.stringByReplacingMatches(in: text, options: .withTransparentBounds, range: NSMakeRange(0, text.count ), withTemplate: "")
            
            return newString
        }
        
        return ""
    }
    
    var body: some View {
        Text(getTextWithoutHtml(text))
            .frame(maxWidth: .infinity)
    }
}
