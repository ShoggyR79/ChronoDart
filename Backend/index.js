const express = require("express");
const mongoose = require("mongoose");

require('dotenv').config()
// Set up default mongoose connection
const mongoDB = process.env.MONGO_DB_URL;
// Get the default connection


const app = express()
const cors = require('cors');
const { rootRouter } = require("./routers/root.router");
const { config } = require("dotenv");

app.use(cors());
app.use(express.json())

app.use("/api/v1", rootRouter)

const port = 3000;
app.listen(port, async () => {
    await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    
    console.log(`Connected with mongoDB`);

    console.log(`App listening on port ${port}`)
})
