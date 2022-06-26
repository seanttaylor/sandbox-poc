// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property
import events from '../src/sandbox-controller/events/index.js';


/**
 * 
 */
describe('Events', () => {
    test('Should trigger a registered event for broadast', async () => {
        const fakeCallback = jest.fn();
        events.on('fake-event', fakeCallback);
        events.notify('fake-event', 42);
        
        expect(fakeCallback.mock.calls.length).toBe(1);
         // The first argument of the callback was an object with the AppEvent interface.
        expect(Object.keys(fakeCallback.mock.calls[0][0]).includes('header')).toBe(true);
        expect(Object.keys(fakeCallback.mock.calls[0][0]).includes('payload')).toBe(true);
    });

    test('Should get an object conforming to the {AppEvent} interface in the data associated with a triggered event', async () => {
        const fakeCallback = jest.fn();
        events.on('new-fake-event', fakeCallback);
        events.notify('new-fake-event', 42);
        
        expect(fakeCallback.mock.calls.length).toBe(1);

        expect(typeof(fakeCallback.mock.calls[0][0]['header']['id'])).toBe('string');
        expect(typeof(fakeCallback.mock.calls[0][0]['header']['timestamp'])).toBe('string');

        expect(typeof(fakeCallback.mock.calls[0][0]['payload'])).toBe('function');
    });

    test('Should be able to get the data associated with a triggered event', async () => {
        const fakeCallback = jest.fn();
        events.on('new-fake-event', fakeCallback);
        events.notify('new-fake-event', 42);
        
        expect(fakeCallback.mock.calls.length).toBe(1);

        expect(fakeCallback.mock.calls[0][0]['payload']()).toEqual(42);
    });
});