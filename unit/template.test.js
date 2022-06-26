import sum from './es6-import.js';

describe('Template Sanity Test', () => {
    test('Should be able to launch the test suite without errors', async () => {
        expect(1).toEqual(1);        
    });

    test('Should be able to import es6 modules without errors', async () => {
        expect(sum(2,2)).toEqual(4);        
    });
});