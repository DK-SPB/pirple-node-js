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

// Export the module
export default helpers;