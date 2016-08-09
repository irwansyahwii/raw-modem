
/**
 * Hold information to modem opening configuration
 */
export class ModemOptions{
    /**
     * The device name, ex: /dev/ttyUSB0
     */
    public deviceName: string;

    /**
     * The baud rate, ex: 115200
     */
    public baudRate: number;

    /**
     * Automically opened flag
     */
    public autoOpen: boolean = false;
}