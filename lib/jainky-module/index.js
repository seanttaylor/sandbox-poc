import { v4 } from 'uuid';

/**
 * 
 * @param {Object} box - the application sandbox 
 * @returns {Function} a function providing custom logic to stop this module
 */
export default function jainkyModule(box) {
  console.log(box)

  box.put('jainkyModule', {hello, start, stop});
  
  const timeout = setTimeout(()=> {
    box.events.notify('application.error', {
      id: 'module.jainky',
      message: 'This is a jainky module, lol',
      name: 'LibJainkyModuleError', 
      module: '/lib/jainky-module',
    });
  }, 10000);

  /**
   * 
   */
  function hello() {
    console.log('jainkyModule is [UP]')
  }

  /**
   * 
   */
  function start() {
    jainkyModule(box);
  }

  /**
   * 
   */
  function stop() {
    console.log('stopping...');
    clearInterval(timeout);
  }
}