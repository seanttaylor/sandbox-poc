import events from 'events';

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
   eventEmitter.emit(eventName, eventData);
   
  }

  /**
   * 
   */
  function on(eventName, eventHandler) {
    eventEmitter.on(eventName, eventHandler);
  }
}