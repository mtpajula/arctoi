
/*

Coordinate correction in survey line
TODO jonokorjaa sellainen, jossa ei ole suunnan sulkua sekä messages!
*/

var corrected = new L.FeatureGroup();
map.addLayer(corrected);

function correctionHelp() {
	var h = '<p>Alla mallitiedosto:</p>';
	h = h + '\xa07228\xa0\xa0\xa0\xa06676806.896\xa0\xa0\xa0\xa025497020.617\xa0\xa0\xa0\xa00.000<br />';
	h = h + '\xa07227\xa0\xa0\xa0\xa06676735.366\xa0\xa0\xa0\xa025497012.010\xa0\xa0\xa0\xa00.000<br />';
	h = h + '20141\xa0\xa0\xa0\xa06676646.685\xa0\xa0\xa0\xa025497025.193\xa0\xa0\xa0\xa08.929<br />';
	h = h + '20142\xa0\xa0\xa0\xa06676548.349\xa0\xa0\xa0\xa025497083.838\xa0\xa0\xa0\xa09.774<br />';
	h = h + '20143\xa0\xa0\xa0\xa06676437.194\xa0\xa0\xa0\xa025497198.476\xa0\xa0\xa011.355<br />';
	h = h + '20144\xa0\xa0\xa0\xa06676506.711\xa0\xa0\xa0\xa025497345.567\xa0\xa0\xa0\xa08.748<br />';
	h = h + '20145\xa0\xa0\xa0\xa06676639.873\xa0\xa0\xa0\xa025497416.418\xa0\xa0\xa010.242<br />';
	h = h + '20146\xa0\xa0\xa0\xa06676743.977\xa0\xa0\xa0\xa025497495.378\xa0\xa0\xa010.411<br />';
	h = h + '3169k\xa0\xa0\xa0\xa06676769.567\xa0\xa0\xa0\xa025497416.893\xa0\xa0\xa0\xa00.000<br />';
	h = h + '3170k\xa0\xa0\xa0\xa06676682.223\xa0\xa0\xa0\xa025497244.900\xa0\xa0\xa0\xa00.000<br />';
	h = h + '\xa03169\xa0\xa0\xa0\xa06676769.675\xa0\xa0\xa0\xa025497416.918\xa0\xa0\xa0\xa00.000<br />';
	h = h + '\xa03170\xa0\xa0\xa0\xa06676682.313\xa0\xa0\xa0\xa025497244.960\xa0\xa0\xa0\xa00.000<br />';
	h = h + '<br /><p>Ensimmäiset kaksi pistettä on lähtöpiste, johon keskistettiin (7227) ja suunta (7228). ';
	h = h + 'Viimeiset neljä pistettä ovat sulkupiste (3169) ja suunta (3170) havaintoina (k****) sekä teoreettisinä (kaksi viimeisintä)</p>';
	surveyorHelp("Correction -ohje", h);
};

function correctionPositionMarker(p) {
	var s = {
		color: 'green'
	}
	var popup = 'Nimi: <b>' + p.name + '</b>';
	L.circleMarker([p.lat,p.lon], s).bindPopup(popup).addTo(positions);
}

function startCorrection() {
	console.log('onclick startCorrection');
	if (surveyor.s.points.length == 0) {
		surveyorMessage('Correction','alert','No points');
		return;
	}

	console.log('set points');
	for (var p in surveyor.s.points) {
		if (p == 0) {
			surveyor.modules["correction"].addStart(surveyor.s.points[p]);
		} else if (p == surveyor.s.points.length-2) {
			surveyor.modules["correction"].addStop(surveyor.s.points[p]);
		} else if (p == surveyor.s.points.length-1) {
			surveyor.modules["correction"].stop.setMeasure(surveyor.s.points[p]);
		} else {
			surveyor.modules["correction"].addToLine(surveyor.s.points[p]);
		}
	}
	surveyor.modules["correction"].log();
	console.log('1');
	surveyor.modules["correction"].do();

	//console.log('2');
    //surveyor.modules["correction"].log();
	//surveyor.s.points = surveyor.modules["correction"].getPoints();
	//console.log('3');
	//surveyor.gtread.write();
	//console.log('4');
	//points.clearLayers();
	//drawPointPointMarkers();

	var cpoints = surveyor.modules["correction"].getPoints();
	for (p in cpoints) {
		correctionPositionMarker(cpoints[p]);
	}
	surveyorMessage('Correction','success','Measure line corrected');
};

