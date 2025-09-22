/*

Right angle calculator Arctoi-map ui interaction class

*/
var rightangle = new L.FeatureGroup();
map.addLayer(rightangle);

class ArctoiRightAnglify {
    constructor() {
        this.ra = new RightAnglify();
        this.title = 'RightAnglify';

        this.commands = {
            'clear': 'tyhjennä mittalinja'
        };
    }

    setTransform(t) {
        console.log('set transform to ArctoiRightAnglify')
        this.ra.t = t;
    }

    setStorage(s) {
        this.s = s;
    }

    runCommand(c) {
        if (c === 'clear') {
            this.clear();
        }
    }

    clear(c) {
        this.ra.clear();
        rightangle.clearLayers();
        surveyorMessage('ArctoiRightAnglify', 'success', 'clear');
    }

    toMapPopup(id, p) {
        let popup = '<br /><br /><button class="btn btn-primary" onclick=rightangle1(' + id + ') value="test">mittalinjan alku</button>';
        popup = popup + '<br /><br /><button class="btn btn-primary" onclick=rightangle2(' + id + ') value="test">mittalinjan loppu</button>';
        popup = popup + '<br /><br /><button class="btn btn-primary" onclick=perpendicular(' + id + ') value="test">mittaa tähän</button>';
        return popup;
    }
}


const drawRigthAngle = () => {
    const l = surveyor.modules['ArctoiRightAnglify'].ra.length;
    const a = surveyor.modules['ArctoiRightAnglify'].ra.a;
    const b = surveyor.modules['ArctoiRightAnglify'].ra.b;
    console.log("ra l:" + l + " a:" + a + " b:" + b);
}

const rightangle1 = (id) => {
    console.log("rightangle1 " + id);
    surveyor.modules['ArctoiRightAnglify'].ra.point1 = surveyor.s.points[parseInt(id)];
    drawRigthAngle();
}

const rightangle2 = (id) => {
    console.log("rightangle2 " + id);
    surveyor.modules['ArctoiRightAnglify'].ra.point2 = surveyor.s.points[parseInt(id)];
    drawRigthAngle();
}

const perpendicular = (id) => {
    const ra = surveyor.modules['ArctoiRightAnglify'].ra;
    console.log("perpendicular " + id);
    ra.createSurveyLine();
    ra.setPerpendicular(surveyor.s.points[parseInt(id)]);

    const colorSline = "#3399ff";
    const colorA = "#33cc33";
    const colorB = "#ff9900";

    let popupstr = '<table class="table table-bordered"><thead><tr><th>Linja</th><th>Pituus</th></tr></thead><tbody>'
    popupstr = popupstr + '<tr><td><span style="color:' + colorSline + ';">Mittalinja</span></td><td>' + ra.length + ' m</td></tr>';
    popupstr = popupstr + '<tr><td><span style="color:' + colorA + ';">a</span></td><td>' + ra.a + ' m</td></tr>';
    popupstr = popupstr + '<tr><td><span style="color:' + colorB + ';">b</span></td><td>' + ra.b + ' m</td></tr>';
    popupstr = popupstr + '</tbody></table>';

    L.circleMarker([ra.intersectionPoint.lat, ra.intersectionPoint.lon], { color: 'black' }).bindPopup(popupstr).addTo(rightangle);

    L.polyline(ra.getSurveyLineLatLon(), { color: colorSline }).addTo(rightangle);
    L.polyline(ra.aLatLon(), { color: colorA }).addTo(rightangle);
    L.polyline(ra.bLatLon(), { color: colorB }).addTo(rightangle);

    drawRigthAngle();
}


/*

Right angle calculator

*/

class Line {
    constructor() {
        this.a = 0.0;
        this.b = 0.0;
    }

    createFromPoints(point1, point2) {
        this.a = (point1.n - point2.n) / (point1.e - point2.e);
        this.b = (-1) * (this.a * point1.e) + point1.n;
        this.log();
    }

    createFromRightAngle(point, line) {
        this.a = (-1) / line.a;
        this.b = (-1) * (this.a * point.e) + point.n;
        this.log();
    }

    log() {
        console.log("y = " + this.a + "x + " + this.b);
    }

    clear() {
        this.a = 0.0;
        this.b = 0.0;
    }
}


/*

Right angle measurement

*/

class RightAnglify {
    constructor() {
        this.point1 = null;
        this.point2 = null;
        this.pointTo = null;
        this.intersectionPoint = null;
        this.surveyLine = new Line();
        this.perpendicularLine = new Line();
        this.t = null;
        this.a = 0.0;
        this.b = 0.0;
        this.length = 0.0;
    }

    setTransform(t) {
        this.t = t;
    }

    clear() {
        this.point1 = null;
        this.point2 = null;
        this.pointTo = null;
        this.intersectionPoint = null;
        this.surveyLine.clear();
        this.perpendicularLine.clear();
        this.a = 0.0;
        this.b = 0.0;
        this.length = 0.0;
    }

    setSurveyLine(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
        this.createSurveyLine();
    }

    createSurveyLine() {
        this.surveyLine.createFromPoints(this.point1, this.point2);
        this.length = this.distance(this.point1, this.point2);
    }

    setPerpendicular(pointTo) {
        this.pointTo = pointTo;
        this.perpendicularLine.createFromRightAngle(pointTo, this.surveyLine);
        this.getIntersectionPoint();
        this.countAB();
        console.log("a: " + this.a + "  b: " + this.b);
    }

    getSurveyLineLatLon() {
        const line = []
        line.push([this.point1.lat, this.point1.lon]);
        line.push([this.point2.lat, this.point2.lon]);

        return line;
    }

