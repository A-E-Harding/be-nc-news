const express = require("express");
const { getTopics, getArticles } = require("./controllers/controllers");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticles);

module.exports = app;

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Not a valid input" });
  }
  next(err);
});

app.use((err, request, response, next) => {
    response.status(404).send({ msg: "Input not found" });
    next(err)
});
  
app.use((err, request, response, next) => {
  response.status(500).send({ msg: "err" });
});
