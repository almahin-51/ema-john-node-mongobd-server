const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrtib.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        
        const database = client.db('ema_john_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        // GET products API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            console.log(req.query);
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        });

        // use post to data by key 
        app.post('/products/bykeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        // Add order API to database 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir)

// middleware 
app.use(cors());
app.use(express.json());

// GET API 
app.get('/', (req, res) => {
    res.send('ema-john server is running now');
});

app.listen(port, () => {
    console.log('server runnign as port ', port);
});