import { promisify } from 'util';
import figlet from 'figlet';
import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import Sandbox from './src/sandbox/index.js';

/******** SERVICES ********/
import PostRepository from './lib/repos/post/index.js';
import JainkyModule from './lib/jainky-module/index.js';
import StatusService from './lib/services/status/index.js';

/******** PLUGINS ********/
import PluginEventAuthz from './lib/plugins/event-authz/index.js';
import PluginStatusRouter from './lib/plugins/router/status/index.js';

const GLOBAL_ERROR_THRESHOLD = 10;
const SERVER_PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'sandbox'; 
const APP_VERSION = process.env.APP_VERSION || '0.0.1';

const figletize = promisify(figlet);
const expressApp = express();

Sandbox.module('/lib/repos/post', PostRepository);
Sandbox.module('/lib/jainky-module', JainkyModule);
Sandbox.module('/lib/plugins/event-authz', PluginEventAuthz);
Sandbox.module('/lib/plugins/status-router', PluginStatusRouter);
Sandbox.module('/lib/services/status', StatusService);

Sandbox.of([
  '/lib/plugins/event-authz',
  '/lib/jainky-module',
  '/lib/repos/post',
  '/lib/services/status',
  '/lib/plugins/status-router'
],
  /***
   * @param {Object} box - the sandboxed module APIs; this is where the registered module functionality lives
   */
  async function myApp(box) {
    const events = box.get('/plugins/events-authz');
    const console = box.get('console');
    const subscriberId = 'myApp';

    /******** PLUGIN CONFIGURATION ********/
    const StatusAPI = box.my.plugins['/plugins/status-router'].load(RouterFactory, box.my.statusService);


    /******** EVENT REGISTRATION ********/
    events.on({ event: 'application.error', handler: onApplicationError, subscriberId });


    /******** MIDDLEWARE *********/
    expressApp.use(morgan('tiny'));
    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({ extended: false }));


    /******** ROUTES ********/
    expressApp.use('/status', StatusAPI);


    expressApp.use((req, res) => {
      // console.error(`Error 404 on ${req.url}.`);
      res.status(404).send({ status: 404, error: 'Not Found' });
    });

    // The `next` parameter here is required *even when not in use* per the ExpressJS documentation on error handling middleware
    // See (https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling)
    expressApp.use((err, req, res, next) => {
      const status = err.status || 500;
      // const msg = err.error || err.message;
      console.error(err);
      res.status(status).send({ status, error: 'There was an error.' });
    });

    if (process.env.NODE_ENV !== 'ci/cd/test') {
      http.createServer(expressApp).listen(SERVER_PORT, () => {
        console.info(`myApp listening on port ${SERVER_PORT} (http://localhost:${SERVER_PORT})`);
      });
    }

    /******** GREETING ********/
    hello();
    
    /**
     * Creates a router instance to enable registration of API routes 
     * @returns {Object}
     */
    function RouterFactory() {
      return new express.Router();
    }

    /**
     * Logic for handling the event the `GLOBAL_ERROR_THRESHOLD` value is exceeded for *any* running module
     * @param {String} module - a module that exceeds the error threshold, triggering a stop request
     */
    function onGlobalModuleErrorThresholdExceeded(module) {
      box.events.emit('application.info.moduleStopped', module);
    }

    /**
     * Logic for handling the event a module fires the `application.error` event
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     */
    function onApplicationError(appEvent) {
      console.error(appEvent.payload());
    }

    /**
     * Restarts a specified module
     * @param {String} moduleName 
     */
    function restartModule(moduleName) {
      box.moduleCtrl[`${moduleName}`].stop();
      box.moduleCtrl[`${moduleName}`].start();
      box.events.notify('application.info.moduleRestarted', moduleName);
    }

    /**
     * Prints application name and version
     */
    async function hello() {
      const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
      console.log(banner);
    }
  }
);
