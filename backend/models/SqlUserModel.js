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
            field: 'login_first_date',
            type: Sequelize.DataTypes.DATE,
        },
        updatedAt: {
            field: 'login_latest_date',
            type: Sequelize.DataTypes.DATE,
        }
    }, {
        tableName: 'users'
    });

    return User;
};
