import { faker } from '@faker-js/faker';
import WAL from '../../lib/wal/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';
import PluginEventAuthz from '../../lib/plugins/event-authz/index.js';

/**
 * This test suite verifies the WAL functionality.
 */
describe('WAL', () => {
    test('Should be able to append an entry to the write-ahead log', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        
        PluginEventAuthz(controller);
        WAL(controller);

        const events = controller.get('/plugins/events-authz');
        const wal = sandbox.my.wal;
        
        events.notify('postService.post.writeRequestReceived', {
            id: `/posts/${faker.datatype.uuid()}`,
            authorId: `/users/${faker.datatype.uuid()}`,
            body: faker.hacker.phrase(),
            moduleName: 'postService',
            operation: 'create',
            sequenceId: faker.datatype.uuid(),
        });
    
        expect(typeof(wal.getLastSequenceId()) === 'string').toBe(true);
        expect(Array.isArray(wal.getAllEntries())).toBe(true);
        expect(wal.getAllEntries().length === 1).toBe(true);
    });
});