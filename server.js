const express = require("express");
const path = require("path");
const app = express();
const MongoClient = require("mongodb").MongoClient;

const PORT = 3030;
// Middleware
app.use(express.json());

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// MongoDB connection URL (you've to enter your own username and password here that you confirgured during docker run command)
const MONGO_URL = "mongodb://sachin_admin:secret@localhost:27017";

// Create MongoDB client
const client = new MongoClient(MONGO_URL);

// GET all users
app.get("/getUsers", async (req, res) => {
  try {
    await client.connect();

    console.log("Connected successfully to MongoDB");

    const db = client.db("my-sample-db");

    const data = await db.collection("users").find({}).toArray();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// POST new user
app.post("/addUser", async (req, res) => {
  try {
    const userObj = req.body;

    await client.connect();

    console.log("Connected successfully to MongoDB");

    const db = client.db("my-sample-db");

    const data = await db.collection("users").insertOne(userObj);

    console.log(data);

    console.log("Data inserted in DB");

    res.status(201).json({
      message: "User created successfully",
      id: data.insertedId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
