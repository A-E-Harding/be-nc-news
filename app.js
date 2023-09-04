const express = require("express");
const cors = require('cors');

const { getTopics, getEndpoints, getArticles, getAllArticles, getArticleComments, postComment, removeComment, updateVotes, getAllUsers } = require("./controllers/controllers");



const app = express();
app.use(cors());

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticles);

app.get("/api/articles", getAllArticles)

app.post("/api/articles/:article_id/comments", postComment)

app.get("/api/articles/:article_id/comments", getArticleComments);

app.delete('/api/comments/:comment_id', removeComment)

app.patch("/api/articles/:article_id", updateVotes);

app.get('/api/users', getAllUsers)

app.use((_, response) => {
  response.status(404).send({ msg: "Path not found" });
});

app.use((err, request, response, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    response.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23503") {
    response.status(404).send({ msg: "Not Found" });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  }
});

app.use((err, request, response, next) => {
  response.status(500).send({ msg: "err" });
});

module.exports = app;
