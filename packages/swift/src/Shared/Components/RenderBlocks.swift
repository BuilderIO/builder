import SwiftUI

struct RenderBlocks: View {
    var blocks: [BuilderBlock]
    
    var body: some View {
        ForEach(blocks, id: \.id) { block in
            RenderBlock(block: block)
        }
    }
}
