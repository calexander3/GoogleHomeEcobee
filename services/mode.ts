import * as Url from 'url';
import { ThermostatService } from "./thermostat";
import { ChangeModeRequest } from "../models/change-mode-request";
import { Thermostat } from "../models/thermostat";
import { EcobeeThermostatCommand } from "../models/ecobee-thermostat-command";
import { EcobeeResponse } from "../models/ecobee-response";

export class ModeService extends ThermostatService {

    public ChangeMode(changeModeRequest: ChangeModeRequest): Promise<boolean>  {
        return new Promise((resolve:any, reject:any) => {
            this.getThermostats()
            .then(thermostats => {
                let thermostatData = thermostats.filter(t => t.name.toLowerCase() === changeModeRequest.thermostat.toLowerCase())[0];
                if (thermostatData) {
                    let targetedThermostat = new Thermostat(thermostatData);
                    if (targetedThermostat.settings.hvacMode !== changeModeRequest.hvacMode) {
                        this.apiRequestService.postContent<EcobeeThermostatCommand,EcobeeResponse>(Url.parse(`${this.ecobeeServerUrl}${this.ecobeeApiEndpoint}?format=json`),
                        {
                            selection: {
                                selectionType: "thermostats",
                                selectionMatch: targetedThermostat.identifier
                            },
                            thermostat: {
                                settings: {
                                    hvacMode: changeModeRequest.hvacMode
                                }
                            }
                        },
                        this.accessToken)
                        .then(response => resolve(true))
                        .catch(_ => reject(_));
                    }
                    else {
                        resolve(true)
                    }
                }
                else {
                    reject(false);
                }
            });
        });
    }
}