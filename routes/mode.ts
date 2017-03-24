import * as express from 'express';
import * as basicAuth from 'basic-auth';
import { ModeService } from "../services/mode";

export let router = express.Router();
let modeService = new ModeService();

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

  modeService.ChangeMode(req.body).then(_ => res.sendStatus(204)).catch(_ => res.sendStatus(500));
});