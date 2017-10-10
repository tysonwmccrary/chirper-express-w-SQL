var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var path = require("path");
var app = express();

//Connect mysql database to index.js.
var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "codeman",
    password: "codenow",
    database: "chirper"
});

//Direct index.js to client folder to perform main.js code.
var clientPath = path.join(__dirname, "../client");
// var dataPath = path.join(__dirname, 'data.json');

app.use(express.static(clientPath)); //This will read all files in the client path.
app.use(bodyParser.json()); //Turns the json data into javascript.

app.route("/api/Allchirps") //Sends and recieves information. Used from Ajax on main.js.
    .get(function (request, response) { //Gets the information from SQL.
        rows("GetChirps") //This is the name of the procedure use in SQL.
            .then(function (Allchirps) { //Finds the table Allchirps and responds the table.
                response.send(Allchirps);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    }).post(function (request, response) { //Post the information into the database.
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

app.route("/api/Allchirps/:id")  //This routes the url particularly to id in Allchirps table.
    .get(function (request, response) {
        row("GetSingleChirp", [request.params.id]) //This is the name of the procedure use in SQL, particularly to id and is from this specific row.
            .then(function (Allchirps) {
                response.send(Allchirps);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    }).put(function (request, response) {
        empty("UpdateChirp", [request.params.id, request.body.message]) //This is the name of the procedure use in SQL.
            .then(function () {
                response.sendStatus(204);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    }).delete(function (request, response) {
        empty("DeleteChirp", [request.params.id]) //This is the name of the procedure use in SQL, particularly to id.
            .then(function () {
                response.sendStatus(204);
            }).catch(function (error) {
                console.log(error);
                response.sendStatus(500);
            });
    });

app.route("/api/users").get(function (request, response) { //This routes the url to the users Table in the chirper Database.
    rows("GetUsers") //This is the name of the procedure use in SQL, and will be updated in that paricular row.
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
