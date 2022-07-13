import SwiftUI
import SwiftyJSON
import FirebaseFirestoreSwift
import FirebaseFirestore


let debug = true

struct ContentView: View {
    let isEditing = true
    
    @State private var firestoreSubscription: ListenerRegistration?
    
    init() {
        if (isEditing) {
            initFirestore()
        } else {
            initContent()
        }
        
    }
    
    func initContent() {
        testing.getContent(model: "page", apiKey: "7ff1b55f7ecb4f08a012fbb2a859aced", url: "/") { content in
            self.overrideContent.content = content
        }
    }
    
    @ObservedObject var overrideContent = ContentTracker()
    
    @State var lastScreenshot: String? = nil;
    
    func initFirestore() {
        let collectionName = "components"
        // TODO: hardoded only for now
        let docId = "00df1822dbdf48d18a1fdef36d98a315"
        
        let collection = testingApp.db.collection(collectionName)
        let doc = collection.document(docId)
        firestoreSubscription = doc.addSnapshotListener { documentSnapshot, error in
            do {
                guard let document = documentSnapshot else {
                    print("Error fetching document: \(error!)")
                    return
                }
                guard let data = try document.data(as: BuilderContent.self) else {
                    print("Document data was empty.")
                    return
                }
                
                overrideContent.content = data

                print("Got snapshot")

            } catch {
                print("Error decoding firestore data \(error)")
            }
        }

        
        func convertImageToBase64String (img: UIImage) -> String {
            return img.jpegData(compressionQuality: 1)?.base64EncodedString() ?? ""
        }
    }
    
    func takeScreenshot() -> String? {
        var screenshotImage :UIImage?
        let layer = UIApplication.shared.keyWindow!.layer
        let scale = UIScreen.main.scale
        UIGraphicsBeginImageContextWithOptions(layer.frame.size, false, scale);
        guard let context = UIGraphicsGetCurrentContext() else {return nil}
        layer.render(in:context)
        screenshotImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return convertImageToBase64String(screenshotImage!)
    }
    
    
    func convertImageToBase64String (_ img: UIImage) -> String {
        return img.jpegData(compressionQuality: 1)?.base64EncodedString() ?? ""
    }
    
    
    func getContent() -> BuilderContent? {
        if overrideContent.content != nil {
            return overrideContent.content
        }
        
        return nil
    }
    
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading) {
                if $overrideContent.content.wrappedValue != nil {
                    RenderContent(content: $overrideContent.content.wrappedValue!)
                } else {
                    let content = getContent()
                    if content != nil {
                        RenderContent(content: content!)
                    } else {
                        let _ = print("Content is nil")
                    }
                }
            }
        }.onDisappear {
            firestoreSubscription?.remove()
        }
        if debug && !isEditing {
            Button("Reload") {
                initContent()
            }
        }
    }
}

final class ContentTracker: ObservableObject {
    @Published var content: BuilderContent?;
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
