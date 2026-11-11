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
import UIKit

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
        for view in views where view.annotation is MKMapItemAnnotation { view.displayPriority = .required }
    }

    func mapView(_ mapView: MKMapView, selectionAccessoryFor annotation: any MKAnnotation) -> MKSelectionAccessory? {
        guard annotation is MKMapItemAnnotation else { return nil }
        // A card too large for a callout is presented from the controller that shows the map.
        let presenter = sequence(first: mapView as UIResponder, next: \.next).first { $0 is UIViewController } as? UIViewController
        return .mapItemDetail(.automatic(presentationViewController: presenter))
    }
}

/// A map that shows its region, or a box of points, at the size it ends up: MapKit fits a span
/// to the map's bounds when it is set and keeps that scale as they change, so a map no one
/// moves fits it again at each new size, as SwiftUI's `Map(position: .region(…))` does; one a
/// person can move keeps where they took it.
private final class RegionMap: MKMapView {
    enum Target { case region(MKCoordinateRegion), box(MKMapRect, UIEdgeInsets) }
    private var wanted: Target?
    private var fitted: CGSize?
    override func layoutSubviews() {
        super.layoutSubviews()
        guard let wanted, bounds.width > 0, bounds.height > 0, fitted == nil || (fitted != bounds.size && !isScrollEnabled && !isZoomEnabled) else { return }
        fitted = bounds.size
        switch wanted {
        case .region(let region): setRegion(region, animated: false)
        case .box(let box, let padding): setVisibleMapRect(box, edgePadding: padding, animated: false)
        }
    }
    func show(_ target: Target) {
        wanted = target
        fitted = nil
        setNeedsLayout()
    }
}

final class LandmarkMap: ExactNativeInstance {
    private let map = RegionMap(frame: .zero)
    private let delegate = MapDelegate()
    private var props: [String: String] = [:]
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
            map.show(.box(box, UIEdgeInsets(top: 28, left: 0, bottom: 0, right: 0)))
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
            self.map.removeAnnotations(self.map.annotations.filter { $0 is MKMapItemAnnotation })
            self.map.addAnnotations(annotations)
        }
    }

    private func region(_ text: String?) -> MKCoordinateRegion? {
        let f = (text ?? "").split(separator: "|").compactMap { Double($0) }
        guard f.count == 3 else { return nil }
        return MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: f[0], longitude: f[1]),
                                  span: MKCoordinateSpan(latitudeDelta: f[2], longitudeDelta: f[2]))
    }

    private func items(_ text: String) -> [(placeID: String, coordinate: CLLocationCoordinate2D)] {
        text.split(separator: ";").compactMap { row in
            let f = row.split(separator: "|", omittingEmptySubsequences: false).map(String.init)
            guard f.count >= 4, !f[0].isEmpty, let latitude = Double(f[1]), let longitude = Double(f[2]) else { return nil }
            return (f[0], CLLocationCoordinate2D(latitude: latitude, longitude: longitude))
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
        return UIGraphicsImageRenderer(size: size).pngData { _ in snap.image.draw(in: CGRect(origin: .zero, size: size)) }
    }
}
