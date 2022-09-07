import Sandbox from '../../src/sandbox/index.js';
import PluginEventAuthz from '../../lib/plugins/event-authz/index.js';
import ModalManager from './modal/index.js';

/* *************** MODULE DEFINITION *************** */
Sandbox.module('/lib/modal-manager', ModalManager);
Sandbox.module('/lib/plugins/events-authz', PluginEventAuthz);

Sandbox.of([
  '/lib/plugins/events-authz',
  '/lib/modal-manager',
], (sandbox) => {
  const events = sandbox.get('/plugins/events-authz');
  const PluginModalManager = sandbox.my.plugins['/plugins/modal-manager'].load(window);

  events.on({ event: 'application.domContentLoaded', handler: onDomContentLoaded, subscriberId: 'myFrontendApp' });

  /**
   * Handler for the DOMContentLoaded event
   * @param {Object} appEvent
   */
  function onDomContentLoaded(appEvent) {
    const { $ } = appEvent.payload();
    const createPostButton = $('#create-post-button');
    const closePostPreviewButton = $('.close-post-preview-button');

    createPostButton.addEventListener('click', (e) => {
      PluginModalManager.openModal('.create-post-preview-modal', e);
    });

    closePostPreviewButton.addEventListener('click', (e) => {
      PluginModalManager.closeModal('.create-post-preview-modal', e);
    });
  }

  console.log('sandbox v0.0.3');
});