function setCorrected() {
	var cpoints = surveyor.modules["correction"].getPoints();
	console.log(cpoints);
	if (cpoints.length == 0) {
		surveyorMessage('Correction','alert','No corrected points');
		return;
	}

	for (cp in cpoints) {
		cpoints[cp].ui = null;
	}

	points.clearLayers();
	surveyor.s.points = cpoints;

	drawStoragePoints();
	surveyor.modules["correction"].clear();
};

var Correction = function () {
	this.start = null;
	this.surveys = [];
	this.stop = null;
	this.errorAngle = null;
	this.errorn = 0.0;
	this.errore = 0.0;
	this.calc = new Calculations();

    this.commands = {
        'startCorrection' : 'Aloita jonokorjaus',
		'setCorrected' : 'Korvaa pisteet korjatuilla',
		'correctionHelp' : 'Jonokorjauksen ohje',
    }
};

Correction.prototype.setTransform = function(t) {
	this.calc.t = t;
};

Correction.prototype.runCommand = function(c) {
	if (c === 'startCorrection') {
		startCorrection();
	}
	if (c === 'setCorrected') {
		setCorrected();
	}
	if (c === 'correctionHelp') {
		correctionHelp();
	}
};

Correction.prototype.setCalc = function(calc) {
	this.calc = calc;
};

Correction.prototype.clear = function() {
	this.start = null;
	this.surveys = [];
	this.stop = null;
	corrected.clearLayers();
	surveyorMessage('Correction','success','clear');
};

Correction.prototype.addStart = function(point) {
	console.log("addStart: " + point.name);
	this.start = new SurveyPoint();
	this.start.setPoint(point);
};

Correction.prototype.addStop = function(point) {
	console.log("addStop: " + point.name);
	this.stop = new SurveyPoint();
	this.stop.setPoint(point);
};

Correction.prototype.addToLine = function(point) {

	console.log("addToLine: " + point.name);

	sp = new SurveyPoint();
	sp.setPoint(point);

	if (this.surveys.length !== 0) {
		this.surveys[this.surveys.length-1].setMeasure(point);
	} else {
		this.start.setMeasure(point);
	}
	this.surveys.push(sp);
};

Correction.prototype.getPoints = function() {
	var points = [];
	for (var p in this.surveys) {
		points.push(this.surveys[p].p);
	}
	return points;
};

Correction.prototype.countAngleError = function() {
	if (this.stop.measure.length == 0) {
		console.log("No stop angle to compare");
		return;
	}

	console.log("P: "+this.surveys[this.surveys.length-1].p.name+" Measured: " + this.surveys[this.surveys.length-1].measure[0].angleFromParent());
	console.log("P: "+this.stop.p.name+" Real: " + this.stop.measure[0].angleFromParent());

	this.errorAngle = this.surveys[this.surveys.length-1].measure[0].angleFromParent() - this.stop.measure[0].angleFromParent();
	console.log("Angle error: " + this.errorAngle);
};

Correction.prototype.do = function() {
	console.log("");
	this.surveys.pop();

	this.countAngleError();
	this.fixAngle();

	console.log("");
	console.log("-----------------------");
	this.countAngleError();
	console.log("");
	this.countCartesianError();
	this.fixCoords();

	console.log("");
	console.log("-----------------------");
	this.countCartesianError();
	this.countAngleError();
};

Correction.prototype.fixAngle = function() {
	if (this.errorAngle == null) {
		console.log("No angle error");
		return;
	}
	console.log("Surveys: " + this.surveys.length);

	var fixsum = 0.0;
	for (var p in this.surveys) {
		fixsum = fixsum + this.errorAngle / this.surveys.length * (-1);
		var newAngle = this.surveys[p].measure[0].angleFromParent() + fixsum;

		console.log("    P: " + this.surveys[p].p.name + " fix: " + fixsum);
		console.log("    P: " + this.surveys[p].p.name + " newAngle: " + newAngle);


		var pcorr = this.calc.measureFromPolar(this.surveys[p].p,newAngle,this.surveys[p].measure[0].distance);
		this.surveys[p].reSet(this.calc.newCoords(this.surveys[p].measure[0].p,pcorr),0);
		if (p < this.surveys.length-1) {
			this.calc.newCoords(this.surveys[(parseInt(p)+1)].p,pcorr)
		}
	}
	this.log();
};

