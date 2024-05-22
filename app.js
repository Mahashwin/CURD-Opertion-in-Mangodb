const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router); // Use the router for all routes

const mongoUrl = "mongodb+srv://Mahashwin:Mahashwin5522@mahashwin.esqtx8s.mongodb.net/";
const dbName = "formdata";
let db;

MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);
    });

// Define routes using router
router.get("/", (req, res) => {
    res.sendFile(__dirname + "/form.html");
});

// Route for inserting data
router.post("/insert", async (req, res) => {
    const { name, email, confirmPassword, age, phone, gender, country } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        await db.collection("items").insertOne({ name, email, confirmPassword, age, phone, gender, country });
        res.redirect("/");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Route for updating data
router.post("/update", async (req, res) => {
    const names = req.body.name;
    const number = req.body.phone;
    db.collection("items").updateOne({ name: names }, { $set: { phone: number } }, function(err, result) {
        if (err) throw err;
        console.log("1 document updated");
    });
    res.redirect("/");
});

router.get("/update", async (req, res) => {
    res.sendFile(__dirname + "/update.html");
});

// Route for deleting data
router.post("/delete", async (req, res) => {
    const names = req.body.name;
    db.collection("items").deleteOne({ name: names }, function(err, result) {
        if (err) throw err;
        console.log("1 document deleted");
    });
    res.redirect("/");
});

router.get("/delete", async (req, res) => {
    res.sendFile(__dirname + "/delete.html");
});

// Route for generating report
router.get("/report", async (req, res) => {
    try {
        const items = await db.collection("items").find().toArray();
        let tableContent = "<h1>Report</h1><table border='1'><tr><th>Name</th><th>Email</th><th>Age</th><th>Number</th><th>Gender</th><th>Country</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.name}</td><td>${item.email}</td><td>${item.age}</td><td>${item.phone}</td><td>${item.gender}</td><td>${item.country}</td></tr>`).join("");
        tableContent += "</table><a href='/'>Back to form</a>";
        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
