/*

Prototype class for all format -classes

*/
class ProtoRead {
    constructor() {
        this.xIse = false;
        this.s = null;
        this.isOutput = false;
        this.isInput = false;
    }

    setStorage(s) {
        this.s = s;
    }

    changeAxis() {
        this.xIse = !this.xIse;
    }
}

/*

CSV-writer

*/
class CSVFormat extends ProtoRead {
    constructor() {
        super();
        this.title = 'csv';
        this.isOutput = true;
    }

    write() {
        if (this.s.points.length === 0) {
            console.log('Empty points list');
            return;
        }

        let text = this.getCsvHeader(this.s.points[0]) + "\r\n";

        for (const point in this.s.points) {
            text = text + this.getCsvLine(this.s.points[point]) + "\r\n";
        }
        return text;
    }

    getCsvHeader(p) {
        console.log(p);
        let h = "";
        for (const property in p) {
            if (p.hasOwnProperty(property)) {
                h = h + property + ";";
            }
        }
        return h;
    }

    getCsvLine(p) {
        let l = "";
        for (const property in p) {
            if (p.hasOwnProperty(property)) {
                l = l + p[property] + ";";
            }
        }
        return l;
    }
}
/*

DXF-reader

*/
class DxfRead extends ProtoRead {
    constructor() {
        super();
        this.title = 'dxf';
        this.isInput = true;
    }

    read(file) {
        console.log('DxfRead read');

        const lines = file.split('\n');
        const poi = [];
        let name = '';

        for (let line = 0; line < lines.length; line++) {
            if (lines[line].includes("POINT")) {
                name = lines[line + 2]
            }

            if (lines[line].includes("AcDbPoint")) {
                const x = lines[line + 2]
                const y = lines[line + 4]
                const z = lines[line + 6]
                this.s.points.push(this.createPoint(name, x, y, z));
                poi.push(this.s.points.length - 1);
            }
        }
        return poi;
    }

    createPoint(rawname, rawx, rawy, rawz) {
        const p = new Point();
        p.name = rawname.trim();

        const x = parseFloat(rawx.trim());
        const y = parseFloat(rawy.trim());
        p.altitude = parseFloat(rawz.trim());

        if (isNaN(p.altitude)) {
            p.altitude = 0.0;
        }

        if (this.xIse) {
            p.n = y;
            p.e = x;
        } else {
            p.n = x;
            p.e = y;
        }

        console.log(p.name + '  ' + p.n + '  ' + p.e + '  ' + p.altitude);
        return p;
    }
}

/*

PRN-reader

*/
class PrnRead extends ProtoRead {
    constructor() {
        super();
        this.title = 'prn';
        this.isInput = true;
        this.isOutput = true;
    }

    read(file) {
        console.log('PrnRead read');
        console.log(file);

        const lines = file.split('\n');
        const poi = [];

        for (let line = 0; line < lines.length; line++) {
            console.log(lines[line]);
            const elements = lines[line].trim().split(' ');
            console.log(line);
            if (elements.length === 4) {
                console.log(line);
                this.s.points.push(this.elementsRead(elements));
                poi.push(this.s.points.length - 1);
            }
        }
        return poi;
    }

    elementsRead(elements) {
        const p = new Point();
        p.name = elements[0].trim();

        const x = parseFloat(elements[1].trim());
        const y = parseFloat(elements[2].trim());

        p.altitude = parseFloat(elements[3].trim());

        if (this.xIse) {
            p.n = y;
            p.e = x;
        } else {
            p.n = x;
            p.e = y;
        }

        return p;
    }

    write() {
        let text = "";
        for (const p in this.s.points) {
            text = text + this.writePoint(this.s.points[p]) + "\r\n";
        }
        return text;
    }

    writePoint(p) {
        let text = "";

        text = text + " " + p.name;

        let x = 0.0;
        let y = 0.0;

        if (this.xIse) {
            y = p.n;
            x = p.e;
        } else {
            x = p.n;
            y = p.e;
        }

        text = text + " " + x;
        text = text + " " + y;
        text = text + " " + p.altitude;

        return text;
    }
}

/*

GT-reader

*/
class GtRead extends ProtoRead {
    constructor() {
        super();
        this.title = 'gt';
        this.isInput = true;
        this.isOutput = true;
    }

    lineRead(line) {
        const p = new Point();
        p.t1 = line.substring(0, 8).trim();
        p.t2 = line.substring(9, 16).trim();
        p.t3 = line.substring(17, 24).trim();
        p.name = line.substring(25, 32).trim();

        const x = parseFloat(line.substring(33, 46).trim());
        const y = parseFloat(line.substring(47, 60).trim());

        p.altitude = parseFloat(line.substring(61, 74).trim());

        if (this.xIse) {
            p.n = y;
            p.e = x;
        } else {
            p.n = x;
            p.e = y;
        }
        return p;
    }

    read(file) {
        const lines = file.split('\n');
        const poi = [];

        for (let line = 0; line < lines.length; line++) {
            if (lines[line].length > 73 && lines[line].length < 78) {
                this.s.points.push(this.lineRead(lines[line]));
                poi.push(this.s.points.length - 1);
            }
        }
        return poi;
    }

    write() {
        let text = "";
        for (const p in this.s.points) {
            text = text + this.writePoint(this.s.points[p]) + "\r\n";
        }
        return text;
    }

    writePoint(p) {
        let text = "";

        text = text + this.writeProperty(p.t1, 8);
        text = text + this.writeProperty(p.t2, 8);
        text = text + this.writeProperty(p.t3, 8);
        text = text + this.writeProperty(p.name, 8);

        let x = 0.0;
        let y = 0.0;

        if (this.xIse) {
            y = p.n;
            x = p.e;
        } else {
            x = p.n;
            y = p.e;
        }

        text = text + this.writeProperty(this.writeCoord(x), 14);
        text = text + this.writeProperty(this.writeCoord(y), 14);
        text = text + this.writeProperty(this.writeCoord(p.altitude), 14);

        return text;
    }

    writeProperty(data, length) {
        let text = "";

        if (data.length === length) {
            text = data;
            return text;
        } else if (data.length > length) {
            text = data.substring(0, length);
        } else {
            text = " ".repeat(length - data.length);
            text = text + data;
        }
        return text;
    }

    writeCoord(c) {
        const nums = c.toString().split('.');

        if (nums.length === 2) {
            let text = nums[0] + ".";
            if (nums[1].length === 3) {
                return text + nums[1];
            } else if (nums[1].length > 3) {
                return text + nums[1].substring(0, 3);
            } else {
                return text + nums[1] + "0".repeat(3 - nums[1].length);
            }
        }
        return nums[0] + ".000";
    }
}
