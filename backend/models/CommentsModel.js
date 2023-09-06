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
        }
    }, {
        tableName: 'comments'
    });

    return Comment;
};
