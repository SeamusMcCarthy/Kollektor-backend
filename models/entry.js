const mongoose = require("mongoose")

const entrySchema = mongoose.Schema({
    title: {type: String, required: true },
    description: {type: String, required: true },
    category: [
        {
          type: Schema.Types.ObjectId,
          ref: "Category",
          required: true
        },
      ],
    comments: [
        {
            type: String, required: true 
        }
      ],
    user: 
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
    dateAdded: {type: Date, required: true},
    purchaseLocation: {type: String, required: false}    

})

module.exports = mongoose.model("Entry", entrySchema);