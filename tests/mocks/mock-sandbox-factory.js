/* istanbul ignore file */
// Reason: Just a wrapper around `jest.fn()` mocking functionality. Juice not worth the squeeze.
// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

/**
 * Creates a mock sandbox API for modules under unit test to consume
 * @returns {Object}
 */
function MockSandBoxFactory() {
    const fakeModules = {
        '/plugins/events-authz': jest.fn().mockImplementation(() => {
            return {
                on: jest.fn(),
                notify: jest.fn()
            }
        })(),
        ajax: jest.fn(),
        console: jest.fn().mockImplementation(() => {
            return {
                debug: jest.fn(),
                error: jest.fn(),
                info: jest.fn(),
                log: jest.fn(),
                warn: jest.fn()
            }
        })(),
        database: jest.fn(),
        errors: jest.fn(),
        events: jest.fn().mockImplementation(() => {
            return {
                on: jest.fn(),
                notify: jest.fn()
            }
        }),

    };

    return {
        plugin: jest.fn(),
        put: jest.fn(),
        get(name) {
            return fakeModules[name];
        }
    }
}



export default MockSandBoxFactory;