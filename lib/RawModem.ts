import {ISerialPort} from './ISerialPort';
import Rx = require('rxjs/Rx');
import {ModemOptions} from './ModemOptions';
import {ITimer} from './ITimer';


export class RawModem{
    private _modemOptions: ModemOptions = null;
    constructor(private serialPort: ISerialPort, private commandTimer: ITimer){

    }

    open(options:ModemOptions):Rx.Observable<void>{
        return Rx.Observable.create(s =>{
            this._modemOptions = options;
            this.serialPort.setPortOptions(options)
                .flatMap(() => this.serialPort.open())
                .flatMap(() => this.serialPort.write('AT\r'))
                .subscribe(r =>{
                    s.next();
                }, err =>{
                    s.error(err);
                }, ()=>{
                    s.complete();
                })
        })
    }

    close(): Rx.Observable<void>{
        return Rx.Observable.create(s =>{
            this.serialPort.close()
                .subscribe(r =>{
                    s.next(r);
                }, err =>{
                    s.error(err);
                }, ()=>{
                    s.complete();
                })
        });
    }


    send(command, callback?:(buffer:any, subscriber:Rx.Subscriber<string>)=> void): Rx.Observable<string>{
        return Rx.Observable.create(s =>{
            if(!this.serialPort.isOpen()){
                s.error(new Error('Port is closed'));
            }
            else{
                this.commandTimer.start(this._modemOptions.commandTimeout, ()=>{
                    s.error(new Error('Command timedout: ' + command.trim()));
                });
                this.serialPort.write(command, callback).subscribe(r =>{
                    s.next(r);
                }, err =>{
                    s.error(err);
                }, ()=>{
                    s.complete();
                })
            }
        })
    }
}