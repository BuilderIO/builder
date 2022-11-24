//
//  SwiftUIView.swift
//  
//
//  Created by ANSK Vivek on 17/11/22.
//

import SwiftUI
import AVKit

@available(iOS 15.0, macOS 10.15, *)
struct BuilderVideo: View {
    
    var videoURLString = "https://bit.ly/swswift"
    
    var body: some View {
        VideoPlayer(player: player)
            .onAppear {
                if player.currentItem == nil {
                            let item = AVPlayerItem(url: URL(string: "https://cdn.builder.io/o/assets%2Fe084484c0e0241579f01abba29d9be10%2Fb48d9fba1f3d400d96fcfeb7a79b45f9%2Fcompressed?apiKey=e084484c0e0241579f01abba29d9be10&token=b48d9fba1f3d400d96fcfeb7a79b45f9&alt=media&optimized=true")!)
                            player.replaceCurrentItem(with: item)
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: {
                            player.play()
                        })
        }
            .frame(width: UIScreen.main.bounds.size.width, height: 245)
//            .frame(alignment: .center)
//            .padding(EdgeInsets(top: 20, leading: 20, bottom: 20, trailing: 20))

    }
}

struct BuilderVideo_Previews: PreviewProvider {
    @available(iOS 15.0, *)
    static var previews: some View {
        if #available(iOS 15.0, *) {
            BuilderVideo()
        } else {
            // Fallback on earlier versions
        }
    }
}
