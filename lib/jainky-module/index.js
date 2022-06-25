import { v4 } from 'uuid';

/**
 * 
 * @param {Object} box - sandboxed module APIs 
 * @returns {Function} a function providing custom logic to stop this module
 */
export default function jainkyModule(box) {
  console.log('jainkyModule is [UP]');

  box.put('jainkyModule', { hello });
  
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

  
  function stop() {
    console.log('stopping jainkyModule...');
    clearInterval(timeout);
    console.log('jainkyModule is [DOWN]');
  }

  return stop;
}