export interface Selection {
    selectionType: string;
    selectionMatch: number;
}

export interface Settings {
    hvacMode: string;
}

export interface TargetThermostat {
    settings: Settings;
}

export interface Function {
    type: string;
    params: any;
}

export interface EcobeeThermostatCommand {
    selection: Selection;
    thermostat?: TargetThermostat;
    functions?: Function[];
}