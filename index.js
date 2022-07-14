const express = require('express');
const app = express();
const db1 = import('./models/userModels.js');
var parseUrl = require('body-parser');
let encodeUrl = parseUrl.urlencoded({ extended: true });
const uController = require('./controllers/userController');
const cController = require('./controllers/championshipController');
const tController = require('./controllers/teamController');
const pController = require('./controllers/playerController');
const login = require('./controllers/loginController');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const game = require('./game/gameLogic');

app.get('/addUser', (req, res) => {
    res.sendFile(__dirname + '/templates/addUser.html');
});
app.post('/addUser', encodeUrl, uController.createUser);

app.get('/login', (req, res) => {
    if (!req.cookies.Logged && !req.cookies.Client) {
        res.sendFile(__dirname + '/templates/login.html');
    } else {
        res.send("Already Logged");
    }
});
app.get('/adminprofile', login.verifyToken, login.adminprofile);
app.get('/clientprofile', login.verifyToken, login.clientprofile);
app.get('/logout', login.logout);
app.post('/login', encodeUrl, login.login);


app.get('/championships', cController.findAllChampionships);
app.get('/championship/:name', cController.findChampionshipyByName);
app.get('/deleteChampionship/:name', cController.deleteChampionship);
app.get('/addChampionship', (req, res) => {
    res.sendFile(__dirname + '/templates/addChampionship.html')
});
app.post('/addChampionship', encodeUrl, cController.createChampionship);

app.get('/teams', tController.findAllTeams);
app.get('/teams/:name', tController.findTeamByName);
app.get('/deleteTeam/:name', tController.deleteTeam);
app.get('/teamsbc/:name', tController.findTeamByChampionship);
app.get('/addTeam', (req, res) => {
    res.sendFile(__dirname + '/templates/addTeam.html')
});
app.post('/addTeam', encodeUrl, tController.createTeam);

app.get('/players', pController.findAllPlayers);
app.get('/player/:id', pController.findPlayerById);
app.get('/playerbt/:name', pController.findPlayerByTeam);
app.get('/playerbc/:name', pController.findPlayerByChampionship);
app.get('/addPlayer', (req, res) => {
    res.sendFile(__dirname + '/templates/addPlayer.html')
});
app.post('/addPlayer', encodeUrl, pController.createPlayer);
app.get('/deletePlayer/:id', pController.deletePlayer);

app.get('/startQuiz', game.extraction);
app.get('/checkTries', game.outOfTries);
app.get('/quiz', (req, res) => {
    res.sendFile(__dirname + '/templates/quiz.html')
});
app.post('/quiz', encodeUrl, game.yourAnswer);
app.get('/endGame', game.clearAnswer);
app.get('/winPage', game.win);

app.listen(3000, () => {
    console.log("App is running on port 3000");
})