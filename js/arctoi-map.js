var map = L.map('map');

var openstreetmap = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var peruskartta = new L.TileLayer('http://{s}.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.png', {
    attribution: 'Kartta: Maanmittauslaitos',
    maxZoom: 18,
    subdomains: ['tile1', 'tile2']
});
var ortokuva = new L.TileLayer('http://{s}.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.png', {
    attribution: 'Kartta: Maanmittauslaitos',
    maxZoom: 18,
    subdomains: ['tile1', 'tile2']
});

var points = new L.FeatureGroup();

L.control.scale().addTo(map);
map.setView(new L.LatLng(60.1708, 24.9375), 7).addLayer(openstreetmap);

var baseMaps = {
    'OpenStreetMap': openstreetmap,
    'Peruskartta': peruskartta,
    'Ilmakuva': ortokuva,
};

var overlayMaps = {
    'Pisteet' : points
};

map.addLayer(points);

L.control.layers(baseMaps, overlayMaps).addTo(map);
