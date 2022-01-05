const express = require("express")
const userController = require('../controllers/user-controller')
const router = express.Router()
const mongo = require("../mongo")
const mongoose = require("../mongoose")

// router.get('/', userController.getUsers )
router.get('/', mongoose.getUsers )

router.patch('/:uid', userController.updateUser)
router.get('/:uid', userController.getUserById)
// router.post('/signup', userController.signup)
// router.post('/signup', mongo.create)
router.post('/signup', mongoose.createUser)
router.post('/login', userController.login)
module.exports = router