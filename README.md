# Google Home Ecobee Integration

The following are the simple requests meant to be made through Google Assistant, IFTTT, and Maker

### Set Temperature
```
POST /settemperature
```

```json
{ 
	"thermostat": "<thermostat-name>", "temperature": "<temperature>"
}
```

### Change Temperature
```
POST /changetemperature
```

```json
{ 
	"thermostat": "<thermostat-name>", "temperatureDelta": "<temperature>"
}
```

### Change Mode
```
POST /mode
```

```json
{ 
	"thermostat": "<thermostat-name>", "hvacMode": "<temperature>"
}
```

hvacMode values are
* heat
* auxHeatOnly
* cool
* auto
* off


Below are requests intented to be made through Google Assistant actions from api.ai

```
POST /googlehome
```
```
Action: 'GetTemperature'
Parameters: room
```
