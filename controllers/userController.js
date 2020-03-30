let User = require('../models/userModel.js');
let userList = [];
let connection = require('../db.js');

// Pages Rendering
exports.renderSecondPage = function (req, res) {
    console.log('rendering second page');
    connection.query("SELECT * from user;" , function (error, resultSQL) {
        if (error) {
            res.status(400).json(error);
        }
        else {
            res.status(200);
            userList = resultSQL;
            res.json({users: userList});
        }
    })
}

exports.renderAddMemberPage = function (req, res) {
    console.log('rendering add member page');
    res.json({ label: "", iduser: "-1" });

};

exports.renderUpdateMemberPage = function (req, res) {
    console.log('rendering update member page');
    connection.query("Select * from user where iduser = ?", req.params.iduser, (error, data) => {
        res.json(data[0]);
    })
};


//Action USERS

exports.userNew = function (req, res) {
    let lastname = req.body.lastname;
    let firstname = req.body.firstname;
    let position = req.body.position;
    let status = req.body.status;
    if (lastname != '' && firstname != '' && position != '' && status != '') {
        let user = new User(lastname, firstname, position, status);
        console.log(user);
        console.log(userList);
        connection.query("INSERT INTO user set ?", user, function (error, resultSQL) {
            if (error) {
                res.status(400).json(error);
            }
            else {
                res.status(201).json({'message': 'success'});
            }
        });
    }
}



exports.updateUser = function (req, res) {
    let lastname = req.body.lastname;
    let firstname = req.body.firstname;
    let position = req.body.position;
    let status = req.body.status;
    let iduser = req.body.iduser;
    console.log("updating user with id: " + req.body.iduser + " ; lastname= " + lastname + " ; firstname= " + firstname + " ; position= " + position + " ; status= " + status);
    let sql = "UPDATE user SET lastname=?, firstname=?, position=?, status=? WHERE iduser = ?";
    let sqlQuery = connection.query(sql, [lastname, firstname, position, status, iduser],
        function (error, resultSQL) {
            if (error) {
                console.log(error);
                res.status(400).json(error);
            }
            else {
                res.status(202).json({'message': 'success'});
            }
        });

    console.log("Query applied: " + sqlQuery);
}


exports.removeUser = function (req, res) {
    console.log('removing user id: ' + req.params.iduser);
    let sql = "DELETE FROM register_to WHERE FK_iduser = ?";
    connection.query(sql, [req.params.iduser], (error, resultSQL) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            let sql = "DELETE FROM user WHERE iduser = ?";
            connection.query(sql, [req.params.iduser], (error, resultSQL) => {
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
