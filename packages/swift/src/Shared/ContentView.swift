import SwiftUI


struct ContentView: View {
    @State var content: BuilderContent? = nil
    
    init() {
        fetchContent()
    }
    
    func fetchContent() {
        getContent(model: "page", apiKey: "e084484c0e0241579f01abba29d9be10", url: "/") { content in
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
