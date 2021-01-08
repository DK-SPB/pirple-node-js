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
handlers._users.get = (data, callback) => {
    // Check that the phone number id valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length === 10 ?
        data.queryStringObject.phone.trim() :
        false;
    if (phone) {
        // Get the token from the headers
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        //Verify that the given token id valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
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
                callback(403, {
                    'Error': 'Missing required token in header or token is invalid'
                });
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
            // Get the token from the headers
            let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
            //Verify that the given token id valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
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
                    callback(403, {
                        'Error': 'Missing required token in header or token is invalid'
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
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length === 10 ?
        data.queryStringObject.phone.trim() :
        false;
    if (phone) {
        // Get the token from the headers
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        //Verify that the given token id valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
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
                callback(403, {
                    'Error': 'Missing required token in header or token is invalid'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }
};

// Tokens handler
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

//Container for all the tokens methods
handlers._tokens = {};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    // Check that the id is valid
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length === 20 ?
        data.queryStringObject.id.trim() :
        false;
    if (id) {
        //Lookup the token
        repo.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
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

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length === 10 ?
        data.payload.phone.trim() :
        false;

    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ?
        data.payload.password.trim() :
        false;

    if (phone && password) {
        // Lookup the user who matches that phone number
        repo.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // Hash the sent password, and compare it to the apsseord stored in teh user object
                let hashPassword = helpers.hash(password);
                if (hashPassword == userData.hashPassword) {
                    // If valid, create a new token with a random name. Set expiration date 1 hour in ...
                    let tokenId = helpers.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    //Store the token
                    repo.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                'Error': 'Could not create the new token'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        'Error': 'Password did not match the specified user stored password'
                    });
                }
            } else {
                callback(400, {
                    'Error': 'Could not find the specified user'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing requires field(s)'
        });
    }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
    const id = typeof (data.payload.id) == 'string' &&
        data.payload.id.trim().length === 20 ?
        data.payload.id.trim() :
        false;

    const extend = typeof (data.payload.extend) == 'boolean' &&
        data.payload.extend == true;

    if (id && extend) {
        repo.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to the make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    //Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    //Store the new updates
                    repo.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                'Error': 'Could not update the token\'s expiration'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        'Error': 'The token has already expired, and cannot be extended'
                    });
                }
            } else {
                callback(400, {
                    'Error': 'Specified token does not exist'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required fields or fields are invalid'
        });
    }
};

// Tokens - delete
// Required data: id
// Oprional data: none
handlers._tokens.delete = function (data, callback) {
    // Check that the id is valid
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length === 20 ?
        data.queryStringObject.id.trim() :
        false;
    if (id) {
        //Lookup the token
        repo.read('tokens', id, (err, data) => {
            if (!err && data) {
                repo.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            'Error': 'Could not delete the specified token'
                        });
                    }
                });
            } else {
                callback(400, {
                    'Error': 'Could not find the specified token'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }
};

//Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    //Lookup the token
    repo.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            //Check that the token is for the given user has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Export the module
export default handlers;