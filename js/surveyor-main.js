
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
class Surveyor {
    constructor() {
        this.t = new Transform();
        this.s = new Storage();

        this.formats = [new GtRead(), new PrnRead(), new DxfRead(), new CSVFormat()];
        this.currentInputFormat = 0;
        this.currentOutputFormat = 0;

        this.modules = {
            "Pointify": new Pointify(),
            "ArctoiRightAnglify": new ArctoiRightAnglify()
        };

        // TODO jotenkin ei mene hyvin tuo initModules
        this.initModules();
    }

    initModules() {
        console.log('Init modules:');
        for (const m in this.modules) {
            try {
                this.modules[m].setTransform(this.t);
            } catch(err) {
                console.log(err);
                //arctoiMessage('Surveyor','neutral',m+": no setTransform");
            }
            try {
                this.modules[m].setStorage(this.s);
            } catch(err) {
                console.log(err);
                //arctoiMessage('Surveyor','neutral',m+": no setStorage");
            }
        }
    }

    runModuleCommand(m, c) {
        this.modules[m].runCommand(c);
        /*
        try {
            this.modules[m].runCommand(c);
        } catch(err) {
           surveyorMessage(m+"-"+c,'alert',err);
       }
       */
    }

    clear() {
        this.s.clear();

        for (const m in this.modules) {
            this.modules[m].clear();
        }

        surveyorMessage('Surveyor', 'success', 'clear');
    }

    setInputFormat(format) {
        this.currentInputFormat = parseInt(format);
        console.log(`Current file-format: ${this.formats[this.currentInputFormat].title}`);
    }

    setOutputFormat(format) {
        this.currentOutputFormat = parseInt(format);
        console.log(`Current file-format: ${this.formats[this.currentOutputFormat].title}`);
    }

    input(file) {
        this.formats[this.currentInputFormat].setStorage(this.s);
        const points = this.formats[this.currentInputFormat].read(file);

        this.TransformPointsCartesianToPolar();
        this.s.addEpsg(this.t.epsg);

        return points;
    }

    TransformPointsCartesianToPolar() {
        console.log(this.t.epsg);
        for (const p in this.s.points) {
            if (this.s.points[p].epsg === "") {
                const coords = this.t.cartesianToPolar(this.s.points[p].e, this.s.points[p].n);
                this.s.points[p].lat = coords[1];
                this.s.points[p].lon = coords[0];
                this.s.points[p].epsg = this.t.epsg;
            }
        }
    }

    TransformPointsPolarToCartesian(s) {
        for (const p in s.points) {
            const coords = this.t.polarToCartesian(s.points[p].lon, s.points[p].lat);
            s.points[p].n = coords[1];
            s.points[p].e = coords[0];
        }
        return s;
    }

    // Helper function to create clean storage for export using JSON methods
    createCleanStorage() {
        // Create a deep copy using JSON methods, excluding the 'ui' property
        const cleanPoints = this.s.points.map(p => {
            const { ui, ...cleanPoint } = p; // Destructure to exclude 'ui'
            return cleanPoint;
        });
        
        return JSON.parse(JSON.stringify({
            points: cleanPoints,
            epsg: this.s.epsg
        }));
    }

    output() {
        if (this.s.epsg != this.t.epsg) {
            console.log("Eri koordinaatisto kuin tuodessa");
            let copys = this.createCleanStorage();
            copys = this.TransformPointsPolarToCartesian(copys);
            this.formats[this.currentOutputFormat].setStorage(copys);
            surveyorMessage('main', 'neutral', ` Muunto: ${this.s.epsg} > ${this.t.epsg}`);
            console.log(copys);
        } else {
            // When coordinate systems are the same, use original storage directly without any transformation
            console.log("Same coordinate system - no conversion needed");
            this.formats[this.currentOutputFormat].setStorage(this.s);
        }

        return this.formats[this.currentOutputFormat].write();
    }
}

/*
Point object
*/
class Point {
    constructor() {
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
        this.epsg = "";
    }
}

/*
Storage
*/
class Storage {
    constructor() {
        this.points = [];
        this.epsg = "";
    }

    clear() {
        this.points = [];
    }

    isEmpty() {
        return this.points.length === 0;
    }

    addEpsg(epsg) {
        if (this.epsg === "") {
            this.epsg = epsg;
        } else if (this.epsg === epsg) {
            this.epsg = epsg;
        } else {
            surveyorMessage('Storage', 'warning', 'Mixed cartesian coords');
            this.epsg = "multiple";
        }
        console.log(`Storage: ${this.epsg}`);
        return true;
    }
}


/*
SURVEYOR Transform -class to handle coordinate transforms
*/
class Transform {
    constructor() {
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
        Proj4js.defs['EPSG:900913'] = "+title=Google Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
        Proj4js.defs['EPSG:10000'] = "+title=None +proj=tmerc +lat_0=0 +lon_0=27 +k=1 +y_0=-6700000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

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
            'EPSG:3883': new Proj4js.Proj('EPSG:3883'),
            'EPSG:900913': new Proj4js.Proj('EPSG:900913'),
            'EPSG:4326': new Proj4js.Proj('EPSG:4326'),
            'EPSG:10000': new Proj4js.Proj('EPSG:10000'),
        };

        this.epsg = 'EPSG:3067';
        this.cartesian = this.projs[this.epsg];
        this.polar = Proj4js.WGS84;
        console.log(this.polar.title);
    }

    setCartesian(to) {
        console.log(`try to set ${to}`);
        this.cartesian = this.projs[to];
        this.epsg = to;
        console.log(`Cartesian set to ${this.cartesian.title}`);
        surveyorMessage('Transform', 'neutral', `coordinate system set to: ${this.cartesian.title}`);
    }

    do(x, y, from, to) {
        const r = Proj4js.transform(from, to, new Proj4js.Point([x, y]));
        return [r.x, r.y];
    }

    cartesianToPolar(x, y) {
        return this.do(x, y, this.cartesian, this.polar);
    }

    polarToCartesian(x, y) {
        return this.do(x, y, this.polar, this.cartesian);
    }
}
