import permissions from './permissions.js';

/**
 * Module plugin that extends the existing application events API to apply permissions to modules that subscribe to a given event
 * @param {Object} box - default sandbox APIs 
 */
export default function pluginEventAuthz(box) {
    const console = box.get('console');

    box.plugin({
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

    /**
     * 
     * @param {Object} events - default sandbox events API
     */
    function myPlugin(events) {

        /**
         * @param {String} eventName
         * @param {Any} eventData
         */
        function notify(eventName, eventData) {
            events.notify(eventName, eventData);
        }

        /**
         * 
         * @param {String} event
         * @param {Function} handler
         * @param {String} subscriberId 
         */
        function on({ event, handler, subscriberId }) {
            if (!validatePermissions(subscriberId, event)) {
                return;
            }

            events.on({ event, handler });
        }

        return {
            notify,
            on
        };
    }

}