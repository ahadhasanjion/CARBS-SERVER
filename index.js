const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${DB_PASSWORD}@cluster0.k5l2a3d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const usersCollection = client.db('crabs').collection('user');


app.post('/users', async(req, res) => {
    const userInfo = req.body;
    const user = await usersCollection.findOne(userInfo)
    if(user){
        res.send(userInfo)
    }
    const result = await usersCollection.insertOne(userInfo)
    res.send(result)
})





app.get('/', async (req, res) => {
    res.send('CARBS SERVER IS RUNNING');
})
app.listen(port, () => console.log(`CARBS SERVER RUNNING ON ${port}}`));