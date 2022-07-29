// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property
import events from '../../../src/sandbox-controller/events/index.js';
const testSchema = {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "Root Schema",
    "required": [
        "foo",
        "qux"
    ],
    "properties": {
        "foo": {
            "type": "string",
            "default": "",
            "title": "The foo Schema",
            "examples": [
                "bar"
            ]
        },
        "qux": {
            "type": "integer",
            "default": 0,
            "title": "The qux Schema",
            "examples": [
                3
            ]
        }
    },
    "examples": [{
        "foo": "bar",
        "qux": 3
    }]
};

/**
 * This test suite verifies the functionality of the event broadcasting system and the interface of 
 * all data payloads associated with a triggered events
 */
describe('Events', () => {
    test('Should trigger a registered event for broadast', async () => {
        const fakeCallback = jest.fn();
        events.on({ event: 'fake-event', handler: fakeCallback });
        events.notify('fake-event', 42);

        expect(fakeCallback.mock.calls.length).toBe(1);
        // The first argument of the callback was an object with the AppEvent interface.
        expect(Object.keys(fakeCallback.mock.calls[0][0]).includes('header')).toBe(true);
        expect(Object.keys(fakeCallback.mock.calls[0][0]).includes('payload')).toBe(true);
    });

    test('Should get an object conforming to the {AppEvent} interface in the data associated with a triggered event', async () => {
        const fakeCallback = jest.fn();
        events.on({ event: 'new-fake-event', handler: fakeCallback });
        events.notify('new-fake-event', 42);

        expect(fakeCallback.mock.calls.length).toBe(1);

        expect(typeof (fakeCallback.mock.calls[0][0]['header']['id'])).toBe('string');
        expect(typeof (fakeCallback.mock.calls[0][0]['header']['timestamp'])).toBe('string');

        expect(typeof (fakeCallback.mock.calls[0][0]['payload'])).toBe('function');
    });

    test('Should be able to get the data associated with a triggered event', async () => {
        const fakeCallback = jest.fn();
        events.on({ event: 'new-fake-event', handler: fakeCallback });
        events.notify('new-fake-event', 42);

        expect(fakeCallback.mock.calls.length).toBe(1);
        expect(fakeCallback.mock.calls[0][0]['payload']()).toEqual(42);
    });

    test('Should be able to flatten event payloads that are themselves instances of {AppEvent}', async () => {
        const fakeCallback = jest.fn();
        const { AppEvent } = events;
        const fakeEventInner = AppEvent(42);
        const fakeEventOuter = AppEvent(fakeEventInner);

        expect(fakeEventOuter.payload()).toEqual(42);
    });
});