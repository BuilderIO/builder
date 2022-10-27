// Schema for Builder content
public struct BuilderContent: Codable {
    var data = BuilderContentData()
    var screenshot: String? = nil
}

struct BuilderContentData: Codable {
    var blocks: [BuilderBlock] = []
}

struct BuilderContentList: Codable {
    var results: [BuilderContent] = []
}
