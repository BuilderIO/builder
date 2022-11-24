import SwiftUI

@available(iOS, deprecated: 15.0, renamed: "SwiftUI.AsyncImage")
@available(iOS 15.0, *)
public typealias AsyncImage = BackportAsyncImage


@available(iOS, deprecated: 15.0, renamed: "SwiftUI.AsyncImagePhase")
@available(iOS 15.0, *)
public enum AsyncImagePhase {
    case empty
    case success(Image)
    case failure(Error)

    public var image: Image? {
        switch self {
        case .empty, .failure:
            return nil
        case .success(let image):
            return image
        }
    }

    public var error: Error? {
        switch self {
        case .empty, .success:
            return nil
        case .failure(let error):
            return error
        }
    }
}

// Credit: https://github.com/yutailang0119/SBPAsyncImage/blob/main/Sources/SBPAsyncImage/BackportAsyncImage.swift
@available(iOS, deprecated: 15.0, renamed: "SwiftUI.AsyncImage")
@available(iOS 15.0, *)
public struct BackportAsyncImage<Content: View>: View {
    private let url: URL?
    private let scale: CGFloat
    private let transaction: Transaction
    private let content: (AsyncImagePhase) -> Content

    public init(url: URL?, scale: CGFloat = 1) where Content == Image {
        self.url = url
        self.scale = scale
        self.transaction = Transaction()
        self.content = { $0.image ?? Image("") }
    }

    @available(iOS 15.0, *)
    public init<I, P>(url: URL?,
                      scale: CGFloat = 1,
                      @ViewBuilder content: @escaping (Image) -> I,
                      @ViewBuilder placeholder: @escaping () -> P) where Content == _ConditionalContent<I, P>, I : View, P : View {
        self.url = url
        self.scale = scale
        self.transaction = Transaction()
        self.content = { phase -> _ConditionalContent<I, P> in
            if let image = phase.image {
                return ViewBuilder.buildEither(first: content(image))
            } else {
                return ViewBuilder.buildEither(second: placeholder())
            }
        }
    }

    @available(iOS 15.0, *)
    public init(url: URL?,
                scale: CGFloat = 1,
                transaction: Transaction = Transaction(),
                @ViewBuilder content: @escaping (AsyncImagePhase) -> Content) {
        self.url = url
        self.scale = scale
        self.transaction = transaction
        self.content = content
    }

    @available(iOS 15.0, *)
    public var body: some View {
        if #available(macOS 11.0, tvOS 14.0, watchOS 7.0, *) {
            ContentBody(url: url,
                        scale: scale,
                        transaction: transaction,
                        content: content)
        } else {
            ContentCompatBody(url: url,
                              scale: scale,
                              transaction: transaction,
                              content: content)
        }
    }
}

@available(iOS 15.0, *)
private final class Provider: ObservableObject {
    @Published var phase: AsyncImagePhase

    init() {
        self.phase = .empty
    }

    func task(url: URL?,
              scale: CGFloat,
              transaction: Transaction) {
        guard let url = url else {
            return
        }
        URLSession.shared.dataTask(with: url) { data, _, error in
            DispatchQueue.main.async { [weak self] in
                if let error = error {
                    self?.phase = .failure(error)
                    return
                }

                withTransaction(transaction) {
                    self?.phase = self?.image(from: data, scale: scale)
                        .map{ AsyncImagePhase.success($0) }
                        ?? .empty
                }
            }
        }
        .resume()
    }

    private func image(from data: Data?, scale: CGFloat) -> Image? {
        #if os(macOS)
        // TODO: Support scale on macOS
        return data
            .flatMap(NSImage.init(data:))
            .map(Image.init(nsImage:))
        #else
        return data
            .flatMap { UIImage(data: $0, scale: scale) }
            .map(Image.init(uiImage:))
        #endif
    }
}

@available(iOS 15.0, *)
private struct ContentBody<Content: View>: View {
    @StateObject private var provider = Provider()
    private let url: URL?
    private let scale: CGFloat
    private let transaction: Transaction
    private let content: (AsyncImagePhase) -> Content

    init(url: URL?,
         scale: CGFloat,
         transaction: Transaction,
         @ViewBuilder content: @escaping (AsyncImagePhase) -> Content) {
        self.url = url
        self.scale = scale
        self.transaction = transaction
        self.content = content
    }

    var body: some View {
        content(provider.phase)
            .onAppear {
                provider.task(url: url, scale: scale, transaction: transaction)
            }
            .onChange(of: url) { url in
                provider.task(url: url, scale: scale, transaction: transaction)
            }
    }
}

@available(iOS, deprecated: 14.0)
@available(iOS 15.0, *)
private struct ContentCompatBody<Content: View>: View {
    struct Body: View {
        @ObservedObject private var provider: Provider
        private let content: (AsyncImagePhase) -> Content

        init(provider: Provider,
             url: URL?,
             scale: CGFloat,
             transaction: Transaction,
             @ViewBuilder content: @escaping (AsyncImagePhase) -> Content) {
            self.provider = provider
            self.content = content
            self.provider.task(url: url, scale: scale, transaction: transaction)
        }

        var body: some View {
            content(provider.phase)
        }
    }

    @available(iOS 15.0, *)
    @State private var provider = Provider()
    private let url: URL?
    private let scale: CGFloat
    @available(iOS 15.0, *)
    private let transaction: Transaction
    private let content: (AsyncImagePhase) -> Content

    @available(iOS 15.0, *)
    init(url: URL?,
         scale: CGFloat,
         transaction: Transaction,
         @ViewBuilder content: @escaping (AsyncImagePhase) -> Content) {
        self.url = url
        self.scale = scale
        self.transaction = transaction
        self.content = content
    }

    @available(iOS 15.0, *)
    var body: Body {
        Body(provider: provider,
             url: url,
             scale: scale,
             transaction: transaction,
             content: content)
    }
}

/*
struct BackportAsyncImage_Previews: PreviewProvider {
    static var url: URL? {
        URL(string: "http://httpbin.org/image/png")
    }

    static var previews: some View {
        VStack {
            BackportAsyncImage(url: url, scale: 2.0)
                .frame(width: 100, height: 100)

            BackportAsyncImage(
                url: url,
                content: {
                    $0
                        .resizable()
                        .clipShape(Circle())
                },
                placeholder: {
                    Color.black
                }
            )
            .frame(width: 100, height: 100)

            BackportAsyncImage(
                url: url,
                transaction: Transaction(animation: .linear),
                content: { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    } else if phase.error != nil {
                        Color.red
                    } else {
                        Color.blue
                    }
                }
            )
            .frame(width: 100, height: 100)
        }
    }
}
*/
