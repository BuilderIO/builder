import SwiftyJSON
import SwiftUI

typealias BuilderBlockFactory = (JSON) -> Any;
var componentDict: [String:BuilderBlockFactory] = [:]

typealias BuilderBlockResonsiveStyles = (JSON) -> Any;
var stylesDict: [String:BuilderBlockResonsiveStyles] = [:]

func registerComponent(name: String, factory: @escaping BuilderBlockFactory, responsiveStyles: @escaping BuilderBlockResonsiveStyles) {
    func useFactory(options: JSON) -> Any {
        do {
            let value = try factory(options)
            return value
        } catch {
            print("Could not instantiate \(name): \(error)")
            if #available(iOS 15.0, *) {
                return Text("Builder block \(name) could not load")
            } else {
                // Fallback on earlier versions
            }
        }
    }
    componentDict[name] = useFactory
    
    func useStyles(styles:JSON) -> Any {
        do {
            let value = try responsiveStyles(styles)
            return value
        } catch {
            print("Could not instantiate \(name): \(error)")
            return Button("Builder block \(name) could not load")
        }
    }
}
