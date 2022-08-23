const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.drcn6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     const serviceCollection = client.db("Shakira_Parlour").collection("services");
//     // perform actions on the collection object
//     app.get('/service', async (req, res) => {
//         const result = await serviceCollection.find().toArray()
//         res.send(result)
//     })
//     // client.close();
//   });

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization
  if(!authHeader){
    return res.status(401).send({message: 'Unauthorized'})
  }
  const token = authHeader.split(" ")[1]
  jwt.verify(token, process.env.Private_key, function(err, decoded){
    if(err){
      return res.status(403).send({message: "Forbidden"})
    }
    if(decoded){
      req.decoded = decoded
      next()
    }
  })
}

async function run(){
    // await client.connect(
    try{
        const serviceCollection = client.db("Shakira_Parlour").collection("services");
        const orderCollection = client.db("Shakira_Parlour").collection("orders");
        const userCollection = client.db("Shakira_Parlour").collection("users");

        app.get('/service', async (req, res) => {
            const result = await serviceCollection.find().toArray()
            res.send(result)
        })
        app.get('/service/:id', verifyJWT, async (req, res) => {
          const id = req.params.id
          const query = {_id: ObjectId(id)}
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })
        app.get('/serviceOnly', async (req, res) => {
          const result = await serviceCollection.find().project({name: 1}).toArray()
          res.send(result)
        })
        app.get('/order', verifyJWT, async (req, res) => {
          const result = await orderCollection.find().toArray()
          res.send(result)
        })
        app.get('/admin', async (req, res) => {
          const email = req.query.email
          const result = await userCollection.findOne({email})
          const admin = result?.role === 'admin'
          res.json(admin)
        })
        app.get('/bookingList', async (req, res) => {
          const email = req.query.email
          const result = await orderCollection.find({email}).toArray()
          res.send(result)
        })

        app.post('/order', async (req, res) => {
          const service = req.body
          const result = await orderCollection.insertOne(service)
          res.send(result)
        })
        app.post('/addService', async (req, res) => {
          const data = req.body
          const result = await serviceCollection.insertOne(data)
          res.send(result)
        })
        
        app.put('/login/:email', async (req, res) => {
          const email = req.params.email
          const data = req.body
          const filter = {email}
          const options = {upsert: true}
          const updateDoc = {
            $set: data
          }
          const result = await userCollection.updateOne(filter,updateDoc, options)

          const token = await jwt.sign({ email }, process.env.Private_key, { expiresIn: '1h' });
          res.send({token, result})
        })

        app.patch('/makeAdmin', async (req, res) => {
          const email = req.body.email
          const filter = {email: email}
          const updateDoc = {
            $set: {
              role: 'admin'
            }
          }
          const result = await userCollection.updateOne(filter, updateDoc)
          console.log(result)
          res.send(result)
        })
    }finally{
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})