const pb = require('../api/pocketbase');

async function writeLog(userId, moduleName, data) {
  const date = new Date().toISOString().slice(0, 10);
  await pb.collection('logs').create({
    user_id: userId,
    module: moduleName,
    date,
    data,
  });
}

module.exports = { writeLog };
