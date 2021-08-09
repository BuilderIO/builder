import SwiftUI
import JavaScriptCore
import SwiftyJSON
import FirebaseFirestoreSwift

struct BuilderBlock: Codable {
    var id: String
    var properties: [String: String]? = [:]
    var bindings: [String: String]? = [:]
    var children: [BuilderBlock]? = []
    var component: BuilderBlockComponent? = nil
    var responsiveStyles: BuilderBlockResponsiveStyles? = BuilderBlockResponsiveStyles()
    
}

struct BuilderBlockComponent: Codable {
    var name: String
    var options: JSON? = [:]
}

struct BuilderBlockResponsiveStyles: Codable {
    var large: [String: String]? = [:]
    var medium: [String: String]? = [:]
    var small: [String: String]? = [:]
}

struct BuilderContent: Codable {
    var data = BuilderContentData()
}

struct BuilderContentData: Codable {
    var blocks: [BuilderBlock] = []
}

let jsonString = """
{
  "data": {
    "blocks": [
      {
        "id": "abc123",
        "responsiveStyles": {
          "large": {
            "padding": "20px",
            "backgroundColor": "blue",
            "color": "white"
          }
        },
        "component": {
          "name": "Text",
          "options": {
            "text": "Hi there"
          }
        }
      },
      {
        "id": "abc124",
        "responsiveStyles": {
          "large": {
            "padding": "20px",
            "backgroundColor": "white",
            "color": "gray"
          }
        },
        "component": {
          "name": "Text",
          "options": {
            "text": "Hello"
          }
        }
      }
    ]
  }
}
"""

struct RenderContent: View {
    
    static var registered = false;
    
    init(content: BuilderContent) {
        self.content = content
        if (!RenderContent.registered) {
            registerComponent(name: "Text", factory: { options in
                return BuilderText(text: options["text"].stringValue)
            })
            RenderContent.registered = true
        }
        
    }
    
    var content: BuilderContent
    
    var body: some View {
        VStack(alignment: .leading) {
            let _ = print("render: RenderContent")
            RenderBlocks(blocks: content.data.blocks)
        }
    }
}

typealias BuilderBlockFactory = (JSON) -> Any;
var componentDict: [String:BuilderBlockFactory] = [:]

func registerComponent(name: String, factory: @escaping BuilderBlockFactory) {
    func useFactory(options: JSON) -> Any {
        do {
            let value = try factory(options)
            return value
        } catch {
            print("Could not instantiate \(name): \(error)")
            return Text("Builder block \(name) could not load")
        }
    }
    componentDict[name] = useFactory
}

struct BuilderText: View {
    var text: String
    
    // TODO: actually handle HTML
    func getTextWithoutHtml(_ text: String) -> String {
        if let regex = try? NSRegularExpression(pattern: "<.*?>") { // TODO: handle decimals
            let newString = regex.stringByReplacingMatches(in: text, options: .withTransparentBounds, range: NSMakeRange(0, text.count ), withTemplate: "")
            
            return newString
            
        }
        
        return ""
    }
    
    var body: some View {
        Text(getTextWithoutHtml(text))
    }
}

struct RenderBlock: View {
    var block: BuilderBlock
    @State var geometry: GeometryProxy?
    
    func setGeometry(newGeometry: GeometryProxy) {
        geometry = newGeometry
    }
    
    var body: some View {
        let _ = print("render: RenderBlock")
        GeometryReader { geometry in
            let _ = setGeometry(newGeometry: geometry)
            VStack {
                VStack(alignment: .leading) {
                    let name = block.component?.name
                    if name != nil {
                        let factoryValue = componentDict[name!]
                        if factoryValue != nil && block.component?.options! != nil {
                            AnyView(_fromValue: factoryValue!(block.component!.options!))
                        }
                        
                    } else {
                        let _ = print("Could not find component for block \(block)")
                    }
                }
                .padding(.leading, getStyleValue("padding", "Left"))
                .padding(.top, getStyleValue("padding", "Top"))
                .padding(.trailing,  getStyleValue("padding", "Right"))
                .padding(.bottom,  getStyleValue("padding", "Bottom"))
                .foregroundColor(getColor(propertyName: "color"))
                .background(getColor(propertyName: "backgroundColor"))
            }
            .padding(.leading, getStyleValue("margin", "Left"))
            .padding(.top, getStyleValue("margin", "Top"))
            .padding(.trailing,  getStyleValue("margin", "Right"))
            .padding(.bottom,  getStyleValue("margin", "Bottom"))
        }
    }
    
