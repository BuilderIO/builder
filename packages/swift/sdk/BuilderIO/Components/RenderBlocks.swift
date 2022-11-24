import SwiftUI

@available(iOS 15.0, macOS 10.15, *)
struct RenderBlocks: View {
    var blocks: [BuilderBlock]
    
    var body: some View {
        ForEach(blocks, id: \.id) { block in
            RenderBlock(block: block)
        }
    }
}
