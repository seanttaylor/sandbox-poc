/**
 * Returns a mocked `express.Router` API
 * @returns {Object}
 */
export default function MockRouterFactory() { 
    return { 
        get: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        post: jest.fn(),
        use: jest.fn()
    } 
};


