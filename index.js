const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k5l2a3d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


const usersCollection = client.db('carbs').collection('users');
const categoryCollection = client.db('carbs').collection('category');
const productsCollection = client.db('carbs').collection('products');
const bookingsCollection = client.db('carbs').collection('bookings');
const paymentsCollection = client.db('carbs').collection('payments')


async function run(){
    try{
        app.post('/users', async(req, res) => {
            const user = req.body;    
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        app.get('/users/seller/:role', async (req, res) => {
            const role = req.params.role;
            let query = {role:role }
            const user = await usersCollection.find(query).toArray();
            res.send(user);
          
        });
        app.get('/users/buyer/:role', async (req, res) => {
            const role = req.params.role;
            let query = {role:role }
            const user = await usersCollection.find(query).toArray();
            res.send(user);
          
        });
        // app.get('/users/seller/:role', async (req, res) => {
        //     const role = req.params.role;
        //     console.log(role)
        //     let query = {role:role }
        //     if(role === "seller"){
        //         const user = await usersCollection.find(query).toArray();
        //         res.send(user);
        //     }
        //     else{
        //         const user = await usersCollection.find({}).toArray();
        //         res.send(user); 
        //     }
        // });
        // app.get('/users/buyer/:role', async (req, res) => {
        //     const role = req.params.role;
        //     console.log(role)
        //     let query = {role:role }
        //     if(role === "buyer"){
        //         const user = await usersCollection.find(query).toArray();
        //         res.send(user);
        //     }
        //     else{
        //         const user = await usersCollection.find({}).toArray();
        //         res.send(user); 
        //     }
        // });






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

        app.get("/products/myproducts", async(req, res) => {
            const email = req.query.email;
            const query = {email};
            console.log(query)
            const products = await productsCollection.find(query).toArray();
            console.log(products)
            res.send(products);
        })












        
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });
        // app.put('/users/admin/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     }
        //     const result = await usersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // });
        
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
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })
        // app.get('/users/admin/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email }
        //     const user = await usersCollection.findOne(query);
        //     res.send({ isAdmin: user?.role === 'admin' });
        // })
        // app.post('/create-payment-intent', async (req, res) => {
        //     const booking = req.body;
        //     const price = booking.price;
        //     const amount = price;
        
        //     const paymentIntent = await stripe.paymentIntents.create({
        //         currency: 'usd',
        //         amount: amount,
        //         "payment_method_types": [
        //             "card"
        //         ]
        //     });
        //     res.send({
        //         clientSecret: paymentIntent.client_secret,
        //     });
        // });
        // app.post('/payments', async (req, res) =>{
        //     const payment = req.body;
        //     const result = await paymentsCollection.insertOne(payment);
        //     const id = payment.bookingId
        //     const filter = {_id: ObjectId(id)}
        //     const updatedDoc = {
        //         $set: {
        //             paid: true,
        //             transactionId: payment.transactionId
        //         }
        //     }
        //     const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
        //     res.send(result);
        // })
    }
    finally{

    }
}
run().catch(console.log())

// app.post('/users', async(req, res) => {
//     const user = req.body;    
//     const result = await usersCollection.insertOne(userInfo)
//     res.send(result)
// })
// app.get('/users', async (req, res) => {
//     const query = {};
//     const users = await usersCollection.find(query).toArray();
//     res.send(users);
// });
// app.get('/users/admin/:email', async (req, res) => {
//     const email = req.params.email;
//     const query = { email }
//     const user = await usersCollection.findOne(query);
//     res.send({ isAdmin: user?.role === 'admin' });
// })
// app.put('/users/admin/:id', async (req, res) => {
//     const id = req.params.id;
//     const filter = { _id: ObjectId(id) }
//     const options = { upsert: true };
//     const updatedDoc = {
//         $set: {
//             role: 'admin'
//         }
//     }
//     const result = await usersCollection.updateOne(filter, updatedDoc, options);
//     res.send(result);
// });
// app.get('/category', async(req, res) => {
//     const query = {};
//     const result = await categoryCollection.find(query).toArray();
//     res.send(result)
// })
// app.post('/products',  async (req, res) => {
//     const product = req.body;
//     console.log(product)
//     const result = await productsCollection.insertOne(product);
//     res.send(result);
// });
// app.get("/products", async (req, res) => {
//     let query = {};
//     if (req.query.id)
//       query = {
//         categoryId: req.query.id,
//       };
//     const cursor = productsCollection.find(query);
//     const result = await cursor.toArray();
//     res.send(result);
// });


// app.get('/jwt', async (req, res) => {
//     const email = req.query.email;
//     const query = { email: email };
//     const user = await usersCollection.findOne(query);
//     if (user) {
//         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
//         return res.send({ accessToken: token });
//     }
//     res.status(403).send({ accessToken: '' })
// });
// app.put('/users/admin/:id', async (req, res) => {
//     const id = req.params.id;
//     const filter = { _id: ObjectId(id) }
//     const options = { upsert: true };
//     const updatedDoc = {
//         $set: {
//             role: 'admin'
//         }
//     }
//     const result = await usersCollection.updateOne(filter, updatedDoc, options);
//     res.send(result);
// });

// app.get('/category/:id', async(req, res) => {
//     let query = {};
//     if (req.params.id)
//     query = {
//       categoryId: req.params.id,
//     };
//     const cursor = await productsCollection.find(query);
//     const result = await cursor.toArray();
//     res.send(result)
// })


// app.post('/bookings', async (req, res) => {
//     const booking = req.body;
//     const result = await bookingsCollection.insertOne(booking);
//     res.send(result);
// });
// app.get('/users/admin/:email', async (req, res) => {
//     const email = req.params.email;
//     const query = { email }
//     const user = await usersCollection.findOne(query);
//     res.send({ isAdmin: user?.role === 'admin' });
// })
// app.post('/create-payment-intent', async (req, res) => {
//     const booking = req.body;
//     const price = booking.price;
//     const amount = price;

//     const paymentIntent = await stripe.paymentIntents.create({
//         currency: 'usd',
//         amount: amount,
//         "payment_method_types": [
//             "card"
//         ]
//     });
//     res.send({
//         clientSecret: paymentIntent.client_secret,
//     });
// });
// app.post('/payments', async (req, res) =>{
//     const payment = req.body;
//     const result = await paymentsCollection.insertOne(payment);
//     const id = payment.bookingId
//     const filter = {_id: ObjectId(id)}
//     const updatedDoc = {
//         $set: {
//             paid: true,
//             transactionId: payment.transactionId
//         }
//     }
//     const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
//     res.send(result);
// })
app.get('/', async (req, res) => {
    res.send('CARBS SERVER IS RUNNING');
})
app.listen(port, () => console.log(`CARBS SERVER RUNNING ON ${port}}`));