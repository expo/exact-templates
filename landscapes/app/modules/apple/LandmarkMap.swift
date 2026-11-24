// `<landmark-map>`: MapKit's map of the landmarks as Apple's sample draws it
// with SwiftUI's `Map` and `Marker(item:)` (LLP 1127 §5). Each landmark is
// MapKit's own place, fetched by its place ID (`MKMapItemRequest`), so its
// marker takes MapKit's name, glyph and colour, and selecting one shows the
// place card (`MKSelectionAccessory.mapItemDetail`). Props:
//   items        `placeID|latitude|longitude|name;…`
//   region       `latitude|longitude|span`; unset, the map frames every item
//   interactive  `false`: no gestures, as `Map(interactionModes: [])`
import CoreLocation
import Foundation
import MapKit
#if os(macOS)
import AppKit
private typealias MapInsets = NSEdgeInsets
#else
import UIKit
private typealias MapInsets = UIEdgeInsets
#endif

final class LandmarksModule: ExactModule {
    override class var views: [String: ExactNativeFactory] {
        ["landmark-map": ExactNativeFactory(snapshot: true) { props, events in LandmarkMap(props: props, events: events) }]
    }
}
let exactModule: ExactModule.Type = LandmarksModule.self

/// MapKit's delegate is an NSObject; the instance is not.
private final class MapDelegate: NSObject, MKMapViewDelegate {
    // SwiftUI's `Marker` keeps every marker where two collide and gives way only with its
    // title; MapKit's default view hides the lower-priority marker (Dover beside the Alps).
    func mapView(_ mapView: MKMapView, didAdd views: [MKAnnotationView]) {
        for view in views where !(view.annotation is MKUserLocation) { view.displayPriority = .required }
    }

    @available(macOS 15.0, *)
    func mapView(_ mapView: MKMapView, selectionAccessoryFor annotation: any MKAnnotation) -> MKSelectionAccessory? {
        guard annotation is MKMapItemAnnotation else { return nil }
        // A card too large for a callout is presented from the controller that shows the map.
        #if os(macOS)
        let presenter = sequence(first: mapView as NSResponder, next: \.nextResponder).first { $0 is NSViewController } as? NSViewController
        #else
        let presenter = sequence(first: mapView as UIResponder, next: \.next).first { $0 is UIViewController } as? UIViewController
        #endif
        return .mapItemDetail(.automatic(presentationViewController: presenter))
    }

    func mapViewDidFinishRenderingMap(_ mapView: MKMapView, fullyRendered: Bool) {
        if mapView.window != nil { (mapView as? RegionMap)?.drawn = true }
    }
}

/// A map that shows its region, or a box of points, fitted to its bounds at each size it takes
/// until MapKit has drawn it in a window, as SwiftUI's `Map(position: .region(…))` fits it as it
/// appears. From then MapKit keeps its centre and scale as the bounds change, so a bigger map
/// shows more around the same centre, as SwiftUI's does as a fold widens its column.
private final class RegionMap: MKMapView {
    enum Target { case region(MKCoordinateRegion), box(MKMapRect, MapInsets) }
    private var wanted: Target?
    private var fitted: CGSize?
    /// MapKit has finished drawing the map in a window since its target was set.
    var drawn = false
    #if os(macOS)
    override func layout() {
        super.layout()
        fitTarget()
    }
    #else
    override func layoutSubviews() {
        super.layoutSubviews()
        fitTarget()
    }
    #endif
    private func fitTarget() {
        guard let wanted, bounds.width > 0, bounds.height > 0, fitted == nil || (fitted != bounds.size && !drawn) else { return }
        fitted = bounds.size
        switch wanted {
        case .region(let region): setRegion(region, animated: false)
        case .box(let box, let padding): setVisibleMapRect(box, edgePadding: padding, animated: false)
        }
    }
    func show(_ target: Target) {
        wanted = target
        fitted = nil
        drawn = false
        #if os(macOS)
        needsLayout = true
        #else
        setNeedsLayout()
        #endif
    }
}

final class LandmarkMap: ExactNativeInstance {
    private let map = RegionMap(frame: .zero)
    private let delegate = MapDelegate()
    private var props: [String: String] = [:]
    private var annotations: [any MKAnnotation] = []
    /// The fetch under way, so a newer `items` supersedes it.
    private var generation = 0

