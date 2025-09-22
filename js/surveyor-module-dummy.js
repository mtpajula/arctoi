

class TestModule {
    constructor() {
        this.title = 'Test module';
        this.t = null;
        this.s = null;

        this.commands = {
            'test1': 'testikomento 1',
            'test2': 'testikomento 2',
        }
    }

    setTransform(t) {
        this.t = t;
    }

    setStorage(s) {
        this.s = s;
    }

    toMapPopup(id, p) {
        const popup = '';
        return popup;
    }

    runCommand(c) {
        console.log(c);
    }

    clear(c) {
        console.log("clear");
    }
}
