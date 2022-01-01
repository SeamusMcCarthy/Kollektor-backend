const {v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Seamus Mc',
        email: 'test@test.com',
        password: 'testtest'
    },
    {
        id: 'u2',
        name: 'Seamus Mc2',
        email: 'test2@test2.com',
        password: 'testtest'
    }
]

const getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS})
}

const getUserById = (req, res, next) => {
    const userId = req.params.uid

    const user = DUMMY_USERS.find(u => u.id === userId)

    res.status(200).json({user: user})

}

const signup = (req, res, next) => {
    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email)
    if (hasUser) {
        throw new HttpError('Could not create user. User already exists.', 401)
    }
    
    const createdUser = {
      id: uuidv4(),
      name, 
      email,
      password
    };
  
    DUMMY_USERS.push(createdUser);
  
    res.status(201).json({user: createdUser});
}

const login = (req, res, next) => {
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user. Credentials may be wrong.', 401)
    } else {
        res.json({message: 'Logged in'})
    }
}

exports.getUsers = getUsers
exports.getUserById = getUserById
exports.signup = signup
exports.login = login  
  