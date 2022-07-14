const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('testdb', 'bollini', 'password', {
    host: 'localhost',
    dialect: 'postgres'
});

class User extends Model { }
User.init({
    email: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    password: DataTypes.STRING,
    admin: DataTypes.BOOLEAN
}, {
    sequelize
});

(async () => {
    await sequelize.sync({ alter: true });
})();

module.exports.User = User;