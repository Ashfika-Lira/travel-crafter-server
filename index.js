const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.swu9d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travel');
        const tourCollection = database.collection('services');
        const ordersCollection = database.collection('orders');

        // POST Method
        app.get('/services', async (req, res) => {
            console.log('hit the post api');
			const doc = req.body;
            const result = await tourCollection.insertOne(doc);
            res.send(result);
        });

        // UPDATE ORDER OR INSERT ORDER
        app.put('/orders', async (req, res) => {
            const orderDetail = req.body;
            const filter = { email: orderDetail.email };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    address: orderDetail.address,
                    from: orderDetail.from,
                    order: orderDetail.order,
                    phone: orderDetail.phone,
                    name: orderDetail.name,
                    status: orderDetail.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        });

        // get method
        app.get('/services', async (req, res) => {
            const cursor = tourCollection.find({});
            const allTours = await cursor.toArray();
            res.json(allTours);
        });

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //single get method
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const result = await tourCollection.findOne(query);
            res.json(result);
        })

        //post method for get orders by ID
        app.post('/orders', async (req, res) => {
            const mail = req.body;
            const query = { email: {$in: mail} };
            const orders = await orderCollection.find(query).toArray();
            res.json(orders);
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

// app.get('/', (req, res) => {
    // res.send('Running Travel Server');
// });

// app.listen(port, () => {
    // console.log('Running Travel Server on port:', port);
// })