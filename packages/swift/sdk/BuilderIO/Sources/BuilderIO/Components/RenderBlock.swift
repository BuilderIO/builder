import SwiftUI

@available(iOS 15.0, macOS 10.15, *)
struct RenderBlock: View {
    var block: BuilderBlock
    var body: some View {
        let textAlignValue = getStyleValue("textAlign")
//        let displayValue = getStyleValue("display")
//        let flexDirection = getStyleValue("flexDirection")
//        let position = getStyleValue("position")
//        let flexShrink = getStyleValue("flexShrink")
//        let boxSizing = getStyleValue("boxSizing")
//        let marginTop = getStyleValue("marginTop")
//        let appearance = getStyleValue("appearance")
//        let color = getStyleValue("color")
        let cornerRadius = getFloatValue(cssString:getStyleValue("borderRadius") ?? "0px") ?? 0
//        let cursor = getStyleValue("cursor")
//        let marginLeft = getStyleValue("marginLeft")
//        let width = getStyleValue("width")
//        let alignSelf = getStyleValue("alignSelf")
//        let fontSize = getFloatValue(cssString: "fontSize") ?? 0.0
        VStack {
            if #available(iOS 16.0, *) {
                VStack(alignment: .center) {
                    let name = block.component?.name
                    if name != nil {
                        let factoryValue = componentDict[name!]
                        //                    print("componentDict[name!] = \(componentDict[name!])")
                        let _ = print("cornerRadius = \(cornerRadius)")
                        
                        if factoryValue != nil && block.component?.options! != nil {
                            AnyView(_fromValue: factoryValue!(block.component!.options!))
                        } else {
                            let _ = print("Could not find component", name!)
                        }
                        
                    } else if block.children != nil {
                        RenderBlocks(blocks: block.children!)
                    }
                }
                .padding(EdgeInsets(top: getDirectionStyleValue("padding", "Top"), leading: getDirectionStyleValue("padding", "Left"), bottom: getDirectionStyleValue("padding", "Bottom"), trailing: getDirectionStyleValue("padding", "Right"))) // margin
                .foregroundColor(getColor(propertyName: "color"))
                .background(RoundedRectangle(cornerRadius: cornerRadius).fill(getColor(propertyName: "backgroundColor") ?? .black))
                .multilineTextAlignment(textAlignValue == "center" ? .center : textAlignValue == "right" ? .trailing : .leading)
                .font(.title)
                .fontWeight(Font.Weight.bold)
            } else {
                // Fallback on earlier versions
            }
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
            } else if value == "black" {
                return Color.black
            }
            
            
            let allMatches = matchingStrings(string: value!, regex: "rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*(\\d+)\\)");
            if allMatches.count>0 {
                let matches = allMatches[0]
                
                if (matches.count > 3) {
                    return Color(red: Double(matches[1])! / 255, green: Double(matches[2])! / 255, blue: Double(matches[3])! / 255, opacity: Double(matches[4])!)
                }
            }
        } else {
            return Color.black
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
                let float = CGFloat(truncating: number)
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