Correction.prototype.fixCoords = function() {
	var fixn = 0.0;
	var fixe = 0.0;
	for (var p in this.surveys) {
		fixn = fixn + this.errorn / (this.surveys.length - 1) * (-1);
		fixe = fixe + this.errore / (this.surveys.length - 1) * (-1);
		console.log("    P: " + this.surveys[p].measure[0].p.name + " fix n: " + fixn + " e: " + fixe);

		this.calc.movePoint(this.surveys[p].measure[0].p,fixn,fixe);
		this.surveys[p].reCalc();

		if (p < this.surveys.length-1) {
			this.calc.newCoords(this.surveys[(parseInt(p)+1)].p,this.surveys[p].measure[0].p)
		}
	}
	this.log();
};

Correction.prototype.countCartesianError = function() {

	console.log("Points: " + this.surveys[this.surveys.length-1].p.name + " " + this.stop.p.name);
	console.log("North: " + this.surveys[this.surveys.length-1].p.n +" "+ this.stop.p.n);
	console.log("East: " + this.surveys[this.surveys.length-1].p.e + " " + this.stop.p.e);

	this.errorn = this.surveys[this.surveys.length-1].p.n - this.stop.p.n;
	this.errore = this.surveys[this.surveys.length-1].p.e - this.stop.p.e;
	console.log("N E error: " + this.errorn + " " + this.errore);
};

Correction.prototype.log = function() {

	console.log(" === StartPoint ===");
	this.start.log();
	console.log(" === SurveyLine === Points: " + this.surveys.length);
	for (var p in this.surveys) {
		this.surveys[p].log();
	}
	console.log(" === StopPoint ===");
	this.stop.log();
};



/*

Basic calculations

*/

var Calculations = function () {
	this.t = null;
};

Calculations.prototype.setTransform = function(t) {
	this.t = t;
};

Calculations.prototype.measureFromPolar = function(point,angle,dist) {
	var p = new Point();
	p.n = point.n + dist * Math.cos(this.gonToRad(angle));
	p.e = point.e + dist * Math.sin(this.gonToRad(angle));
	p.n = Math.round(p.n * 1000) / 1000;
	p.e = Math.round(p.e * 1000) / 1000;
	this.cartesianToPolar(p);
	return p;
};

Calculations.prototype.movePoint = function(point,n,e) {
	point.n = point.n + n;
	point.e = point.e + e;
	point.n = Math.round(point.n * 1000) / 1000;
	point.e = Math.round(point.e * 1000) / 1000;
	this.cartesianToPolar(point);
	return point;
};

Calculations.prototype.gonToDegree = function(gon) {
	return gon * 0.9;
};

Calculations.prototype.degreeToGon = function(deg) {
	return deg / 0.9;
};

Calculations.prototype.gonToRad = function(gon) {
	return gon * (Math.PI / 200);
};

Calculations.prototype.degreeToRad = function(deg) {
	return deg * (Math.PI / 180);
};

Calculations.prototype.radToGon = function(rad) {
	return rad * (200 / Math.PI);
};

Calculations.prototype.radToDegree = function(rad) {
	return rad * (180 / Math.PI);
};

Calculations.prototype.polarToCartesian = function(p) {
	var coords = this.t.polarToCartesian(p.lon,p.lat);
	p.n = Math.round(coords[1] * 1000) / 1000;
	p.e = Math.round(coords[0] * 1000) / 1000;
};

Calculations.prototype.cartesianToPolar = function(p) {
	var coords = this.t.cartesianToPolar(p.e,p.n);
    p.lat = coords[1];
    p.lon = coords[0];
};

Calculations.prototype.newCoords = function(p1,p2) {
	p1.n = p2.n;
	p1.e = p2.e;
	p1.lat = p2.lat;
	p1.lon = p2.lon;
	return p1;
};

Calculations.prototype.newCoordsFromNE = function(p,n,e) {
	p.n = n;
	p.e = e;
	this.cartesianToPolar(p);
	return p1;
};
