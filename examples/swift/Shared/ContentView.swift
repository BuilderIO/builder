import SwiftUI
import BuilderIO

struct ContentView: View {
    @State var content: BuilderContent? = nil
    
    init() {
        registerComponent(name: "HeroComponent", factory: { (options, styles) in
            return HeroComponent(headingText: options["headingText"].stringValue, ctaText: options["ctaText"].stringValue)
        });
        fetchContent()
    }
    
    func fetchContent() {
        Content.getContent(model: "page", apiKey: "e084484c0e0241579f01abba29d9be10", url: "/custom-components") { content in
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
        ContentView()
    }
}
