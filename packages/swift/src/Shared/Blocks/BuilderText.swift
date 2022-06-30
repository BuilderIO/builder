import SwiftUI

struct BuilderText: View {
    var text: String
    
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
