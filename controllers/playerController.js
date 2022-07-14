const db = require('../models/quizModels');
const Cache = require('node-cache');
const pCache = new Cache({ stdTTL: 120 });

exports.createPlayer = (req, res) => {
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const player = {
            name: req.body.name,
            nationality: req.body.nationality,
            age: req.body.age,
            role: req.body.role,
            goals: req.body.goals,
            TeamName: req.body.team
        }
        db.Player.create(player)
            .then((data) => {
                res.send(data);
                pCache.del('allPlayers');
                pCache.del(req.body.team);
                //Ci sarebbe da fare il cancella cache per il filtro su campionato
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the element."
                });
            });
    }
}

exports.findAllPlayers = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        let players = pCache.get('allPlayers');
        if (players != null) {
            res.send(players);
        } else {
            await db.Player.findAll()
                .then((data) => {
                    res.send(data);
                    pCache.set('allPlayers', data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving the db."
                    });
                })
        }
    }
}

exports.findPlayerByTeam = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const team = req.params.name;
        let player = pCache.get(team);
        if (player != null) {
            res.send(player)
        } else {
            await db.Player.findAll({
                where: { TeamName: team }
            })
                .then((data) => {
                    res.send(data);
                    pCache.set(team, data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving the db."
                    });
                })
        }
    }
}

exports.findPlayerById = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const id = req.params.id;
        let player = pCache.get(id);
        if (player != null) {
            res.send(player);
        } else {
            await db.Player.findByPk(id)
                .then((data) => {
                    res.send(data);
                    pCache.set(id, data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving the db."
                    });
                })
        }
    }
}

exports.findPlayerByChampionship = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const championship = req.params.name;
        let players = pCache.get(championship);
        if (players != null) {
            res.send(players);
        } else {
            await db.Player.findAll({
                include: [{
                    model: db.Team,
                    where: { ChampionshipName: championship },
                    required: true
                }]
            })
                .then((data) => {
                    res.send(data);
                    pCache.set(championship, data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving the db."
                    });
                })
        }
    }
}

exports.deletePlayer = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const id = req.params.id;
        db.Player.destroy({ where: { id: id } })
            .then((rows) => {
                if (pCache.get(id) != null) {
                    pCache.del(id);
                } else if (pCache.get('allPlayers') != null) {
                    pCache.del('allPlayers');
                }
                if (rows != 0) {
                    res.send('Deleted successfully');
                }
                else {
                    res.send('Impossible to delete');
                }
            })
    }
}