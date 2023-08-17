const { request, response } = require("../app");


const { readTopics, readArticles, readAllArticles, readArticleComments, checkExists, addComment, deleteComment, checkCommentExists, addVotes } = require("../models/models");


const fs = require("fs/promises");

exports.getTopics = (request, response, next) => {
  readTopics().then((topicRows) => {
    response.status(200).send(topicRows);
  });
};

exports.getEndpoints = (request, response, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`, "utf-8").then(
    (fileContents) => {
      response.status(200).send({ endpoints: JSON.parse(fileContents) });
    }
  );
};
exports.getArticles = (request, response, next) => {
  const { article_id } = request.params;
  readArticles(article_id)
    .then((articleObj) => {
      response.status(200).send(articleObj);
    })
    .catch((err) => {
      next(err);
    });
};
exports.getAllArticles = (request, response, next) => {
  readAllArticles().then((allArticles) => {
    response.status(200).send(allArticles);
  });
};

exports.postComment = (request, response, next) => {
  const newComment = request.body;
  const { article_id } = request.params;
  addComment(newComment, article_id)
    .then((comment) => {
      response.status(201).send(comment);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params;
  const promises = [checkExists(article_id), readArticleComments(article_id)];
  Promise.all(promises)
    .then((resolvedPromises) => {
      const articles = resolvedPromises[1];
      response.status(200).send(articles);
    })
    .catch((err) => {
      next(err);
    });
};


exports.removeComment = (request, response, next) => {
  const { comment_id } = request.params
  const promises = [checkCommentExists(comment_id), deleteComment(comment_id)]
  Promise.all(promises).then((resolvedPromises) => {
    response.status(204).send()
  })
    .catch((err) => {
    next(err)
})
}

exports.updateVotes = (request, response, next) => {
  const votes = request.body;
  const { article_id } = request.params;
  addVotes(article_id, votes)
    .then((article) => {
      response.status(200).send(article);
    })
    .catch((err) => {
      next(err);
    });
};

