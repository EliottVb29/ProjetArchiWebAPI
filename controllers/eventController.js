let Event = require('../models/eventModel.js');
let User = require('../models/userModel.js');
let eventList = [];
let userList = [];
let connection = require('../db.js');

//Pages Rendering
exports.renderMainPage = function (req, res) {
    console.log('rendering main page');
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

exports.renderAddItemPage = function (req, res) {
    console.log('rendering add event page');
    res.json({ label: "", idcal: "-1" , 'message': 'success'});

};


exports.renderUpdateItemPage = function (req, res) {
    console.log('rendering update event page');
    connection.query("Select * from event where idcal = ?", req.params.idcal, (error, data) => {
        res.json(data[0],{'message': 'success'});
    })
};


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
                    console.log(event);
                    console.log(listUserNo);
                    console.log(listUserYes);
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
        console.log(event);
        console.log("Event list = " + eventList);
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
    console.log("updating event with id: " + req.body.idcal + " ; type= " + type + " ; name= " + name + " ; date= " + date);
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

    console.log("Query applied: " + sqlQuery);
}


exports.removeItem = function (req, res) {
    console.log('removing event id: ' + req.params.idcal);
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
    console.log('User ' + req.body.users + ' said Yes for: ' + req.params.idcal);
    getMembersFromDb();
    let sql = "select FK_idcal, FK_iduser from register_to where FK_idcal = ? and FK_iduser = ?";
    connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            console.log(resultSQL);
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

    console.log('User ' + req.body.users + ' said No for: ' + req.params.idcal);

    let sql = "select FK_idcal, FK_iduser from register_to where FK_idcal = ? and FK_iduser = ?"
    connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            console.log(resultSQL);
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