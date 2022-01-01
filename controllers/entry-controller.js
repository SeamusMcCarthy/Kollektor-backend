const {v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')

let DUMMY_ENTRIES = [
    {
        id: 'e1',
        title: 'Schecter JLV6',
        description: 'Jeff Loomis sig series Flying V',
        address: '20 W 34th St, New York, NY 10001',
        userId: 'u1',
        categoryID: 'c1'
    }
]

const getEntryById = (req, res, next) => {
    const entryId = req.params.eid
    const entry = DUMMY_ENTRIES.find(e => {return e.id === entryId})

    if (!entry) {
        throw new HttpError('Could not find an entry for the provided id', 404)
    }
    res.json({entry})
}

const getEntriesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const entries = DUMMY_ENTRIES.filter(e => {return e.userId === userId})

    if (!entries || entries.length === 0) {
        return next(new HttpError('Could not find any entries for the provided user id', 404))
    }
    res.json({entries})
}

const createEntry = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors)
        throw new HttpError('Invalid input passed. Please check your data.', 422)
    }
    const { title, description, address, userId, categoryId } = req.body;
    
    const createdEntry = {
      id: uuidv4(),
      title,
      description,
      address,
      userId,
      categoryId
    };
  
    DUMMY_ENTRIES.push(createdEntry); 
  
    res.status(201).json({entry: createdEntry});
  };

  const updateEntry = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors)
        throw new HttpError('Invalid input passed. Please check your data.', 422)
    }
    
    const { title, description } = req.body;
    const entryId = req.params.pid
    const updatedEntry = { ...DUMMY_ENTRIES.find(e => e.id === entryId) }
    const entryIndex = DUMMY_ENTRIES.findIndex(e => e.id === entryId)
    updatedEntry.title = title
    updatedEntry.description = description

    DUMMY_ENTRIES[entryIndex] = updatedEntry

    res.status(200).json({entry: updatedEntry})
  }

  const deleteEntry = (req, res, next) => {
    const entryId = req.params.eid
    DUMMY_ENTRIES = DUMMY_ENTRIES.filter(e => e.id != entryId)

    res.status(200).json({message: 'Deleted entry'})
  }
  
  exports.getEntryById = getEntryById
  exports.getEntriesByUserId = getEntriesByUserId
  exports.createEntry = createEntry
  exports.updateEntry = updateEntry;
  exports.deleteEntry = deleteEntry
  