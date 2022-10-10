# Builder.io SDK for iOS

Render Builder.io content to SwiftUI, including registering your SwiftUI components

## Developing

1. Install XCode
2. Open `./src/testing.xcworkspace` in XCode
3. Build and run from Xcode

## Usage

See [ContentView.swift](./src/Shared/ContentView.swift) for a usage example

```swiçft
struct ContentView: View {
    @State var content: BuilderContent? = nil

    init() {
        fetchContent()
    }

    func fetchContent() {
        getContent(model: "page", apiKey: "e084484c0e0241579f01abba29d9be10", url: "/") { content in
            self.content = content
        }
    }

    var body: some View {
        ScrollView {
            if $content.wrappedValue != nil {
                RenderContent(content: $content.wrappedValue!)
            }
        }

        Button("Reload") {
            fetchContent()
        }
    }
}
```

## TODO

- Make final installable package
- Stress test the renderer against a larger variety of Builder content and ensure it renders as expected
