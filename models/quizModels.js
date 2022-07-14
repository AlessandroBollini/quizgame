const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('testdb', 'bollini', 'password', {
    host: 'localhost',
    dialect: 'postgres'
});

class Player extends Model { }
Player.init({
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    nationality: DataTypes.STRING,
    role: DataTypes.ENUM("GK", "DEF", "MID", "ATT"),
    age: DataTypes.INTEGER,
    goals: DataTypes.INTEGER
}, {
    timestamps: false,
    sequelize
});

class Team extends Model { }
Team.init({
    name: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    timestamps: false,
    sequelize
});

class Championship extends Model { }
Championship.init({
    name: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    timestamps: false,
    sequelize
});

Championship.hasMany(Team);
Team.belongsTo(Championship);
Team.hasMany(Player);
Player.belongsTo(Team);

(async () => {
    await sequelize.sync({});
})();

module.exports.Championship = Championship;
module.exports.Team = Team;
module.exports.Player = Player;