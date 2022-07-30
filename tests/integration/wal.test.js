import { faker } from '@faker-js/faker';
import WAL from '../../lib/wal/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite verifies the WAL functionality.
 */
describe('WAL', () => {
    test('Should be able to append an entry to the write-ahead log', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        
        WAL(controller);

        const { AppEvent } = controller.get('events');
        const wal = sandbox.my.wal;

        wal.onWriteRequest(
            AppEvent({
                id: `/posts/${faker.datatype.uuid()}`,
                authorId: `/users/${faker.datatype.uuid()}`,
                body: faker.hacker.phrase(),
                serviceName: 'postService',
                operation: 'create',
                sequenceId: faker.datatype.uuid(),
            })
        );
    
        expect(typeof(wal.getLastSequenceId()) === 'string').toBe(true);
        expect(Array.isArray(wal.getAllEntries())).toBe(true);
        expect(wal.getAllEntries().length === 1).toBe(true);
    });
});