import * as https from 'https';
import * as Url from 'url';
import { TokenResponse } from "../models/token-response";
import { TemperatureRequest } from "../models/temperature-request";
import { RequestOptions } from "http";

const ecobeeServerUrl = 'https://api.ecobee.com'; 
const ecobeeApiEndpoint = '/1/thermostat';
const ecobeeTokenEndpoint = '/token'
const ecobeeApiRefreshToken = process.env.ECOBEE_REFRESH_TOKEN;
const ecobeeApiClientId = process.env.ECOBEE_CLIENT_ID;
var accessToken: string;
var accessTokenExpiration: Date;

function getContent<T>(url: Url.Url, authorization?: string): Promise<T> {
  return new Promise((resolve:any, reject:any) => {
    let opts: RequestOptions = {
        host: url.hostname,
        port: parseInt(url.port || '443'),
        path: url.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (authorization) {
        opts.headers['Authorization'] = `bearer ${authorization}`
    }
    const request = https.get(opts, (response: any) => {
      const body: string[] = [];
      response.on('data', (chunk: string) => body.push(chunk));
      response.on('end', () =>{ 
            var responseString = body.join('');
            if (response.statusCode < 200 || response.statusCode > 299) {
                console.error(response.statusCode + ' - ' + responseString)
                reject();
            }
            resolve(JSON.parse(responseString));
        });
    });
    request.on('error', (err: any) => {
        console.error(err);
        reject(err);
    });
  });
}

function postContent<T>(url: Url.Url, postData?: any, authorization?: string): Promise<T> {
  return new Promise((resolve:any, reject:any) => {
    let postDataString = postData ? JSON.stringify(postData) : null;
    let opts: RequestOptions = {
        host: url.hostname,
        port: parseInt(url.port || '443'),
        path: url.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (authorization) {
        opts.headers['Authorization'] = `bearer ${authorization}`
    }
    if (postDataString) {
         opts.headers['Content-Length'] = Buffer.byteLength(postDataString)
    }
    const request = https.request(opts, (response: any) => {
        const body: string[] = [];
        response.on('data', (chunk: string) => body.push(chunk));
        response.on('end', () =>{ 
            var responseString = body.join('');
            if (response.statusCode < 200 || response.statusCode > 299) {
                console.error(response.statusCode + ' - ' + responseString)
                reject();
            }
            resolve(JSON.parse(responseString));
        });
    });
    request.on('error', (err: any) => reject(err));
    if (postDataString) {
        request.write(postDataString)
    };
    request.end();
  });
}

function ensureAccessToken(): Promise<boolean>{
    return new Promise((resolve:any, reject:any) => {
        let now = new Date();
        now.setSeconds(now.getSeconds() + 60);
        if(!accessToken || !accessTokenExpiration || now > accessTokenExpiration){
            postContent<TokenResponse>(Url.parse(`${ecobeeServerUrl}${ecobeeTokenEndpoint}?grant_type=refresh_token&refresh_token=${ecobeeApiRefreshToken}&client_id=${ecobeeApiClientId}`))
            .then(tokenResponse =>{
                accessToken = tokenResponse.access_token;
                accessTokenExpiration = new Date(Date.now() + (tokenResponse.expires_in * 1000));
                resolve(true);
            })
            .catch(err => {
                resolve(false);
            });
        }
        else{
            resolve(true);
        }
    });
}

export class ThermostatService{

    getThermostats = function (): Promise<boolean>{
        return new Promise((resolve:any, reject:any) => {
            ensureAccessToken()
            .then(_ =>{
                console.log(accessToken);
                getContent(Url.parse(`${ecobeeServerUrl}${ecobeeApiEndpoint}?json={"selection":{"includeAlerts":"true","selectionType":"registered","selectionMatch":"","includeEvents":"true","includeSettings":"true","includeRuntime":"true"}}`), accessToken)
                .then(thermostats => {
                    console.log(thermostats);
                    resolve(true);
                }).catch(err => resolve(false));;
            }).catch(err => resolve(false));
        });
    };

    setTemperature = function (setTemperature: TemperatureRequest): Promise<boolean>{
        return new Promise((resolve:any, reject:any) => {
            
        });
    };


}