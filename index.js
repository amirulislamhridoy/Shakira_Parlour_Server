const express = require('express')
const app = express()
const port = process.env.PORT || 5000
var cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://Shakira_Parlour:32202910@cluster0.drcn6.mongodb.net/?retryWrites=true&w=majority";
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

async function run(){
    // await client.connect(
    try{
        const serviceCollection = client.db("Shakira_Parlour").collection("services");

        app.get('/service', async (req, res) => {
            const result = await serviceCollection.find().toArray()
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