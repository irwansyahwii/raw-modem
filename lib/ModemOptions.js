"use strict";
/**
 * Hold information to modem opening configuration
 */
class ModemOptions {
    constructor() {
        /**
         * Automically opened flag
         */
        this.autoOpen = false;
        /**
         * Command execution timeout
         */
        this.commandTimeout = 3000;
    }
}
exports.ModemOptions = ModemOptions;
