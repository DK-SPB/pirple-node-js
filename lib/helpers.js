/**
 * Helpers for the continuous tasks
 */

// Dependencies
import crypto from 'crypto';
import config from './config.js';

// Container for all the helpers
const helpers = {};

// Crete a SHA256 hash
helpers.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    } else {
        return false;
    }
};

// Parse a JSON string to an objection all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLenght) => {
    strLenght = typeof(strLenght) == 'number' && strLenght > 0 ? strLenght : false;
    if (strLenght) {
        //Define all the possiable characters that could go into a string
        let possiableChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        //Start the final string
        let str = '';
        for (let i = 0; i < strLenght; i++) {
            //Get a random character from the possiableChars string
            let randomChar = possiableChars.charAt(Math.floor(Math.random() * possiableChars.length));
            //Append this character to the final string
            str += randomChar;
        }
        return str;
    } else {
        return false;
    }
};

// Export the module
export default helpers;