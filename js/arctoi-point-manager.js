/*
ARCTOI POINT MANAGER
-------------------
Handles adding points to the map using Leaflet.Draw plugin
and integrating with the surveyor storage system.
*/

class PointManager {
    constructor(map, surveyor) {
        this.map = map;
        this.surveyor = surveyor;
        this.pointCounter = 1;
        this.coordinateSystem = 'EPSG:3067'; // Default to ETRS-TM35FIN
        
        this.init();
    }

    init() {

        // Initialize draw control with only marker (point) drawing enabled
        this.drawControl = new L.Control.Draw({
            draw: {
                polyline: false,
                polygon: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: true
            },
            edit: false
        });

        // Add draw control to map
        this.map.addControl(this.drawControl);

        // Listen for draw events
        this.map.on('draw:created', (e) => {
            this.onPointCreated(e);
        });

        console.log('PointManager initialized');
    }

    onPointCreated(e) {
        const layer = e.layer;
        const latlng = layer.getLatLng();
        
        // Create a new Point object
        const point = new Point();
        point.name = `Point_${this.pointCounter}`;
        point.lat = latlng.lat;
        point.lon = latlng.lng;
        
        // Use the selected coordinate system from settings
        const selectedCoordSystem = window.pointManagerCoordinateSystem || this.coordinateSystem;
        point.epsg = selectedCoordSystem;
        
        // Transform coordinates to cartesian using the selected coordinate system
        const selectedProj = this.surveyor.t.projs[selectedCoordSystem];
        const coords = Proj4js.transform(Proj4js.WGS84, selectedProj, new Proj4js.Point([point.lon, point.lat]));
        point.n = coords.y;
        point.e = coords.x;
        
        // Add point to surveyor storage
        this.surveyor.s.points.push(point);
        
        // Set storage coordinate system if it's empty
        if (this.surveyor.s.epsg === "") {
            this.surveyor.s.epsg = selectedCoordSystem;
        }
        
        // Remove the default marker from the map
        this.map.removeLayer(layer);
        
        // Add to the main points layer using existing pointMarker function
        pointMarker(this.surveyor.s.points.length - 1);
        
        // Update point counter
        this.pointCounter++;
        
        // Show success message
        const coordSystemName = this.surveyor.t.projs[selectedCoordSystem].title;
        surveyorMessage('PointManager', 'success', `Point ${point.name} added at (${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}) in ${coordSystemName}`);
        
        console.log('Point added:', point);
    }


}

// Initialize point manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for map and surveyor to be initialized
    setTimeout(() => {
        if (typeof map !== 'undefined' && typeof surveyor !== 'undefined') {
            window.pointManager = new PointManager(map, surveyor);
        } else {
            console.error('Map or surveyor not initialized');
        }
    }, 1000);
});
