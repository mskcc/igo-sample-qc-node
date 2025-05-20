const db = require('../models');
const mongoose = require('mongoose');
require('../models/UserModel'); // <-- Register MongoDB schema first
const MongoUser = mongoose.model('User');
const User = db.users; // MySQL User model
const { logger } = require('./winston');

const syncUserFromMongo = async (username) => {
  try {
    if (!username) {
      logger.error('[SYNC] No username provided for sync');
      console.log('[SYNC] ❌ Username missing');
      return null;
    }

    logger.info(`[SYNC] Checking MySQL for user: ${username}`);
    console.log(`[SYNC] Checking MySQL for user: ${username}`);

    const mysqlUser = await User.findOne({ where: { username } });

    if (mysqlUser) {
      logger.info(`[SYNC] ✅ User found in MySQL: ${username}`);
      console.log(`[SYNC] ✅ User found in MySQL: ${username}`);
      
      try {
        await User.update(
          {
            login_counter: db.Sequelize.literal('login_counter + 1'),
            login_latest_date: new Date()
          },
          { where: { username } }
        );
        logger.info(`[SYNC] Updated login info for: ${username}`);
      } catch (updateError) {
        logger.error(`[SYNC] ⚠️ Error updating login info for ${username}: ${updateError}`);
        console.error(`[SYNC] ⚠️ Error updating login info for ${username}:`, updateError);
      }

      return mysqlUser;
    }

    logger.warn(`[SYNC] User not found in MySQL. Looking in MongoDB: ${username}`);
    console.log(`[SYNC] 🔍 User not found in MySQL. Looking in MongoDB: ${username}`);

    const mongoUser = await MongoUser.findOne({ username });

    if (!mongoUser) {
      logger.error(`[SYNC] ❌ User ${username} not found in MongoDB`);
      console.log(`[SYNC] ❌ User ${username} not found in MongoDB`);
      return null;
    }

    logger.info(`[SYNC] ✅ User found in MongoDB: ${username}`);
    console.log(`[SYNC] ✅ User found in MongoDB: ${username}`);

    let role = 'user';
    if (mongoUser.isLabMember) role = 'lab_member';
    else if (mongoUser.isPM) role = 'cmo_pm';

    let groups = '';
    if (typeof mongoUser.groups === 'string') {
      groups = mongoUser.groups;
    } else if (Array.isArray(mongoUser.groups)) {
      groups = mongoUser.groups.join(',');
    }

    const newMysqlUser = await User.create({
      full_name: `${mongoUser.firstName} ${mongoUser.lastName}`,
      username: mongoUser.username,
      title: mongoUser.title,
      role,
      groups,
      login_counter: 1,
      login_first_date: mongoUser.createdAt || new Date(),
      login_latest_date: mongoUser.updatedAt || new Date()
    });

    logger.info(`[SYNC] 🎉 User ${username} added to MySQL`);
    console.log(`[SYNC] 🎉 User ${username} added to MySQL`);

    return newMysqlUser;
  } catch (error) {
    logger.error(`[SYNC] ❌ Error syncing user ${username}: ${error.message}`);
    console.error(`[SYNC] ❌ Exception during user sync for ${username}:`, error);
    return null;
  }
};

module.exports = {
  syncUserFromMongo
};
