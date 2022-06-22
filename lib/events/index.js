import events from 'events';

/**
 * @typedef AppEvent
 * @property {Function} payload 
 */

/**
 * Reliable interface for receiving data from emitted events
 * @param {Any} eventData 
 * @returns {Object}
 */
function AppEvent(eventData) {
  function payload() {
    return eventData;
  }

  return { 
    payload 
  }
}

/**
 * @param {Object} box - the application sandbox
 */
export default function(box) {
  const eventEmitter = new events.EventEmitter();
  
  box.put('events', { emit, on });

  /**
   * 
   */
  function emit(eventName, eventData) {
   try { 
    eventEmitter.emit(eventName, AppEvent(eventData));
   } catch(e) {
    console.error(`Events.InternalError.EmittedEventError: (${eventName}) => ${e.message}`);
   }
  }

  /**
   * 
   */
  function on(eventName, eventHandler) {
    eventEmitter.on(eventName, eventHandler);
  }
}