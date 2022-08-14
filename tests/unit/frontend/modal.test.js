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
        const events = mockSandbox.get('/plugins/events-authz');
        ModalManager(mockSandbox);

        // Verify the ModalManager API is registered on the application sandbox
        expect(mockSandbox.put.mock.calls[0][0] === 'modalManager').toBe(true);
        expect(typeof(mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);

        expect(events.on.mock.calls.length === 1).toBe(true);
        expect(typeof (events.on.mock.calls[0][0]) === 'object').toBe(true);
        expect(events.on.mock.calls[0][0]['event'] === 'application.domContentLoaded').toBe(true);
        expect(events.on.mock.calls[0][0]['subscriberId'] === 'modalManager').toBe(true);
    });

    test('Triggering the `application.domContentLoaded` event should load the ModalManager configuration', async () => {
        const mockSandbox = MockSandboxFactory();
        const events = mockSandbox.get('/plugins/events-authz');
        const console = mockSandbox.get('console');
        ModalManager(mockSandbox);

        // Verify the ModalManager API is registered on the application sandbox
        expect(mockSandbox.put.mock.calls[0][0] === 'modalManager').toBe(true);
        expect(typeof(mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);

        // We manually trigger the `application.domContentLoaded` handler by calling the function directly
        events.on.mock.calls[0][0]['handler']({ $: undefined, $$: undefined });

        expect(console.log.mock.calls[0][0] === 'ModalManager:domContentLoaded').toBe(true);
    });

    test('Should be able to toggle modals open/closed', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockDomElement = MockDomElementFactory();
        const events = mockSandbox.get('/plugins/events-authz');
        const $ = jest.fn().mockImplementation(() => mockDomElement);
        const $$ = jest.fn().mockImplementation(()=> [mockDomElement]);
        ModalManager(mockSandbox);

        // We manually trigger the `application.domContentLoaded` handler by calling the function directly
        events.on.mock.calls[0][0]['handler']({ $, $$ });
        
        mockSandbox.put.mock.calls[0][1]['openModal'](mockDomElement);
        
        // Verify to call above to `ModalManager.openModal` method attempts to select a dom element 
        expect($.mock.calls.length === 1).toBe(true);
        expect(mockDomElement.classList.add.mock.calls.length === 1).toBe(true);
        expect(mockDomElement.classList.add.mock.calls[0][0] === 'is-active').toBe(true);

        mockSandbox.put.mock.calls[0][1]['closeModal'](mockDomElement);

        // Verify to call above to `ModalManager.closeModal` method attempts to select a dom element 
        expect($.mock.calls.length === 2).toBe(true);
        expect(mockDomElement.classList.remove.mock.calls.length === 1).toBe(true);
        expect(mockDomElement.classList.remove.mock.calls[0][0] === 'is-active').toBe(true);

        mockSandbox.put.mock.calls[0][1]['closeAllModals']();

        // Verify to call above to `ModalManager.closeModals` method attempts to select a dom element 
        expect($$.mock.calls.length === 1).toBe(true);
    });
});