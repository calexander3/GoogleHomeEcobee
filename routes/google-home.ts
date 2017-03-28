import * as express from 'express';
import * as basicAuth from 'basic-auth';
import { GetTemperatureService } from "../services/get-temperature";
import { GoogleHomeRequest, Fulfillment } from "../models/google-home";

export let router = express.Router();
let getTemperatureService = new GetTemperatureService();

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
  switch(googleHomeRequest.result.action) {
    case 'GetTemperature':
      handleGetTemperature(googleHomeRequest).then(response => res.send(response)).catch(_ => res.sendStatus(500));
      break;
    case 'GetDesiredTemperature':
      handleGetDesiredTemperature(googleHomeRequest).then(response => res.send(response)).catch(_ => res.sendStatus(500));
      break;
    default:
      console.error(`Action ${googleHomeRequest.result.action} not supported`)
      res.sendStatus(400);
      break;
  }
});

function handleGetTemperature(googleHomeRequest: GoogleHomeRequest): Promise<Fulfillment> {
  return new Promise((resolve:any, reject:any) => {
      getTemperatureService.GetCurrentTemperature(googleHomeRequest.result.parameters.sensorName)
        .then(temperature => {
            let response: Fulfillment;
          
            if (temperature) {
              response = {
                source: 'GoogleHomeEcobee',
                speech: `The temperature of the ${googleHomeRequest.result.parameters.sensorName} sensor is ${temperature} degrees.`,
                displayText: `The temperature of the ${googleHomeRequest.result.parameters.sensorName} sensor is ${temperature} degrees.`
              }
            }
            else {
              response = {
                source: 'GoogleHomeEcobee',
                speech: `I'm sorry, I wasn't able to find a sensor in that room.`,
                displayText: `I'm sorry, I wasn't able to find a sensor in that room.`
              }
            }
            resolve(response);
        });
    });
}

function handleGetDesiredTemperature(googleHomeRequest: GoogleHomeRequest): Promise<Fulfillment> {
  return new Promise((resolve:any, reject:any) => {
      getTemperatureService.GetDesiredTemperature(googleHomeRequest.result.parameters.thermostatName)
        .then(temperatures => {
            let response: Fulfillment;
          
            if (temperatures && temperatures.length == 1) {
              response = {
                source: 'GoogleHomeEcobee',
                speech: `The ${googleHomeRequest.result.parameters.thermostatName} is set to ${temperatures[0]} degrees.`,
                displayText: `The ${googleHomeRequest.result.parameters.thermostatName} is set to ${temperatures[0]} degrees.`
              }
            }
            else if (temperatures && temperatures.length == 2) {
              response = {
                source: 'GoogleHomeEcobee',
                speech: `The ${googleHomeRequest.result.parameters.thermostatName} is set to stay between ${temperatures[0]} and ${temperatures[1]} degrees.`,
                displayText: `The ${googleHomeRequest.result.parameters.thermostatName} is set to stay between ${temperatures[0]} and ${temperatures[1]} degrees.`
              }
            }
            else {
              response = {
                source: 'GoogleHomeEcobee',
                speech: `I'm sorry, I wasn't able to find a thermostat by that name.`,
                displayText: `I'm sorry, I wasn't able to find a thermostat by that name.`
              }
            }
            resolve(response);
        });
    });
}