import { Settings, Runtime, EcobeeEvent } from "./ecobee-thermostat-response";

export class Thermostat {
    identifier: number;
    name: string;
    thermostatRev: number;
    isRegistered: boolean;
    modelNumber: string;
    brand: string;
    features: string;
    lastModified: string;
    thermostatTime: string;
    utcTime: string;
    alerts: any[];
    settings: Settings;
    runtime: Runtime;
    events: EcobeeEvent[];

    constructor(seed: Thermostat){
        this.identifier = seed.identifier;
        this.name= seed.name;
        this.thermostatRev= seed.thermostatRev;
        this.isRegistered= seed.isRegistered;
        this.modelNumber= seed.modelNumber;
        this.brand= seed.brand;
        this.features= seed.features;
        this.lastModified= seed.lastModified;
        this.thermostatTime= seed.thermostatTime;
        this.utcTime= seed.thermostatTime;
        this.alerts= seed.alerts;
        this.settings= seed.settings;
        this.runtime= seed.runtime;
        this.events= seed.events;
    }

    public hasHold(): boolean {
        if (this.events && this.events.length) 
        {
            return this.events.some(event => (event.type === 'hold' || event.type === 'autoAway' || event.type === 'autoHome' ) && event.running);
        }
        return false;
    }

    public hasHeatMode(): boolean {
        return this.settings.heatStages > 0 || this.settings.hasHeatPump;
    };

    public hasCoolMode(): boolean {
        return this.settings.coolStages > 0 || this.settings.hasHeatPump;
    };

    public hasAuxHeatMode(): boolean {
        return this.settings.hasHeatPump && (this.settings.hasElectric || this.settings.hasBoiler || this.settings.hasForcedAir);
    };

    public hasAutoMode(): boolean {
        return this.settings.autoHeatCoolFeatureEnabled && this.hasCoolMode() && this.hasHeatMode();
    };

    public desiredHoldType(): string {
        switch(this.settings.holdAction){
        case 'nextPeriod':
            return 'nextTransition';
        case 'useEndTime4hour':
            return 'holdHours';
        case 'useEndTime2hour':
            return 'holdHours';
        default:
            return 'indefinite';
        } 
    }
  
    public desiredHoldHours(): number {
        switch(this.settings.holdAction){
            case 'useEndTime4hour':
                return 4;
            case 'useEndTime2hour':
                return 2;
            default:
                return null;
        } 
    }

    public isHeatOn(): boolean {
        let heatDisabled: boolean;
        this.events.forEach(function(event){
            if(event.running){
                if(event.isHeatOff){
                    heatDisabled = true;
                }
            }
        });

        return !heatDisabled && (this.settings.hvacMode === 'heat' || this.settings.hvacMode === 'auxHeatOnly' || this.settings.hvacMode === 'auto')
    }

    public isCoolOn(): boolean {
        let coolDisabled: boolean;
        this.events.forEach(function(event){
            if(event.running){
                if(event.isCoolOff){
                    coolDisabled = true;
                }
            }
        });

        return !coolDisabled && (this.settings.hvacMode === 'cool' || this.settings.hvacMode === 'auto')
    }
}