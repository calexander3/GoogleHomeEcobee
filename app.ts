import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

import { router as index } from './routes/index';
import { router as setTemperature } from './routes/set-temperature';
import { router as changeTemperature } from './routes/change-temperature';
import { router as mode } from './routes/mode';
import { router as googleHome } from './routes/google-home';

export let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', index);
app.use('/settemperature', setTemperature);
app.use('/changetemperature', changeTemperature);
app.use('/mode', mode);
app.use('/googlehome', googleHome);

// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  let err = new Error('Not Found');
  (err as any).status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});
