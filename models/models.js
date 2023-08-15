const db = require("../db/connection");
const format = require("pg-format");

exports.readTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

exports.readArticles = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id=$1;`, [article_id])
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({ status: 404, msg: "Input not found" });
      }
      return article;
    });
};


exports.readAllArticles = () => {
  return db.query('SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM ARTICLES LEFT JOIN comments ON comments.article_id = articles.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC').then(({ rows }) => {
    return rows
  })

}
exports.readArticleComments = (article_id) => {
  return db.query(`SELECT * FROM comments WHERE article_id=$1 ORDER BY comments.created_at DESC`, [article_id]).then(({ rows }) => {
    return rows
  })
}