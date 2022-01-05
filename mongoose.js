const mongoose = require("mongoose")

const User = require('./models/user')

mongoose.connect('mongodb+srv://kollektor-user:witfyp-ko@cluster0.llhnv.mongodb.net/kollektor?retryWrites=true&w=majority')
.then(() => {
    console.log('Connected to the DB')
})

const createUser = async (req, res, next) => {
    const createdUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        numOfEntries: 0
    })
    const result = await createdUser.save()
    res.json(result)
}

const getUsers = async (req, res, next) => {
    const users = await User.find().exec()
    res.json(users)
}

exports.createUser = createUser
exports.getUsers = getUsers