import { Thermostat } from "./thermostat";

export interface Page {
    page: number;
    totalPages: number;
    pageSize: number;
    total: number;
}

export interface Settings {
    hvacMode: 'heat' | 'auxHeatOnly' | 'cool' | 'auto' | 'off';
    lastServiceDate: string;
    serviceRemindMe: boolean;
    monthsBetweenService: number;
    remindMeDate: string;
    vent: string;
    ventilatorMinOnTime: number;
    serviceRemindTechnician: boolean;
    eiLocation: string;
    coldTempAlert: number;
    coldTempAlertEnabled: boolean;
    hotTempAlert: number;
    hotTempAlertEnabled: boolean;
    coolStages: number;
    heatStages: number;
    maxSetBack: number;
    maxSetForward: number;
    quickSaveSetBack: number;
    quickSaveSetForward: number;
    hasHeatPump: boolean;
    hasForcedAir: boolean;
    hasBoiler: boolean;
    hasHumidifier: boolean;
    hasErv: boolean;
    hasHrv: boolean;
    condensationAvoid: boolean;
    useCelsius: boolean;
    useTimeFormat12: boolean;
    locale: string;
    humidity: string;
    humidifierMode: string;
    backlightOnIntensity: number;
    backlightSleepIntensity: number;
    backlightOffTime: number;
    soundTickVolume: number;
    soundAlertVolume: number;
    compressorProtectionMinTime: number;
    compressorProtectionMinTemp: number;
    stage1HeatingDifferentialTemp: number;
    stage1CoolingDifferentialTemp: number;
    stage1HeatingDissipationTime: number;
    stage1CoolingDissipationTime: number;
    heatPumpReversalOnCool: boolean;
    fanControlRequired: boolean;
    fanMinOnTime: number;
    heatCoolMinDelta: number;
    tempCorrection: number;
    holdAction: string;
    heatPumpGroundWater: boolean;
    hasElectric: boolean;
    hasDehumidifier: boolean;
    dehumidifierMode: string;
    dehumidifierLevel: number;
    dehumidifyWithAC: boolean;
    dehumidifyOvercoolOffset: number;
    autoHeatCoolFeatureEnabled: boolean;
    wifiOfflineAlert: boolean;
    heatMinTemp: number;
    heatMaxTemp: number;
    coolMinTemp: number;
    coolMaxTemp: number;
    heatRangeHigh: number;
    heatRangeLow: number;
    coolRangeHigh: number;
    coolRangeLow: number;
    userAccessCode: string;
    userAccessSetting: number;
    auxRuntimeAlert: number;
    auxOutdoorTempAlert: number;
    auxMaxOutdoorTemp: number;
    auxRuntimeAlertNotify: boolean;
    auxOutdoorTempAlertNotify: boolean;
    auxRuntimeAlertNotifyTechnician: boolean;
    auxOutdoorTempAlertNotifyTechnician: boolean;
    disablePreHeating: boolean;
    disablePreCooling: boolean;
    installerCodeRequired: boolean;
    drAccept: string;
    isRentalProperty: boolean;
    useZoneController: boolean;
    randomStartDelayCool: number;
    randomStartDelayHeat: number;
    humidityHighAlert: number;
    humidityLowAlert: number;
    disableHeatPumpAlerts: boolean;
    disableAlertsOnIdt: boolean;
    humidityAlertNotify: boolean;
    humidityAlertNotifyTechnician: boolean;
    tempAlertNotify: boolean;
    tempAlertNotifyTechnician: boolean;
    monthlyElectricityBillLimit: number;
    enableElectricityBillAlert: boolean;
    enableProjectedElectricityBillAlert: boolean;
    electricityBillingDayOfMonth: number;
    electricityBillCycleMonths: number;
    electricityBillStartMonth: number;
    ventilatorMinOnTimeHome: number;
    ventilatorMinOnTimeAway: number;
    backlightOffDuringSleep: boolean;
    autoAway: boolean;
    smartCirculation: boolean;
    followMeComfort: boolean;
    ventilatorType: string;
    isVentilatorTimerOn: boolean;
    ventilatorOffDateTime: string;
    hasUVFilter: boolean;
    coolingLockout: boolean;
    ventilatorFreeCooling: boolean;
    dehumidifyWhenHeating: boolean;
    ventilatorDehumidify: boolean;
    groupRef: string;
    groupName: string;
    groupSetting: number;
}

export interface Runtime {
    runtimeRev: string;
    connected: boolean;
    firstConnected: string;
    connectDateTime: string;
    disconnectDateTime: string;
    lastModified: string;
    lastStatusModified: string;
    runtimeDate: string;
    runtimeInterval: number;
    actualTemperature: number;
    actualHumidity: number;
    desiredHeat: number;
    desiredCool: number;
    desiredHumidity: number;
    desiredDehumidity: number;
    desiredFanMode: string;
    desiredHeatRange: number[];
    desiredCoolRange: number[];
}

export interface EcobeeEvent {
    type: string;
    name: string;
    running: boolean;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    isOccupied: boolean;
    isCoolOff: boolean;
    isHeatOff: boolean;
    coolHoldTemp: number;
    heatHoldTemp: number;
    fan: string;
    vent: string;
    ventilatorMinOnTime: number;
    isOptional: boolean;
    isTemperatureRelative: boolean;
    coolRelativeTemp: number;
    heatRelativeTemp: number;
    isTemperatureAbsolute: boolean;
    dutyCyclePercentage: number;
    fanMinOnTime: number;
    occupiedSensorActive: boolean;
    unoccupiedSensorActive: boolean;
    drRampUpTemp: number;
    drRampUpTime: number;
    linkRef: string;
    holdClimateRef: string;
}

export interface Status {
    code: number;
    message: string;
}

export interface EcobeeThermostatResponse {
    page: Page;
    thermostatList: Thermostat[];
    status: Status;
}