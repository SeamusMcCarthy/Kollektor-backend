const { MongoClient } = require("mongodb");
const url = 'mongodb+srv://kollektor-user:witfyp-ko@cluster0.llhnv.mongodb.net/kollektor?retryWrites=true&w=majority';


const create = async (req, res, next) => {
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    };
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db();
        const result = await db.collection("users").insertOne(newUser);
    } catch (error) {
        return res.json({message: "Could not save data"});
    }
    client.close();
    res.json({newUser});
}

const get = async (req, res, next) => {
    const client = new MongoClient(url)
    let users
    try {
        await client.connect()
        const db = client.db()
        users = await db.collection("users").find().toArray();
    } catch (error) {
        return res.json({message: "Could not retrieve data"})
    }
    client.close()
    res.json(users)
}
exports.create = create
exports.get = get