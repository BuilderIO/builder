import SwiftyJSON
import SwiftUI

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
