"use strict";
/// <reference path="../typings/index.d.ts" />
const RawModem_1 = require('../lib/RawModem');
const ModemOptions_1 = require('../lib/ModemOptions');
const Rx = require('rxjs/Rx');
const chai_1 = require('chai');
describe('RawModem', function () {
    describe('open', function () {
        it('open the serial port', function (done) {
            let isSerialPortOpened = false;
            let isPortOptionsCalled = false;
            let isCommandATWritten = false;
            let modem = new RawModem_1.RawModem({
                open: function () {
                    return Rx.Observable.create(s => {
                        isSerialPortOpened = true;
                        s.next();
                        s.complete();
                    });
                },
                close: function () {
                    return null;
                },
                write: function (command) {
                    return Rx.Observable.create(s => {
                        let trimmedCommand = command.trim();
                        if (trimmedCommand === 'AT') {
                            isCommandATWritten = true;
                        }
                        s.next('');
                        s.complete();
                    });
                },
                setPortOptions: function (options) {
                    return Rx.Observable.create(s => {
                        isPortOptionsCalled = true;
                        chai_1.assert.equal(options.autoOpen, modemOptions.autoOpen);
                        chai_1.assert.equal(options.baudRate, modemOptions.baudRate);
                        chai_1.assert.equal(options.deviceName, modemOptions.deviceName);
                        s.next();
                        s.complete();
                    });
                }
            });
            let modemOptions = new ModemOptions_1.ModemOptions();
            modemOptions.autoOpen = true;
            modemOptions.baudRate = 9600;
            modemOptions.deviceName = "/dev/ttyUSB0";
            modem.open(modemOptions).subscribe(r => {
            }, null, () => {
                chai_1.assert.isTrue(isSerialPortOpened);
                chai_1.assert.isTrue(isPortOptionsCalled, 'setPortOptions not called');
                chai_1.assert.isTrue(isCommandATWritten, 'command AT not writtend');
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
