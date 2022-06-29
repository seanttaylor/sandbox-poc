import { promisify } from 'util';
import figlet from 'figlet';

import Sandbox from './src/sandbox/index.js';
import PostRepository from './lib/repos/post/index.js';
import JainkyModule from './lib/jainky-module/index.js';
import PluginEventAuthz from './lib/plugins/event-authz/index.js';

const GLOBAL_ERROR_THRESHOLD = 10;
const figletize = promisify(figlet);

Sandbox.module('/lib/repos/post', PostRepository);
Sandbox.module('/lib/jainky-module', JainkyModule);
Sandbox.module('/lib/plugins/event-authz', PluginEventAuthz);

Sandbox.of([
  '/lib/plugins/event-authz',
  '/lib/jainky-module',
  '/lib/repos/post',
],
  /***
   * @param {Object} box - the sandboxed module APIs; this is where the registered module functionality lives
   */
  async function myApp(box) {
    const { ApplicationError } = box.get('errors');
    const subscriberId = 'myApp';
    const events = box.get('/plugins/events-authz');
    
    events.on({ event: 'application.error', handler: onApplicationError, subscriberId });

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
     * 
     */
    async function hello() {
      const banner = await figletize('sandbox v.0.0.1');
      console.log(banner);
    }

    await box.my.postRepo.create({
      authorId: "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d",
      body: "Another day in the life of a playboy billionaire genius..."
    });

    hello();

    
    setTimeout(()=> {
      try {
        events.notify('application.info.moduleStopped', 42);
      } catch(e) {
        console.error(e.message);
      }
    }, 30000);
  }
);
