import SwiftUI
import SwiftyJSON


struct ContentView: View {
    init() {
        initContent()
        
    }
    
    func initContent() {
        testing.getContent(model: "page", apiKey: "e084484c0e0241579f01abba29d9be10", url: "/") { content in
            self.content.value = content
        }
    }
    
    @ObservedObject var content = ContentTracker()
    
    
    func getContent() -> BuilderContent? {
        if content.value != nil {
            return content.value
        }
        
        return nil
    }
    
    
    var body: some View {
        ScrollView {
            RenderContent(content: $content.value.wrappedValue!)
        }
        Button("Reload") {
            initContent()
        }
    }
}

final class ContentTracker: ObservableObject {
    @Published var value: BuilderContent?;
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
