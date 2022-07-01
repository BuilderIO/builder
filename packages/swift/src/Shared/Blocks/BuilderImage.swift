import SwiftUI

struct BuilderImage: View {
    var image: String
    var backgroundSize: String
    
    var body: some View {
        BackportAsyncImage(url: URL(string: image)) { phase in
            if let image = phase.image {
                image
                    .resizable()
                    .aspectRatio(contentMode: backgroundSize == "cover" ? .fill : .fit)
            }else if phase.error != nil {
                Color.red
            } else {
                Color.blue
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
