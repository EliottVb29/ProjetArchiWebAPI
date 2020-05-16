//Appel au modèle
let User = require('../models/userModel.js');

//Liste
let userList = [];

//Appel à la db
let connection = require('../db.js');

// Pages Rendering
exports.renderSecondPage = function (req, res) {
    connection.query("SELECT * from user;", function (error, resultSQL) {
        if (error) {
            res.status(400).json(error);
        }
        else {
            res.status(200);
            userList = resultSQL;
            res.json({ users: userList, 'message': 'success' });
        }
    })
}

exports.renderAddMemberPage = function (req, res) {
    res.json({ label: "", iduser: "-1", 'message': 'success' });

};

exports.renderUpdateMemberPage = function (req, res) {
    connection.query("Select * from user where iduser = ?", req.params.iduser, (error, data) => {
        res.json(data[0], { 'message': 'success' });
    })
};

exports.renderDetailsUser = function (req, res) {
    connection.query("Select * from user where iduser = ?", req.params.iduser, (error, data) => {
        if (error) {
            res.status(400).json(error);
        }
        else {
            res.json({user: data[0],'message': 'success'});
        }
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
        connection.query("INSERT INTO user set ?", user, function (error, resultSQL) {
            if (error) {
                res.status(400).json(error);
            }
            else {
                res.status(201).json({ 'message': 'success' });
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
    let sql = "UPDATE user SET lastname=?, firstname=?, position=?, status=? WHERE iduser = ?";
    let sqlQuery = connection.query(sql, [lastname, firstname, position, status, iduser],
        function (error, resultSQL) {
            if (error) {
                console.log(error);
                res.status(400).json(error);
            }
            else {
                res.status(202).json({ 'message': 'success' });
            }
        });
}


exports.removeUser = function (req, res) {
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
                    res.json({ 'message': 'success' })
                }
            });
        }
    });
}
