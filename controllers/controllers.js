const { request, response } = require("../app");
const { readTopics, readArticles, readAllArticles, readArticleComments, checkExists } = require("../models/models");
const fs = require("fs/promises");

exports.getTopics = (request, response, next) => {
  readTopics().then((topicRows) => {
    response.status(200).send(topicRows);
  });
};

exports.getEndpoints = (request, response, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`, "utf-8").then(
      (fileContents) => {
      response.status(200).send({endpoints:JSON.parse(fileContents)});
    }
  );
};
exports.getArticles = (request, response, next) => {
    const { article_id } = request.params
    readArticles(article_id).then((articleObj) => {
        response.status(200).send(articleObj)
    })
        .catch((err) => {
        next(err)
    })
}
exports.getAllArticles = (request, response, next) => {
  readAllArticles().then((allArticles) => {
    response.status(200).send(allArticles)
  })
}

// exports.getArticleComments = (request, response, next) => {
//   const { article_id } = request.params
//   readArticleComments(article_id).then((commentArr) => {
//     if (!commentArr.length) {
//       return Promise.reject({status:404, msg:'404 Not Found'})
//     }
//     response.status(200).send(commentArr)
//   })
//   .catch((err) => {
//     next(err)
// })
// }

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params
  const promises = [checkExists(article_id), readArticleComments(article_id)]
  Promise.all(promises).then((resolvedPromises) => {
    const articles = resolvedPromises[1]
    response.status(200).send(articles)
  })
    .catch((err) => {
    next(err)
  })
}




