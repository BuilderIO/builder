//
//  testingApp.swift
//  Shared
//
//  Created by Stephen Sewell on 8/2/21.
//

import SwiftUI


@main
struct testingApp: App {
    var body: some Scene {
        WindowGroup {
            if #available(iOS 15.0, *) {
                ContentView()
            } else {
                // Fallback on earlier versions
            }
        }
    }
}
