
/*

Pointify

*/
var positions = new L.FeatureGroup();
map.addLayer(positions);

class Pointify {
    constructor() {
        this.observations = [];
        this.t = null;
        this.s = null;

        this.title = 'Pointify';

        this.commands = {
            'pfy1': 'Pisteet havainnoiksi',
            'pfy2': 'Uusi havainto',
            'pfy3': 'Luo keskiarvopiste',
        }
    }

    runCommand(c) {
        console.log(c);
        if (c === 'pfy1') {
            this.pointsToLoc();
        } else if (c === 'pfy2') {
            this.getPosition();
        } else if (c === 'pfy3') {
            this.createAvgPoint();
        }
    }

    setTransform(t) {
        this.t = t;
    }

    setStorage(s) {
        this.s = s;
    }

    clear() {
        this.observations = [];
        positions.clearLayers();
        surveyorMessage('Pointify', 'success', 'clear');
    }

    addObservation(obs) {
        this.observations.push(obs);
    }

    fuse() {
        if (this.observations.length === 0) {
            surveyorMessage('Pointify', 'alert', 'No observations');
            return;
        }

        const w = {
            "lat": 0.0,
            "lon": 0.0,
            "latsum": 0.0,
            "lonsum": 0.0,
            "weight": 0.0,
            "weightsum": 0.0,
            "altitude": 0.0,
            "altitudeweightsum": 0.0,
            "altitudesum": 0.0
        }

        let obslenght = 0;

        for (const pos in this.observations) {
            if (this.observations[pos].accuracy === null) {
                console.log('No accuracy value');
                break;
            }

            w.weight = 1 / this.observations[pos].accuracy;
            w.weightsum = w.weightsum + w.weight;
            w.lat = w.weight * this.observations[pos].lat;
            w.lon = w.weight * this.observations[pos].lon;
            w.latsum = w.latsum + w.lat;
            w.lonsum = w.lonsum + w.lon;
            obslenght = obslenght + 1;

            if (this.observations[pos].altitude !== null) {
                if (this.observations[pos].altitude > 0.0) {
                    w.weight = 1 / this.observations[pos].altitudeAccuracy;
                    w.altitudeweightsum = w.altitudeweightsum + w.weight;
                    w.altitude = w.weight * this.observations[pos].altitude;
                    w.altitudesum = w.altitudesum + w.altitude;
                }
            }
        }

        if (w.weightsum === 0.0) {
            surveyorMessage('Pointify', 'alert', 'Weightsum is 0');
            return;
        }

        const p = new Point();

        p.name = "avgPoint";
        p.lat = w.latsum / w.weightsum;
        p.lon = w.lonsum / w.weightsum;
        p.altitude = 0.0;
        p.measurements = obslenght;

        if (w.altitudeweightsum > 0.0) {
            p.altitude = Math.round((w.altitudesum / w.altitudeweightsum) * 1000) / 1000;
        }

        console.log('Fused point coordinates:', p.lat, p.lon);
        this.addCoords(p);
        surveyorMessage('Pointify', 'neutral', "Coordinates weighted average");

        this.s.points.push(p);
        this.observations = [];

        return this.s.points.length - 1;
    }

    addCoords(p) {
        const coords = this.t.polarToCartesian(p.lon, p.lat);
        p.n = Math.round(coords[1] * 1000) / 1000;
        p.e = Math.round(coords[0] * 1000) / 1000;
        p.epsg = this.t.epsg;
        this.s.addEpsg(this.t.epsg);
    }

    createAvgPoint() {
        const pointIndex = surveyor.modules['Pointify'].fuse();
        
        if (pointIndex === undefined) {
            return; // fuse() already showed error message
        }

        const p = surveyor.s.points[pointIndex];
        
        // Add the averaged point to the main points layer so it's visible
        pointMarker(pointIndex);
        
        // Clear the positions layer (temporary markers)
        positions.clearLayers();
        
        // Fit bounds to show the new point
        try {
            map.fitBounds(points.getBounds());
        } catch (error) {
            console.log('Could not fit bounds:', error);
            // Fallback: just center on the new point
            map.setView([p.lat, p.lon], map.getZoom());
        }

        surveyorMessage('Pointify', 'success', 'createAvgPoint');
    }


    positionMarker(json) {
        console.log('positionMarker called with:', json);
        console.log('Coordinates:', json.lat, json.lon);
        
        if (json.lat === undefined || json.lon === undefined) {
            console.error('Invalid coordinates in positionMarker:', json);
            surveyorMessage('Pointify', 'alert', 'Invalid coordinates for marker');
            return;
        }
        
        const s = {
            color: 'black'
        }
        L.circleMarker([json.lat, json.lon], s).bindPopup("Tarkkuus: " + json.accuracy.toString()).setRadius(json.accuracy).addTo(positions);
    }

    pointsToLoc() {
        if (surveyor.s.isEmpty()) {
            surveyorMessage('Pointify', 'alert', 'No points');
            return;
        }

        for (const p in surveyor.s.points) {
            surveyor.s.points[p].accuracy = Math.floor((Math.random() * 100) + 1);
            surveyor.s.points[p].altitudeAccuracy = Math.floor((Math.random() * 100) + 1);

            this.positionMarker(surveyor.s.points[p]);
            surveyor.modules['Pointify'].addObservation(surveyor.s.points[p]);
        }

        surveyor.s.clear();
        points.clearLayers();
        map.fitBounds(positions.getBounds());

        surveyorMessage('Pointify', 'success', 'pointsToLoc');
    }

    getPosition() {
        console.log('getPosition');

        if (navigator.geolocation) {
            surveyorLoading('show');
            
            // Store reference to this for the callback
            const self = this;
            
            // Add a small delay to ensure modal is fully shown
            setTimeout(() => {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        console.log('Geolocation success callback called');
                        self.getPositionAction(position);
                    },
                    function(error) {
                        console.error('Geolocation error:', error);
                        surveyorLoading('hide');
                        surveyorMessage('Pointify', 'alert', 'Geolocation failed: ' + error.message);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000, // 10 seconds timeout
                        maximumAge: 60000 // 1 minute cache
                    }
                );
            }, 100); // 100ms delay
        } else {
            surveyorMessage('Pointify', 'alert', 'Geolocation is not supported by this browser.');
        }
    }

    getPositionAction(position) {
        console.log('getPositionAction called with position:', position);
        
        try {
            const p = new Point();

            p.lat = position.coords.latitude;
            p.lon = position.coords.longitude;
            p.accuracy = position.coords.accuracy;
            p.altitude = position.coords.altitude;
            p.altitudeAccuracy = position.coords.altitudeAccuracy;

            console.log('Created point:', p);
            surveyor.modules['Pointify'].addObservation(p);

            this.positionMarker(p);
            
            // Only fit bounds if positions layer has valid bounds
            if (positions.getLayers().length > 0) {
                try {
                    map.fitBounds(positions.getBounds());
                } catch (error) {
                    console.log('Could not fit bounds:', error);
                    // Fallback: just center on the new point
                    map.setView([p.lat, p.lon], map.getZoom());
                }
            }

            surveyorMessage('Pointify', 'success', 'Geolocation done');
        } catch (error) {
            console.error('Error in getPositionAction:', error);
            surveyorMessage('Pointify', 'alert', 'Error processing position: ' + error.message);
        } finally {
            console.log('Hiding loading...');
            // Add a longer delay to ensure modal is fully shown before hiding
            setTimeout(() => {
                surveyorLoading('hide');
            }, 500); // 500ms delay
        }
    }
}
