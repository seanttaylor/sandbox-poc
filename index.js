import { fileURLToPath } from 'url';
import { promisify } from 'util';
import figlet from 'figlet';
import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import Sandbox from './src/sandbox/index.js';

/**************** SERVICES ****************/
import PostRepository from './lib/repos/post/index.js';
import WriteAheadLog from './lib/wal/index.js';
import StatusService from './lib/services/status/index.js';
import PostService from './lib/services/post/index.js';
import Supervisor from './lib/supervisor/index.js';
import RecoveryManager from './lib/recovery/index.js';

/**************** PLUGINS ****************/
import PluginEventAuthz from './lib/plugins/event-authz/index.js';
import PluginStatusRouter from './lib/plugins/router/status/index.js';
import PluginPostRouter from './lib/plugins/router/post/index.js';
import PluginChaos from './lib/plugins/chaos/index.js';
import PluginHypermediaPost from './lib/plugins/hypermedia/post/index.js';
import PluginHTTPMediaStrategyPost from './lib/plugins/http-media-strategy/post/index.js';
import PluginHTMLPost from './lib/plugins/html/post/index.js';

const SERVER_PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'sandbox';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';

// Resolves issue of `__dirname` environment variable being `undefined` in ES modules
// See (https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const figletize = promisify(figlet);
const expressApp = express();

/**************** MODULE DEFINITION ****************/
Sandbox.module('/lib/repos/post', PostRepository);
Sandbox.module('/lib/wal', WriteAheadLog);
Sandbox.module('/lib/plugins/chaos', PluginChaos);
Sandbox.module('/lib/supervisor', Supervisor);
Sandbox.module('/lib/plugins/event-authz', PluginEventAuthz);
Sandbox.module('/lib/plugins/status-router', PluginStatusRouter);
Sandbox.module('/lib/services/status', StatusService);
Sandbox.module('/lib/plugins/post-router', PluginPostRouter);
Sandbox.module('/lib/services/post', PostService);
Sandbox.module('/lib/plugins/chaos', PluginChaos);
Sandbox.module('/lib/recovery', RecoveryManager);
Sandbox.module('/lib/plugins/hypermedia-post', PluginHypermediaPost);
Sandbox.module('/lib/plugins/http-media-strategy/post', PluginHTTPMediaStrategyPost);
Sandbox.module('/lib/plugins/html/post', PluginHTMLPost);


