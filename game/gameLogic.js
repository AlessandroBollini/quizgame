const db = require('../models/quizModels');
const tries = 5;
const answer = [];
var player = null;
var championship = null;

exports.extraction = async (req, res) => {
    if (!req.cookies.Client) {
        res.send("Not logged");
    } else {
        await db.Player.sequelize.query("SELECT * FROM public.\"Players\" ORDER BY RANDOM() LIMIT 1;")
            .then((rows) => {
                player = rows[0][0];
                db.Team.findByPk(player.TeamName)
                    .then((data) => {
                        championship = data.ChampionshipName;
                        res.redirect(302, '/checkTries');
                    })
            })
    }
}

exports.outOfTries = (req, res) => {
    if (answer.length >= tries) {
        res.redirect(302, '/endGame');
    } else {
        res.redirect(302, '/quiz');
    }
}

exports.yourAnswer = (req, res) => {
    if (!req.cookies.Client) {
        res.send("Not logged");
    } else {
        if (answer.length >= tries) {
            res.redirect(302, '/endGame');
        } else {
            db.Player.findAll({ where: { name: req.body.name } })
                .then((data) => {
                    if (data.length != 1) {
                        res.send("Player not found, retry");
                    } else {
                        if (data[0].name === player.name) {
                            res.redirect(302, '/winPage');
                        } else {
                            var pick = {
                                name: data[0].name,
                                nationality: data[0].nationality,
                                checkNationality: data[0].nationality === player.nationality ? true : false,
                                goals: JSON.stringify(data[0].goals),
                                checkGoals: (JSON.stringify(data[0].goals) === player.goals) ? "same goals" : (JSON.stringify(data[0].goals) > player.goals) ? "less goals scored" : "more goals scored",
                                age: JSON.stringify(data[0].age),
                                checkAge: (JSON.stringify(data[0].age) === player.age) ? "same age" : (JSON.stringify(data[0].age) > player.age) ? "younger" : "older",
                                role: data[0].role,
                                checkRole: data[0].role === player.role ? true : false,
                                team: data[0].TeamName,
                                checkTeam: data[0].TeamName === player.TeamName ? true : false,
                                championship: null,
                                checkChampionship: false
                            }
                            db.Team.findByPk(data[0].TeamName)
                                .then((cdata) => {
                                    pick.championship = cdata.ChampionshipName;
                                    pick.checkChampionship = (pick.championship === championship) ? true : false;
                                    answer.push(pick);
                                    res.send(answer);
                                })
                        }
                    }
                })
        }
    }
}

exports.clearAnswer = (req, res) => {
    if (!req.cookies.Client) {
        res.send("Not logged");
    } else {
        while (answer.length != 0) {
            answer.pop();
        }
        res.send("Game ended, the right player was: " + player.name);
        //player = null;
    }
}

exports.win = (req, res) => {
    if (!req.cookies.Client) {
        res.send("Not logged");
    } else {
        while (answer.length != 0) {
            answer.pop();
        }
        res.send("Game ended,you win! The right player was: " + player.name);
        //  player = null;
    }

}