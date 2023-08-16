const express = require("express");
const { getTopics, getEndpoints, getArticles, getAllArticles, postComment} = require("./controllers/controllers");

const app = express();

app.use(express.json())

app.get("/api/topics", getTopics);

app.get('/api', getEndpoints)

app.get("/api/articles/:article_id", getArticles);

app.get("/api/articles", getAllArticles)

app.post("/api/articles/:article_id/comments", postComment)

app.use((_, response) => {
  response.status(404).send({msg:"Path not found"})
})

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Not a valid input" });
  }
  if (err.code === "23503") {
    response.status(404).send({ msg: "Not Found" });
  }
  if (err.code === "23502") {
    response.status(400).send({ msg: "Bad request" });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({msg:err.msg})
  }
})
  
app.use((err, request, response, next) => {
  response.status(500).send({ msg: "err" });
});


module.exports = app;