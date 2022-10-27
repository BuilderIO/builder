import SwiftUI

@available(iOS 14.0, macOS 10.15, *)
struct RenderBlocks: View {
    var blocks: [BuilderBlock]
    
    var body: some View {
        ForEach(blocks, id: \.id) { block in
            RenderBlock(block: block)
        }
    }
}
