
/*
SURVEYOR
--------
File includes following classes:

Surveyor()
Storage()
Transform()

*/

/*
SURVEYOR Main wrapper -class.
*/
var Surveyor = function () {
    this.t = new Transform();
    this.s = new Storage();

    this.formats = [new GtRead(), new PrnRead(), new DxfRead(), new CSVFormat()];
    this.currentInputFormat = 0;
    this.currentOutputFormat = 0;

    this.modules = {
        "testModule" : new testModule(),
        "ArctoiRightAnglify" : new ArctoiRightAnglify()
    };

    console.log('Init modules:');
    for (m in this.modules) {
        console.log(" "+this.modules[m].title);
        if (this.modules[m].stuff["t"]) {
            this.modules[m].setTransform(this.t);
        }
    }
};

Surveyor.prototype.clear = function() {
    this.s.clear();
};

Surveyor.prototype.setInputFormat = function(format) {
	this.currentInputFormat = parseInt(format);
	console.log('Current file-format: ' + this.formats[this.currentInputFormat].title);
};

Surveyor.prototype.setOutputFormat = function(format) {
	this.currentOutputFormat = parseInt(format);
	console.log('Current file-format: ' + this.formats[this.currentOutputFormat].title);
};

Surveyor.prototype.input = function(file) {

    this.formats[this.currentInputFormat].setStorage(this.s);
    var points = this.formats[this.currentInputFormat].read(file);

    this.TransformPointsCartesianToPolar();

    return points;
};

Surveyor.prototype.TransformPointsCartesianToPolar = function() {
    for (p in this.s.points) {
        coords = this.t.cartesianToPolar(this.s.points[p].e,this.s.points[p].n);
        this.s.points[p].lat = coords[1];
        this.s.points[p].lon = coords[0];
    }
};

Surveyor.prototype.output = function(epsg) {
    return this.formats[this.currentOutputFormat].write();
};

/*
Point object
*/
var Point = function () {
	this.t1 = "";
	this.t2 = "";
	this.t3 = "";
	this.name = "Na";
	this.n = 0.0;
	this.e = 0.0;
	this.lat = 0.0;
	this.lon = 0.0;
	this.altitude = 0.0;
	this.measurements = 0;
	this.accuracy = 0;
	this.altitudeAccuracy = 0;
	this.ui = null;
	this.image = false;
};

/*
Storage
*/
var Storage = function () {
	this.points = [];
};

Storage.prototype.clear = function() {
    this.points = [];
};


/*
SURVEYOR Transform -class to handle coordinate transforms
*/
var Transform = function () {
	Proj4js.defs['EPSG:3067'] = '+title=ETRS-TM35FIN +proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs';
	Proj4js.defs['EPSG:2393'] = '+title=KKJ +proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=3500000 +y_0=0 +ellps=intl +towgs84=-96.0617,-82.4278,-121.7535,4.80107,0.34543,-1.37646,1.4964 +units=m +no_defs';

	Proj4js.defs['EPSG:3874'] = '+title=ETRS-GK20FIN +proj=tmerc +lat_0=0 +lon_0=20 +k=1 +x_0=20500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3875'] = '+title=ETRS-GK21FIN +proj=tmerc +lat_0=0 +lon_0=21 +k=1 +x_0=21500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3876'] = '+title=ETRS-GK22FIN +proj=tmerc +lat_0=0 +lon_0=22 +k=1 +x_0=22500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3877'] = '+title=ETRS-GK23FIN +proj=tmerc +lat_0=0 +lon_0=23 +k=1 +x_0=23500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3878'] = '+title=ETRS-GK24FIN +proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=24500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3879'] = '+title=ETRS-GK25FIN +proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3880'] = '+title=ETRS-GK26FIN +proj=tmerc +lat_0=0 +lon_0=26 +k=1 +x_0=26500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3881'] = '+title=ETRS-GK27FIN +proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=27500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3882'] = '+title=ETRS-GK28FIN +proj=tmerc +lat_0=0 +lon_0=28 +k=1 +x_0=28500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
	Proj4js.defs['EPSG:3883'] = '+title=ETRS-GK29FIN +proj=tmerc +lat_0=0 +lon_0=29 +k=1 +x_0=29500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

	this.projs = {
			'EPSG:3067': new Proj4js.Proj('EPSG:3067'),
			'EPSG:2393': new Proj4js.Proj('EPSG:2393'),
			'EPSG:3874': new Proj4js.Proj('EPSG:3874'),
			'EPSG:3875': new Proj4js.Proj('EPSG:3875'),
			'EPSG:3876': new Proj4js.Proj('EPSG:3876'),
			'EPSG:3877': new Proj4js.Proj('EPSG:3877'),
			'EPSG:3878': new Proj4js.Proj('EPSG:3878'),
			'EPSG:3879': new Proj4js.Proj('EPSG:3879'),
			'EPSG:3880': new Proj4js.Proj('EPSG:3880'),
			'EPSG:3881': new Proj4js.Proj('EPSG:3881'),
			'EPSG:3882': new Proj4js.Proj('EPSG:3882'),
			'EPSG:3883': new Proj4js.Proj('EPSG:3883')
		};

	this.cartesian = this.projs['EPSG:3067'];
	this.polar = Proj4js.WGS84;
};

Transform.prototype.setCartesian = function(to) {
	console.log('try to set ' + to);
	this.cartesian = this.projs[to];
	console.log('Cartesian set to ' + this.cartesian.title);
};

Transform.prototype.do = function(x,y,from,to) {
	var r = Proj4js.transform(from, to, new Proj4js.Point([x,y]));
	return [r.x,r.y];
};

Transform.prototype.cartesianToPolar = function(x,y) {
	return this.do(x,y,this.cartesian,this.polar);
};

Transform.prototype.polarToCartesian = function(x,y) {
	return this.do(x,y,this.polar,this.cartesian);
};
