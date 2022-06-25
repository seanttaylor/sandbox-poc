import Sandbox from './lib/sandbox/index.js';
import Slideshows from './lib/repos/slideshows/index.js';
import JainkyModule from './lib/jainky-module/index.js';

const GLOBAL_ERROR_THRESHOLD = 10;

Sandbox.module('/lib/repos/slideshows', Slideshows);
Sandbox.module('/lib/jainky-module', JainkyModule);

Sandbox.of([
  '/lib/jainky-module',
  '/lib/repos/slideshows', 
  ],
  /***
   * @param {Object} box - the application sandbox API; this is where the registered module functionality lives
   */
  async function myApp(box) {
    const { fetch } = box.ajax;
    const { ApplicationError } = box.errors;
    const data = await fetch({ url: 'https://httpbin.org/json' });
    console.log(box);
    
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

    setTimeout(()=> {
      try {
      box.my.jainkyModule.stop();
      box.my.jainkyModule.start();
      box.events.notify('application.info.moduleRestarted', '/lib/jainky-module')
      } catch(e) {
        console.error(e.message)
      }
    }, 30000)
  }
);
