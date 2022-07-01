import SwiftUI

struct RenderBlock: View {
    var block: BuilderBlock
    var body: some View {
        let textAlignValue = getStyleValue("textAlign")
        VStack {
            VStack(alignment: .leading) {
                let name = block.component?.name
                if name != nil {
                    let factoryValue = componentDict[name!]
                    if factoryValue != nil && block.component?.options! != nil {
                        AnyView(_fromValue: factoryValue!(block.component!.options!))
                    } else {
                        let _ = print("Could not find component", name!)
                    }
                    
                } else if block.children != nil {
                    RenderBlocks(blocks: block.children!)
                }
            }
            .padding(.leading, getDirectionStyleValue("padding", "Left"))
            .padding(.top, getDirectionStyleValue("padding", "Top"))
            .padding(.trailing,  getDirectionStyleValue("padding", "Right"))
            .padding(.bottom,  getDirectionStyleValue("padding", "Bottom"))
            .foregroundColor(getColor(propertyName: "color"))
            .background(getColor(propertyName: "backgroundColor"))
            .multilineTextAlignment(textAlignValue == "center" ? .center : textAlignValue == "right" ? .trailing : .leading)
        }
        .padding(.leading, getDirectionStyleValue("margin", "Left"))
        .padding(.top, getDirectionStyleValue("margin", "Top"))
        .padding(.trailing,  getDirectionStyleValue("margin", "Right"))
        .padding(.bottom,  getDirectionStyleValue("margin", "Bottom"))
        
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
    
    func getStyleValue(_ property: String) -> String? {
        let styles = getStyles()
        return styles?[property]
    }
    
    func getDirectionStyleValue(_ type: String, _ direction: String) -> CGFloat {
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
