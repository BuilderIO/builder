import SwiftUI
import BuilderIO

struct ContentView: View {
    @ObservedObject var content: BuilderContentWrapper = BuilderContentWrapper();
    
    init() {
        registerComponent(name: "HeroComponent", factory: { (options, styles) in
            return HeroComponent(headingText: options["headingText"].stringValue, ctaText: options["ctaText"].stringValue)
        });
        fetchContent()
    }
    
    func fetchContent() {
        print("TRIGGER FETCH CONTENT")
        
        let isAppetize = UserDefaults.standard.bool(forKey: "isAppetize");
        print("IS APPETIZE??", isAppetize);
        let contentId = UserDefaults.standard.string(forKey: "builderContentId") ?? "NO CONTENT ID";
        let modelName = UserDefaults.standard.string(forKey: "builderModelName") ?? "NO MODEL NAME";
        
        let modelId = UserDefaults.standard.string(forKey: "builderModelId") ?? "NO MODEL ID";
        print("FETCH CONtent iN APP", isAppetize, contentId, modelName, modelId);
        
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
        
        if (Content.isPreviewing()) {
            Button("Reload") {
                fetchContent();
            }.onReceive(NotificationCenter.default.publisher(for: deviceDidShakeNotification)) { _ in
                fetchContent()
                
            }
        }
        
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
