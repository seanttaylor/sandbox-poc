/* istanbul ignore file */
// Reason: The `sandboxFetch` method will be exercised in integration tests; juice not worth the squeeze unit testing a deli-thin `node-fetch` wrapper. 

import fetch from 'node-fetch';

/** 
 * A wrapper around the `node-fetch`; provides a facade for networking functionality. This is a default sandbox API that is available to *all* 
 * client-defined modules.
 * @module Ajax 
 */

/**
 * Reliable interface for making HTTP requests
 * @param {Object} body - the request body
 * @param {Object} headers - the request headers
 * @param {String} method - the request method 
 * @param {String} url - the URL for the request
 */
async function sandboxFetch({ body = {}, headers = {}, method = 'GET', url }) {
  if (method === 'GET') {
    const response = await fetch(url, { headers, method });
    return response.json();
  }
  const response = await fetch(url, { body, headers, method });
  return response.json();
}

export default { fetch: sandboxFetch }
