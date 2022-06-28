/* istanbul ignore file */
// Reason: The `sandboxFetch` method will be exercised in integration tests; juice not worth the squeeze unit testing a deli-thin `node-fetch` wrapper. 

import fetch from 'node-fetch';

/**
 * Reliable interface for making HTTP requests
 * @param {Object} body
 * @param {Object} headers
 * @param {String} method
 * @param {String} url
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
