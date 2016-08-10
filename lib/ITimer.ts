/**
 * Represent an instance of timer
 */
export interface ITimer{
    /**
     * Start a new timer 
     * 
     * @param {number} timeout - The time when the timer will call the callback function
     * @param {lambda} callback - The callback function that will be called when timedout
     */
    start(timeout:number, callback:(...args:any[])=> void):void;

    /**
     * Stop and reset the currently running timer
     */
    reset():void;    
}