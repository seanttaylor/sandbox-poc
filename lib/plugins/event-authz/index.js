/**
 * Module plugin that extends the existing application events API to apply permissions to modules that subscribe to a given
 * @param {Object} box - sandboxed module APIs 
 */
export default function pluginEventAuthz(box) {
    box.put('/plugins/events-authz', { myPlugin });

    /**
     * 
     * @param {Object} events - default application events API
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
            console.log(`Look who it is: ${subscriberId}`)
        }

        return {
            notify,
            on
        };
    }

}