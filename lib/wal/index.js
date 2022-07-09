import SequenceIdFactory from './sequence-id.js'

/**
 * Creates a structured entry for the Write-Ahead Log
 * @param {Object} next - the next state of the item being created or updated
 * @param {String} operation - the type of operation being performed (e.g. create, update, delete)
 * @param {Object} prev - the current state of the item being created or updated
 */
function WALEntry({ next, operation, prev }) {

  return {
    next,
    operation,
    prev,
    sequenceId: SequenceIdFactory(),
    timestamp: new Date().toISOString()
  }
}

/**
 * Exposes an API for managing a write-ahead log
 * @param {Object} box - sandboxed module APIs 
 */
export default function writeAheadLog(box) {
  const events = box.get('/plugins/events-authz');
  const entryLog = [];
  const subscriberId = 'wal';
  let lastSequenceId;

  box.put('wal', { getAllEntries, getLastSequenceId });

  events.on({ event: 'postService.post.writeRequestReceived', handler: onWriteRequest, subscriberId });

  /**
   * Appends a new entry to the write-ahead log
   * Takes an instance of the {AppEvent} interface containing the properties below
   * @param {String} operation 
   * @param {Object} record 
   */
  function onWriteRequest(appEvent) {
    const { operation, record } = appEvent.payload();
    const entry = WALEntry({
      operation,
      next: { ...record },
      prev: null,
    });

    entryLog.push(entry);
    lastSequenceId =  entry.sequenceId;
  }

  /**
   * @returns {Array} - a list of `WALEntry` instances
   */
  function getAllEntries() {
    return entryLog;
  }

  /**
   * Returns the last sequence identifier appended to the log
   * @returns {String}
   */
  function getLastSequenceId() {
    return lastSequenceId;
  }

}