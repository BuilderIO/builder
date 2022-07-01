import SwiftUI

struct RenderContent: View {
    static var registered = false;
    
    init(content: BuilderContent) {
        self.content = content
        if (!RenderContent.registered) {
            // TODO: move these out of here?
            registerComponent(name: "Text", factory: { options in
                return BuilderText(text: options["text"].stringValue)
            })
            registerComponent(name: "Image", factory: { options in
                return BuilderImage(image: options["image"].stringValue, backgroundSize: options["backgroundSize: <#T##String#>"].stringValue)
            })
            registerComponent(name: "Columns", factory: { options in
                let decoder = JSONDecoder()
                let jsonString = options["columns"].rawString()!
                let columns = try! decoder.decode([BuilderColumn].self, from: Data(jsonString.utf8))
                return BuilderColumns(columns: columns, space: CGFloat(options["space"].floatValue))
            })
            RenderContent.registered = true
        }
        
    }
    
    var content: BuilderContent
    
    var body: some View {
        VStack(alignment: .leading) {
            RenderBlocks(blocks: content.data.blocks)
        }
    }
}
