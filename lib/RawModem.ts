import {ISerialPort} from './ISerialPort';
import Rx = require('rxjs/Rx');
import {ModemOptions} from './ModemOptions';


export class RawModem{
    constructor(private serialPort: ISerialPort){

    }

    open(options:ModemOptions):Rx.Observable<void>{
        return Rx.Observable.create(s =>{
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
            this.serialPort.write(command, callback).subscribe(r =>{
                s.next(r);
            }, err =>{
                s.error(err);
            }, ()=>{
                s.complete();
            })
        })
    }
}