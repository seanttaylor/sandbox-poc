/**
 * Returns a mocked `express.Router` API
 * @returns {Object}
 */
export default function MockRouterFactory() { 
    return { 
        get: jest.fn() 
    } 
};


