import * as express from 'express';
import * as basicAuth from 'basic-auth';
import { TemperatureService } from "../services/temperature";
import { GoogleHomeRequest, Fulfillment } from "../models/google-home";

export let router = express.Router();
let temperatureService = new TemperatureService();

router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.sendStatus(405);
});

router.put('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.sendStatus(405);
});

router.delete('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.sendStatus(405);
});

router.post('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if(!req.headers.authorization){
    res.sendStatus(401);
    return;
  }
  const credentials = basicAuth(req);
  if(credentials.name !== process.env.BASIC_USER || credentials.pass !== process.env.BASIC_PASS){
    res.sendStatus(401);
    return;
  }

  let googleHomeRequest: GoogleHomeRequest = req.body;
  if (googleHomeRequest.result.action === 'GetTemperature') {
    temperatureService.getThermostats()
      .then(thermostats => {
        let response: Fulfillment;
        let roomTemps = <[{ name: string; temp: number; }]>[];

        thermostats.forEach(thermostat => {
          roomTemps.push({
            name: thermostat.name,
            temp: thermostat.runtime.actualTemperature / 10
          });
          thermostat.remoteSensors.forEach(sensor => {
            roomTemps.push({
              name: sensor.name,
              temp: parseInt(sensor.capability.filter(c => c.type === 'temperature')[0].value) / 10
            });
          });
        });

        let targetRoomTemp = roomTemps.filter(rt => rt.name.toLowerCase() === googleHomeRequest.result.parameters.room.toLocaleLowerCase())[0];

        if (targetRoomTemp) {
          response = {
            source: 'GoogleHomeEcobee',
            speech: `The temperature of the ${targetRoomTemp.name} sensor is ${targetRoomTemp.temp} degrees.`,
            displayText: `The temperature of the ${targetRoomTemp.name} sensor is ${targetRoomTemp.temp} degrees.`
          }
        }
        else {
          response = {
            source: 'GoogleHomeEcobee',
            speech: `I'm sorry, I wasn't able to find a sensor in that room.`,
            displayText: `I'm sorry, I wasn't able to find a sensor in that room.`
          }
        }

        res.send(response);
      })
      .catch(_ => res.sendStatus(500));
  }
  else {
    console.error(`Action ${googleHomeRequest.result.action} not supported`)
    res.sendStatus(400);
  }
});