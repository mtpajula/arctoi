

var testModule = function () {
    this.title = 'Test module';

    this.commands = {
        'test1' : 'testikomento 1',
        'test2' : 'testikomento 2',
    }

    this.stuff = {
        "t" : false,
        "s" : false
    };
};

testModule.prototype.runCommand = function(c) {
    console.log(c);
};

testModule.prototype.clear = function(c) {
    console.log("clear");
};
