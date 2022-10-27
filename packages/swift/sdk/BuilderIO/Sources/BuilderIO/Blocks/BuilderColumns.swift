import Foundation
import SwiftUI

struct BuilderColumn: Codable {
    var blocks: [BuilderBlock] = []
}

@available(iOS 14.0, macOS 10.15, *)
struct BuilderColumns: View {
    var columns: [BuilderColumn]
    var space: CGFloat = 0
    
    @available(iOS 14.0, *)
    var body: some View {
        HStack(alignment: .top, spacing: space) {
            ForEach(0...columns.count - 1, id: \.self) { index in
                VStack {
                    
                    
                    let blocks = columns[index].blocks
                    RenderBlocks(blocks: blocks)
                    
                }.frame(minWidth: 0, maxWidth: .infinity)
            }
        }
    }
}
