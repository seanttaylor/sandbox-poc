import events from 'events';

const eventEmitter = new events.EventEmitter();

/**
 * @typedef AppEvent
 * @property {Function} payload 
 * @property {AppEventHeader} header
 */

/**
 * @typedef AppEventHeader
 * @property {String} timestamp 
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
 * Notifies the application sandbox of an event of interest
 * @param {String} eventName
 * @param {Any} eventData
 */
function notify(eventName, eventData) {
  try { 
      eventEmitter.emit(eventName, AppEvent(eventData));
  } catch(e) {
      console.error(`Events.InternalError.EmittedEventError: (${eventName}) => ${e.message}`);
  }
}

/**
 * Registers an event of interest with the application sandbox
 * @param {String} eventName
 * @param {Function} eventHandler
 */
function on(eventName, eventHandler) {
  eventEmitter.on(eventName, eventHandler);
}

export default {
  notify,
  on
}
