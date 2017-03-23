import * as Url from 'url';
import { ThermostatService } from "./thermostat";
import { SetTemperatureRequest } from "../models/set-temperature-request";
import { Thermostat } from "../models/thermostat";
import { EcobeeThermostatCommand } from "../models/ecobee-thermostat-command";
import { EcobeeResponse } from "../models/ecobee-response";
import { ChangeTemperatureRequest } from "../models/change-temperature-request";

export class SetTemperatureService extends ThermostatService {

    private convertTemp(degrees: number, useCelsius: boolean): number {
        if(useCelsius) {
            return Math.round(10 * (degrees * 9 / 5 + 32));
        }
        return degrees * 10;
    }

    public SetTemperature(setTemperatureRequest: SetTemperatureRequest): Promise<boolean> {
        return new Promise((resolve:any, reject:any) => {
            this.getThermostats()
            .then(thermostats => {
                let thermostatData = thermostats.filter(t => t.name.toLowerCase() === setTemperatureRequest.thermostat.toLowerCase())[0];
                if(thermostatData) {
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
                                heatHold = this.convertTemp(setTemperatureRequest.temperature, targetedThermostat.settings.useCelsius);
                            }
                            else {
                                coolHold = this.convertTemp(setTemperatureRequest.temperature, targetedThermostat.settings.useCelsius);
                                heatHold = targetedThermostat.runtime.desiredHeat;
                            }
                    }
                    else {
                        coolHold = coolOn ? this.convertTemp(setTemperatureRequest.temperature, targetedThermostat.settings.useCelsius) : 'Off';
                        heatHold = heatOn ? this.convertTemp(setTemperatureRequest.temperature, targetedThermostat.settings.useCelsius) : 'Off';
                    }

                    this.apiRequestService.postContent<EcobeeThermostatCommand,EcobeeResponse>(Url.parse(`${this.ecobeeServerUrl}${this.ecobeeApiEndpoint}?format=json`),
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
                    this.accessToken)
                    .then(response => resolve(true))
                    .catch(_ => reject(false));
                }
                else{
                    reject(false);
                }
            });
        });
    }

    public ChangeTemperature(changeTemperatureRequest: ChangeTemperatureRequest): Promise<boolean> {
        return new Promise((resolve:any, reject:any) => {
            this.getThermostats()
            .then(thermostats => {
                let thermostatData = thermostats.filter(t => t.name.toLowerCase() === changeTemperatureRequest.thermostat.toLowerCase())[0];
                if(thermostatData) {
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
                                heatHold = targetedThermostat.runtime.desiredHeat + this.convertTemp(changeTemperatureRequest.temperatureDelta, targetedThermostat.settings.useCelsius);
                            }
                            else {
                                coolHold = targetedThermostat.runtime.desiredCool + this.convertTemp(changeTemperatureRequest.temperatureDelta, targetedThermostat.settings.useCelsius);
                                heatHold = targetedThermostat.runtime.desiredHeat;
                            }
                    } 
                    else {
                        coolHold = coolOn ? targetedThermostat.runtime.desiredCool + this.convertTemp(changeTemperatureRequest.temperatureDelta, targetedThermostat.settings.useCelsius) : 'Off';
                        heatHold = heatOn ? targetedThermostat.runtime.desiredHeat + this.convertTemp(changeTemperatureRequest.temperatureDelta, targetedThermostat.settings.useCelsius) : 'Off';
                    }

                    this.apiRequestService.postContent<EcobeeThermostatCommand,EcobeeResponse>(Url.parse(`${this.ecobeeServerUrl}${this.ecobeeApiEndpoint}?format=json`),
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
                    this.accessToken)
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