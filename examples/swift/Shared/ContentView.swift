import SwiftUI
import SwiftyJSON
import BuilderIO

@available(iOS 15.0, macOS 10.15, *)
struct ContentView: View {
    @State var content: BuilderContent? = nil
    
    init() {
        fetchContent()
    }
    
    func fetchContent() {
        Content.getContent(model: "page", apiKey: "e084484c0e0241579f01abba29d9be10", url: "/buttons") { content in
            self.content = content
        }
    }
    
    var body: some View {
        ScrollView {
            if $content.wrappedValue != nil {
                RenderContent(content: $content.wrappedValue!)
            }
        }
        
        Button("Reload") {
            fetchContent()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        if #available(iOS 15.0, *) {
            ContentView()
        } else {
            // Fallback on earlier versions
        }
    }
}
