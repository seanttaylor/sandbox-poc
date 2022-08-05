/**
 * A map of error codes provided to the ApplicationError factory to indicate the category of an application error.
 * @typedef {Object.<String, ErrorEntry>} MyHistogram
 * @memberof module:Histogram
 */

/**
 * An application service name mapped to a number (i.e. the number of times the service has experienced a given error category)
 * @typedef {Object.<String, Number>} ErrorEntry
 * @memberof module:Histogram
 */

/**
 * Builds a histogram; returns an API for displaying and analyzing histogram data; used by the [Supervisor]{@link module:Supervisor} module.
 * @module Histogram
 */
function Histogram() {
  /** @type {MyHistogram} */
  const _histogram = {};
  const histogramDataEventHandlers = [];

  /**
   * Updates the histogram; calls any registered event handlers
   * @param {ErrorEntry} entry - A data item to add to the histogram
   * @memberof module:Histogram
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
   * Specifies client-defined logic for processing histogram data
   * @param {Function} analyzeFn - function taking the current histogram as an argument
   * @memberof module:Histogram
   */
  function analyze(analyzeFn) {
    return analyzeFn(_histogram);
  }

  /**
   * Registers a callback function to execute when new data is added to the histogram
   * @param {Function} fn - the callback to execute on new histogram data
   * @memberof module:Histogram
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