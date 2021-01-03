/**
 * Request handlers
 */

// Dependencies
import repo from './repo.js';
import helpers from './helpers.js';

// Define the handlers
const handlers = {};

// Users handler
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

// Error handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Hello handler
handlers.hello = (data, callback) => {
    callback(200, {
        'message': 'hello friend!'
    });
};

// Container for the users sub methods
handlers._users = {};

// Users -X POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    const firstName = typeof (data.payload.firstName) == 'string' &&
        data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() :
        false;

    const lastName = typeof (data.payload.lastName) == 'string' &&
        data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() :
        false;

    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length === 10 ?
        data.payload.phone.trim() :
        false;

    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ?
        data.payload.password.trim() :
        false;

    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' &&
        data.payload.tosAgreement === true;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        repo.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password
                const hashPassword = helpers.hash(password);

                if (hashPassword) {
                    // Create the user object
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashPassword': hashPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    repo.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                'Error': 'Could not create a new user'
                            });
                        }
                    });
                } else {
                    callback(500, {
                        'Error': 'Could not hash the users password'
                    });
                }
            } else {
                // User already exists
                callback(400, {
                    'Error': 'A user with this phone already exists'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required fields'
        });
    }
};
// Users -X GET
// Required data: phone
// Optional data: none
//
// TODO: Only let an authenticated user access their object.
// TODO: Don't let them access anymore else's
handlers._users.get = (data, callback) => {
    // Check that the phone number id valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length === 10 ?
        data.queryStringObject.phone.trim() :
        false;
    if (phone) {
        //Lookup the user
        repo.read('users', phone, (err, data) => {
            if (!err && data) {
                // Remove the hashed password from the user before return it to the requester
                delete data.hashPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }
};
// Users -X PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one have to be specified)
//
// TODO: Only let authenticated users update their own object. 
// TODO: Don't let the update anyone else
handlers._users.put = (data, callback) => {
    // Check for the required fields
    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length === 10 ?
        data.payload.phone.trim() :
        false;

    // Check for the optional fields
    const firstName = typeof (data.payload.firstName) == 'string' &&
        data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() :
        false;

    const lastName = typeof (data.payload.lastName) == 'string' &&
        data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() :
        false;

    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ?
        data.payload.password.trim() :
        false;

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is send to update
        if (firstName || lastName || password) {
            // Lookup the user
            repo.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    // Update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashPassword = helpers.hash(password);
                    }
                    //Store the new updates
                    repo.update('users', phone, userData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                'Error': 'Could not update the user'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        'Error': 'The specified user does not exist'
                    });
                }
            });
        } else {
            callback(400, {
                'Error': 'Missing fields to update'
            });
        }
    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }
};
// Users -X DELETE
// Required field: phone
// 
// TODO: Only let an authenticated user delete their objext. Don't let them delete anyone.
// TODO: Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length === 10 ?
        data.queryStringObject.phone.trim() :
        false;
    if (phone) {
        //Lookup the user
        repo.read('users', phone, (err, data) => {
            if (!err && data) {
                repo.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            'Error': 'Could not delete the specified user'
                        });
                    }
                });
            } else {
                callback(400, {
                    'Error': 'Could not find the specified user'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }
};

// Export the module
export default handlers;