const express = require("express");
const { getMatches } = require("../controllers/root.controller");
const rootRouter = express.Router();
rootRouter.get('/na/:sums', getMatches)

module.exports = {
    rootRouter
}