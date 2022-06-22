import Sandbox from './lib/sandbox/index.js';
import AppEvents from './lib/events/index.js';
import Ajax from './lib/ajax/index.js';
import Errors from './lib/errors/index.js';
import Slideshows from './lib/repos/slideshows/index.js';
import JainkyModule from './lib/jainky-module/index.js';

Sandbox.module('/lib/errors', Errors);
Sandbox.module('/lib/events', AppEvents);
Sandbox.module('/lib/ajax', Ajax);
Sandbox.module('/lib/repos/slideshows', Slideshows);
Sandbox.module('/lib/jainky-module', JainkyModule);

Sandbox.of([
  '/lib/ajax',
  '/lib/errors', 
  '/lib/events', 
  '/lib/repos/slideshows', 
  '/lib/jainky-module'
  ],
  async function myApp(sb, ctrl) {
    const { fetch } = sb.get('ajax');
    const events = sb.get('events');
    const slideshow = sb.get('slideshow');
    const data = await fetch({ url: 'https://httpbin.org/json' });
    
    events.emit('slideshow.downloaded', data);

    events.on('application.error', onApplicationError);

    /**
     * 
     * @param {String} module - a module that exceeded the error threshold, triggering a stop request
     */
    function onGlobalModuleErrorThresholdExceeded(module) {
      events.emit('application.info.moduleStopped', module);
    }

    /**
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     */
    function onApplicationError(appEvent) {
      ctrl.handleModuleError(appEvent, onGlobalModuleErrorThresholdExceeded);
    }

    
    setTimeout(()=> {
      slideshow.create();
      slideshow.create();
      slideshow.create();
    }, 50000)
  }
);
