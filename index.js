const express = require('express');
const cors = require('cors');
const app= express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.USER_SEC}:${process.env.USER_PASS}@cluster0.wkiarbk.mongodb.net/?retryWrites=true&w=majority`;

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


    const toysCollection = client.db('carToys').collection('toys')
    const bookingCollection = client.db('carToys').collection('booking')

    app.get('/toys',async(req,res)=>{
      const cursor = toysCollection.find()
      const result =await cursor.toArray()
      res.send(result);
    })

    //get the specific card by id 

    app.get('/viewDetailsCard/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result= await toysCollection.find(query).toArray();
      res.send(result)
    })

    // Searcing Toys by Name 

    app.get('/searceToyByName/:text',async(req,res)=>{
      const searceText = req.params.text;
      console.log(searceText);
      if (searceText == "BusToys" || searceText == "TruckToys" || searceText == "BikeToys") {
        const result = await toysCollection.find({subcategory:searceText}).toArray();
        return res.send(result)
        
      }
      const result = await toysCollection.find().toArray();
      res.send(result);
    })
// Add specific Toy 

    app.post('/addToy',async(req,res)=>{
      
     const body = req.body;
     if (!body) {
      return res.status(404).send({message:"data not found"})
     }
      const result = await bookingCollection.insertOne(body);
      res.send(result);

    })
  
    // get all booking Toys 

    app.get('/getToy',async(req,res)=>{
      const data = bookingCollection.find().limit(20)
      const result = await data.toArray();
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("volunteer server is running ontime ")
})

app.listen(port ,()=>{
    console.log(`volunteer server is port Number ${port}`);
})