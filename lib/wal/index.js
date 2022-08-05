
/**
 * Data required to create an entry in the Write-Ahead Log
 * @typedef {Object} WriteRequestConfiguration
 * @property {String} sequenceId - a sortable unique string identifier for entries in the Write-Ahead Log
 * @property {String} operation - indicates the intent of the write (e.g. create or update)
 * @property {Object} record - the data associated with a write event
 * @memberof module:WriteAheadLog
 */

/**
 * Creates a structured entry for the Write-Ahead Log
 * @param {Object} next - the next state of the item being created or updated
 * @param {String} operation - the type of operation being performed (e.g. create, update, delete)
 * @param {Object} prev - the current state of the item being created or updated
 * @param {Object} sequenceId - a unique sortable id for an WriteAheadLog entry
 * @memberof module:WriteAheadLog
 */
function WALEntry({ next, operation, prev, sequenceId }) {

  return {
    next,
    operation,
    prev,
    sequenceId,
    timestamp: new Date().toISOString()
  }
}

/**
 * Exposes an API for managing a Write-Ahead log. Provides functionality that allows us to log all writes to the database in the event that 
 * there is a database failure such that we can restore any lost writes once the database recovers.
 * @param {Object} sandbox - sandboxed module APIs
 * @module WriteAheadLog 
 */
export default function WriteAheadLog(sandbox) {
  const entryLog = [];
  let WALlastSequenceId;

  /**************** PUBLIC API ****************/
  sandbox.put('wal', { getAllEntries, getLastSequenceId, onWriteRequest });

  /**
   * Appends a new entry to the write-ahead log
   * @param {WriteRequestConfiguration} appEvent - an instance of `AppEvent` whose payload is satisfies the `WriteRequestConfiguration` interface
   * @memberof module:WriteAheadLog
   */
  function onWriteRequest(appEvent) {
    const { sequenceId, operation, ...record } = appEvent.payload();
    const entry = WALEntry({
      operation,
      sequenceId,
      next: record,
      prev: null,
    });

    entryLog.push(entry);
    WALlastSequenceId = entry.sequenceId;
  }

  /**
   * Returns all entries in the log
   * @memberof module:WriteAheadLog
   * @returns {Array} - a list of `WALEntry` instances
   */
  function getAllEntries() {
    return entryLog;
  }

  /**
   * Returns the last sequence identifier appended to the Write-Ahead log
   * @memberof module:WriteAheadLog
   * @returns {String}
   */
  function getLastSequenceId() {
    return WALlastSequenceId;
  }

}