/* 
 * Create and export config variables
* NODE_ENV
 */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
};

// Production environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
};

// Detwermine which environment was passed as a command-line argument
const _env = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
const env = typeof(environments[_env]) == 'object' ? environments[_env] : environments.staging;

// Export the module
module.exports = env;