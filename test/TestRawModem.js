"use strict";
/// <reference path="../typings/index.d.ts" />
const RawModem_1 = require('../lib/RawModem');
const Rx = require('rxjs/Rx');
const chai_1 = require('chai');
describe('RawModem', function () {
    describe('open', function () {
        it('open the serial port', function (done) {
            let isSerialPortOpened = false;
            let modem = new RawModem_1.RawModem({
                open: function () {
                    return Rx.Observable.create(s => {
                        isSerialPortOpened = true;
                        s.complete();
                    });
                },
                close: function () {
                    return null;
                },
                write: function () {
                    return null;
                },
                setPortOptions: function (options) {
                    return null;
                }
            });
            modem.open().subscribe(r => {
            }, null, () => {
                chai_1.assert.isTrue(isSerialPortOpened);
                done();
            });
        });
    });
    describe('close', function () {
        it('close the serial port', function (done) {
            let isSerialPortClosed = false;
            let modem = new RawModem_1.RawModem({
                open: function () {
                    return null;
                },
                close: function () {
                    return Rx.Observable.create(s => {
                        isSerialPortClosed = true;
                        s.complete();
                    });
                },
                write: function () {
                    return null;
                },
                setPortOptions: function (options) {
                    return null;
                }
            });
            modem.close().subscribe(r => {
            }, null, () => {
                chai_1.assert.isTrue(isSerialPortClosed);
                done();
            });
        });
    });
    describe('send(command)', function () {
        it('write to the serial port', function (done) {
            let isSerialPortWritten = false;
            let modem = new RawModem_1.RawModem({
                open: function () {
                    return null;
                },
                close: function () {
                    return null;
                },
                write: function (command) {
                    return Rx.Observable.create(s => {
                        isSerialPortWritten = true;
                        chai_1.assert.equal(command, 'AT+CMGF=1');
                        s.complete();
                    });
                },
                setPortOptions: function (options) {
                    return null;
                }
            });
            modem.send('AT+CMGF=1').subscribe(r => {
            }, null, () => {
                chai_1.assert.isTrue(isSerialPortWritten);
                done();
            });
        });
    });
});
