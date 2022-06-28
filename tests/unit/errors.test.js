import errors from '../../src/sandbox-controller/errors/index.js';

const { ApplicationError } = errors;

/**
 * This test suite verifies the {ApplicationError} interface.
 */
describe('ApplicationError', () => {
    test('Should create an object conforming to the {ApplicationError} interface', async () => {
        const code = "ThingyError.BadRequest.CouldNotDoTheThing";
        const myError = ApplicationError({
            code,
            message: "This is a jainky module, lol",
            name: "LibJainkyModuleError",
            module: "/lib/jainky-module",
            _open: {
                stackTrace: "[STACK TRACE COULD BE HERE FOR EXAMPLE]"
            }
        });

        expect(myError.code === code).toBe(true);
        expect(Object.keys(myError).includes('message')).toBe(true);
        expect(Object.keys(myError).includes('name')).toBe(true);

        expect(Object.keys(myError).includes('module')).toBe(true);
        expect(Object.keys(myError).includes('_open')).toBe(true);
    });
});