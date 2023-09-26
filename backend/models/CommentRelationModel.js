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
        createdAt: {
            field: 'date_created',
            type: Sequelize.DataTypes.DATE,
        },
        updatedAt: {
            field: 'date_updated',
            type: Sequelize.DataTypes.DATE,
        }
    }, {
        tableName: 'commentrelations'
    });

    return CommentRelation;
};
