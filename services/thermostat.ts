import * as https from 'https';

const ecobeeServerUrl = 'https://api.ecobee.com'; 
const ecobeeApiEndpoint = '/1/thermostat';
const ecobeeTokenEndpoint = '/token'
const ecobeeApiRefreshToken = process.env.REFRESHTOKEN
var accessToken:string;
var accessTokenExpiration:Date;

// function ensureAccessToken():Promise<boolean>{

// }

function getContent(url: string): Promise<any> {
  return new Promise((resolve:any, reject:any) => {
    const request = https.get(url, (response: any) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(response.statusCode);
      }
      const body: string[] = [];
      response.on('data', (chunk: string) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err: any) => reject(err));
  });
}

function postContent(url: string, body: any, authorization: string): Promise<any> {
  return new Promise((resolve:any, reject:any) => {
    let postData = JSON.stringify(body);
    const request = https.request({
      host: url.split('/')[0],
      port: 443,
      path: url.split('/').slice(1).join('/'),
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'authorization': `bearer ${authorization}`
      }
    }, (response: any) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(response.statusCode);
      }
      const body: string[] = [];
      response.on('data', (chunk: string) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err: any) => reject(err));
    request.write(postData);
    request.end();
  });
}

export class ThermostatService{



}