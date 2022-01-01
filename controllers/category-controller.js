const {v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error')

let DUMMY_CATEGORIES = [
    {
        id: 'c1',
        title: 'Guitar'
    },
    {
        id: 'c2',
        title: 'FX'
    }
]

const getCategories = (req, res, next) => {
    res.json({categories: DUMMY_CATEGORIES})
}

const createCategory = (req, res, next) => {
    const { title } = req.body;

    const hasCategory = DUMMY_CATEGORIES.find(c => c.title === title)
    if (hasCategory) {
        throw new HttpError('Could not create category as it already exists.', 401)
    }
    
    const createdCategory = {
      id: uuidv4(),
      title
    };
  
    DUMMY_CATEGORIES.push(createdCategory);
  
    res.status(201).json({category: createdCategory});
}

const deleteCategory = (req, res, next) => {
    const categoryId = req.params.cid
    DUMMY_CATEGORIES = DUMMY_CATEGORIES.filter(c => c.id != categoryId)

    res.status(200).json({message: 'Deleted category'})
  }

exports.getCategories = getCategories
exports.createCategory = createCategory
exports.deleteCategory = deleteCategory
  