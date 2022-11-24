import SwiftUI

@available(iOS 15.0, macOS 10.15, *)
public struct RenderContent: View {
    static var registered = false;
    
    public init(content: BuilderContent) {
        self.content = content
        if (!RenderContent.registered) {
            // TODO: move these out of here?
            registerComponent(name: "Text", factory: { options in
                print("Text \n titleString = "+options["text"].stringValue+" \n options = \(options)")
                return BuilderText(text: options["text"].stringValue)
            })
            registerComponent(name: "Image", factory: { options in
                return BuilderImage(image: options["image"].stringValue, backgroundSize: options["backgroundSize: <#T##String#>"].stringValue)
            })
            registerComponent(name: "Core:Button", factory: { options in
                for block in content.data.blocks {
                    if(options["text"] == block.component?.options?["text"]) {
                        return BuilderButton(text: options["text"].stringValue, urlStr: options["link"].stringValue, openInNewTab: options["openLinkInNewTab"].boolValue, responsiveStyles: block.responsiveStyles)
                    }
                }
                
                print("button text =  \(options["text"].stringValue) + responsiveStyles = \(content.data)")
                // The below code will not be executed but written to avoid error.
                return BuilderButton(text: options["text"].stringValue, urlStr: options["link"].stringValue, openInNewTab: options["openLinkInNewTab"].boolValue, responsiveStyles: content.data.blocks[0].responsiveStyles)
            })
            registerComponent(name: "Columns", factory: { options in
                let decoder = JSONDecoder()
                let jsonString = options["columns"].rawString()!
                let columns = try! decoder.decode([BuilderColumn].self, from: Data(jsonString.utf8))
                return BuilderColumns(columns: columns, space: CGFloat(options["space"].floatValue))
            })
            
            registerComponent(name: "Video", factory: { options in
                let decoder = JSONDecoder()
                let jsonString = options["video"].rawString()!
                print("video jsonString = \(jsonString)")
//                let videoURL = try! decoder.decode([BuilderColumn].self, from: Data(jsonString.utf8))
                
                return BuilderVideo()
            })
            RenderContent.registered = true
        }
        
    }
    
    var content: BuilderContent
    
    public var body: some View {
        VStack(alignment: .leading) {
            RenderBlocks(blocks: content.data.blocks)
        }
    }
}
