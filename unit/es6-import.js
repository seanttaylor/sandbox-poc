/* 
* This file exists to test ES6 imports with the Jest test runner. There is a
* known issue of Jest not yet being able to handle ES6 module syntax. This
* template repo has been configured so that Jest will import ES6 modules without issue. You
* may remove this file at will.
*/

/**
 * Returns the sum of 2 numbers
 * @param {Number} num1
 * @param {Number} num2
 * @returns {Number}
 */
 export default function sum(num1, num2) {
    return num1 + num2;
}