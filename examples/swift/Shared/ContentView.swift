import SwiftUI
import BuilderIO

class BuilderContentWrapper: ObservableObject {
    var content: BuilderContent? = nil;
    init(content: BuilderContent? = nil) {
        self.content = content
    }
    
    func changeContent(_ newValue: BuilderContent?) {
        self.content = newValue;
        self.objectWillChange.send();
    }
}

struct ContentView: View {
    @ObservedObject var content: BuilderContentWrapper = BuilderContentWrapper();
    
    init() {
        registerComponent(name: "HeroComponent", factory: { (options, styles) in
            return HeroComponent(headingText: options["headingText"].stringValue, ctaText: options["ctaText"].stringValue)
        });
        fetchContent()
    }
    
    func fetchContent() {
        Content.getContent(model: "page", apiKey: "e084484c0e0241579f01abba29d9be10", url: "/custom-components", locale: "", preview: "") { content in
            DispatchQueue.main.async {
                self.content.changeContent(content);
            }
        }
    }
    
    var body: some View {
        ScrollView {
            if $content.content.wrappedValue != nil {
                RenderContent(content: $content.content.wrappedValue!)
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
