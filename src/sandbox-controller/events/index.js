import events from 'events';
import { randomUUID } from 'crypto';
import { IConsole } from '../../interfaces/console.js';
import SimpleConsole from '../console/index.js'

const eventEmitter = new events.EventEmitter();
const console = IConsole(SimpleConsole);

/**
 * @typedef AppEvent
 * @property {Function} payload 
 * @property {AppEventHeader} header
 */

/**
 * Reliable interface for receiving data from emitted events
 * @param {Any} eventData 
 * @returns {Object}
 */
function AppEvent(eventData) {
  const header = { 
    id: `/events/${randomUUID()}`,
    timestamp: new Date().toISOString() 
  };

  function payload() {
    return eventData;
  }

  return { 
    header,
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
    // Reason: Unlikely the native Node EventEmitter will break here; juice not worth the squeeze for mocking EventEmitter
    /* istanbul ignore next */
    console.error(`Events.InternalError.EmittedEventError: (${eventName}) => ${e.message}`);
  }
}

/**
 * Registers an event of interest with the application sandbox
 * @param {String} event
 * @param {Function} handler
 */
function on({event, handler}) {
  eventEmitter.on(event, handler);
}

export default {
  AppEvent,
  notify,
  on
}
