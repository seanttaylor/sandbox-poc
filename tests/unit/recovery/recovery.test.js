// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import RecoveryManager from '../../../lib/recovery/index.js';

/**
 * This test suite verifies the RecoveryManager functionality.
 */
describe('RecoveryManager', () => {

    test('Should register RecoveryManager API on the sandbox via `put`', async () => {
        const mockSandbox = MockSandboxFactory();
        RecoveryManager(mockSandbox);

        expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
        expect(mockSandbox.put.mock.calls[0][0] === 'recovery').toBe(true);
        expect(typeof mockSandbox.put.mock.calls[0][1] === 'object').toBe(true);
        expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getAllStrategies')).toBe(true);
    });

    test('Should register `application.error.globalErrorThresholdExceeded` and `recovery.recoveryStrategyRegistered`', async () => {
        const mockSandbox = MockSandboxFactory();
        RecoveryManager(mockSandbox);

        const events = mockSandbox.get('/plugins/events-authz');

        // Event registrations via `events.on` are object his the lookup on the `event` key
        expect(events.on.mock.calls[0][0]['event'] === 'application.error.globalErrorThresholdExceeded').toBe(true);
        expect(events.on.mock.calls[1][0]['event'] === 'recovery.recoveryStrategyRegistered').toBe(true);
    });

    test('Should extract the event payload and create a new {Recovery} on the `recovery.recoveryStrategyRegistered` event', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'bogusService', strategies: [] }))
        }
        RecoveryManager(mockSandbox);

        const events = mockSandbox.get('/plugins/events-authz');

        // We call the handler function of the first event registration via `events.on`
        events.on.mock.calls[0][0]['handler'](mockEvent);

        // We verify the `payload` method of the mockEvent is called in the handler function
        expect(mockEvent.payload.mock.calls.length === 1).toBe(true);
    });

    test('Should be able to add additional recovery strategies after an initial registration', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockStrategy = jest.fn();
        const mockEvent = {
            payload: jest.fn().mockImplementation(() => ({
                moduleName: 'postService',
                strategies: [{ name: 'mockStrategy', fn: jest.fn() }]
            }))
        };
        RecoveryManager(mockSandbox);

        const events = mockSandbox.get('/plugins/events-authz');

        // We call the handler function of the `recovery.recoveryStrategyRegistered` event 
        events.on.mock.calls[1][0]['handler'](mockEvent);
        events.on.mock.calls[1][0]['handler'](mockEvent);

        expect(mockEvent.payload.mock.calls.length === 2).toBe(true);
    });

    test('Should be able to run recovery strategies when the global error threshold is exceeded', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockStrategy = { name: 'mockStrategy', fn: jest.fn() };
        const mockRecoveryStrategyRegisteredEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'postService', strategies: [mockStrategy] }))
        };
        const mockGlobalErrorThresholdExeceededEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'postService', errorCount: 1 }))
        };
        RecoveryManager(mockSandbox);

        const events = mockSandbox.get('/plugins/events-authz');

        // We call the handler function of the `recovery.recoveryStrategyRegistered` event
        events.on.mock.calls[1][0]['handler'](mockRecoveryStrategyRegisteredEvent);

        // We call the handler function of the `application.error.globalErrorThresholdExceeded` event
        events.on.mock.calls[0][0]['handler'](mockGlobalErrorThresholdExeceededEvent);

        // We verify the strategy was called in response the the `application.error.globalErrorThresholdExceeded`
        expect(mockStrategy.fn.mock.calls.length === 1).toBe(true);
    });

    test('Should log an error if a recovery strategy throws an error', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockErrorStrategy = {
            name: 'mockStrategy',
            fn: jest.fn().mockImplementation(() => {
                throw new Error();
            })
        };
        const mockRecoveryStrategyRegisteredEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'postService', strategies: [mockErrorStrategy] }))
        };
        const mockGlobalErrorThresholdExeceededEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'postService', errorCount: 1 }))
        };
        RecoveryManager(mockSandbox);

        const events = mockSandbox.get('/plugins/events-authz');
        const console = mockSandbox.get('console');

        // We call the handler function of the `recovery.recoveryStrategyRegistered` event via `events.on`
        events.on.mock.calls[1][0]['handler'](mockRecoveryStrategyRegisteredEvent);

        // We call the handler function of the `application.error.globalErrorThresholdExceeded` event via `events.on`
        events.on.mock.calls[0][0]['handler'](mockGlobalErrorThresholdExeceededEvent);

        // We verify the strategy was called in response the the `application.error.globalErrorThresholdExceeded`
        expect(mockErrorStrategy.fn.mock.calls.length === 1).toBe(true);
        expect(console.error.mock.calls.length === 1).toBe(true);
        expect(console.error.mock.calls[0][0].includes('RecoveryError.StrategyError')).toBe(true);
    });

    test('Should log an error when a strategy is not of type (function) and use the default recovery strategy', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockStrategy = { name: 'mockStrategy', fn: 'undefined' };
        const mockRecoveryStrategyRegisteredEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'postService', strategies: [mockStrategy] }))
        };
        const mockGlobalErrorThresholdExeceededEvent = {
            payload: jest.fn().mockImplementation(() => 'postService')
        };
        RecoveryManager(mockSandbox);

        const events = mockSandbox.get('/plugins/events-authz');
        const console = mockSandbox.get('console');

        // We call the handler function of the `recovery.recoveryStrategyRegistered` event
        events.on.mock.calls[1][0]['handler'](mockRecoveryStrategyRegisteredEvent);

        // We call the handler function of the `application.error.globalErrorThresholdExceeded` event
        events.on.mock.calls[0][0]['handler'](mockGlobalErrorThresholdExeceededEvent);

        // We verify the `StrategyError.BadRequest` error was logged
        expect(console.error.mock.calls[0][0].includes('StrategyError.BadRequest')).toBe(true);
    });

});