    init(props: [String: String], events: ExactNativeEvents) {
        super.init(events: events)
        map.delegate = delegate
        map.pointOfInterestFilter = .excludingAll
        apply(props)
        events.load()
    }

    override var view: ExactNativeView { map }

    override func setProps(_ props: [String: String]) throws { apply(props) }

    private func apply(_ next: [String: String]) {
        defer { props = next }
        let interactive = next["interactive"] != "false"
        map.isScrollEnabled = interactive; map.isZoomEnabled = interactive
        map.isRotateEnabled = interactive; map.isPitchEnabled = interactive
        let region = self.region(next["region"])
        if next["region"] != props["region"], let region { map.show(.region(region)) }
        guard next["items"] != props["items"] else { return }
        generation += 1
        let token = generation
        let wanted = items(next["items"] ?? "")
        // Unset, the region is every item's, as SwiftUI's automatic position frames them, from their
        // coordinates at the map's first layout, not from the places the lookup below finds: until it
        // answers MapKit shows its default region, near the device. The box has 28 points more room
        // above than below, which reproduces SwiftUI's centre and span on the Duo.
        if region == nil, !wanted.isEmpty {
            let box = wanted.reduce(MKMapRect.null) { $0.union(MKMapRect(origin: MKMapPoint($1.coordinate), size: MKMapSize())) }
            map.show(.box(box, MapInsets(top: 28, left: 0, bottom: 0, right: 0)))
        }
        guard #available(macOS 15.0, *) else {
            showAnnotations(wanted.map { item in
                let pin = MKPointAnnotation()
                pin.coordinate = item.coordinate
                pin.title = item.name
                return pin
            })
            return
        }
        Task { @MainActor [weak self] in
            var annotations: [MKMapItemAnnotation] = []
            for item in wanted {
                guard let id = MKMapItem.Identifier(rawValue: item.placeID),
                      let found = try? await MKMapItemRequest(mapItemIdentifier: id).mapItem,
                      let annotation = MKMapItemAnnotation(mapItem: found) else { continue }
                annotations.append(annotation)
            }
            guard let self, self.generation == token else { return }
            self.showAnnotations(annotations)
        }
    }

    private func showAnnotations(_ annotations: [any MKAnnotation]) {
        map.removeAnnotations(self.annotations)
        self.annotations = annotations
        map.addAnnotations(annotations)
    }

    private func region(_ text: String?) -> MKCoordinateRegion? {
        let f = (text ?? "").split(separator: "|").compactMap { Double($0) }
        guard f.count == 3 else { return nil }
        return MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: f[0], longitude: f[1]),
                                  span: MKCoordinateSpan(latitudeDelta: f[2], longitudeDelta: f[2]))
    }

    private func items(_ text: String) -> [(placeID: String, coordinate: CLLocationCoordinate2D, name: String)] {
        text.split(separator: ";").compactMap { row in
            let f = row.split(separator: "|", omittingEmptySubsequences: false).map(String.init)
            guard f.count >= 4, !f[0].isEmpty, let latitude = Double(f[1]), let longitude = Double(f[2]) else { return nil }
            return (f[0], CLLocationCoordinate2D(latitude: latitude, longitude: longitude), f[3])
        }
    }

    /// MapKit draws with Metal, which the host's capture cannot see.
    override func snapshot() throws -> Data {
        let size = map.bounds.size
        guard size.width > 0, size.height > 0 else { throw ExactNativeRefusal("no bounds yet") }
        let options = MKMapSnapshotter.Options()
        options.region = map.region
        options.size = size
        let done = DispatchSemaphore(value: 0)
        var result: MKMapSnapshotter.Snapshot?
        MKMapSnapshotter(options: options).start(with: .global()) { snap, _ in result = snap; done.signal() }
        guard done.wait(timeout: .now() + 4) == .success, let snap = result else { throw ExactNativeRefusal("map snapshot failed") }
        #if os(macOS)
        guard let tiff = snap.image.tiffRepresentation, let bitmap = NSBitmapImageRep(data: tiff),
              let png = bitmap.representation(using: .png, properties: [:]) else { throw ExactNativeRefusal("map snapshot encoding failed") }
        return png
        #else
        return UIGraphicsImageRenderer(size: size).pngData { _ in snap.image.draw(in: CGRect(origin: .zero, size: size)) }
        #endif
    }
}
