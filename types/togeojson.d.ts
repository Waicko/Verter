declare module "@mapbox/togeojson" {
  function gpx(gpxDoc: Document): GeoJSON.FeatureCollection;
  function kml(kmlDoc: Document): GeoJSON.FeatureCollection;
}
