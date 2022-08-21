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

        app.get('/service', async (req, res) => {
            const result = await serviceCollection.find().toArray()
            res.send(result)
        })
        app.get('/service/:id', verifyJWT, async (req, res) => {
          const id = req.params.id
          const decoded = req. decoded;
          const query = {_id: ObjectId(id)}
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })
        app.get('/order', async (req, res) => {
          const result = await orderCollection.find().toArray()
          res.send(result)
        })

        app.post('/order', async (req, res) => {
          const service = req.body
          const result = await orderCollection.insertOne(service)
          res.send(result)
        })
        app.post('/login/:id', async (req, res) => {
          const id = req.params.id
          const email = req.body.email
          const token = jwt.sign({ email }, process.env.Private_key, { expiresIn: '1h' });
          res.send({token})
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