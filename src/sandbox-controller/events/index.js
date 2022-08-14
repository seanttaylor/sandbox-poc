import events from 'events';
import generateGuid from '../../utils/id.js';
import { IConsole } from '../../interfaces/console.js';
import SimpleConsole from '../console/index.js'

const eventEmitter = new events.EventEmitter();
const console = IConsole(SimpleConsole);

/** 
 * A service providing publish/subscribe functionality to all application modules. **This is a 
 * default sandbox API that is available to *all* client-defined modules.**
 * @module Events
 */

/** 
* @typedef AppEventHeader 
* @property {String} id - unique identifier for the emitted event
* @property {String} timestamp - date/time the event was emitted
*/

/**
 * @typedef AppEvent
 * @property {Function} payload - returns the data associated with the event
 * @property {AppEventHeader} header - see AppEventHeader
 */

/**
 * @typedef {Object} Recovery
 * @property {String} attemptOffset
 * @property {String} serviceName - name of a service containing a Recovery procedure
 * @property {Function[]} strategies - list of functions to execute in order to recover a module experiencing errors
 */


/**
 * Reliable interface for receiving data from emitted events
 * @param {Any} eventData - any data associated with emitted event
 * @returns {Object}
 */
function AppEvent(eventData) {
  const header = { 
    id: `/events/${generateGuid()}`,
    timestamp: new Date().toISOString() 
  };

  function payload() {
    if (typeof(eventData.payload) === 'function') {
      return eventData.payload();
    }
    
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
