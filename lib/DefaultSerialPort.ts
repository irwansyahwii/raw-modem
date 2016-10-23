import {ISerialPort} from './ISerialPort';
let SerialPort = require('serialport');
import {ModemOptions} from './ModemOptions';

import Rx = require('rxjs/Rx');

export class DefaultSerialPort implements ISerialPort{

    private _portOptions:ModemOptions = null;
    private _devicePort: any = null;

    

    constructor(){
        
    }

    get devicePort(){
        return this._devicePort;
    }

    _checkDevicePort(){
        if(this.devicePort == null){
            throw new Error('Port not created');
        }
    }

    open(): Rx.Observable<void>{
        return Rx.Observable.create(s =>{
            this._checkDevicePort();

            this.devicePort.open(err =>{

                if(err){
                    s.error(err);
                }
                else{
                    s.next();
                    s.complete();
                }
            });
        });
    }

    close(): Rx.Observable<void>{
        return Rx.Observable.create(s =>{
            this._checkDevicePort();
            if(this.devicePort.isOpen()){
                this.devicePort.close(err =>{
                    if(err){
                        s.error(err);
                    }
                    else{
                        s.next();
                        s.complete();
                    }
                })
            }
            else{
                s.next();
                s.complete();
            }
        })
    }

    write(command:string, callback?:(buffer:any, subscriber:Rx.Subscriber<string>)=> void): Rx.Observable<string>{
        return Rx.Observable.create(s =>{
            this._checkDevicePort();

            let timeoutId:NodeJS.Timer = setTimeout(()=> {
                clearAllListeners();

                s.error(new Error('Command timedout'));
            }, this._portOptions.commandTimeout);

            let state:string = 'waiting-response';
            

            let completeResponse = '';
            let dataState = 'waiting-OK';
            let defaultDataParser = data => {
                let responseString = data.toString();
                
                completeResponse += responseString;
                let commandTrimmed = command.trim();
                if (dataState === 'waiting-OK') {
                    let completeResponseTrimmed = completeResponse.trim();
                    if (completeResponseTrimmed.endsWith("OK")) {
                        let dataWithoutOK = completeResponseTrimmed.slice(0, completeResponseTrimmed.length - 2);

                        s.next(dataWithoutOK);
                        clearTimeout(timeoutId);
                        clearAllListeners();
                        s.complete();
                    }
                }
            };


            let onDataCallback = data =>{
                
                if(callback != null){
                    callback(data, s);
                }
                else{
                    defaultDataParser(data);
                }
            }

            let onErrorCallback = err =>{
                if(state !== 'terminated'){
                    clearTimeout(timeoutId);
                    clearAllListeners();
                    s.error(err);
                }
            }

            let clearAllListeners = ()=>{
                this.devicePort.removeListener("data", onDataCallback);
                this.devicePort.removeListener("error", onErrorCallback);
            }

            this.devicePort.on("data", onDataCallback);

            this.devicePort.on("error", onErrorCallback)

            let completeCommand = command;

            this.devicePort.write(completeCommand, err =>{
                
                if(err){
                    clearTimeout(timeoutId);
                    clearAllListeners();
                    state = 'terminated';
                    s.error(err);
                }
            })
        })
    }

    setPortOptions(options:ModemOptions): Rx.Observable<void>{
        return Rx.Observable.create(s =>{
            if(this.devicePort != null){
                this.devicePort.close();
            }

            this._portOptions = options;
            this._devicePort = new SerialPort(options.deviceName, {
                baudRate: options.baudRate,
                autoOpen: options.autoOpen,
                parser: SerialPort.parsers.raw
            });

            s.next();
            s.complete();
        })
    }

}