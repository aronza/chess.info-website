const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const mysql = require('mysql')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')





var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chessproject"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to mysql in chessproject database");
});


app.get('/', function (req, res) {
	
	
	res.render('index');
 
})


app.get('/search', function (req, res) {
	
	var limit = 50;
	con.query("SELECT game_ID,game_date AS Date, result AS Result, white_elo, black_elo FROM game LIMIT "+limit
	, function (err, result, fields) {
    if (err) throw err;
	res.render('searchDefault',{results: result,limit: limit});
 });
})

app.get('/search/:size', function (req, res) {
	
	var limit = req.params.size;
	con.query("SELECT game_ID,game_date AS Date, result AS Result, white_elo, black_elo FROM game LIMIT "+limit
	, function (err, result, fields) {
    if (err) throw err;
	res.render('searchDefault',{results: result,limit: limit});
 });
})

app.get('/search/:offset', function (req, res) {
	
	var limit = 50;
	con.query("SELECT game_ID,game_date AS Date, result AS Result, white_elo, black_elo FROM game LIMIT "+req.params.offset+", "+limit
	, function (err, result, fields) {
    if (err) throw err;
	res.render('searchDefault',{results: result,limit: limit});
 });
})

//average elo of players that win vs players that lose
app.get('/search.1', function (req, res) {
	var queryString = "SELECT result, ROUND(AVG(white_elo), 0) AS whiteElo FROM game WHERE black_elo <> 'none' GROUP BY result;"
	con.query(queryString, function (err, result, fields) {
    if (err) throw err;
	res.render('search',{results: result,limit: result.length});
 });
})

//overall win PCT
app.get('/search.2', function (req, res) {
	var queryString = "SELECT result, ROUND((COUNT(*) / (SELECT COUNT(*) FROM game WHERE black_elo <> 'none') * 100), 2) AS winPCT "+
 "FROM game "+
 "WHERE black_elo <> 'none' "+
 "GROUP BY result;"
	con.query(queryString, function (err, result, fields) {
    if (err) throw err;
	res.render('search',{results: result,limit: result.length});
 });
})

// how often do players win when playing a move to h2 after move 
app.get('/search.4', function (req, res) {
	var queryString = "SELECT result, COUNT(*) "+
  "FROM(SELECT result FROM game WHERE game_ID IN "+
 "(SELECT game_ID FROM splitmoves NATURAL JOIN game WHERE num > 40 AND incheck AND color = 'W' AND endSquare = 'h2') "+
 "GROUP BY result) AS T GROUP BY result;"
	con.query(queryString, function (err, result, fields) {
    if (err) throw err;
	res.render('search',{results: result,limit: result.length});
 });
})

//Do long games result in more draws?
app.get('/search.3', function (req, res) {
	var queryString = "SELECT result, COUNT(*) "+
 "FROM(SELECT result FROM game_move NATURAL JOIN game "+
 "GROUP BY game_ID HAVING COUNT(move_ID) > 150) AS t1 "+
  "GROUP BY result;"
	con.query(queryString, function (err, result, fields) {
    if (err) throw err;
	res.render('search',{results: result,limit: result.length});
 });
})


app.get('/game', function (req, res) {
	var limit = -1;
	con.query("SELECT  color, move_num, piece, capture, castle_k, castle_q, end_Square, inCheck "+
	"FROM move NATURAL JOIN (SELECT move_ID FROM game_move WHERE game_ID = "+req.query.game_ID+") AS gameMoves"
	, function (err, result, fields) {
    if (err) throw err;
	res.render('search',{results: result,limit: limit});
 });
})


app.get('/samples', function (req, res)  {
	res.render('samples');
 
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})