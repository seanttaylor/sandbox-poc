/**
 * A map of codes provided to the ApplicationError factory to indicate the category of error to instances of the ErrorEntry interface.
 * @typedef MyHistogram
 * @property {Object.<String, ErrorEntry>} code - an error code provided to an ApplicationError instance
 */

/**
 * @typedef {Object} ErrorEntry
 * @property {Object.<String, Number} moduleName - the name of the module reporting an 
 * error mapped to a current count of specified errors for that module
 */



/**
 * Builds a histogram; returns an API for displaying and analyzing data;
 * @returns {Object}
 */
function Histogram() {
  /** @type {MyHistogram} */
  const _histogram = {};
  const histogramDataEventHandlers = [];

  /**
   * Updates the histogram; calls any registered event handlers
   * @param {Object} entry - A data item to add to the histogram
   * @returns 
   */
  function add(entry) {
    if (!_histogram[entry.code]) {
      _histogram[entry.code] = {};
      _histogram[entry.code][entry._open.serviceName] = 1;
      histogramDataEventHandlers.forEach((fn) => fn(entry, _histogram));
      return;
    }

    _histogram[entry.code][entry._open.serviceName] += 1;
    histogramDataEventHandlers.forEach((fn) => fn(entry, _histogram));
  }

  /**
   * Specifies client-defined logic processing histogram data
   * @param {Function} analyzeFn - function taking the current histogram as an argument
   */
  function analyze(analyzeFn) {
    return analyzeFn(_histogram);
  }

  /**
   * Registers a callback function to execute when new data is added to the histogram
   * @param {String} eventName 
   * @param {Function} fn - the callback to execute on new histogram data
   */
  function onData(fn) {
    histogramDataEventHandlers.push(fn);
  }

  return {
    add,
    analyze,
    onData
  }
}

export default Histogram;