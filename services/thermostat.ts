import * as Url from 'url';
import { TokenResponse } from "../models/token-response";
import { TemperatureRequest } from "../models/temperature-request";
import { EcobeeThermostatResponse } from "../models/ecobee-thermostat-response";
import { EcobeeThermostatCommand } from "../models/ecobee-thermostat-command";
import { EcobeeResponse } from "../models/ecobee-response";
import { ApiRequestService } from "./api-request";
import { Thermostat } from "../models/thermostat";

const ecobeeServerUrl = 'https://api.ecobee.com'; 
const ecobeeApiEndpoint = '/1/thermostat';
const ecobeeTokenEndpoint = '/token'
const ecobeeApiRefreshToken = process.env.ECOBEE_REFRESH_TOKEN;
const ecobeeApiClientId = process.env.ECOBEE_CLIENT_ID;
var accessToken: string;
var accessTokenExpiration: Date;

let apiRequestService = new ApiRequestService();

function ensureAccessToken(): Promise<boolean>{
    return new Promise((resolve:any, reject:any) => {
        let now = new Date();
        now.setSeconds(now.getSeconds() + 60);
        if(!accessToken || !accessTokenExpiration || now > accessTokenExpiration){
            apiRequestService.postContent<any,TokenResponse>(Url.parse(`${ecobeeServerUrl}${ecobeeTokenEndpoint}?grant_type=refresh_token&refresh_token=${ecobeeApiRefreshToken}&client_id=${ecobeeApiClientId}`))
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

function getThermostats (): Promise<Thermostat[]>{
    return new Promise((resolve:any, reject:any) => {
        ensureAccessToken()
        .then(_ =>{
            apiRequestService.getContent<EcobeeThermostatResponse>(Url.parse(`${ecobeeServerUrl}${ecobeeApiEndpoint}?json={"selection":{"includeAlerts":"true","selectionType":"registered","selectionMatch":"","includeEvents":"true","includeSettings":"true","includeRuntime":"true"}}`), accessToken)
            .then(thermostatResponse => {
                resolve(thermostatResponse.thermostatList);
            }).catch(err => resolve([]));;
        }).catch(err => resolve([]));
    });
};

export class ThermostatService{

    public setTemperature(setTemperatureRequest: TemperatureRequest): Promise<boolean> {
        return new Promise((resolve:any, reject:any) => {
            getThermostats()
            .then(thermostats => {
                let thermostatData = thermostats.filter(t => t.name.toLowerCase() === setTemperatureRequest.thermostat.toLowerCase())[0];
                if(thermostatData){
                    let targetedThermostat = new Thermostat(thermostatData);
                    let coolOn = targetedThermostat.isCoolOn();
                    let heatOn = targetedThermostat.isHeatOn();

                    if (!coolOn && !heatOn) {
                        console.error('Hvac system is off');
                        reject(false);
                    }
                    
                    let coolHold: number | string;
                    let heatHold: number | string;

                    if (coolOn && heatOn) {
                        if (Math.abs(targetedThermostat.runtime.actualTemperature - targetedThermostat.runtime.desiredCool) >
                            Math.abs(targetedThermostat.runtime.actualTemperature - targetedThermostat.runtime.desiredHeat)) {
                                coolHold = targetedThermostat.runtime.desiredCool;
                                heatHold = setTemperatureRequest.temperature * 10;
                            }
                            else
                            {
                                coolHold = setTemperatureRequest.temperature * 10;
                                heatHold = targetedThermostat.runtime.desiredHeat;
                            }
                    } 
                    else
                    {
                        coolHold = coolOn ? setTemperatureRequest.temperature * 10 : 'Off';
                        heatHold = heatOn ? setTemperatureRequest.temperature * 10 : 'Off';
                    }

                    apiRequestService.postContent<EcobeeThermostatCommand,EcobeeResponse>(Url.parse(`${ecobeeServerUrl}${ecobeeApiEndpoint}?format=json`),
                    {
                        selection: {
                            selectionType: "thermostats",
                            selectionMatch: targetedThermostat.identifier
                        },
                        functions: [
                            {
                            type: "setHold",
                            params: {
                                holdType: targetedThermostat.desiredHoldType(), 
                                holdHours: targetedThermostat.desiredHoldHours(),
                                coolHoldTemp: coolHold, 
                                heatHoldTemp: heatHold
                                }
                            }
                        ]
                    },
                    accessToken)
                    .then(response => resolve(true))
                    .catch(_ => reject(false));
                }
                else{
                    reject(false);
                }
            });
        });
    }


}