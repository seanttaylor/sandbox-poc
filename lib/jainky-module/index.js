/**
 * 
 * @param {Object} box - the application sandbox 
 * @returns {Function} a function providing logic to stop this module
 */
export default function(box) {
    const { ApplicationError } = box.get('errors');
  
    box.put('jainky', { getJainky });
    
    const interval = setInterval(()=> {
      ApplicationError({
        id: 'module.jainky',
        message: 'This is a jainky module, lol',
        name: 'LibJainkyModuleError', 
        module: '/lib/jainky-module',
      }); 
    }, 3000);

    /**
     * 
     */
     function getJainky() {
  
    }
  
    /**
     * 
     */
    return function stop() {
      clearInterval(interval);
    }
}