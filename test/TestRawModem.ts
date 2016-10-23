import {RawModem} from '../lib/RawModem';
import {ISerialPort} from '../lib/ISerialPort';
import {ModemOptions} from '../lib/ModemOptions';

import Rx = require('rxjs/Rx');
import {assert} from 'chai';

describe('RawModem', function(){
    describe('open', function(){
        it('open the serial port', function(done){

            let isSerialPortOpened = false;
            let isPortOptionsCalled = false;
            let isCommandATWritten = false;

            let modem = new RawModem({
                open: function():Rx.Observable<void>{
                    return Rx.Observable.create(s =>{
                        isSerialPortOpened = true;
                        s.next();
                        s.complete();
                    })
                },
                close: function():Rx.Observable<void>{
                    return null;
                },
                write: function(command):Rx.Observable<string>{
                    return Rx.Observable.create(s =>{
                        let trimmedCommand = command.trim();
                        if(trimmedCommand === 'AT'){
                            isCommandATWritten = true;
                        }
                        s.next('');
                        s.complete();
                    });
                },
                setPortOptions: function(options:ModemOptions):Rx.Observable<void>{                    
                    return Rx.Observable.create(s =>{
                        isPortOptionsCalled = true;
                        assert.equal(options.autoOpen, modemOptions.autoOpen);
                        assert.equal(options.baudRate, modemOptions.baudRate);
                        assert.equal(options.deviceName, modemOptions.deviceName);

                        s.next();
                        s.complete();
                    });
                }                                
            })

            let modemOptions = new ModemOptions();
            modemOptions.autoOpen = true;
            modemOptions.baudRate = 9600;
            modemOptions.deviceName = "/dev/ttyUSB0";

            modem.open(modemOptions).subscribe(r =>{

            }, null, ()=>{
                assert.isTrue(isSerialPortOpened);
                assert.isTrue(isPortOptionsCalled, 'setPortOptions not called');
                assert.isTrue(isCommandATWritten, 'command AT not writtend')
                done();
            })
        })
    })
    describe('close', function(){
        it('close the serial port', function(done){
            let isSerialPortClosed = false;

            let modem = new RawModem({
                open: function():Rx.Observable<void>{
                    return null;
                },
                close: function():Rx.Observable<void>{
                    return Rx.Observable.create(s =>{
                        isSerialPortClosed = true;
                        s.complete();
                    })
                },
                write: function():Rx.Observable<string>{
                    return null;
                },
                setPortOptions: function(options:ModemOptions):Rx.Observable<void>{
                    return null;
                }                                
            })

            modem.close().subscribe(r =>{

            }, null, ()=>{
                assert.isTrue(isSerialPortClosed);
                done();
            })
        })
    })
    describe('send(command)', function(){
        it('write to the serial port', function(done){
            let isSerialPortWritten = false;

            let modem = new RawModem({
                open: function():Rx.Observable<void>{
                    return null;
                },
                close: function():Rx.Observable<void>{
                    return null;
                },
                write: function(command):Rx.Observable<string>{
                    return Rx.Observable.create(s =>{
                        isSerialPortWritten = true;
                        assert.equal(command, 'AT+CMGF=1');
                        s.complete();
                    })
                },
                setPortOptions: function(options:ModemOptions):Rx.Observable<void>{
                    return null;
                }
            })

            modem.send('AT+CMGF=1').subscribe(r =>{

            }, null, ()=>{
                assert.isTrue(isSerialPortWritten);
                done();
            })
        })
    })
})