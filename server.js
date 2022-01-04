const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const HttpError = require("./models/http-error")


const app = express()
app.use(cors())
app.use(bodyParser.json())

const entryRoutes = require("./routes/entry-routes")
const userRoutes = require("./routes/user-routes")
const categoryRoutes = require("./routes/category-routes")

app.use("/api/v1/entry", entryRoutes)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/category", categoryRoutes)

app.use((req, res, next) => {
    throw new HttpError('Could not find this route', 404)
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'})
})

module.exports = app