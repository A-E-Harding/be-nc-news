const express = require("express");
const { getTopics, getEndpoints } = require("./controllers/controllers");

const app = express();

app.get("/api/topics", getTopics);

app.get('/api', getEndpoints)




module.exports = app;

app.use((err, request, response, next) => {
  response.status(500).send({ msg: "err" });
});


