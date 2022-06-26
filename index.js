import Sandbox from './src/sandbox/index.js';
import Slideshows from './lib/repos/post/index.js';
import JainkyModule from './lib/jainky-module/index.js';

const GLOBAL_ERROR_THRESHOLD = 10;

Sandbox.module('/lib/repos/slideshows', Slideshows);
Sandbox.module('/lib/jainky-module', JainkyModule);

Sandbox.of([
  '/lib/jainky-module',
  '/lib/repos/slideshows', 
  ],
  /***
   * @param {Object} box - the sandboxed module APIs; this is where the registered module functionality lives
   */
  async function myApp(box) {
    const { fetch } = box.ajax;
    const { ApplicationError } = box.errors;
    const data = await fetch({ url: 'https://httpbin.org/json' });
    
    box.events.notify('slideshow.downloaded', data);

    box.events.on('application.error', onApplicationError);

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
      console.error(appEvent.payload())
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

    setTimeout(()=> {
      try {
        restartModule('/lib/jainky-module');
      } catch(e) {
        console.error(e.message)
      }
    }, 30000)
  }
);
