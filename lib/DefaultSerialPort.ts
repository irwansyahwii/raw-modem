import {ISerialPort} from './ISerialPort';
let SerialPort = require('serialport');
import {ModemOptions} from './ModemOptions';

import Rx = require('rxjs/Rx');

export class DefaultSerialPort implements ISerialPort{

    private _portOptions:Object = {};
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

            this.devicePort.close(err =>{
                if(err){
                    s.error(err);s
                }
                else{
                    s.next();
                    s.complete();
                }
            })
        })
    }

    write(command:string, callback?:(buffer:any, subscriber:Rx.Subscriber<string>)=> void): Rx.Observable<string>{
        return Rx.Observable.create(s =>{
            this._checkDevicePort();

            let timeoutId:NodeJS.Timer = setTimeout(()=> {
                clearAllListeners();

                s.error(new Error('Command timedout'));
            }, 3000);

            let state:string = 'waiting-response';
            

            let completeResponse = '';
            let dataState = 'waiting-echo';

            let defaultDataParser = data =>{
                let responseString = data.toString().trim(); 

                completeResponse += responseString;

                let commandTrimmed = command.trim();

                console.log('completeResponse: ', completeResponse);

                if(dataState === 'waiting-echo'){
                    if(completeResponse.startsWith(commandTrimmed)){
                        dataState = 'waiting-OK';
                                            
                        responseString = completeResponse.slice(commandTrimmed.length);
                        completeResponse = '';
                    }
                }
                
                if(dataState === 'waiting-OK'){
                    if(completeResponse.endsWith("OK")){
                        let dataWithoutOK = completeResponse.slice(0, completeResponse.length - 2);
                        s.next(dataWithoutOK);

                        clearTimeout(timeoutId);
                        clearAllListeners();
                        s.complete();
                    }
                }                
            }

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
                console.log('command written: ', completeCommand);
                

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