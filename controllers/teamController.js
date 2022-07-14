const db = require('../models/quizModels');
const Cache = require('node-cache');
const tCache = new Cache({ stdTTL: 120 });

exports.createTeam = (req, res) => {
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const team = {
            name: req.body.name,
            ChampionshipName: req.body.championship
        }
        db.Team.create(team)
            .then((data) => {
                res.send(data);
                tCache.del('allTeams');
                tCache.del(req.body.championship);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the element."
                });
            });
    }

}

exports.findAllTeams = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        let teams = tCache.get('allTeams');
        if (teams != null) {
            res.send(teams);
        } else {
            await db.Team.findAll()
                .then((data) => {
                    res.send(data);
                    tCache.set('allTeams', data);
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

exports.findTeamByChampionship = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const championship = req.params.name;
        let teams = tCache.get(championship);
        if (teams != null) {
            res.send(teams);
        } else {
            await db.Team.findAll({
                where: { ChampionshipName: championship }
            })
                .then((data) => {
                    res.send(data);
                    tCache.set(championship, data);
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

exports.findTeamByName = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const name = req.params.name;
        let team = tCache.get(name);
        if (team != null) {
            res.send(team);
        } else {
            await db.Team.findByPk(name)
                .then((data) => {
                    res.send(data);
                    tCache.set(name, data);
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

exports.deleteTeam = (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const name = req.params.name;
        db.Team.destroy({ where: { name: name } })
            .then((rows) => {
                if (tCache.get(name) != null) {
                    tCache.del(name);
                } else if (tCache.get('allTeams') != null) {
                    tCache.del('allTeams');
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