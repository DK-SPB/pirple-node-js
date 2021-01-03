/**
 * Library for store and editing various data
 */

// Dependencies
import fs from 'fs';
import path from 'path';
import helpers from './helpers.js';

// Container for the module (to be exported)
const repo = {};

// Base directory of the data folder
// FixMe should be defined with __dirname, but doesn't work..
const __dirname = '/Users/18301689/Web/project-pirple-node-js/.data/';
repo.baseDir = path.join(__dirname);

// Write data to a file
repo.create = (dir, file, data, callback) => {
    // Open the file for writing
    fs.open(`${repo.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to the string
            const stringData = JSON.stringify(data);

            // Write to file and chose it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error while closing new file');
                        }
                    });
                } else {
                    callback('Error while writing to new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

// Read data from a file
repo.read = (dir, file, callback) => {
    fs.readFile(`${repo.baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {

        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

// Update data inside a file
repo.update = (dir, file, data, callback) => {
    // Open the file for writing
    fs.open(`${repo.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to the string
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
                if (!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing a file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Could not open the file for updating, it may not exist yet');
        }
    });
};

// Delete file
repo.delete = (dir, file, callback) => {
    // Unlink the file
    fs.unlink(`${repo.baseDir}${dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

export default repo;