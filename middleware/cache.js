const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cache;