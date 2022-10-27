import SwiftUI

@available(iOS 14.0, macOS 10.15, *)
struct BuilderButton: View {
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
        HStack(spacing: 0) {
            Button(getTextWithoutHtml(text)) {print(getTextWithoutHtml(text))}
        }.frame(maxWidth: .infinity)
    }
}

/*
 import SwiftUI

 struct ContentView: View {
     var body: some View {
         VStack {
             Text("By tapping Done, you agree to the ")
             HStack(spacing: 0) {
                 Button("privacy policy") {}
                 Text(" and ")
                 Button("terms of service") {}
                 Text(".")
             }
         }
     }
 }

 */
