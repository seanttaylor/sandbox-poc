import Sandbox from './lib/sandbox/index.js';
import AppEvents from './lib/events/index.js';
import Ajax from './lib/ajax/index.js';
import Errors from './lib/errors/index.js';
import Slideshows from './lib/repos/slideshows/index.js';

Sandbox.module('/lib/errors', Errors);
Sandbox.module('/lib/events', AppEvents);
Sandbox.module('/lib/ajax', Ajax);
Sandbox.module('/lib/repos/slideshows', Slideshows);

Sandbox.module('/lib/jainky-module', (box) => {
  const { ApplicationError } = box.get('errors');
  const events = box.get('events');

  box.put('jainky', { getJainky });

  function getJainky() {

  }

  /*const interval = setInterval(()=> {
    ApplicationError({
      errorName: 'LibJainkyModuleError', 
      errorType: 'module.jainky',
      moduleName: '/lib/jainky-module',
    }); 
  }, 3000);
  */

  /**
   * 
   */
  return function stop() {
    clearInterval(interval);
  }
});

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
    
    events.on('application.error', (errorData)=> {
      ctrl.handleModuleError(errorData, events);
      console.log(ctrl.getModuleAnalytics());
    });

    events.emit('slideshow.downloaded', data);
    
    setTimeout(()=> {
      slideshow.create();
      slideshow.create();
    }, 50000)
  }
);
