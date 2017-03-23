export interface ChangeModeRequest {
    thermostat: string;
    hvacMode: 'heat' | 'auxHeatOnly' | 'cool' | 'auto' | 'off';
}