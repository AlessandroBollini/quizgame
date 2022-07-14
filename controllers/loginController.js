const jwt = require('jsonwebtoken');
const db = require('../models/userModels');

async function verifyUser(user) {
    return await db.User.count({ where: { email: user.email, password: user.password } })
        .then((count) => {
            if (count > 0) {
                return true;
            } else {
                return false;
            }
        })
}

async function isAdmin(user) {
    return await db.User.count({ where: { email: user.email, password: user.password, admin: true } })
        .then((count) => {
            if (count > 0) {
                return true;
            } else {
                return false;
            }
        })
}

exports.login = async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }
    await verifyUser(user)
        .then((check) => {
            if (check) {
                const token = jwt.sign({ user: user }, 'secretkey')
                isAdmin(user)
                    .then((adm) => {
                        if (adm) {
                            res.cookie('authorization', token);
                            res.redirect(302, '/adminprofile');
                        } else {
                            res.cookie('authorization', token);
                            res.redirect(302, '/clientprofile');
                        }
                    })
            } else {
                res.send("Login refused");
            }
        })
}

exports.adminprofile = async (req, res) => {
    jwt.verify(req.cookies.authorization, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.clearCookie("authorization");
            res.cookie("Logged", authData);
            res.send("Login ok");
        }
    })
}

exports.clientprofile = async (req, res) => {
    jwt.verify(req.cookies.authorization, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.clearCookie("authorization");
            res.cookie("Client", authData);
            res.send("Login ok");
        }
    })
}

exports.logout = (req, res) => {
    if (!req.cookies.Logged && !req.cookies.Client) {
        res.send("Not logged");
    } else {
        res.clearCookie("Client");
        res.clearCookie("Logged");
        res.send("Logout ok");
    }
}

exports.verifyToken = (req, res, next) => {
    const bearerHeader = req.cookies.authorization;
    if (typeof bearerHeader !== 'undefined') {
        req.cookies.authorization = bearerHeader;
        next()
    } else {
        res.sendStatus(403);
    }

}