Sandbox.of([
  '/lib/plugins/event-authz',
  '/lib/wal',
  '/lib/repos/post',
  '/lib/services/post',
  '/lib/plugins/post-router',
  '/lib/services/status',
  '/lib/plugins/status-router',
  '/lib/plugins/chaos',
  '/lib/supervisor',
  '/lib/recovery',
  '/lib/plugins/hypermedia-post',
  '/lib/plugins/http-media-strategy/post',
  '/lib/plugins/html/post'
],
  /***
   * @module ApplicationCore
   * The application core 
   * @param {Object} sandbox - the sandboxed module APIs; this is where the registered client-defined module functionality lives
   */
  async function myApp(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    const myConsole = sandbox.get('console');
    const postRepo = sandbox.my.postRepo;
    const postService = sandbox.my.postService;
    const subscriberId = 'myApp';
    const { AppEvent } = events;

    /**************** PLUGIN CONFIGURATION ****************/
    const htmlPostService = sandbox.my.plugins['/plugins/html/post'].load({ templateRootPath: path.join(__dirname, 'views')  }, postService);
    const hypermediaPostService = sandbox.my.plugins['/plugins/hypermedia-post'].load(postService);
    const strategyPostService = sandbox.my.plugins['/plugins/http-media-strategy/post'].load({
      applicationJSON: postService,
      applicationHAL: hypermediaPostService,
      textHTML: htmlPostService
    });

    const StatusAPI = sandbox.my.plugins['/plugins/status-router'].load(RouterFactory(), sandbox.my.statusService);
    const PostAPI = sandbox.my.plugins['/plugins/post-router'].load(RouterFactory(), strategyPostService);
    //const PostAPI = sandbox.my.plugins['/plugins/post-router'].load(RouterFactory(), hypermediaPostService);

    const pluginChaos = sandbox.my.plugins['/plugins/chaos'].load({
      chaosEnabled: process.env.CHAOS_ENABLED,
      scheduleTimeoutMillis: process.env.CHAOS_SCHEDULE_TIMEOUT_MILLIS
    });


    /**************** MODULE CONFIGURATION *****************/
    sandbox.my.postService.setRepository(postRepo);
    sandbox.my.supervisor.setErrorThreshold(process.env.GLOBAL_ERROR_COUNT_THRESHOLD);

    /**************** EVENT REGISTRATION ****************/
    events.on({ event: 'application.error', handler: onApplicationError, subscriberId });
    events.on({ event: 'application.error.globalErrorThresholdExceeded', handler: onGlobalModuleErrorThresholdExceeded, subscriberId });
    events.on({ event: 'application.recovery.recoveryAttemptCompleted', handler: onModuleRecoveryAttemptCompleted, subscriberId });
    events.on({ event: 'application.chaos.experiment.registrationRequested', handler: onChaosExperimentRegistrationRequest, subscriberId });
    events.on({ event: 'application.postService.post.writeRequestReceived', handler: onPostServiceWriteRequest, subscriberId });

    /**************** SETTINGS *****************/
    expressApp.set('view engine', 'ejs');

    /**************** MIDDLEWARE *****************/
    expressApp.use(morgan('tiny'));
    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({ extended: false }));
    expressApp.use('/public', express.static(path.join(__dirname, 'public')));

    /**************** ROUTES ****************/
    expressApp.use('/status', StatusAPI);
    expressApp.use('/api/v1', PostAPI);

    expressApp.use((req, res) => {
      // console.error(`Error 404 on ${req.url}.`);
      res.status(404).send({ status: 404, error: 'Not Found' });
    });

    // The `next` parameter here is required *even when not in use* per the ExpressJS documentation on error handling middleware
    // See (https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling)
    expressApp.use((err, req, res, next) => {
      const status = err.status || 500;
      // const msg = err.error || err.message;
      myConsole.error(err);
      res.status(status).send({ status, error: 'There was an error.' });
    });

    /**************** SERVER START ****************/
    if (process.env.NODE_ENV !== 'ci/cd/test') {
      http.createServer(expressApp).listen(SERVER_PORT, () => {
        myConsole.info(`myApp listening on port ${SERVER_PORT} (http://localhost:${SERVER_PORT})`);
      });
    }

    /**************** APPLICATION READY ****************/
    hello();
    events.notify('application.ready');
    sandbox.my.recovery.onRecoveryStrategyRegistered(
      AppEvent({
        serviceName: 'postService',
        strategies: [{ name: 'resetRepository', fn: resetRepository }]
      })
    );

    /**
     * Creates a router instance to enable registration of API routes 
     * @returns {Object}
     */
    function RouterFactory() {
      return new express.Router();
    }

    /**************** HANDLERS ****************/

    /**
     * Logic for handling the event the `GLOBAL_ERROR_COUNT_THRESHOLD` value is exceeded for *any* running module
     * @param {AppEvent} appEvent - an instance of {AppEvent} interface
     * @memberof ApplicationCore
     */
    function onGlobalModuleErrorThresholdExceeded(appEvent) {
      sandbox.my.recovery.onGlobalErrorThresholdExceeded(appEvent);
    }

    /**
     * Receives an incoming request to setup a new chaos experiment; forwards the request to the chaos plugin
     * @param {AppEvent} appEvent 
     */
    function onChaosExperimentRegistrationRequest(appEvent) {
      pluginChaos.onExperimentRegistrationRequest(appEvent);
    }

    /**
     * Logic for handling the event a module fires the `application.error` event; forwards to /lib/supervisor
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     */
    function onApplicationError(appEvent) {
      sandbox.my.supervisor.onApplicationError(appEvent);
    }

    /**
     * Logic for handling the event a module fires the `application.postService.post.writeRequestReceived` event; forwards to /lib/wal
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     */
    function onPostServiceWriteRequest(appEvent) {
      sandbox.my.wal.onWriteRequest(appEvent);
    }

    /**
     * Excecutes any remaining logic required to a return a recently recovered module to a normal state
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     */
    function onModuleRecoveryAttemptCompleted(appEvent) {
      const serviceName = appEvent.payload();
      const entries = sandbox.my.wal.getAllEntries();

      if (entries) {
        events.notify('application.writeAheadLogAvailable', {
          count: entries.length,
          entries,
          serviceName
        });
      }
    }

    /**
     * Basic recovery strategy for resolving failures to create posts
     * @module Foo
     * @function resetRepository
     */
    function resetRepository() {
      sandbox.my.postService.setRepository(postRepo);
    }

    /**
     * Prints application name and version
     */
    async function hello() {
      const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
      myConsole.log(banner);
    }
  }
);
