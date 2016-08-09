import Rx = require('rxjs/Rx');
import {ModemOptions} from './ModemOptions';

/**
 * Defined the operations to communicate with a serial port
 */
export interface ISerialPort{
    /**
     * Open the serial port
     * 
     * @return {Rx.Observable<void>} An Observable
     */
    open(): Rx.Observable<void>;

    /**
     * Close the serial port
     * 
     * @return {Rx.Observable<void>} An Observable
     */
    close(): Rx.Observable<void>;

    /**
     * Write a string of command(s) to the port
     * 
     * @return {Rx.Observable<string>} An Observable containing the response string
     */
    write(command:string, callback?:(buffer:any, subscriber:Rx.Subscriber<string>)=> void): Rx.Observable<string>;

    /**
     * Set the port options
     * 
     * @return {Rx.Observable} An Observable
     */
    setPortOptions(options:ModemOptions): Rx.Observable<void>;
}