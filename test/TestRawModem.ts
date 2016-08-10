/// <reference path="../typings/index.d.ts" />
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
                isOpen: function():boolean{
                    return false;
                },
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
            }, null);

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
                isOpen: function():boolean{
                    return false;
                },
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
            }, null);

            modem.close().subscribe(r =>{

            }, null, ()=>{
                assert.isTrue(isSerialPortClosed);
                done();
            })
        })
    })
    describe('send(command,callback?)', function(){
        it('check the port open status', function(done){
            let modem = new RawModem({
                isOpen: function():boolean{
                    return false;
                },                
                open: function():Rx.Observable<void>{
                    return null;
                },
                close: function():Rx.Observable<void>{
                    return null;
                },
                write: function(command):Rx.Observable<string>{
                    return Rx.Observable.create(s =>{
                        assert.equal(command, 'AT+CMGF=1');
                        s.complete();
                    })
                },
                setPortOptions: function(options:ModemOptions):Rx.Observable<void>{
                    return null;
                }
            }, null);

            modem.send('AT+CMGF=1').subscribe(r =>{
                assert.fail(null, null, 'Must not reached here');
            }, err => {
                assert.equal(err.message, "Port is closed");
                done();
            }, ()=>{
                assert.fail(null, null, 'Must not reached here');
            })
        })
        it('write to the serial port', function(done){
            let isSerialPortWritten = false;
            let isPortOpened = false;

            let modem = new RawModem({
                isOpen: function():boolean{
                    return isPortOpened;
                },                
                open: function():Rx.Observable<void>{
                    return Rx.Observable.create(s =>{
                        s.next();
                        s.complete();
                    });
                },
                close: function():Rx.Observable<void>{
                    return null;
                },
                write: function(command):Rx.Observable<string>{
                    return Rx.Observable.create(s =>{
                        let commandTrimmed = command.trim();
                        
                        if(commandTrimmed !== 'AT'){
                            isSerialPortWritten = true;
                            assert.equal(command, 'AT+CMGF=1');
                        }
                        s.next();
                        s.complete();
                    })
                },
                setPortOptions: function(options:ModemOptions):Rx.Observable<void>{
                    return Rx.Observable.create(s =>{
                        isPortOpened = true;
                        s.next();
                        s.complete();
                    });
                }
            }, 
            {
                start: function(timeout:number, callback:(...args:any[])=> void):void{
                    
                },
                reset:function(){

                }
            })

            modem.open({
                autoOpen: false,
                baudRate: 9600,
                commandTimeout: 3000,
                deviceName: '/dev/ttyUSB0'
            })
            .flatMap(() => {
                return modem.send('AT+CMGF=1')
            })
            .subscribe(r =>{
            }, err => {
                assert.fail(null, null, "Must not reached here");
            }, ()=>{
                assert.isTrue(isSerialPortWritten);
                done();
            })
        })

        it('setup a timeout for the command', function(done){
            let isTimerStarted = false;
            let modem = new RawModem({
                isOpen: function():boolean{
                    return true;
                },                
                open: function():Rx.Observable<void>{
                    return Rx.Observable.create(s =>{
                        s.next();
                        s.complete();
                    })
                },
                close: function():Rx.Observable<void>{
                    return null;
                },
                write: function(command):Rx.Observable<string>{
                    return Rx.Observable.create(s =>{
                        s.next();
                        s.complete();
                    })
                },
                setPortOptions: function(options:ModemOptions):Rx.Observable<void>{
                    return Rx.Observable.create(s =>{
                        s.next();
                        s.complete();
                    })
                }
            },
            {
                start: function(timeout:number, callback:(...args:any[])=> void):void{
                    isTimerStarted = true;
                    assert.equal(timeout, 3000);
                    assert.isNotNull(callback);
                },
                reset:function(){

                }
            })            

            modem.open({
                autoOpen: false,
                baudRate: 9600,
                commandTimeout: 3000,
                deviceName: '/dev/ttyUSB0'
            })
            .flatMap(() => {
                return modem.send('AT+CMGF=1')
            })
            .subscribe(r =>{
                assert.isTrue(isTimerStarted);
            }, err => {
                assert.fail(null, null, "Must not reached here");
            }, ()=>{
                done();
            })
        })

        it('subscribes to port events', function(done){
        })

        it('clean up all port event listeners when the command timedout', function(done){
        })

        it('clean up all port event listeners when the port error', function(done){
        })

        it('stop the command timer and clean up all port event listeners when the writing failed', function(done){
        })

        it('calls the command callback when specified', function(done){

        })

        it('parse the AT command response correctly', function(){

        })

        it('parse the AT+CGMI command response correctly', function(){
            
        })

        it('parse the AT+CGSN command response correctly', function(){
            
        })

        it('parse the AT+CSCS="GSM" command response correctly', function(){
            
        })

        it('parse the AT+CMGS="08898892382" command response correctly', function(){
            
        })
    })
})