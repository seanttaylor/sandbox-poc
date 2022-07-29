/**
 * Creates a structured entry for the Write-Ahead Log
 * @param {Object} next - the next state of the item being created or updated
 * @param {String} operation - the type of operation being performed (e.g. create, update, delete)
 * @param {Object} prev - the current state of the item being created or updated
 * @param {Object} sequenceId - a unique sortable id for an WriteAheadLog entry
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
 * Exposes an API for managing a write-ahead log
 * @param {Object} sandbox - sandboxed module APIs 
 */
export default function WriteAheadLog(sandbox) {
  const entryLog = [];
  let WALlastSequenceId;

  /**************** PUBLIC API ****************/
  sandbox.put('wal', { getAllEntries, getLastSequenceId, onWriteRequest });
  
  /**
   * Appends a new entry to the write-ahead log
   * Takes an instance of the {AppEvent} interface containing the properties below
   * @param {String} operation 
   * @param {Object} record 
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
    return WALlastSequenceId;
  }

}