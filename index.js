require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SK);
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k5l2a3d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err)
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}





async function run() {
    try {
        const usersCollection = client.db('carbs').collection('users');
const categoryCollection = client.db('carbs').collection('category');
const productsCollection = client.db('carbs').collection('products');
const bookingsCollection = client.db('carbs').collection('bookings');
const paymentsCollection = client.db('carbs').collection('payments')
        app.get('/users', async (req, res) => {
            let query = {}
            if (req.query.role) {
                query = {
                    role: req.query.role
                }
            };
            const cursor = usersCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        app.get('/users/seller', async(req, res) => {
            const result = await usersCollection.find({role: 'seller'}).toArray()
            res.send(result)
        })
        app.get('/users/buyer', async(req, res) => {
            const result = await usersCollection.find({role: 'buyer'}).toArray()
            res.send(result)
        })
        app.get('/users/seller/:email', async(req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = {email};
            const user = await usersCollection.findOne(query)
            res.send({isSeller: user?.role === 'seller'});
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

      

        app.get('/category', async (req, res) => {
            const query = {};
            const result = await categoryCollection.find(query).toArray();
            res.send(result)
        })
        app.post('/products', async (req, res) => {
            const product = req.body;
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

        app.get("/products/myproducts", async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const products = await productsCollection.find(query).toArray();
            console.log(products)
            res.send(products);
        })



        app.put('/products/advertise/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    isAdvertised : true
                },
            };
            const options = {upsert: true};
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        app.get('/advertiseproducts', async (req, res) => {
            const query = { isAdvertised: true };
            const advertiseproducts = await productsCollection.find(query).toArray();
            res.send(advertiseproducts);
        });

        app.put('/products/verifySeller/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email};
            const updatedDoc = {
                $set: {
                    verify: 'verified'
                },
            };
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            const products = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email  };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '20d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });
        

        app.get('/category/:id', async (req, res) => {
            let query = {};
            if (req.params.id)
                query = {
                    categoryId: req.params.id,
                };
            const cursor = await productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/bookings/:id',  async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })
        // app.post('/bookings', async (req, res) => {
        //     const booking = req.body;
        //     const query = {
        //         productName: booking.productName,
        //         email: booking.email,
        //         userName: booking.userName
        //     }

        //     const booked = await bookingsCollection.find(query).toArray();

        //     if (booked.length) {
        //         const message = `You have already ordered ${order.productName}`;
        //         return res.send({ acknowledged: false, message });
        //     }
        //     const result = await bookingsCollection.insertOne(order);
        //     res.send(result);
        // });
        
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: email };
            const booking = await bookingsCollection.find(query).toArray();
            console.log(booking)
            res.send(booking);
        });
        
        app.post('/bookings', verifyJWT, async (req, res) => {
            const booking = req.body;
            console.log(booking)
            const result = await bookingsCollection.insertOne(booking);
            console.log(result)
            res.send(result);
        });
       
        // app.get("/products/bookings", verifyJWT, async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email };
        //     const bookings = await bookingsCollection.find(query).toArray();
        //     res.send(bookings);
        // })

       
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.delete('/users/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })
        app.delete('/users/buyer/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })
        app.delete('/product/:id',verifyJWT,  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.log())


app.get('/', async (req, res) => {
    res.send('CARBS SERVER IS RUNNING');
})
app.listen(port, () => console.log(`CARBS SERVER RUNNING ON ${port}}`));