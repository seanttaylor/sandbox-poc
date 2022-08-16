// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import ModalManager from '../../../public/js/modal/index.js';
import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import MockDomElementFactory from '../../mocks/mock-dom-element-factory.js';

/**
 * This test suite verifies the ModalManager functionality.
 */
describe('ModalManager', () => {

    test('Should register the a handler for the `DOMContentLoaded` event', async () => {
      const mockSandbox = MockSandboxFactory();
      ModalManager(mockSandbox);

      // Verify the ModalManager API is registered on the application sandbox
      expect(mockSandbox.plugin.mock.calls[0][0]['name'] === '/plugins/modal-manager').toBe(true);
      expect(typeof(mockSandbox.plugin.mock.calls[0][0]['fn']) === 'function').toBe(true);
    });

    test(' The `DOMContentLoaded` window event should trigger `application.domContentLoaded` event', async () => {
      const mockSandbox = MockSandboxFactory();
      const events = mockSandbox.get('/plugins/events-authz');
      const mockBind = jest.fn();
      const mockAddEventListener = jest.fn();
      const mockWindow = {
        document: { 
          addEventListener: mockAddEventListener,
          querySelector: { bind: mockBind },
          querySelectorAll: { bind: mockBind } 
        }
      };
      ModalManager(mockSandbox);
     
      // Manually load the plugin
      mockSandbox.plugin.mock.calls[0][0]['fn'](mockWindow);

      // Verify a handler for the `DOMContentLoaded` event is registered
      expect(mockAddEventListener.mock.calls[0][0] === 'DOMContentLoaded').toBe(true);
      expect(typeof(mockAddEventListener.mock.calls[0][1]) === 'function').toBe(true);
      
      // Call the handler registered on `DOMContentLoaded` event
      mockAddEventListener.mock.calls[0][1]();

      expect(events.notify.mock.calls[0][0] === 'application.domContentLoaded');
      expect(typeof(events.notify.mock.calls[0][1]) === 'object');
      expect(Object.keys(events.notify.mock.calls[0][1]).includes('$')).toBe(true);
      expect(Object.keys(events.notify.mock.calls[0][1]).includes('$$')).toBe(true);
    });

    test('Should be able to toggle modals open/closed', async () => {
      const mockSandbox = MockSandboxFactory();
      const mockDomElement = MockDomElementFactory();
      const mockBind$ = jest.fn().mockImplementation(()=> {
        return jest.fn().mockImplementation(()=> mockDomElement)
      });
      const mockBind$$ = jest.fn().mockImplementation(()=> {
        return jest.fn().mockImplementation(()=> [mockDomElement])
      });
      const mockAddEventListener = jest.fn();
      const mockWindow = {
        document: { 
          addEventListener: mockAddEventListener,
          querySelector: { bind: mockBind$ },
          querySelectorAll: { bind: mockBind$$ } 
        }
      };
      ModalManager(mockSandbox);

      // Manually load the plugin
      const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockWindow);
      testPlugin.openModal(mockDomElement);
      
      // Verify to call above to `ModalManager.openModal` method attempts to select the `.modal` element and add a CSS class
      expect(mockDomElement.classList.add.mock.calls.length === 1).toBe(true);
      expect(mockDomElement.classList.add.mock.calls[0][0] === 'is-active').toBe(true);

      testPlugin.closeModal(mockDomElement);

      // Verify to call above to `ModalManager.closeModal` method attempts to select the `.modal` element and remove a CSS class
      expect(mockDomElement.classList.remove.mock.calls.length === 1).toBe(true);
      expect(mockDomElement.classList.remove.mock.calls[0][0] === 'is-active').toBe(true);

      testPlugin.closeAllModals();

      // Verify to call above to `ModalManager.closeModals` method attempts to select the `.modal` element from 
      // an element list and remove a CSS class
      expect(mockBind$$.mock.calls.length === 1).toBe(true);
    });
});