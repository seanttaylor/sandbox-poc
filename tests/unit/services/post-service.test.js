// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import PostService from '../../../lib/services/post/index.js';

/**
 * This test suite verifies the Post Service interface.
 */
describe('PostService', () => {
  test('Should register the Post Service API on the sandbox', async () => {
    const mockSandbox = MockSandboxFactory();

    PostService(mockSandbox);

    expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
    expect(mockSandbox.put.mock.calls[0][0] === 'postService').toBe(true);
    expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getAllPosts')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('create')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('editPost')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('exists')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('deletePost')).toBe(true);
  });
});