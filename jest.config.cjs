module.exports = {
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    testPathIgnorePatterns: [
      '<rootDir>/index.test.js',
    ],
};