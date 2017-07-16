import * as Url from 'url';
import * as fs from 'fs';
import { TokenResponse } from "../models/token-response";
import { SetTemperatureRequest } from "../models/set-temperature-request";
import { EcobeeThermostatResponse } from "../models/ecobee-thermostat-response";
import { EcobeeThermostatCommand } from "../models/ecobee-thermostat-command";
import { EcobeeResponse } from "../models/ecobee-response";
import { ApiRequestService } from "./api-request";
import { Thermostat } from "../models/thermostat";
import { DatabaseService } from "./database";

export abstract  class ThermostatService {
    
    ecobeeServerUrl = 'https://api.ecobee.com'; 
    ecobeeApiEndpoint = '/1/thermostat';
    ecobeeTokenEndpoint = '/token'
    ecobeeApiClientId = process.env.ECOBEE_CLIENT_ID;

    accessToken: string;
    accessTokenExpiration: Date;

    apiRequestService = new ApiRequestService();
    private databaseService = new DatabaseService();

    ensureAccessToken(): Promise<boolean>{
        return new Promise((resolve:any, reject:any) => {
            let now = new Date();
            now.setSeconds(now.getSeconds() + 60);
            if(!this.accessToken || !this.accessTokenExpiration || now > this.accessTokenExpiration){
                this.databaseService.loadRefreshToken().then(ecobeeApiRefreshToken => {
                    this.apiRequestService.postContent<any,TokenResponse>(Url.parse(`${this.ecobeeServerUrl}${this.ecobeeTokenEndpoint}?grant_type=refresh_token&refresh_token=${ecobeeApiRefreshToken}&client_id=${this.ecobeeApiClientId}`))
                    .then(tokenResponse =>{
                        this.accessToken = tokenResponse.access_token;
                        this.accessTokenExpiration = new Date(Date.now() + (tokenResponse.expires_in * 1000));
                        this.databaseService.saveRefreshToken(tokenResponse.refresh_token)
                        .then(_ => resolve(true))
                        .catch(err =>{ 
                            console.error(err);
                            reject(err);
                        });
                    })
                    .catch(err => {
                        reject(err);
                    });
                })
                .catch(err => {
                    reject(err);
                });
            }
            else {
                resolve(true);
            }
        });
    }

    getThermostats (): Promise<Thermostat[]>{
        return new Promise((resolve:any, reject:any) => {
            this.ensureAccessToken()
            .then(_ =>{
                this.apiRequestService.getContent<EcobeeThermostatResponse>(
                    Url.parse(`${this.ecobeeServerUrl}${this.ecobeeApiEndpoint}?json={"selection":{"includeAlerts":"true","selectionType":"registered","selectionMatch":"","includeEvents":"true","includeSettings":"true","includeRuntime":"true","includeSensors":"true"}}`),
                    this.accessToken)
                .then(thermostatResponse => {
                    resolve(thermostatResponse.thermostatList);
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
}