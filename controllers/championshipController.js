const db = require('../models/quizModels');
const Cache = require('node-cache');
const cCache = new Cache({ stdTTL: 300 });

exports.createChampionship = async (req, res) => {
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const championship = {
            name: req.body.name
        }
        db.Championship.create(championship)
            .then((data) => {
                res.send(data);
                if (cCache.get('allChampionships') != null) {
                    cCache.del('allChampionships');
                }
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the element."
                });
            });
    }
}

exports.findAllChampionships = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    }
    else {
        let championships = cCache.get('allChampionships');
        if (championships != null) {
            res.send(championships);
        } else {
            await db.Championship.findAll()
                .then((data) => {
                    res.send(data);
                    cCache.set('allChampionships', data);
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


exports.findChampionshipyByName = async (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const name = req.params.name;
        let championship = cCache.get(name);
        if (championship != null) {
            res.send(championship);
        } else {
            await db.Championship.findByPk(name)
                .then((data) => {
                    res.send(data);
                    cCache.set(name, data);
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

exports.deleteChampionship = (req, res) => {
    if (!req.cookies.Logged) {
        res.send('Not logged');
    } else {
        const name = req.params.name;
        db.Championship.destroy({ where: { name: name } })
            .then((rows) => {
                if (cCache.get(name) != null) {
                    cCache.del(name);
                } else if (cCache.get('allChampionships') != null) {
                    cCache.del('allChampionships');
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