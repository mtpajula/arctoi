/*

Prototype class for all format -classes

*/
var ProtoRead = function () {
	this.xIse = false;
	this.s = null;
    this.isOutput = false;
    this.isInput = false;
};

ProtoRead.prototype.setStorage = function(s) {
	this.s = s;
};

ProtoRead.prototype.changeAxis = function() {
	if (this.xIse === true) {
		this.xIse = false;
	} else {
		this.xIse = true;
	}
};

/*

CSV-writer

*/
function CSVFormat() {
	ProtoRead.call(this);
	this.title = 'csv';
    this.isOutput = true;
}

CSVFormat.prototype = Object.create(ProtoRead.prototype);
CSVFormat.prototype.constructor = CSVFormat;

CSVFormat.prototype.write = function() {

	if (this.points.length === 0) {
		console.log('Empty points list');
		return;
	}

	var text = this.getCsvHeader(this.points[0]) + "\r\n";

	for (var point in this.points) {
		text = text + this.getCsvLine(this.points[point]) + "\r\n";
	}
	return text;
};

CSVFormat.prototype.getCsvHeader = function(p) {
	console.log(p);
	var h = "";
	for (var property in p) {
	    if (p.hasOwnProperty(property)) {
	        h = h + property + ";";
	    }
	}
	return h;
};

CSVFormat.prototype.getCsvLine = function(p) {
	var l = "";
	for (var property in p) {
	    if (p.hasOwnProperty(property)) {
	        l = l + p[property] + ";";
	    }
	}
	return l;
};
/*

DXF-reader

*/
function DxfRead() {
	ProtoRead.call(this);
	this.title = 'dxf';
    this.isInput = true;
}

DxfRead.prototype = Object.create(ProtoRead.prototype);
DxfRead.prototype.constructor = DxfRead;

DxfRead.prototype.read = function(file) {
	console.log('PrnRead read');

	var lines = file.split('\n');
    var poi = [];
    var name = '';

    for(var line = 0; line < lines.length; line++){
    	if (lines[line].includes("POINT")) {
    		name = lines[line + 2]
    	}

    	if (lines[line].includes("AcDbPoint")) {
    		var x = lines[line + 2]
    		var y = lines[line + 4]
    		var z = lines[line + 6]
    		this.s.points.push(this.createPoint(name,x,y,z));
            poi.push(this.s.points.length - 1);
    	}
    }
    return poi;
};

DxfRead.prototype.createPoint = function(rawname,rawx,rawy,rawz) {
	var p = new Point();
    p.name = rawname.trim();

    var x = parseFloat(rawx.trim());
    var y = parseFloat(rawy.trim());
    p.altitude = parseFloat(rawz.trim());

    if (this.xIse) {
    	p.n = y;
    	p.e = x;
    } else {
    	p.n = x;
    	p.e = y;
    }

    console.log(p.name + '  ' + p.n + '  ' + p.e + '  ' + p.altitude);
    return p;
};

/*

PRN-reader

*/
function PrnRead() {
	ProtoRead.call(this);
	this.title = 'prn';
    this.isInput = true;
}

PrnRead.prototype = Object.create(ProtoRead.prototype);
PrnRead.prototype.constructor = PrnRead;

PrnRead.prototype.read = function(file) {
	console.log('PrnRead read');
	console.log(file);

	var lines = file.split('\n');
    var poi = [];

    for(var line = 0; line < lines.length; line++){
        console.log(lines[line]);
        var elements = lines[line].trim().split(' ');
        console.log(line);
        if (elements.length == 4) {
        	console.log(line);
        	this.s.points.push(this.elementsRead(elements));
            poi.push(this.s.points.length - 1);
        }
    }
    return poi;
};

PrnRead.prototype.elementsRead = function(elements) {

    var p = new Point();
    p.name = elements[0].trim();

    var x = parseFloat(elements[1].trim());
    var y = parseFloat(elements[2].trim());

    p.altitude = parseFloat(elements[3].trim());

    if (this.xIse) {
    	p.n = y;
    	p.e = x;
    } else {
    	p.n = x;
    	p.e = y;
    }

    return p;
};

/*

GT-reader

*/
function GtRead() {
	ProtoRead.call(this);
	this.title = 'gt';
    this.isInput = true;
    this.isOutput = true;
}

GtRead.prototype = Object.create(ProtoRead.prototype);
GtRead.prototype.constructor = GtRead;

GtRead.prototype.lineRead = function(line) {
    var p = new Point();
    p.t1 = line.substring(0,8).trim();
    p.t2 = line.substring(9,16).trim();
    p.t3 = line.substring(17,24).trim();
    p.name = line.substring(25,32).trim();

    var x = parseFloat(line.substring(33,46).trim());
    var y = parseFloat(line.substring(47,60).trim());

    p.altitude = parseFloat(line.substring(61,74).trim());

    if (this.xIse) {
    	p.n = y;
    	p.e = x;
    } else {
    	p.n = x;
    	p.e = y;
    }
    return p;
};

GtRead.prototype.read = function(file) {
	var lines = file.split('\n');
    var poi = [];

    for(var line = 0; line < lines.length; line++){
        //console.log(lines[line]);
        if (lines[line].length > 73 & lines[line].length < 78) {
        	this.s.points.push(this.lineRead(lines[line]));
            poi.push(this.s.points.length - 1);
        }
    }
    return poi;
};

GtRead.prototype.write = function() {
	var text = "";
	for (var p in this.s.points) {
		text = text + this.writePoint(this.s.points[p]) + "\r\n";
	}
	return text;
};

GtRead.prototype.writePoint = function(p) {
	var text = "";

	text = text + this.writeProperty(p.t1,8);
	text = text + this.writeProperty(p.t2,8);
	text = text + this.writeProperty(p.t3,8);
	text = text + this.writeProperty(p.name,8);

	var x = 0.0;
	var y = 0.0;

	if (this.xIse) {
    	y = p.n;
    	x = p.e;
    } else {
    	x = p.n;
    	y = p.e;
    }

	text = text + this.writeProperty(this.writeCoord(x),14);
	text = text + this.writeProperty(this.writeCoord(y),14);
	text = text + this.writeProperty(this.writeCoord(p.altitude),14);

	console.log(text);

	return text;
};

GtRead.prototype.writeProperty = function(data, length) {

	//console.log("data: "+data +" length: "+ length+" datalength: "+data.length);
	var text = "";

	if (data.length === length) {
		text = data;
		return text;
	} else if (data.length > length) {
		text = data.substring(0,lenght);
	} else {
		text = " ".repeat(length - data.length);//" " * (length - data.length);
		text = text + data;
	}
	//console.log(text);
	return text
};

GtRead.prototype.writeCoord = function(c) {

	var nums = c.toString().split('.');

	if (nums.length === 2) {
		var text = nums[0] + ".";
		if (nums[1].length === 3) {
			return text + nums[1];
		} else if (nums[1].length > 3) {
			return text + nums[1].substring(0,3);
		} else {
			return text + nums[1] + "0".repeat(3 - nums[1].length);
		}
	}
	return nums[0] + ".000";
};
