module.exports = (sequelize, Sequelize) => {
    const Comment = sequelize.define('Comment', {
        commentrelation_id: {
            type: Sequelize.DataTypes.INTEGER,
        },
        username: {
            type: Sequelize.DataTypes.STRING,
        },
        comment: {
            type: Sequelize.DataTypes.TEXT,
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
        tableName: 'comments'
    });

    return Comment;
};
