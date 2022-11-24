import SwiftUI

@available(iOS 15.0, macOS 10.15, *)
struct RenderBlock: View {
    var block: BuilderBlock
    var body: some View {
        VStack {
            if #available(iOS 15.0, *) {
                VStack(alignment: .center) {
                    let name = block.component?.name
                    let _ = print("block.component?.name = \(String(describing: name))")
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
            } else {
                // Fallback on earlier versions
            }
        }
    }
}

@available(iOS 15.0, *)
extension View {
    
    func getFontWeight(weight:Int) -> Font.Weight {
        switch(weight) {
        case 100:
            return Font.Weight.ultraLight
        case 200:
            return Font.Weight.thin
        case 300:
            return Font.Weight.light
        case 400:
            return Font.Weight.regular
        case 500:
            return Font.Weight.medium
        case 600:
            return Font.Weight.semibold
        case 700:
            return Font.Weight.bold
        case 800:
            return Font.Weight.heavy
        case 900:
            return Font.Weight.black
        default:
            return Font.Weight.ultraLight
        }
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
    
    // TODO: actually handle HTML
    func getTextWithoutHtml(_ text: String) -> String {
        if let regex = try? NSRegularExpression(pattern: "<.*?>") { // TODO: handle decimals
            let newString = regex.stringByReplacingMatches(in: text, options: .withTransparentBounds, range: NSMakeRange(0, text.count ), withTemplate: "")
            
            return newString
        }
        
        return ""
    }
    
}

@available(iOS 15.0, *)
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
