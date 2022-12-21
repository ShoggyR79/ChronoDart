

const express = require("express");

const app = express()
const cors = require('cors');
const { rootRouter } = require("./routers/root.router");

app.use(cors());
app.use(express.json())

app.use("/api/v1", rootRouter)

const port = 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})