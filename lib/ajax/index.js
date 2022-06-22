import fetch from 'node-fetch';

/**
 * @param {Object} box - the application sandbox
 */
export default function(box) {
  box.put('ajax', { fetch: myFetch });

  /**
   * @param {Object} body
   * @param {Object} headers
   * @param {String} method
   * @param {String} url
   */
  async function myFetch({ body = {}, headers = {}, method = 'GET', url }) {
    if (method === 'GET') {
      const response = await fetch(url, { headers, method });
      return response.json();
    }
    const response = await fetch(url, { body, headers, method });
    return response.json();
  }
}
