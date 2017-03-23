import { ThermostatService } from "./thermostat";
import { ChangeModeRequest } from "../models/change-mode-request";
import { Thermostat } from "../models/thermostat";

export class ModeService extends ThermostatService {

    public ChangeMode(changeModeRequest: ChangeModeRequest): Promise<boolean>  {
        return new Promise((resolve:any, reject:any) => {
            this.getThermostats()
            .then(thermostats => {
                let thermostatData = thermostats.filter(t => t.name.toLowerCase() === changeModeRequest.thermostat.toLowerCase())[0];
                if(thermostatData) {
                    let targetedThermostat = new Thermostat(thermostatData);
                }
            });

        });
    }
}