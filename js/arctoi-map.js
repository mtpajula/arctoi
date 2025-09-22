// Initialize map
const map = L.map('map');

// Create tile layers
const openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const peruskartta = L.tileLayer('https://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.png', {
    attribution: 'Kartta: Maanmittauslaitos',
    maxZoom: 18
});

const ortokuva = L.tileLayer('https://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg', {
    attribution: 'Kartta: Maanmittauslaitos',
    maxZoom: 18
});

// Create feature group for points
const points = L.featureGroup();

// Add scale control and set initial view
L.control.scale().addTo(map);
map.setView([60.1708, 24.9375], 6).addLayer(openstreetmap);

// Define base maps and overlay maps
const baseMaps = {
    'OpenStreetMap': openstreetmap,
    'Peruskartta': peruskartta,
    'Ilmakuva': ortokuva,
};

const overlayMaps = {
    'Pisteet': points
};

// Add points layer and layer control
map.addLayer(points);
L.control.layers(baseMaps, overlayMaps).addTo(map);
