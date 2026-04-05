const NodeCache = require('node-cache');
const redis = require('redis');

// Initialize memory cache fallback
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// Redis Configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient;
let isRedisEnabled = false;

if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: redisUrl
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
    isRedisEnabled = false;
  });

  redisClient.connect().then(() => {
    console.log('✅ Connected to Enterprise Redis Cache');
    isRedisEnabled = true;
  }).catch((err) => {
    console.error('Could not connect to Redis, falling back to Node-Cache:', err);
    isRedisEnabled = false;
  });
}

const dbCache = {
  get: async (key) => {
    if (isRedisEnabled) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
    return localCache.get(key);
  },
  
  set: async (key, value, ttl = 300) => {
    if (isRedisEnabled) {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttl
      });
      return true;
    }
    return localCache.set(key, value, ttl);
  },

  del: async (key) => {
    if (isRedisEnabled) {
      await redisClient.del(key);
      return true;
    }
    return localCache.del(key);
  }
};

module.exports = { dbCache };
