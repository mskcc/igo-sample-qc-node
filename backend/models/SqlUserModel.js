module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        full_name: {
            type: Sequelize.DataTypes.STRING,
        },
        username: {
            type: Sequelize.DataTypes.STRING,
        },
        title: {
            type: Sequelize.DataTypes.STRING,
        },
        role: {
            type: Sequelize.DataTypes.STRING,
        },
        groups: {
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
        tableName: 'users'
    });

    return User;
};
