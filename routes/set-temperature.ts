import * as express from 'express';
import * as basicAuth from 'basic-auth';
import { ThermostatService } from "../services/thermostat";

export let router = express.Router();
let thermostatService = new ThermostatService();

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

  thermostatService.setTemperature(req.body).then(_ => res.sendStatus(204)).catch(_ => res.sendStatus(500));
});