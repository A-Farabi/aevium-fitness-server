const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mrtaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const database = client.db("Aevium_DB");
    const trainerCollection = database.collection("allTrainers");
    const classesCollection = database.collection("allClasses");
    const newsletterCollection = database.collection("newsletter");
    const usersCollection = database.collection("usersCollection");
    // General Apis ................................... General Apis

    app.get("/trainers", async (req, res) => {
      const result = await trainerCollection.find().toArray();
      res.send(result);
    });

    app.get("/trainers/:id", async (req, res) => {
      const id = req.params.id;

      // Validate ObjectId first
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid trainer id" });
      }

      try {
        const trainer = await trainerCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!trainer) {
          return res.status(404).send({ message: "Trainer not found" });
        }
        res.send(trainer);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.get("/all-classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    // General Apis ................................... General Apis

    // Admin Api ************************************* Admin Api
    app.post("/newsletter", async (req, res) => {
      const data = req.body;
      const result = await newsletterCollection.insertOne(data);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userInfo = req.body;
      const filter = { email: userInfo.email };
      const updateDoc = {
        $set: {
          email: userInfo.email,
          role: userInfo.role || "user",
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

// Update user profile by email
app.patch("/users/:email", async (req, res) => {
  const email = req.params.email;
  const { name, image } = req.body;

  try {
    const filter = { email: email };
    const updateDoc = {
      $set: {
        name: name,
        image: image,
      },
    };

    const result = await usersCollection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: "User not found or no changes" });
    }

    res.send({ message: "User updated successfully", result });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ message: "Server error" });
  }
});


    app.get('/users', async(req, res)=>{
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      try {
        const user = await usersCollection.findOne({ email: email });
        if (!user) {
          res.status(404).send({ message: "user not found" });
        }
        res.send(user)
      } catch (error) {
        console.log("error in fetching user by email:", error);
        res.status(500).send({ message: "server error" });
      }
    });
    // Admin Api *************************************** Admin Api
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
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on PORT: ${port}`);
});
