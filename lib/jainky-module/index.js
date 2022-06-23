import { v4 } from 'uuid';

let executionCount = 0

/**
 * 
 * @param {Object} box - the application sandbox 
 * @returns {Function} a function providing custom logic to stop this module
 */
export default function(box) {
    const EXECUTION_ID = v4();
    const { ApplicationError } = box.get('errors');

    console.log(`/lib/jainky-module is [UP] with ExecutionId (${EXECUTION_ID}) and ExecutionCount (${executionCount})`)
   
    executionCount++;
  
    box.put('jainky', { getJainky }); 
     
    ApplicationError({
      id: 'module.jainky',
      message: 'This is a jainky module, lol',
      name: 'LibJainkyModuleError', 
      module: '/lib/jainky-module',
    }); 
  
    
    /**
     * 
     */
     function getJainky() {
      return executionCount;
    }
  
    /**
     * 
     */
    return function stop() {
      console.log(`/lib/jainky-module (${EXECUTION_ID}) is [DOWN]`);
    }
}