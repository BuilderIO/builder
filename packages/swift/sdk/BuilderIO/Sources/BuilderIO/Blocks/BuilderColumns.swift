import Foundation
import SwiftUI

struct BuilderColumn: Codable {
    var blocks: [BuilderBlock] = []
}

@available(iOS 15.0, macOS 10.15, *)
struct BuilderColumns: View {
    var columns: [BuilderColumn]
    var space: CGFloat = 0
    var responsiveStyles: BuilderBlockResponsiveStyles? = BuilderBlockResponsiveStyles() // for outer style of the component

    @available(iOS 15.0, *)
    var body: some View {
        HStack(alignment: .top, spacing: space) {
            ForEach(0...columns.count - 1, id: \.self) { index in
                VStack {
                    
                    
                    let blocks = columns[index].blocks
                    RenderBlocks(blocks: blocks)
                    
                }.frame(minWidth: 0, maxWidth: .infinity)
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
        let step1 = (responsiveStyles?.large ?? [:]).merging(responsiveStyles?.medium ?? [:]) { (_, new) in new }
        let step2 = step1.merging(responsiveStyles?.small ?? [:]) { (_, new) in new }
        
        return step2
    }

}
