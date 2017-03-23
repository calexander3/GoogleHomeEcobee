import { ThermostatService } from "./thermostat";
import { Thermostat } from "../models/thermostat";

export class GetTemperatureService extends ThermostatService {

    private convertTemp(degrees: number, useCelsius: boolean): number {
        if(useCelsius) {
            return Math.round(((5/9) * (degrees / 10 - 32)) * 10) / 10;
        }
        return degrees / 10;
    }

    public GetCurrentTemperature(sensorName: string): Promise<number> {
        return new Promise((resolve:any, reject:any) => {
            this.getThermostats()
            .then(thermostats => {
                let roomTemps = <[{ name: string; temp: number; }]>[];

                thermostats.forEach(thermostat => {
                    roomTemps.push({
                        name: thermostat.name,
                        temp: this.convertTemp(thermostat.runtime.actualTemperature, thermostat.settings.useCelsius)
                    });
                    thermostat.remoteSensors.forEach(sensor => {
                        roomTemps.push({
                        name: sensor.name,
                        temp: this.convertTemp(parseInt(sensor.capability.filter(c => c.type === 'temperature')[0].value), thermostat.settings.useCelsius)
                        });
                    });
                });

                let targetRoomTemp = roomTemps.filter(rt => rt.name.toLowerCase() === sensorName.toLocaleLowerCase())[0];
                resolve(targetRoomTemp.temp);
            })
            .catch(_ => reject(null));
        });
    }

    public GetDesiredTemperature(thermostatName: string): Promise<number[]> {
        return new Promise((resolve:any, reject:any) => {
            this.getThermostats()
            .then(thermostats => {
                let thermostatData = thermostats.filter(t => t.name.toLowerCase() === thermostatName.toLowerCase())[0];
                if (thermostatData) {
                    let targetedThermostat = new Thermostat(thermostatData);
                    let coolOn = targetedThermostat.isCoolOn();
                    let heatOn = targetedThermostat.isHeatOn();

                    if (!coolOn && !heatOn) {
                        console.error('Hvac system is off');
                        reject([]);
                    }
                    else if (coolOn && heatOn) {
                        resolve([this.convertTemp(targetedThermostat.runtime.desiredHeat, targetedThermostat.settings.useCelsius),
                        this.convertTemp(targetedThermostat.runtime.desiredCool, targetedThermostat.settings.useCelsius)]);
                    }
                    else if (heatOn) {
                        resolve([this.convertTemp(targetedThermostat.runtime.desiredHeat, targetedThermostat.settings.useCelsius)]);
                    }
                    else if (coolOn) {
                        resolve([this.convertTemp(targetedThermostat.runtime.desiredCool, targetedThermostat.settings.useCelsius)]);
                    }
                    else {
                        reject(null);
                    }
                }
                else {
                    reject(null);
                }
            })
            .catch(_ => reject(null));
        });
    }
}