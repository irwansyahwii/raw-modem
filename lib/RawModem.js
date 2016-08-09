"use strict";
const Rx = require('rxjs/Rx');
class RawModem {
    constructor(serialPort) {
        this.serialPort = serialPort;
    }
    open(options) {
        return Rx.Observable.create(s => {
            this.serialPort.setPortOptions(options)
                .flatMap(() => this.serialPort.open())
                .flatMap(() => this.serialPort.write('AT\r'))
                .subscribe(r => {
                s.next();
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
