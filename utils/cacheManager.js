const NodeCache = require('node-cache');

// Initialize memory cache equivalent to Redis
// stdTTL: 300 seconds (5 minutes) default time to live
// checkperiod: Defines how often cache is cleaned
const dbCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

module.exports = { dbCache };
