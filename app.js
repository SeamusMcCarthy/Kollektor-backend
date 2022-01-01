const express = require("express")
const bodyParser = require("body-parser")
const HttpError = require("./models/http-error")

const app = express()
app.use(bodyParser.json())

const entryRoutes = require("./routes/entry-routes")
const userRoutes = require("./routes/user-routes")
const categoryRoutes = require("./routes/category-routes")

app.use("/api/entry", entryRoutes)
app.use("/api/user", userRoutes)
app.use("/api/category", categoryRoutes)
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

app.listen(5000)