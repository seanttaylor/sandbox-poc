/* istanbul ignore file */
// Reason: These code paths are exercised during testing of repositories. 

import Ajv from 'ajv';
import dataTemplate from '../database.js';
import posts from '../../../../schemas/post.js';

const ajv = new Ajv();

/**
 * An in-memory database connector for a simpled document-based datastore. This is a 
 * default sandbox API that is available to *all* client-defined modules.
 * @module DatabaseConnector/InMemory
 * @returns {Object}
 */
export default (function InMemoryDatabaseConnector() {
  const data = { ...dataTemplate };
  const schemaValidators = {
    posts
  };

  /**
   * Add a document to the database.
   * @param {Object} doc - an instance of an entity containing data to store
   * @param {String} collection - name of collection to add to
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Object}
   */

  async function add({ doc, collection }) {
    if (typeof doc !== 'object') {
      throw new Error(
        `InMemoryDatabaseConnectorError.BadRequest.InvalidFormat: Record should be of type [Object] but is ${typeof doc} instead.`,
      );
    }

    if (!Object.keys(schemaValidators).includes(collection)) {
      throw new Error(
        `InMemoryDatabaseConnectorError.BadRequest.NoSuchCollection: collection (${collection}) does not exist`,
      );
    }

    try {
      const record = doc;
      const validate = ajv.compile(schemaValidators[collection]);

      if (!validate(record)) {
        throw new Error(
          `BadRequest.ValidationError: ${collection} ${JSON.stringify(
            validate.errors,
            null,
            2,
          )}`,
        );
      }

      data[collection][record.id] = record;

      return [record];
    } catch (e) {
      console.error(`InMemoryDatabaseConnectorError.${e.message}`);
      return undefined;
    }
  }

  /**
   * Update a document in the database by id
   * @param {Object} doc - an instance of an entity containing data to store
   * @param {String} collection - collection to update
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Object}
   */

  async function updateOne({ doc, collection }) {
    const { id } = doc;

    if (typeof doc !== 'object') {
      throw new Error(
        `Record should be of type [Object] but is ${typeof doc} instead.`,
      );
    }

    if (!id) {
      throw new Error('InMemoryDatabaseConnectorError.UpdateError.MissingId');
    }

    if (!Object.keys(schemaValidators).includes(collection)) {
      throw new Error(
        `InMemoryDatabaseConnectorError.UpdateError: collection (${collection}) does not exist`,
      );
    }

    if (!data[collection][id]) {
      console.info(
        `InMemoryDatabaseConnector.UpdateError: Could NOT find ${collection}.${id}`,
      );
      return [];
    }

    try {
      const validate = ajv.compile(schemaValidators[collection]);
      const record = Object.assign(doc, {
        lastModified: new Date().toISOString(),
      });

      if (!validate(record)) {
        throw new Error(
          `ValidationError.SchemaError: ${collection} ${JSON.stringify(
            validate.errors,
            null,
            2,
          )}`,
        );
      }

      data[collection][id] = record;
      return [record];
    } catch (e) {
      console.error('InMemoryDatabaseConnectorError:', e);
      return [];
    }
  }

  /**
   * Add a document to the database with a user-defined ID
   * @param {String} id - id of the document to create in the database
   * @param {Object} doc - an instance of an entity containg data to store
   * @param {String} collection - collection to update
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Object}
   */

  async function putOne({ doc, collection }) {
    const { id } = doc;

    if (typeof doc !== 'object') {
      throw new Error(
        `Record SHOULD be of type [Object] but is ${typeof doc} instead.`,
      );
    }

    if (!id) {
      throw new Error('InMemoryDatabaseConnectorError.PutError.MissingId');
    }

    if (!Object.keys(schemaValidators).includes(collection)) {
      throw new Error(
        `InMemoryDatabaseConnectorError.PutError: Collection (${collection}) does NOT exist`,
      );
    }

    try {
      const validate = ajv.compile(schemaValidators[collection]);
      const record = doc;

      if (!validate(record)) {
        throw new Error(
          `ValidationError.SchemaError: (${collection}) ${JSON.stringify(
            validate.errors,
            null,
            2,
          )}`,
        );
      }

      data[collection][id] = record;
      return [record];
    } catch (e) {
      console.error(`InMemoryDatabaseConnectorError: ${e.message}`);
      return [];
    }
  }

  /**
   * Remove a document from a collection BY ID ONLY
   * @param {String} id - uuid of the document in the database
   * @param {String} collection - collection to remove from
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Object}
   */

  async function removeOne({ id, collection }) {
    try {
      delete data[collection][id];
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  /**
   * Find all documents in a collection
   * @param {String} collection - collection to pull from
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Object}
   */

  async function findAll(collection) {
    try {
      return Object.values(data[collection]);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  /**
   * Find a document in a collection by uuid
   * @param {String} id - uuid of the document
   * @param {String} collection - collection to pull from
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Object}
   */

  async function findOne({ id, collection }) {
    if (!Object.keys(schemaValidators).includes(collection)) {
      throw new Error(
        `InMemoryDatabaseConnectorError.FindOneError: Collection (${collection}) does not exist`,
      );
    }

    if (!id) {
      throw new Error('InMemoryDatabaseConnectorError.FindOneError.MissingId');
    }

    try {
      if (!data[collection][id]) {
        return [];
      }

      return [data[collection][id]];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  /**
   * Drop a collection from the database
   * @param {String} collection - collection to drop
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Array}
   */

  async function drop(collection) {
    delete data[collection];
    return [];
  }

  /**
   * Closes an existing connection to the database
   * This implementation does nothing as there is no database server connection
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Array}
   */
  function close() {
    return [];
  }

  /**
   * Determines whether a key exists in a collection
   * @param {String} id
   * @param {String} collection - collection to search
   * @memberof module:DatabaseConnector/InMemory
   * @returns {Boolean}
   */
  function exists({ id, collection }) {
    if (data[collection][id]) {
      return true;
    }

    return false;
  }

  return {
    add,
    close,
    drop,
    exists,
    findAll,
    findOne,
    putOne,
    removeOne,
    updateOne,
  };
}());

