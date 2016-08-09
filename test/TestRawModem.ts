/// <reference path="../typings/index.d.ts" />
import {RawModem} from '../lib/RawModem';
import {ISerialPort} from '../lib/ISerialPort';
import {PortOptions} from '../lib/PortOptions';

import Rx = require('rxjs/Rx');
import {assert} from 'chai';

describe('RawModem', function(){
    describe('open', function(){
        it('open the serial port', function(done){

            let isSerialPortOpened = false;

            let modem = new RawModem({
                open: function():Rx.Observable<void>{
                    return Rx.Observable.create(s =>{
                        isSerialPortOpened = true;
                        s.complete();
                    })
                },
                close: function():Rx.Observable<void>{
                    return null;
                },
                write: function():Rx.Observable<string>{
                    return null;
                },
                setPortOptions: function(options:PortOptions):Rx.Observable<void>{
                    return null;
                }                                
            })

            modem.open().subscribe(r =>{

            }, null, ()=>{
                assert.isTrue(isSerialPortOpened);
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
                setPortOptions: function(options:PortOptions):Rx.Observable<void>{
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
                setPortOptions: function(options:PortOptions):Rx.Observable<void>{
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