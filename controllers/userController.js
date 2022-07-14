const db = require('../models/userModels');

exports.createUser = (req, res) => {
    if (!req.body.email) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    const user = {
        email: req.body.email,
        password: req.body.password,
        admin: req.body.admin
    }
    db.User.create(user)
        .then(() => {
            res.send("Register OK");
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the element."
            });
        });
}