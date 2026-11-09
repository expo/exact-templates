// `<zoom-image>` on iOS: a product photo in a zooming scroll view, as Photos shows one.
//
//   props   source   the photo, a path under the app's assets (`assets/p/<file>`)
//   events  load     once the photo is up
//           message  "dismiss" when the person pulls the photo down at its resting size
//
// Pinch zooms between 1× and 4× about the fingers, a double tap zooms to 2.5× about the tap
// or back out, and a zoomed photo pans; all of it is UIScrollView's own.
#if !os(macOS)
import UIKit
import ImageIO

final class Softwear: ExactModule {
    override class var views: [String: ExactNativeFactory] {
        ["zoom-image": ExactNativeFactory(for: Softwear.self) { _, props, events in try ZoomImage(props: props, events: events) }]
    }
}
let exactModule: ExactModule.Type = Softwear.self

/// The photo at a path under `assets/`: the development asset root, then the bundle.
private func loadAsset(_ relative: String) -> UIImage? {
    guard !relative.isEmpty, !relative.split(separator: "/").contains("..") else { return nil }
    var roots: [String] = []
    if let assets = ProcessInfo.processInfo.environment["EXACT_ASSETS"] { roots.append(assets) }
    if let resources = Bundle.main.resourcePath { roots.append(resources) }
    roots.append(Bundle.main.bundlePath)
    for root in roots {
        let url = URL(fileURLWithPath: root).appendingPathComponent(relative)
        if let source = CGImageSourceCreateWithURL(url as CFURL, nil),
           let image = CGImageSourceCreateImageAtIndex(source, 0, nil) {
            return UIImage(cgImage: image)
        }
    }
    return nil
}

final class ZoomView: UIScrollView, UIScrollViewDelegate {
    let imageView = UIImageView()
    var pulledDown: (() -> Void)?
    private var fitted = CGSize.zero

    init() {
        super.init(frame: .zero)
        delegate = self
        minimumZoomScale = 1
        maximumZoomScale = 4
        bouncesZoom = true
        alwaysBounceVertical = true // a pull past the top at 1× is the way out
        showsVerticalScrollIndicator = false
        showsHorizontalScrollIndicator = false
        contentInsetAdjustmentBehavior = .never
        backgroundColor = .clear
        imageView.contentMode = .scaleAspectFit
        addSubview(imageView)
        let double = UITapGestureRecognizer(target: self, action: #selector(doubleTapped(_:)))
        double.numberOfTapsRequired = 2
        addGestureRecognizer(double)
    }

    required init?(coder: NSCoder) { nil }

    var image: UIImage? {
        get { imageView.image }
        set { imageView.image = newValue; zoomScale = 1; setNeedsLayout() }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        guard let image = imageView.image, bounds.width > 0, bounds.height > 0 else { return }
        let scale = min(bounds.width / image.size.width, bounds.height / image.size.height)
        let next = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        if next != fitted {
            fitted = next
            let zoom = zoomScale
            zoomScale = 1
            imageView.frame = CGRect(origin: .zero, size: fitted)
            contentSize = fitted
            zoomScale = zoom
        }
        center()
    }

    /// The photo stays centred while it is smaller than the view, as Photos keeps it.
    private func center() {
        let dx = max(0, (bounds.width - contentSize.width) / 2), dy = max(0, (bounds.height - contentSize.height) / 2)
        contentInset = UIEdgeInsets(top: dy, left: dx, bottom: dy, right: dx)
    }

    func viewForZooming(in scrollView: UIScrollView) -> UIView? { imageView }
    func scrollViewDidZoom(_ scrollView: UIScrollView) { center() }

    func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
        guard zoomScale <= 1.001 else { return }
        if contentOffset.y + contentInset.top < -90 { pulledDown?() }
    }

    @objc private func doubleTapped(_ g: UITapGestureRecognizer) {
        if zoomScale > 1.001 {
            setZoomScale(1, animated: true)
            return
        }
        let at = g.location(in: imageView)
        let scale: CGFloat = 2.5
        let size = CGSize(width: bounds.width / scale, height: bounds.height / scale)
        zoom(to: CGRect(x: at.x - size.width / 2, y: at.y - size.height / 2, width: size.width, height: size.height), animated: true)
    }
}

final class ZoomImage: ExactNativeInstance {
    private let zoom = ZoomView()
    private var source = ""

    init(props: [String: String], events: ExactNativeEvents) throws {
        super.init(events: events)
        zoom.pulledDown = { events.message("dismiss") }
        try setProps(props)
    }

    override var view: ExactNativeView { zoom }

    override func setProps(_ props: [String: String]) throws {
        let next = props["source"] ?? ""
        guard next != source else { return }
        guard let image = loadAsset(next) else { throw ExactNativeRefusal("no photo at \(next)") }
        source = next
        zoom.image = image
        events.load()
    }
}
#else
import AppKit

final class Softwear: ExactModule {
    override class var views: [String: ExactNativeFactory] {
        ["zoom-image": ExactNativeFactory(for: Softwear.self) { _, props, events in try ZoomImage(props: props, events: events) }]
    }
}
let exactModule: ExactModule.Type = Softwear.self

private final class ZoomView: NSScrollView {
    let photo = NSImageView()

    override init(frame: NSRect) {
        super.init(frame: frame)
        drawsBackground = false
        allowsMagnification = true
        minMagnification = 1
        maxMagnification = 4
        hasVerticalScroller = true
        hasHorizontalScroller = true
        autohidesScrollers = true
        photo.imageScaling = .scaleProportionallyUpOrDown
        photo.setAccessibilityLabel("Product photo")
        documentView = photo
        let double = NSClickGestureRecognizer(target: self, action: #selector(doubleClicked(_:)))
        double.numberOfClicksRequired = 2
        addGestureRecognizer(double)
    }

    required init?(coder: NSCoder) { nil }

    override func layout() {
        super.layout()
        // Keep the document at the unzoomed viewport size; AppKit magnifies and pans it.
        photo.setFrameSize(NSSize(width: contentView.bounds.width * magnification,
                                  height: contentView.bounds.height * magnification))
    }

    @objc private func doubleClicked(_ gesture: NSClickGestureRecognizer) {
        setMagnification(magnification > 1.001 ? 1 : 2.5, centeredAt: gesture.location(in: photo))
    }
}

final class ZoomImage: ExactNativeInstance {
    private let zoom = ZoomView(frame: .zero)
    private var source = ""

    init(props: [String: String], events: ExactNativeEvents) throws {
        super.init(events: events)
        try setProps(props)
    }

    override var view: ExactNativeView { zoom }

    override func setProps(_ props: [String: String]) throws {
        let next = props["source"] ?? ""
        guard next != source else { return }
        guard !next.isEmpty, !next.split(separator: "/").contains("..") else {
            throw ExactNativeRefusal("invalid photo path")
        }
        let roots = [ProcessInfo.processInfo.environment["EXACT_ASSETS"], Bundle.main.resourcePath, Bundle.main.bundlePath].compactMap { $0 }
        guard let image = roots.lazy.compactMap({ NSImage(contentsOf: URL(fileURLWithPath: $0).appendingPathComponent(next)) }).first else {
            throw ExactNativeRefusal("no photo at \(next)")
        }
        source = next
        zoom.magnification = 1
        zoom.photo.image = image
        events.load()
    }
}
#endif
