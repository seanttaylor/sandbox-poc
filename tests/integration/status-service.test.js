import StatusService from '../../lib/services/status/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite verifies the Status Service functionality.
 */
describe('StatusService', () => {
    test('Should be able to get an object describing the current system status', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        StatusService(controller);

        const statusService = sandbox.my.statusService;
        const systemStatus = statusService.getSystemStatus();

        // verify system status properties 
        expect(systemStatus).toBeTruthy();
        expect(Object.keys(systemStatus).includes('uptime')).toBe(true);
        expect(Object.keys(systemStatus).includes('status')).toBe(true);
        expect(Object.keys(systemStatus).includes('version')).toBe(true);
        expect(Object.keys(systemStatus).includes('commitHash')).toBe(true);

        // verify property values 
        // `commitHash` and `version` SHOULD be defined as an environment variable. If not they are both `null` but that isn't the biggest deal here.
        expect(systemStatus.status === 'OK').toBe(true);
        expect(systemStatus.uptime).toBeTruthy();
    });
});