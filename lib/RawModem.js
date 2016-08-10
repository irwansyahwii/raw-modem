"use strict";
const Rx = require('rxjs/Rx');
class RawModem {
    constructor(serialPort, commandTimer) {
        this.serialPort = serialPort;
        this.commandTimer = commandTimer;
        this._modemOptions = null;
    }
    open(options) {
        return Rx.Observable.create(s => {
            this._modemOptions = options;
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
    send(command, callback) {
        return Rx.Observable.create(s => {
            if (!this.serialPort.isOpen()) {
                s.error(new Error('Port is closed'));
            }
            else {
                this.commandTimer.start(this._modemOptions.commandTimeout, () => {
                    s.error(new Error('Command timedout: ' + command.trim()));
                });
                this.serialPort.write(command, callback).subscribe(r => {
                    s.next(r);
                }, err => {
                    s.error(err);
                }, () => {
                    s.complete();
                });
            }
        });
    }
}
exports.RawModem = RawModem;
