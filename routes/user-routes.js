const express = require("express")
const userController = require('../controllers/user-controller')
const router = express.Router()
const mongo = require("../mongo")

// router.get('/', userController.getUsers )
router.get('/', mongo.get )

router.patch('/:uid', userController.updateUser)
router.get('/:uid', userController.getUserById)
// router.post('/signup', userController.signup)
router.post('/signup', mongo.create)
router.post('/login', userController.login)
module.exports = router