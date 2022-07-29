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

    test('Should be able to create a new module recovery strategy', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockEventRegistration = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'bogusService', strategies: [] }))
        }
        RecoveryManager(mockSandbox);

        const events = mockSandbox.get('/plugins/events-authz');

        // We call the RecoveryManager's `onRecoveryStrategyRegistered` method to add a recovery strategy
        expect(typeof(mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);

        mockSandbox.put.mock.calls[0][1]['onRecoveryStrategyRegistered'](mockEventRegistration)

        expect(mockEventRegistration.payload.mock.calls.length === 1).toBe(true);
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

        expect(typeof(mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);

        // We call the RecoveryManager's `onRecoveryStrategyRegistered` method to add a recovery strategies

        mockSandbox.put.mock.calls[0][1]['onRecoveryStrategyRegistered'](mockEvent);
        mockSandbox.put.mock.calls[0][1]['onRecoveryStrategyRegistered'](mockEvent);

        expect(mockEvent.payload.mock.calls.length === 2).toBe(true);
    });

    test('Should be able to run recovery strategies when the global error threshold is exceeded', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockStrategy = { name: 'mockStrategy', fn: jest.fn() };
        const mockRecoveryStrategyRegisteredEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'postService', strategies: [mockStrategy] }))
        };
        const mockGlobalErrorThresholdExeceededEvent = {
            payload: jest.fn().mockImplementation(() => ({ code: 'service.error', moduleName: 'postService', errorCount: 1 }))
        };
        RecoveryManager(mockSandbox);

        // We call the RecoveryManager's `onRecoveryStrategyRegistered` method
        mockSandbox.put.mock.calls[0][1]['onRecoveryStrategyRegistered'](mockRecoveryStrategyRegisteredEvent);

        // We call the RecoveryManager's `onGlobalErrorThresholdExceeded` method
        mockSandbox.put.mock.calls[0][1]['onGlobalErrorThresholdExceeded'](mockGlobalErrorThresholdExeceededEvent);

        // We verify the strategy was called in response the the `application.error.globalErrorThresholdExceeded`
        expect(mockStrategy.fn.mock.calls.length === 1).toBe(true);
    });

    test('Should do nothing on an error for a module for which NO strategies have been registered', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockGlobalErrorThresholdExeceededEvent = {
            payload: jest.fn().mockImplementation(() => ({ code: 'service.error', moduleName: 'randomService', errorCount: 1 }))
        };
        const console = mockSandbox.get('console');

        RecoveryManager(mockSandbox);

        // We call the RecoveryManager's `onGlobalErrorThresholdExceeded` method
        mockSandbox.put.mock.calls[0][1]['onGlobalErrorThresholdExceeded'](mockGlobalErrorThresholdExeceededEvent);

        // We verify that RecoveryManager issues a warning that no strategies are available
        expect(console.warn.mock.calls[0][0].includes('RecoveryWarn.NoStrategiesRegistered')).toBe(true);
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
            payload: jest.fn().mockImplementation(() => ({ code: 'service.error', errorCount: 1, moduleName: 'postService' }))
        };
        RecoveryManager(mockSandbox);

        const console = mockSandbox.get('console');

        // We call the RecoveryManager's `onRecoveryStrategyRegistered` method
        mockSandbox.put.mock.calls[0][1]['onRecoveryStrategyRegistered'](mockRecoveryStrategyRegisteredEvent);

        // We call the RecoveryManager's `onGlobalErrorThresholdExceeded` method
        mockSandbox.put.mock.calls[0][1]['onGlobalErrorThresholdExceeded'](mockGlobalErrorThresholdExeceededEvent);

        // We verify the strategy was called in response to the `application.error.globalErrorThresholdExceeded` event
        expect(mockErrorStrategy.fn.mock.calls.length === 1).toBe(true);
        expect(console.error.mock.calls.length === 1).toBe(true);
        expect(console.error.mock.calls[0][0].includes('RecoveryError.StrategyError')).toBe(true);
    });

    test('Should log an error when a recovery strategy is not of type (function) and use the default recovery strategy', async () => {
        const mockSandbox = MockSandboxFactory();
        const mockStrategy = { name: 'mockStrategy', fn: 'undefined' };
        const mockRecoveryStrategyRegisteredEvent = {
            payload: jest.fn().mockImplementation(() => ({ moduleName: 'postService', strategies: [mockStrategy] }))
        };
        const mockGlobalErrorThresholdExeceededEvent = {
            payload: jest.fn().mockImplementation(() => ({ code: 'service.error', errorCount: 1, moduleName: 'postService' }))
        };
        RecoveryManager(mockSandbox);

        const console = mockSandbox.get('console');

        // We call the RecoveryManager's `onRecoveryStrategyRegistered` method
        mockSandbox.put.mock.calls[0][1]['onRecoveryStrategyRegistered'](mockRecoveryStrategyRegisteredEvent);

        // We call the RecoveryManager's `onGlobalErrorThresholdExceeded` method
        mockSandbox.put.mock.calls[0][1]['onGlobalErrorThresholdExceeded'](mockGlobalErrorThresholdExeceededEvent);

        // We verify the `StrategyError.BadRequest` error was logged
        expect(console.error.mock.calls[0][0].includes('StrategyError.BadRequest')).toBe(true);
    });

});