    aLatLon() {
        const line = []
        line.push([this.point1.lat, this.point1.lon]);
        line.push([this.intersectionPoint.lat, this.intersectionPoint.lon]);

        return line;
    }

    bLatLon() {
        const line = []
        line.push([this.intersectionPoint.lat, this.intersectionPoint.lon]);
        line.push([this.pointTo.lat, this.pointTo.lon]);

        return line;
    }

    getIntersectionPoint() {
        const div = (this.perpendicularLine.b - this.surveyLine.b) / (this.surveyLine.a - this.perpendicularLine.a);

        this.intersectionPoint = new Point();
        this.intersectionPoint.n = Math.round((this.surveyLine.a * div + this.surveyLine.b) * 1000) / 1000;
        this.intersectionPoint.e = Math.round(div * 1000) / 1000;

        const coord = this.t.cartesianToPolar(this.intersectionPoint.e, this.intersectionPoint.n);
        this.intersectionPoint.lat = coord[1];
        this.intersectionPoint.lon = coord[0];
        console.log(this.intersectionPoint);
    }

    countAB() {
        this.a = this.distance(this.point1, this.intersectionPoint);
        this.b = this.distance(this.intersectionPoint, this.pointTo);
        this.countAB2();
    }

    countAB2() {
        const sp = new SurveyPoint();
        sp.setPoint(this.point1);
        sp.setMeasure(this.point2);
        sp.setMeasure(this.intersectionPoint);

        if (sp.measure[0].quarter !== sp.measure[1].quarter) {
            this.a = this.a * (-1);
        }

        sp.clear();
        sp.setPoint(this.intersectionPoint);
        sp.setMeasure(this.point1);
        sp.setMeasure(this.pointTo);

        switch (sp.measure[0].quarter) {
            case 1:
                if (sp.measure[1].quarter === 2) {
                    this.b = this.b * (-1);
                }
                break;
            case 2:
                if (sp.measure[1].quarter === 3) {
                    this.b = this.b * (-1);
                }
                break;
            case 3:
                if (sp.measure[1].quarter === 4) {
                    this.b = this.b * (-1);
                }
                break;
            case 4:
                if (sp.measure[1].quarter === 1) {
                    this.b = this.b * (-1);
                }
                break;
        }

        if (this.a < 0) {
            this.b = this.b * (-1);
        }
    }

    distance(p1, p2) {
        const dn = p1.n - p2.n;
        const de = p1.e - p2.e;
        return Math.round(Math.sqrt(de * de + dn * dn) * 1000) / 1000;
    }
}

/*

Survey point

*/

class SurveyPoint {
    constructor() {
        this.p = null;
        this.measure = [];
        this.angle = 0.0;
        this.quarter = 0;
        this.distance = 0.0;
    }

    clear() {
        this.p = null;
        this.measure = [];
        this.angle = 0.0;
        this.quarter = 0;
    }

    setPoint(point) {
        this.p = point;
    }

    setMeasure(point) {
        if (this.p === null) {
            console.log("No original survey point");
            return;
        }

        const spoint = new SurveyPoint();
        spoint.setPoint(point);

        spoint.setQuarter(this.p)
        spoint.setAngleToParent(this.p);
        spoint.setDistanceToParent(this.p);

        this.measure.push(spoint);
    }

    reSet(point, num) {
        const spoint = this.measure[num];
        spoint.setPoint(point);

        spoint.setQuarter(this.p)
        spoint.setAngleToParent(this.p);
        spoint.setDistanceToParent(this.p);
    }

    reCalc() {
        for (const p in this.measure) {
            this.measure[p].setQuarter(this.p)
            this.measure[p].setAngleToParent(this.p);
            this.measure[p].setDistanceToParent(this.p);
        }
    }

    setAngleToParent(point) {
        this.angle = Math.atan((this.p.n - point.n) / (this.p.e - point.e)) * (180 / Math.PI);
        this.angle = this.angle / 0.9;

        switch (this.quarter) {
            case 1:
                this.angle = 300 - Math.abs(this.angle);
                break;
            case 2:
                this.angle = Math.abs(this.angle) + 300;
                break;
            case 3:
                this.angle = 100 - Math.abs(this.angle);
                break;
            case 4:
                this.angle = Math.abs(this.angle) + 100;
                break;
        }
    }

    angleFromParent() {
        switch (this.quarter) {
            case 1:
                return this.angle - 200;
            case 2:
                return this.angle - 200;
            case 3:
                return this.angle + 200;
            case 4:
                return this.angle + 200;
        }
    }

    setDistanceToParent(point) {
        const dn = this.p.n - point.n;
        const de = this.p.e - point.e;
        this.distance = Math.sqrt(de * de + dn * dn);
    }

    setQuarter(point) {
        if ((this.p.e - point.e) >= 0) {
            if ((this.p.n - point.n) >= 0) {
                this.quarter = 1;
            } else {
                this.quarter = 2;
            }
        } else {
            if ((this.p.n - point.n) >= 0) {
                this.quarter = 4;
            } else {
                this.quarter = 3;
            }
        }
    }

    log() {
        console.log("SurveyPoint: " + this.p.name + " Measurements: " + this.measure.length);
        console.log("  n: " + this.p.n + " e: " + this.p.e);
        for (const p in this.measure) {
            console.log("    Point: " + this.measure[p].p.name + " Anglefrom: " + this.measure[p].angleFromParent() + " distance: " + this.measure[p].distance);
            console.log("    n: " + this.measure[p].p.n + " e: " + this.measure[p].p.e);
        }
    }
}
