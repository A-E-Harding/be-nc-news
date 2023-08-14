const express = require("express");
const { getTopics } = require("./controllers/controllers");

const app = express();

app.get("/api/topics", getTopics);

module.exports = app;

app.use((err, request, response, next) => {
  response.status(500).send({ msg: "err" });
});
