// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property
import errors from '../src/sandbox-controller/errors/index.js';

const { ApplicationError } = errors; 

/**
 * This test suite verfies the {ApplicationError} interface.
 */
describe('ApplicationError', () => {
    test('Should create an object conforming to the {ApplicationError} interface', async () => {
        const id = "ThingyError.BadRequest.CouldNotDoTheThing";
        const myError = ApplicationError({
            id,
            message: "This is a jainky module, lol",
            name: "LibJainkyModuleError",
            module: "/lib/jainky-module",
            _open: {
                stackTrace: "[STACK TRACE COULD BE HERE FOR EXAMPLE]"
            }
        });

        expect(myError.id === id).toBe(true);
        expect(Object.keys(myError).includes('message')).toBe(true);
        expect(Object.keys(myError).includes('name')).toBe(true);
        
        expect(Object.keys(myError).includes('module')).toBe(true);
        expect(Object.keys(myError).includes('_open')).toBe(true);
    });
});