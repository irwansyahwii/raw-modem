"use strict";
const Rx = require('rxjs/Rx');
class RawModem {
    constructor(serialPort) {
        this.serialPort = serialPort;
    }
    open() {
        return Rx.Observable.create(s => {
            this.serialPort.open()
                .subscribe(r => {
                s.next(r);
            }, err => {
                s.error(err);
            }, () => {
                s.complete();
            });
        });
    }
    close() {
        return Rx.Observable.create(s => {
            this.serialPort.close()
                .subscribe(r => {
                s.next(r);
            }, err => {
                s.error(err);
            }, () => {
                s.complete();
            });
        });
    }
    send(command) {
        return Rx.Observable.create(s => {
            this.serialPort.write(command).subscribe(r => {
                s.next(r);
            }, err => {
                s.error(err);
            }, () => {
                s.complete();
            });
        });
    }
}
exports.RawModem = RawModem;
