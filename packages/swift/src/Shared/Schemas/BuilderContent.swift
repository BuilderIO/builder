// Schema for Builder content
struct BuilderContent: Codable {
    var data = BuilderContentData()
    var screenshot: String? = nil
}

struct BuilderContentData: Codable {
    var blocks: [BuilderBlock] = []
}

struct BuilderContentList: Codable {
    var results: [BuilderContent] = []
}
