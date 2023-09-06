const dbConfig = require('../db.config');
const Sequelize = require('Sequelize');

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.commentRelations = require('./CommentRelationModel')(sequelize, Sequelize);
db.decisions = require('./DecisionsModel')(sequelize, Sequelize);
db.comments = require('./CommentsModel')(sequelize, Sequelize);

module.exports = db;
