import {DefaultSerialPort} from '../../lib/DefaultSerialPort';
import {ModemOptions} from '../../lib/ModemOptions';

import Rx = require('rxjs/Rx');

describe('DefaultSerialPort', function(){
    describe('open()', function(){
        it('open the port', function(done){
            this.timeout(9000);
            
            let port = new DefaultSerialPort();

            let portOptions = new ModemOptions();
            portOptions.deviceName = '/dev/ttyUSB0';
            portOptions.baudRate = 115200;

            let allData = '';

            port.setPortOptions(portOptions)
                .flatMap(()=>{
                    return port.open();
                })
                .flatMap(()=>{
                    return port.write('AT\r')
                })
                .flatMap((r)=>{
                    return port.write('AT+CGMI\r')
                })
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('AT+CGSN\r')
                })//Start list sms
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('AT+CSCS="GSM"\r')
                })
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('AT+CMGF=1\r')
                })
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('AT+CMGL="ALL"\r')
                })//End list sms     
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('AT+CSMP=1,173,0,7\r')
                })              
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('AT+CMGF=1\r')
                })              
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('AT+CMGS="08891366079"\r', 
                        (buffer:any, subscriber: Rx.Subscriber<string>)=>{
                            console.log('cmgs response:', buffer.toString());

                            let responseString = buffer.toString().trim();
                            if(responseString === ">"){
                                subscriber.next("");
                                subscriber.complete();
                            }
                        })
                })                             
                .flatMap(response =>{
                    console.log('respose:', response);

                    return port.write('Ini messagenya\x1A\r')
                })                             
                .subscribe(r =>{
                    console.log('respose:', r);

                    allData += r;
                }, err =>{
                    port.close().subscribe(r =>{
                        done();
                    })
                    console.log('ERROR:', err);
                    
                }, ()=>{
                    console.log('allData: ', allData);
                    console.log('DONE!')
                    done();
                })
        })
    })
})