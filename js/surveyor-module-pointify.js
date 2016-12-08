
/*

Pointify

*/
var positions = new L.FeatureGroup();
map.addLayer(positions);

var Pointify = function () {
	this.observations = [];
	this.t = null;
	this.s = null;

    this.title = 'Pointify';

    this.commands = {
        'pfy1' : 'Pisteet havainnoiksi',
        'pfy2' : 'Uusi havainto',
        'pfy3' : 'Luo keskiarvopiste',
    }
};

Pointify.prototype.runCommand = function(c) {
    console.log(c);
    if (c === 'pfy1') {
        pointsToLoc();
    } else if (c === 'pfy2') {
        getPosition();
    } else if (c === 'pfy3') {
        createAvgPoint();
    }
};

Pointify.prototype.setTransform = function(t) {
	this.t = t;
};

Pointify.prototype.setStorage = function(s) {
	this.s = s;
};

Pointify.prototype.clear = function() {
	this.observations = [];
	positions.clearLayers();
    arctoiMessage('Pointify','success','clear');
};

Pointify.prototype.addObservation = function(obs) {
	this.observations.push(obs);
};

Pointify.prototype.fuse = function() {

	if (this.observations.length === 0) {
        arctoiMessage('Pointify','alert','No observations');
	    return;
	}

	var w = {
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

	var obslenght = 0;

	for (var pos in this.observations) {

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

	    //console.log(this.observations[pos]);

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
        arctoiMessage('Pointify','alert','Weightsum is 0');
	    return;
	}

	var p = new Point();

    p.name = "avgPoint";
	p.lat = w.latsum / w.weightsum;
	p.lon = w.lonsum / w.weightsum;
	p.altitude = 0.0;
	p.measurements = obslenght;

	if (w.altitudeweightsum > 0.0) {
		p.altitude = Math.round((w.altitudesum / w.altitudeweightsum) * 1000) / 1000;
	}

	this.addCoords(p);
    arctoiMessage('Pointify','neutral',"Coordinates weighted average");

	this.s.points.push(p);
    this.observations = [];

    return this.s.points.length - 1;
};

Pointify.prototype.addCoords = function(p) {
	var coords = this.t.polarToCartesian(p.lon,p.lat);
	p.n = Math.round(coords[1] * 1000) / 1000;
	p.e = Math.round(coords[0] * 1000) / 1000;
	p.epsg = this.t.epsg;
	this.s.addEpsg(this.t.epsg);
	//return p;
};

function createAvgPoint() {
	var p = surveyor.modules['Pointify'].fuse();

	pointMarker(p);
    map.fitBounds(points.getBounds());

    positions.clearLayers();
    arctoiMessage('Pointify','success','createAvgPoint');
}


function positionMarker(json) {
	var s = {
		color: 'black'

	}
	L.circleMarker([json.lat,json.lon], s).bindPopup("Tarkkuus: "+json.accuracy.toString()).setRadius(json.accuracy).addTo(positions);
}

function pointsToLoc() {

    if (surveyor.s.isEmpty()) {
        arctoiMessage('Pointify','alert','No points');
        return;
    }

	for (var p in surveyor.s.points) {
		surveyor.s.points[p].accuracy = Math.floor((Math.random() * 100) + 1);
		surveyor.s.points[p].altitudeAccuracy = Math.floor((Math.random() * 100) + 1);

	    positionMarker(surveyor.s.points[p]);
    	surveyor.modules['Pointify'].addObservation(surveyor.s.points[p]);
	}

	surveyor.s.clear();
    points.clearLayers();
    map.fitBounds(positions.getBounds());

    arctoiMessage('Pointify','success','pointsToLoc');
};

function getPosition() {

    console.log('getPosition');

    if (navigator.geolocation) {

        $('#loadingModal').modal('show');

        navigator.geolocation.getCurrentPosition(getPositionAction);
    } else {
        arctoiMessage('Pointify','alert','Geolocation is not supported by this browser."');
    }
}

function getPositionAction(position) {

	var p = new Point();

	p.lat = position.coords.latitude;
	p.lon = position.coords.longitude;
	p.accuracy = position.coords.accuracy;
	p.altitude = position.coords.altitude;
	p.altitudeAccuracy = position.coords.altitudeAccuracy;

    console.log(p);
    surveyor.modules['Pointify'].addObservation(p);

    positionMarker(p);
    //L.marker([jsonLine.lat,jsonLine.lon]).bindPopup(jsonLine.accuracy.toString()).addTo(positions);
    map.fitBounds(positions.getBounds());

    $('#loadingModal').modal('hide');

    arctoiMessage('Pointify','success','Geolocation done"');
}
