const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// app.use(cors())
// app.use(express.json())

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

console.log(process.env.USER_SEC);

const uri = `mongodb+srv://${process.env.USER_SEC}:${process.env.USER_PASS}@cluster0.wkiarbk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db("carToys").collection("toys");
    const bookingCollection = client.db("carToys").collection("booking");
    const blogCollection = client.db("carToys").collection("blog");
    const reviewCollection = client.db("carToys").collection("review");

    const indexKey = { category: 1 };
    const indexOption = { name: "searceByName" };

    const result = await bookingCollection.createIndex(indexKey, indexOption);

    app.get("/toySearceByName/:name", async (req, res) => {
      const searceText = req.params.name;
      const result = await bookingCollection
        .find({ category: { $regex: searceText, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get the specific card by id

    app.get("/viewDetailsCard/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      if (result) {
        console.log("data found");
      } else {
        console.log("not found");
      }
      res.send(result);
    });

    // Searcing Toys by category
    app.get("/searceToyByName/:text", async (req, res) => {
      const searceText = req.params.text;
      console.log(searceText);
      if (
        searceText == "bus" ||
        searceText == "Trucks" ||
        searceText == "Bikes"
      ) {
        const result = await toysCollection
          .find({ subcategory: searceText })
          .toArray();
        return res.send(result);
      }
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    // Add specific Toy
    app.post("/addToy", async (req, res) => {
      const body = req.body;
      if (!body) {
        return res.status(404).send({ message: "data not found" });
      }
      const result = await bookingCollection.insertOne(body);
      res.send(result);
    });

    // get all booking Toys

    app.get("/getToy", async (req, res) => {
      const data = toysCollection.find().limit(20);
      const result = await data.toArray();
      res.send(result);
    });

    app.get("/myToys/:name", async (req, res) => {
      const searceText = req.params.name;
      // console.log(searceText);
      const cursor = bookingCollection.find({ name: searceText });
      const result = await cursor.toArray();
      res.send(result);
    });

    // my toys sorting
    app.get("/myToysSorting", async (req, res) => {
      const sort = req.query.sort;
      const options = {
        sort: {
          price: sort == "asc" ? 1 : -1,
        },
      };

      // const cursor = bookingCollection.find(query,options).collation({ locale: "en_US", numericOrdering: true })
      const cursor = bookingCollection.find(options);
      const result = await cursor.toArray();
      res.send(result);
    });

    //Delete specific toy

    app.delete("/bookingsToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    //update toy

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      console.log("154", id);
      const filter = { _id: new ObjectId(id) };
      const updateToy = req.body;
      console.log(updateToy);

      console.log(updateToy);
      const updatedDoc = {
        $set: {
          price: updateToy.price,
          quantity: updateToy.quantity,
          description: updateToy.description,
        },
      };

      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Add blog Toy
    app.post("/blog", async (req, res) => {
      const body = req.body;
      console.log({ body });
      if (!body) {
        return res.status(404).send({ message: "blog not found" });
      }
      const result = await blogCollection.insertOne(body);
      res.send(result);
    });
    // get blog Toy
    app.get("/blog", async (req, res) => {
      const data = blogCollection.find().limit(20);
      const result = await data.toArray();
      res.send(result);
    });
    // Add customer review
    app.post("/customerReview", async (req, res) => {
      const body = req.body;
      console.log({ body });
      if (!body) {
        return res.status(404).send({ message: "blog not found" });
      }
      const result = await reviewCollection.insertOne(body);
      res.send(result);
    });
    // get blog Toy
    app.get("/customerReview", async (req, res) => {
      const data = reviewCollection.find().limit(20);
      const result = await data.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("volunteer server is running ontime ");
});

app.listen(port, () => {
  console.log(`volunteer server is port Number ${port}`);
});
