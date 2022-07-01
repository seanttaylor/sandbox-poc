/* istanbul ignore file */
// Reason: Just a wrapper around `jest.fn()` mocking functionality. Juice not worth the squeeze.
// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

const fakeModules = {
    ajax: jest.fn(),
    events: jest.fn(),
    errors: jest.fn(),
    database: jest.fn(),
    console: jest.fn().mockImplementation(()=> {
        return {
            debug() {
                //goes nowhere does nothing in test
            },
            error() {
                //goes nowhere does nothing in test
            },
            info() {
                //goes nowhere does nothing in test
            },
        }
    })()
};

/**
 * Creates a mock sandbox API for modules under unit test to consume
 * @returns {Object}
 */
function MockSandBoxFactory() {
    return {
        plugin: jest.fn(),
        put: jest.fn(),
        get(name) {
            return fakeModules[name];
        }
    }
}

export { MockSandBoxFactory }