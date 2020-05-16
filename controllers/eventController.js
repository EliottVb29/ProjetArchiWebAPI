//Appel aux modèles
let Event = require('../models/eventModel.js');
let User = require('../models/userModel.js');

//Listes
let eventList = [];
let userList = [];

//Appel à la db
let connection = require('../db.js');

//Pages Rendering
exports.renderMainPage = function (req, res) {
    getMembersFromDb();
    connection.query("SELECT * from event;", function (error, resultSQL) {
        if (error) {
            res.status(400).json(error);
        }
        else {
            res.status(200);
            eventList = resultSQL;
            eventList.forEach(event => {
                event.Date = new Date(event.Date).toDateString();
            });

            res.json({ events: eventList, users: userList, 'message': 'success' });
        }
    });
}


exports.renderDetailsItem = function (req, res) {
    console.log("renderDetails");
    let sqlevent = "select idcal, type, name, date from event where idcal = ?";
    let sql = "Select lastname, firstname, position, name, type, date, presence" +
        " from event join register_to on register_to.FK_idcal = event.idcal " +
        "join user on register_to.FK_iduser = user.iduser where FK_idcal = ?";
    connection.query(sqlevent, [req.params.idcal], (error, resultSQL) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            let event = { idcal: resultSQL[0].idcal, name: resultSQL[0].name, type: resultSQL[0].type, date: new Date(resultSQL[0].date).toDateString() };
            connection.query(sql, [req.params.idcal], (error, resultSQL) => {
                if (error) {
                    res.status(400).json(error);
                }
                else {
                    listUserYes = [];
                    listUserNo = [];
                    resultSQL.forEach((presence) => {
                        if (presence.presence === "YES") {
                            listUserYes.push(new User(presence.lastname, presence.firstname, presence.position, null));
                        }
                        else {
                            listUserNo.push(new User(presence.lastname, presence.firstname, presence.position, null));
                        }
                    });
                    res.json({ event: event, listUserYes: listUserYes, listUserNo: listUserNo });
                }
            });
        }
    });
};


//Action EVENTS

exports.createItem = function (req, res) {
    let type = req.body.type;
    let name = req.body.name;
    let date = req.body.date;
    if (type != '' && name != '' && date != '') {
        let event = new Event(type, name, new Date(date));
        connection.query("INSERT INTO event set ?", event, function (error, resultSQL) {
            if (error) {
                res.status(400).json(error);
            }
            else {
                res.status(201).json({'message': 'success'});
            }
        });
    }
}
exports.updateItem = function (req, res) {
    let type = req.body.type;
    let name = req.body.name;
    let date = new Date(req.body.date);
    let idcal = req.body.idcal;
    let sql = "UPDATE event SET type=?, name=?, date=? WHERE idcal = ?";
    let sqlQuery = connection.query(sql, [type, name, date, idcal],
        function (error, resultSQL) {
            if (error) {
                console.log(error);
                res.status(400).json(error);
            }
            else {
            }
            res.status(202).json({'message': 'success'});
        });
}


exports.removeItem = function (req, res) {
    let sql = "DELETE FROM register_to WHERE FK_idcal = ?";
    connection.query(sql, [req.params.idcal], (error, resultSQL) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            let sql = "DELETE FROM event WHERE idcal = ?";
            connection.query(sql, [req.params.idcal], (error, resultSQL) => {
                if (error) {
                    res.status(400).json(error);
                }
                else {
                    res.json({'message': 'success'})
                }
            });
        }
    });
}

exports.updateYes = function (req, res) {
    let sql = "select FK_idcal, FK_iduser from register_to where FK_idcal = ? and FK_iduser = ?";
    connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            if (resultSQL.length === 0) {
                let sql = "INSERT INTO register_to (FK_idcal, FK_iduser, presence) VALUES (?, ?, 'YES')";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).json(error);
                    }
                    else {
                        res.json({'message': 'success'});
                    }
                })
            }
            else {
                let sql = "Update register_to SET presence = 'YES' where FK_idcal = ? and FK_iduser = ?";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).json(error);
                    }
                    else {
                        res.json({'message': 'success'});
                    }
                });
            }
        }
    });
}

exports.updateNo = function (req, res) {
    let sql = "select FK_idcal, FK_iduser from register_to where FK_idcal = ? and FK_iduser = ?"
    connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            if (resultSQL.length === 0) {
                let sql = "INSERT INTO register_to (FK_idcal, FK_iduser, presence) VALUES (?, ?, 'NO')";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).json(error);
                    }
                    else {
                        res.json({'message': 'success'});
                    }
                })
            }
            else {
                let sql = "Update register_to SET presence = 'NO' where FK_idcal = ? and FK_iduser = ?";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).json(error);
                    }
                    else {
                        res.json({'message': 'success'});
                    }
                });
            }
        }
    });
}



//functions

function getMembersFromDb() {
    connection.query("SELECT * from user;", function (error, resultSQL) {
        userList = resultSQL;
    });
}