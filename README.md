Raw-Modem
=========

A library to allow sending raw command to a modem and retrieve the response in text format.

This library was created because `sms-device` module needs another driver beside `gammu` to control the modem but anyone can use this module as it is. 

## Installation

`npm install raw-modem`

## Usage

### Using in code

```javascript.es6
import {RawModem} from 'raw-modem';

let modem = new RawModem();

//Send sms using Wavecom modem
modem.open({
    baudRate: 115200
})
.flatMap(() => modem.send('AT+CMGF=1\r'))
.flatMap(() => modem.send('AT+CSMP=1,173,0,7\r))
.flatMap(() => modem.send('AT+CMGS="+6288121212"\r', (buffer:any, subscriber: Rx.Subscriber<string>)=>{
                            console.log('cmgs response:', buffer.toString());

                            let responseString = buffer.toString().trim();
                            if(responseString === ">"){
                                subscriber.next("");
                                subscriber.complete();
                            }
                        })                        
)
.flatMap(response =>{
    return port.write('Your sms message\x1A\r');
})                             
.subscribe(r =>{
    console.log('SMS sent)
});

```

## Contributions

All contributions are welcome

## License

MIT