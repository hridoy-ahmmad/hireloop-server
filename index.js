const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
require('dotenv').config()
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        const database = client.db('hireloop_db');
        const JobsCollection = database.collection('jobs');
        const companiesCollection = database.collection('companies')

        app.post('/api/jobs', async (req, res) => {
            const data = req.body
            const result = await JobsCollection.insertOne(data)
            res.send(result)
        })
        app.post('/api/companies', async (req, res) => {
            const data = req.body
            console.log(data);
            const result = await companiesCollection.insertOne(data)
            res.send(result)
        })
        app.get('/api/jobs', async (req, res) => {
            const query = {}
            if (req.query.companyId) {
                query.companyId = req.query.companyId
            }
            if (req.query.status) {
                query.status = req.query.status
            }
            const result = await JobsCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/api/companies', async (req, res) => {
            try {
                const companies = await companiesCollection.find().toArray();
                res.status(200).send(companies);
            } catch (error) {
                console.error(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed to fetch companies'
                });
            }
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})