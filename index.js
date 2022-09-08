import { fileURLToPath } from 'url';
import { promisify } from 'util';
import figlet from 'figlet';
import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';
import connectSQLite3 from 'connect-sqlite3';

import Sandbox from './src/sandbox/index.js';

/* *************** SERVICES *************** */
import RecoveryManager from './lib/recovery/index.js';
import PostRepository from './lib/repos/post/index.js';
import SessionRepository from './lib/repos/session/index.js';
import UserRepository from './lib/repos/user/index.js';
import Supervisor from './lib/supervisor/index.js';
import WriteAheadLog from './lib/wal/index.js';
import StatusService from './lib/services/status/index.js';
import PostService from './lib/services/post/index.js';
import SessionService from './lib/services/session/index.js';
import UserService from './lib/services/user/index.js';

/** ************** PLUGINS *************** */
import PluginEventAuthz from './lib/plugins/event-authz/index.js';
import PluginStatusRouter from './lib/plugins/router/status/index.js';
import PluginPostRouter from './lib/plugins/router/post/index.js';
import PluginChaos from './lib/plugins/chaos/index.js';
import PluginHypermediaPost from './lib/plugins/hypermedia/post/index.js';
import PluginHTTPMediaStrategyPost from './lib/plugins/http-media-strategy/post/index.js';
import PluginHTTPMediaStrategyUser from './lib/plugins/http-media-strategy/user/index.js';
import PluginHTMLPost from './lib/plugins/html/post/index.js';
import PluginHTMLUser from './lib/plugins/html/user/index.js';
import PluginSessionRouter from './lib/plugins/router/session/index.js';
import PluginUserAuthnService from './lib/plugins/user-authn/index.js';
import PluginMiddlewarePost from './lib/plugins/middleware/post/index.js';
import PluginPassport from './lib/plugins/vendor/passport/index.js';

const expiresInOneHour = Math.floor(Date.now() / 1000) + (60 * 60);
const SessionStore = connectSQLite3(session);
const SERVER_PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'sandbox';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'superSecret';
const JWT_TOKEN_EXPIRATION = process.env.JWT_TOKEN_EXPIRATION_MILLIS || expiresInOneHour;
const SESSION_SECRET = process.env.SESSION_SECRET || 'superSessionSecret';

// Resolves issue of `__dirname` environment variable being `undefined` in ES modules
// See (https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const figletize = promisify(figlet);
const expressApp = express();

/* *************** MODULE DEFINITION *************** */
Sandbox.module('/lib/repos/post', PostRepository);
Sandbox.module('/lib/repos/session', SessionRepository);
Sandbox.module('/lib/repos/user', UserRepository);
Sandbox.module('/lib/wal', WriteAheadLog);
Sandbox.module('/lib/supervisor', Supervisor);
Sandbox.module('/lib/recovery', RecoveryManager);
Sandbox.module('/lib/services/status', StatusService);
Sandbox.module('/lib/services/session', SessionService);
Sandbox.module('/lib/services/user', UserService);
Sandbox.module('/lib/services/post', PostService);
Sandbox.module('/lib/plugins/event-authz', PluginEventAuthz);
Sandbox.module('/lib/plugins/status-router', PluginStatusRouter);
Sandbox.module('/lib/plugins/post-router', PluginPostRouter);
Sandbox.module('/lib/plugins/session-router', PluginSessionRouter);
Sandbox.module('/lib/plugins/chaos', PluginChaos);
Sandbox.module('/lib/plugins/hypermedia-post', PluginHypermediaPost);
Sandbox.module('/lib/plugins/http-media-strategy/post', PluginHTTPMediaStrategyPost);
Sandbox.module('/lib/plugins/http-media-strategy/user', PluginHTTPMediaStrategyUser);
Sandbox.module('/lib/plugins/html/post', PluginHTMLPost);
Sandbox.module('/lib/plugins/html/user', PluginHTMLUser);
Sandbox.module('/lib/plugins/user-authn', PluginUserAuthnService);
Sandbox.module('/lib/plugins/middleware-post', PluginMiddlewarePost);
Sandbox.module('/lib/plugins/vendor/passport/local', PluginPassport);

