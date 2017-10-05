var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var path = require("path");
var app = express();

var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "codeman",
    password: "codenow",
    database: "chirper"
});

var clientPath = path.join(__dirname, "../client");
// var dataPath = path.join(__dirname, 'data.json');

app.use(express.static(clientPath)); //this will read all files in the client path.
app.use(bodyParser.json()); //turns the json data into javascript.

app.route("/api/chirps") //sends and recieves information. Used for Ajax on main.js.
    .get(function (request, response) { //gets the information from SQL.
        rows("GetAllChirps") //this is the name of the procedure use in SQL.
            .then(function (chirps) { //sends a request from the handler/variable chirps.
                response.send(chirps);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    }).post(function (request, response) { //post the information into the database.
        var newChirp = request.body;  //creates a new chirp to be stored into database.
        row("InsertChirp", [newChirp.userid, newChirp.message]) //this is the name of the procedure use in SQL with parameters.
            .then(function (id) {
                response.status(201).send(id);
            })
            .catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    });

app.route("/api/chirps/:id")  //Updates the database in SQL.
    .get(function (request, response) {
        row("GetSingleChirp", [request.params.id]) //this is the name of the procedure use in SQL.
            .then(function (chirp) {
                response.send(chirp);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    }).put(function (request, response) {
        empty("UpdateChirp", [request.params.id, request.body.message]) //this is the name of the procedure use in SQL.
            .then(function () {
                response.sendStatus(204);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    }).delete(function (request, response) {
        empty("DeleteChirp", [request.params.id]) //this is the name of the procedure use in SQL.
            .then(function () {
                response.sendStatus(204);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    });

app.route("/api/users").get(function (request, response) {
    rows("GetUsers") //this is the name of the procedure use in SQL.
        .then(function (users) {
            response.send(users);
        }).catch(function (error) {
            console.log(error);
            response.sendStatus(500);
        });
});

app.listen(3000);

function callProcedure(procedureName, args) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error) {
                reject(error);
            } else {
                var placeholders = "";
                if (args && args.length > 0) {
                    for (var i = 0; i < args.length; i++) {
                        if (i === args.length - 1) {
                            // if we are on the last argument in the array
                            placeholders += "?";
                        } else {
                            placeholders += "?,";
                        }
                    }
                }
                var callString = "CALL " + procedureName + "(" + placeholders + ");"; // CALL GetChirps();, or CALL InsertChirp(?,?,?);
                connection.query(callString, args, function (error, resultsets) {
                    connection.release();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(resultsets);
                    }
                });
            }
        });
    });
}

function rows(procedureName, args) {
    return callProcedure(procedureName, args).then(function (resultsets) {
        return resultsets[0];
    });
}

function row(procedureName, args) {
    return callProcedure(procedureName, args).then(function (resultsets) {
        return resultsets[0][0];
    });
}

function empty(procedureName, args) {
    return callProcedure(procedureName, args).then(function () {
        return;
    });
}
