import {ISerialPort} from './ISerialPort';
import Rx = require('rxjs/Rx');


export class RawModem{
    constructor(private serialPort: ISerialPort){

    }

    open():Rx.Observable<void>{
        return Rx.Observable.create(s =>{
            this.serialPort.open()
                .subscribe(r =>{
                    s.next(r);
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

    send(command): Rx.Observable<string>{
        return Rx.Observable.create(s =>{
            this.serialPort.write(command).subscribe(r =>{
                s.next(r);
            }, err =>{
                s.error(err);
            }, ()=>{
                s.complete();
            })
        })
    }
}