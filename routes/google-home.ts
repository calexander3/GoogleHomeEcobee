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
  if (googleHomeRequest.result.action === 'GetTemperature') {
    getTemperatureService.getCurrentTemperature(googleHomeRequest.result.parameters.room)
    .then(temperature => {
        let response: Fulfillment;
      
        if (temperature) {
          response = {
            source: 'GoogleHomeEcobee',
            speech: `The temperature of the ${googleHomeRequest.result.parameters.room} sensor is ${temperature} degrees.`,
            displayText: `The temperature of the ${googleHomeRequest.result.parameters.room} sensor is ${temperature} degrees.`
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