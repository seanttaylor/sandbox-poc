/** 
 * Manages all instances of application modals and their behavior
 * @param {Object} sandbox - the application sandbox
 */
export default function ModalManager(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    let $;
    let $$;

    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/modal-manager'
    });

    /**************** PLUGIN DEFINITION ****************/

    /**
     * 
     * @param {Object} window 
     * @returns {Object}
     */
    function myPlugin(window) {
        window.document.addEventListener('DOMContentLoaded', onDomContentLoaded);
        $ = window.document.querySelector.bind(document);
        $$ = window.document.querySelectorAll.bind(document);

        /**
         * 
         */
        function onDomContentLoaded() {
            events.notify('application.domContentLoaded', { $, $$ });
        }

        /**
         * Opens a specified modal
         * @param {Object} element 
         */
        function openModal(element) {
            $(element).classList.add('is-active');
        }

        /**
         * Closes a specified modal 
         * @param {Object} element 
         */
        function closeModal(element) {
            $(element).classList.remove('is-active');
        }

        /**
         * Closes all currently open modals
         * @param {Object} element
         */
        function closeAllModals() {
            // Reason: Dom selector not likely to ever be called when there are no elements in the list; juice not worth the squeeze
            /* istanbul ignore next */
            ($$('.modal') || []).forEach((modal) => {
                closeModal(modal);
            });
        }

        return {
            closeAllModals,
            closeModal,
            openModal
        }
    }
}