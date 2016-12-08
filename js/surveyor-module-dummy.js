

var testModule = function () {
    this.title = 'Test module';
    this.t = null;
	this.s = null;

    this.commands = {
        'test1' : 'testikomento 1',
        'test2' : 'testikomento 2',
    }
};

Pointify.prototype.setTransform = function(t) {
	this.t = t;
};

Pointify.prototype.setStorage = function(s) {
	this.s = s;
};

testModule.prototype.toMapPopup = function(id, p) {
    var popup = '';
    return popup;
};

testModule.prototype.runCommand = function(c) {
    console.log(c);
};

testModule.prototype.clear = function(c) {
    console.log("clear");
};
