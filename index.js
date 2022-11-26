const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k5l2a3d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const usersCollection = client.db('crabs').collection('user');
const categoryCollection = client.db('carbs').collection('category');
const productsCollection = client.db('carbs').collection('products');
const bookingsCollection = client.db('doctorsPortal').collection('bookings');





app.post('/users', async(req, res) => {
    const userInfo = req.body;
    const user = await usersCollection.findOne(userInfo)
    if(user){
        res.send(userInfo)
    }
    const result = await usersCollection.insertOne(userInfo)
    res.send(result)
})
app.get('/category', async(req, res) => {
    const query = {};
    const result = await categoryCollection.find(query).toArray();
    res.send(result)
})
app.post('/products',  async (req, res) => {
    const product = req.body;
    console.log(product)
    const result = await productsCollection.insertOne(product);
    res.send(result);
});
app.get("/products", async (req, res) => {
    let query = {};
    if (req.query.id)
      query = {
        categoryId: req.query.id,
      };
    const cursor = productsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
});

app.get('/category/:id', async(req, res) => {
    let query = {};
    if (req.params.id)
    query = {
      categoryId: req.params.id,
    };
    const cursor = await productsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
})
app.post('/bookings', async (req, res) => {
    const booking = req.body;
    const result = await bookingsCollection.insertOne(booking);
    res.send(result);
});

app.get('/', async (req, res) => {
    res.send('CARBS SERVER IS RUNNING');
})
app.listen(port, () => console.log(`CARBS SERVER RUNNING ON ${port}}`));