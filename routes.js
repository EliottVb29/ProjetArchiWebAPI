let express = require('express');
let router = express.Router();

var eventController = require('./controllers/eventController');
var userController = require('./controllers/userController');


// API CALENDAR

router.get('/api/calendar', eventController.renderMainPage);
router.post('/api/calendar', eventController.createItem);
router.put('/api/calendar/', eventController.updateItem);
router.delete('/api/calendar/:idcal', eventController.removeItem);

router.get('/api/calendar/details/:idcal', eventController.renderDetailsItem);
router.put('/api/calendar/yes/:idcal', eventController.updateYes);
router.put('/api/calendar/no/:idcal', eventController.updateNo);


// API USERS

router.get('/api/members', userController.renderSecondPage);
router.post('/api/members', userController.userNew);
router.put('/api/members/', userController.updateUser);
router.delete('/api/members/:iduser', userController.removeUser);


module.exports = router;