Sandbox.of(
  [
    '/lib/plugins/event-authz',
    '/lib/wal',
    '/lib/recovery',
    '/lib/supervisor',
    '/lib/repos/post',
    '/lib/repos/session',
    '/lib/repos/user',
    '/lib/services/session',
    '/lib/services/post',
    '/lib/services/status',
    '/lib/services/user',
    '/lib/plugins/chaos',
    '/lib/plugins/html/post',
    '/lib/plugins/html/user',
    '/lib/plugins/http-media-strategy/post',
    '/lib/plugins/http-media-strategy/user',
    '/lib/plugins/hypermedia-post',
    '/lib/plugins/post-router',
    '/lib/plugins/session-router',
    '/lib/plugins/status-router',
    '/lib/plugins/user-authn',
    '/lib/plugins/middleware-post',
    '/lib/plugins/vendor/passport/local',
  ],
  /**
   * @module ApplicationCore
   * The application core
   * @param {Object} sandbox - the sandboxed module APIs; this is where the registered client-defined module functionality lives
   */
  async (sandbox) => {
    const events = sandbox.get('/plugins/events-authz');
    const myConsole = sandbox.get('console');
    const templateRootPath = path.join(__dirname, 'views');
    const subscriberId = 'myApp';

    const { postRepo } = sandbox.my;
    const { sessionRepo } = sandbox.my;
    const { userRepo } = sandbox.my;
    const { postService } = sandbox.my;
    const { userService } = sandbox.my;
    const { sessionService } = sandbox.my;
    const { AppEvent } = events;

    /* *************** PLUGIN CONFIGURATION *************** */
    const pluginUserAuthn = sandbox.my.plugins['/plugins/user-authn'].load({
      JWT_SECRET,
      JWT_TOKEN_EXPIRATION,
    }, sessionService);
    const pluginChaos = sandbox.my.plugins['/plugins/chaos'].load({
      chaosEnabled: process.env.CHAOS_ENABLED,
      scheduleTimeoutMillis: process.env.CHAOS_SCHEDULE_TIMEOUT_MILLIS,
    });

    /* ******* POSTS ******* */
    const pluginMiddlewarePost = sandbox.my.plugins['/plugins/middleware-post'].load();
    const htmlPostService = sandbox.my.plugins['/plugins/html/post'].load({ templateRootPath }, postService);
    const hypermediaPostService = sandbox.my.plugins['/plugins/hypermedia-post'].load(postService);
    const strategyPostService = sandbox.my.plugins['/plugins/http-media-strategy/post'].load({
      applicationJSON: postService,
      applicationHAL: hypermediaPostService,
      textHTML: htmlPostService,
    });

    /* ******* USERS ******* */
    const htmlUserService = sandbox.my.plugins['/plugins/html/user'].load({ templateRootPath }, userService);
    const strategyUserService = sandbox.my.plugins['/plugins/http-media-strategy/user'].load({
    // applicationJSON: postService,
    // applicationHAL: hypermediaPostService,
      textHTML: htmlUserService,
    });

    const pluginPassport = sandbox.my.plugins['/plugins/vendor/passport/local'].load({
      userAuthn: pluginUserAuthn,
      userService: strategyUserService,
    });

    /* ******* APIS ******* */
    const StatusAPI = sandbox.my.plugins['/plugins/status-router'].load(RouterFactory(), sandbox.my.statusService);
    const PostAPI = sandbox.my.plugins['/plugins/post-router'].load(RouterFactory(), {
      middleware: pluginMiddlewarePost,
      postService: strategyPostService,
      userAuthn: pluginUserAuthn,
    });
    const SessionAPI = sandbox.my.plugins['/plugins/session-router'].load(RouterFactory(), {
      // userAuthn: pluginUserAuthn,
      // userService: strategyUserService,
      passport: pluginPassport,
    });

    /* *************** MODULE CONFIGURATION **************** */
    sandbox.my.postService.setRepository(postRepo);
    sandbox.my.sessionService.setRepository(sessionRepo);
    sandbox.my.userService.setRepository(userRepo);
    sandbox.my.supervisor.setErrorThreshold(process.env.GLOBAL_ERROR_COUNT_THRESHOLD);

    /* *************** EVENT REGISTRATION *************** */
    events.on({ event: 'application.error', handler: onApplicationError, subscriberId });
    events.on({ event: 'application.error.globalErrorThresholdExceeded', handler: onGlobalModuleErrorThresholdExceeded, subscriberId });
    events.on({ event: 'application.recovery.recoveryAttemptCompleted', handler: onModuleRecoveryAttemptCompleted, subscriberId });
    events.on({ event: 'application.chaos.experiment.registrationRequested', handler: onChaosExperimentRegistrationRequest, subscriberId });
    events.on({ event: 'application.postService.post.writeRequestReceived', handler: onPostServiceWriteRequest, subscriberId });
    events.on({ event: 'application.authenticationCredentialIssued', handler: onAuthnCredentialIssued, subscriberId });

    /* *************** SETTINGS **************** */
    expressApp.set('view engine', 'ejs');

    /* *************** MIDDLEWARE **************** */
    expressApp.use(morgan('tiny'));
    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({ extended: false }));
    expressApp.use(cookieParser());
    expressApp.use('/dist', express.static(path.join(__dirname, 'dist')));
    expressApp.use(session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ db: 'sessions.db', dir: './var/db' }),
    }));
    expressApp.use(pluginPassport.authenticate('session'));

    /* ************** ROUTES *************** */
    expressApp.use('/status', StatusAPI);
    expressApp.use('/api/v1', PostAPI);
    expressApp.use('/api/v1', SessionAPI);

    expressApp.use((req, res) => {
    // console.error(`Error 404 on ${req.url}.`);
    // res.status(404).send({ status: 404, error: 'Not Found' });
      res.status(404);
      res.render('not-found-error');
    });

    // The `next` parameter here is required *even when not in use* per the ExpressJS documentation on error handling middleware
    // See (https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling)
    // eslint-disable-next-line
    expressApp.use((err, req, res, next) => {
      const status = err.status || 500;
      // const msg = err.error || err.message;
      myConsole.error(err);
      // res.status(status).send({ status, error: 'There was an error.' });
      res.status(status);
      res.render('internal-error');
    });

    /* *************** SERVER START *************** */
    if (process.env.NODE_ENV !== 'ci/cd/test') {
      http.createServer(expressApp).listen(SERVER_PORT, () => {
        myConsole.info(`myApp listening on port ${SERVER_PORT} (http://localhost:${SERVER_PORT})`);
      });
    }

    /* *************** APPLICATION READY *************** */
    hello();
    events.notify('application.ready');
    sandbox.my.recovery.onRecoveryStrategyRegistered(
      AppEvent({
        serviceName: 'postService',
        strategies: [{ name: 'resetRepository', fn: resetRepository }],
      }),
    );

    /**
     * Creates a router instance to enable registration of API routes
     * @returns {Object}
     */
    function RouterFactory() {
      return new express.Router();
    }

    /* *************** HANDLERS *************** */

    /**
     * Logic for handling the event the `GLOBAL_ERROR_COUNT_THRESHOLD` value is exceeded for *any* running module
     * @param {AppEvent} appEvent - an instance of {AppEvent} interface
     * @memberof module:ApplicationCore
     */
    function onGlobalModuleErrorThresholdExceeded(appEvent) {
      sandbox.my.recovery.onGlobalErrorThresholdExceeded(appEvent);
    }

    /**
     * Schedules a task to burn the authentication credential and expire its associated session
     * @param {AppEvent} appEvent - an instance of {AppEvent} interface
     * @memberof module:ApplicationCore
     */
    function onAuthnCredentialIssued(appEvent) {
      const { credential } = appEvent.payload();
      const { sid: sessionId } = credential;

      setTimeout(() => {
        pluginUserAuthn.expireAuthnCredential(credential);
        sessionService.expire(sessionId);
      }, JWT_TOKEN_EXPIRATION);
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
          serviceName,
        });
      }
    }

    /**
     * Basic recovery strategy for resolving failures to create posts
     * @memberof module:ApplicationCore
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
  },
);
