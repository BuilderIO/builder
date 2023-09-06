//
//  NavigationViews.swift
//  SwiftExample (iOS)
//
//  Created by Shyam Seshadri on 9/4/23.
//

import SwiftUI

struct NavigationViews: View {
    var body: some View {
        NavigationView {
            NavigationLink(destination: ContentView()) {
                    Text("Navigate to Home Screen")
                }
                .navigationBarTitle("Login!")
            }
        
    }
}

struct NavigationViews_Previews: PreviewProvider {
    static var previews: some View {
        NavigationViews()
    }
}