    func getColor(propertyName: String) -> Color? {
        let value = getStyles()?[propertyName]
        if value != nil {
            if value == "red" {
                return Color.red
            } else if value == "blue" {
                return Color.blue
            } else if value == "white" {
                return Color.white
            } else if value == "gray" {
                return Color.gray
            }
            
            
            let allMatches = matchingStrings(string: value!, regex: "rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*(\\d+)\\)");
            let matches = allMatches[0]
            
            if (matches.count > 3) {
                print(matches, value)
                return Color(red: Double(matches[1])! / 255, green: Double(matches[2])! / 255, blue: Double(matches[3])! / 255, opacity: Double(matches[4])!)
            }
        }
        return nil
    }
    
    func matchingStrings(string: String, regex: String) -> [[String]] {
        guard let regex = try? NSRegularExpression(pattern: regex, options: []) else { return [] }
        let nsString = string as NSString
        let results  = regex.matches(in: string, options: [], range: NSMakeRange(0, nsString.length))
        return results.map { result in
            (0..<result.numberOfRanges).map {
                result.range(at: $0).location != NSNotFound
                    ? nsString.substring(with: result.range(at: $0))
                    : ""
            }
        }
    }
    
    
    func getFloatValue(cssString: String) -> CGFloat? {
        if let regex = try? NSRegularExpression(pattern: "px$") { // TODO: handle decimals
            let newString = regex.stringByReplacingMatches(in: cssString, options: .withTransparentBounds, range: NSMakeRange(0, cssString.count ), withTemplate: "")
            
            if let number = NumberFormatter().number(from: newString) {
                let float = CGFloat(number)
                return float
            }
            
        }
        
        return nil
    }
    
    func getStyleValue(_ type: String, _ direction: String) -> CGFloat {
        let styles = getStyles()
        var paddingStr = styles?[type + direction]
        if (paddingStr == nil) {
            paddingStr = styles?[type] // TODO: handle muti value padding shorthand
        }
        if (paddingStr != nil) {
            if let num = getFloatValue(cssString: paddingStr!) {
                return num
            }
        }
        
        return 0
    }
    
    
    func getStyles() -> [String:String]? {
        let step1 = (block.responsiveStyles?.large ?? [:]).merging(block.responsiveStyles?.medium ?? [:]) { (_, new) in new }
        let step2 = step1.merging(block.responsiveStyles?.small ?? [:]) { (_, new) in new }
        
        return step2
    }
}

struct RenderBlocks: View {
    var blocks: [BuilderBlock]
    
    var body: some View {
        let _ = print("render: RenderBlocks")
        ForEach(blocks, id: \.id) { block in
            let _ = print("render: RenderBlocks inner")
            RenderBlock(block: block)
        }
    }
}

struct FirestoreData: Codable {
    //    @DocumentID var id: String?
    
    var content: BuilderContent?
    var screenshot: String?
}


struct ContentView: View {
    init() {
        initFirestore()
    }
    
    @ObservedObject var overrideContent = ContentTracker()
    
    @State var lastScreenshot: String? = nil;
    
    func initFirestore() {
        let collectionName = "components"
        let docId = "testing"
        
        let collection = testingApp.db.collection(collectionName)
        let doc = collection.document(docId)
        doc.addSnapshotListener { documentSnapshot, error in
            do {
                guard let document = documentSnapshot else {
                    print("Error fetching document: \(error!)")
                    return
                }
                guard let data = try document.data(as: FirestoreData.self) else {
                    print("Document data was empty.")
                    return
                }
                if data.content != nil {
                    overrideContent.content = data.content
                } else {
                    print("Not overriding content? \(data.content)")
                }
            } catch {
                print("Error decoding firestore data \(error)")
            }
        }
        
        var timer = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { _ in
            if let screenshot = takeScreenshot() {
                if screenshot != nil && screenshot != lastScreenshot {
                    lastScreenshot = screenshot
                    doc.updateData([ "screenshot": screenshot ]) {  err in
                        if let err = err {
                            print("Error updating document: \(err)")
                        } else {
                            print("Added screenshot")
                        }
                    }
                }
                
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
        print("Get content?")
        if overrideContent.content != nil {
            print("Sending override content?")
            return overrideContent.content
        }
        
        print("Getting old content")
        
        let jsonData = Data(jsonString.utf8)
        let decoder = JSONDecoder()
        
        
        do {
            let content = try decoder.decode(BuilderContent.self, from: jsonData)
            return content
        } catch {
            print(error)
        }
        
        return nil
    }
    
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading) {
                if $overrideContent.content.wrappedValue != nil {
                    let _ = print("Doing override content")
                    RenderContent(content: $overrideContent.content.wrappedValue!)
                } else {
                    let _ = print("Doing default content")
                    let content = getContent()
                    if content != nil {
                        RenderContent(content: content!)
                    } else {
                        let _ = print("Content is nil")
                    }
                }
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
