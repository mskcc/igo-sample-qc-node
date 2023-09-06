module.exports = (sequelize, Sequelize) => {
    const Decision = sequelize.define('Decision', {
        request_id: {
            type: Sequelize.DataTypes.STRING,
        },
        decision_maker: {
            type: Sequelize.DataTypes.STRING,
        },
        comment_relation_id: {
            type: Sequelize.DataTypes.INTEGER,
        },
        report: {
            type: Sequelize.DataTypes.STRING,
        },
        decisions: {
            type: Sequelize.DataTypes.TEXT,
        },
        is_igo_decision: {
            type: Sequelize.DataTypes.TINYINT,
        },
        is_submitted: {
            type: Sequelize.DataTypes.TINYINT,
        }
    }, {
        tableName: 'decisions'
    });

    return Decision;
};
