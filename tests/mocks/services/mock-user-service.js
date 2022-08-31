/* istanbul ignore file */

import { faker } from '@faker-js/faker';

function MockUserFactory() {
  return {
    id: `/users/${faker.datatype.uuid()}`,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    emailAddress: faker.internet.email(),
    handle: faker.datatype.string(),
    profileImageURL: faker.internet.url(),
    schemaVersion: '0.0.1',
    schemaURL: '/schemas/user/0.0.1/user.json',
    lastModified: null,
    createdAt: faker.datatype.datetime(),
  };
}

export default function MockUserService() {
  const mockUsers = {
    '/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d': {
      id: '/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d',
      handle: '@ironman',
      firstName: 'Tony',
      lastName: 'Stark',
      emailAddress: 'tstark@avengers.io',
      motto: 'Genius. Wrangler of cats.',
      profileImageURL: 'https://via.placeholder.com/150',
      schemaVersion: '0.0.1',
      schemaURL: '/schemas/user/0.0.1/user.json',
      lastModified: null,
      createdAt: '2022-06-26T14:24:04.904Z',
    },
  };

  async function create() {
    const user = MockUserFactory();
    mockUsers[user.id] = user;
    return { data: [user], entries: 1 };
  }

  async function deleteUser(id) {
    delete mockUsers[id];
    return { data: [], entries: 0 };
  }

  async function editName({ id, name }) {
    mockUsers[id] = Object.assign(mockUsers[id], { ...name });
    return { data: [mockUsers[id]], entries: 1 };
  }

  async function editMotto({ id, motto }) {
    mockUsers[id] = Object.assign(mockUsers[id], { motto });
    return { data: [mockUsers[id]], entries: 1 };
  }

  async function editEmailAddress({ id, emailAddress }) {
    mockUsers[id] = Object.assign(mockUsers[id], { emailAddress });
    return { data: [mockUsers[id]], entries: 1 };
  }

  async function exists(id) {
    if (mockUsers[id]) {
      return {
        data: [{
          id,
          exists: true,
        }],
        entries: 1,
      };
    }

    return {
      data: [{
        id: null,
        exists: false,
      }],
      entries: 0,
    };
  }

  async function getAllUsers() {
    const posts = Object.values(mockUsers);
    return { data: posts, entries: posts.length };
  }

  async function getUserById(id) {
    return { data: [mockUsers[id]], entries: 1 };
  }

  function getMediaType() {
    return 'application/hal+json';
  }

  function setMediaType() {
    // Just here to conform to the interface in during test
    // Not supposed to do anything
  }

  return {
    create,
    deleteUser,
    editName,
    editMotto,
    editEmailAddress,
    exists,
    getAllUsers,
    getUserById,
    getMediaType,
    setMediaType,
  };
}
