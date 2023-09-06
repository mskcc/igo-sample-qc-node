module.exports = (sequelize, Sequelize) => {
    const CommentRelation = sequelize.define('CommentRelation', {
        request_id: {
            type: Sequelize.DataTypes.STRING,
        },
        report: {
            type: Sequelize.DataTypes.TEXT,
        },
        author: {
            type: Sequelize.DataTypes.STRING,
        },
        recipients: {
            type: Sequelize.DataTypes.TEXT,
        },
        is_cmo_pm_project: {
            type: Sequelize.DataTypes.TINYINT,
        },
    }, {
        tableName: 'commentrelations'
    });

    return CommentRelation;
};
