import fs from 'node:fs';
import permissions from './permissions.js';
import Ajv from 'ajv';

const ajv = new Ajv();
const schemaMap = {};

/**
 * Module plugin that extends the existing application events API to apply permissions to modules that subscribe to a given event
 * @param {Object} sanbox - default sandbox APIs 
 */
export default function pluginEventAuthz(sandbox) {
    const console = sandbox.get('console');

    sandbox.plugin({
        extendsDefault: true,
        fn: myPlugin,
        name: '/plugins/events-authz',
        of: 'events',
    });

    /**
     * @param {String} subscriberId - name of the client attempting to subscribe to an event
     * @param {String} event - name of the event a client is attempting to subscribe to
     */
    function validatePermissions(subscriberId, event) {
        // The event has not been configured in the permissions file
        if (!permissions[event]) {
            console.error(`EventAuthzError.NotFound (${event}) => Could not validate event requested by (${subscriberId}). See ./permissions.js`);
            return false;
        }

        // The subscriber has not been configured in the permissions file for the event specified 
        if (!Object.keys(permissions[event]).includes(subscriberId)) {
            console.error(`EventAuthzError.NotFound (${subscriberId}) => Subscriber not configured for this event (${event}). See ./permissions.js`);
            return false;
        }

        // The subscriber is configured in the permissions file but is not granted the permission to subscribe to this event
        if (!permissions[event][subscriberId]) {
            console.warn(`EventAuthzError.Unauthorized (${subscriberId}) => Subscriber not authorized for this event (${event}). See ./permissions.js`);
            return false;
        }

        //The subscriber is configured in the permissions file and granted permission
        return true;
    }

    /**************** PLUGIN DEFINTION ****************/

    /**
     * Enhances the default events API to allow for subscriber authorization and event schema definitions
     * @param {Object} events - default sandbox events API
     */
    function myPlugin(events) {
        // We have to ensure we have a reference to all the other methods that we ARE NOT extending on the `events` module so
        // that they are still available on the plugin. 
        const { on: defaultOn, notify: defaultNotify, ...allOtherMethods } = events;

        /**
         * Allows an event producer to notify subscribers an event of interest has occurred
         * @param {String} eventName - the name of the event 
         * @param {Any} eventData - data associated with the emitted event
         */
        function notify(eventName, eventData) {
            if (schemaMap[eventName]) {
                const schemaValidator = schemaMap[eventName]['schema'];
                const validSchema = ajv.validate(schemaValidator, eventData);

                if (!validSchema) {
                    console.error(`EventAuthzError.ValidationError (${eventName}) => Event data does pass schema validation for this event. See schema at '${schemaMap[eventName]['schemaPath']}'`);
                    console.error(ajv.errors);
                    return;
                }
            }

            events.notify(eventName, eventData);
        }

        /**
         * Allows a subcriber to listen for notifications of an event
         * @param {String} event - the name of the event
         * @param {Function} handler - a function to call when the event is triggered
         * @param {String} subscriberId - the name of the event subscriber; used to validate permission to subscribe
         * @param {Object} schemaPath - a JSON schema that validates data associated with a emission of this event 
         */
        async function on({ event, handler, schemaPath, subscriberId }) {
            if (!validatePermissions(subscriberId, event)) {
                return;
            }

            if (schemaPath) {
                const { default: schema } = await import(schemaPath);
                schemaMap[event] = {
                    schema,
                    schemaPath
                }
            }

            events.on({ event, handler });
        }

        return {
            ...allOtherMethods,
            notify,
            on
        };
    }

}