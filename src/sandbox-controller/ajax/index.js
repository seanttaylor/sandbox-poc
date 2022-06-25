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
