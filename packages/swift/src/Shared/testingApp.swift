//
//  testingApp.swift
//  Shared
//
//  Created by Stephen Sewell on 8/2/21.
//

import SwiftUI
import Firebase
import FirebaseFirestore


@main
struct testingApp: App {
    static var db = Firestore.firestore()
    
    init() {
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
