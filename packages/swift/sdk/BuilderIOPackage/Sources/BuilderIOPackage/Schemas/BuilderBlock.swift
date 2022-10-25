import SwiftyJSON

// Schema for Builder blocks
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
