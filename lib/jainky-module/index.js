
/**
 * 
 * @param {Object} box - sandboxed module APIs 
 * @returns {Function} a function providing custom logic to stop this module
 */
export default function jainkyModule(box) {

  box.put('jainkyModule', { hello });

  /**
   * 
   */
  function hello() {
    console.log("I'm a module that's jainky AF...");
  }

  /**
   * 
   */
  function stop() {
    console.log('stopping jainkyModule...');
    console.log('jainkyModule is [DOWN]');
  }

  return stop;
}