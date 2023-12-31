const db = require("../db/connection");
const format = require("pg-format");

exports.readTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

exports.readArticles = (article_id) => {
  return db
    .query(`SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM ARTICLES LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id=$1 GROUP BY articles.article_id ORDER BY articles.created_at DESC`, [article_id])
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({ status: 404, msg: "Input not found" });
      }
      return article;
    });
};

exports.readAllArticles = (topic, sort_by = 'created_at', order = "desc") => {
  const queryValues = [];
  const acceptedProperties = ['title', 'topic', 'author', 'body', 'created_at', 'votes', 'comment_count'];
  const acceptedOrders = ['asc', 'desc']

  if (!acceptedProperties.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  if (!acceptedOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  let queryStringFirst =
    "SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM ARTICLES LEFT JOIN comments ON comments.article_id = articles.article_id";

  let queryStringLast;

  if (sort_by === 'comment_count') {
    queryStringLast = `GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;
  }
  else {
    queryStringLast = `GROUP BY articles.article_id ORDER BY articles.${sort_by} ${order}`
  }
  if (topic!==undefined) {
    queryStringFirst += ` WHERE topic=$1`;
    queryString = `${queryStringFirst} ${queryStringLast}`
    queryValues.push(topic);
  }
 
  queryString = `${queryStringFirst} ${queryStringLast}`
  return db.query(queryString, queryValues)
    .then(({ rows }) => {
      return rows;
  });
};

exports.checkTopicExists = (topic) => {
  return db
    .query(`SELECT * from topics WHERE slug=$1;`, [topic])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
    });
};

exports.addComment = (newComment, article_id) => {
  const { username, body } = newComment;
  const queryString = format(
    `INSERT INTO comments (author, body, article_id) VALUES %L RETURNING *`,
    [[username, body, article_id]]
  );
  return db.query(queryString).then(({ rows }) => {
    return rows[0];
  });
};

exports.readArticleComments = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id=$1 ORDER BY comments.created_at DESC`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 200,
          msg: "No comments on that article",
        });
      }
      return rows;
    });
};

exports.checkExists = (article_id) => {
  return db
    .query(`SELECT * from articles WHERE article_id=$1;`, [article_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
    });
};

exports.deleteComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id=$1 RETURNING *`, [comment_id])
    .then(({ rows }) => {
      if ((rows[0].comment_id = comment_id)) {
        return rows;
      }
    });
};

exports.checkCommentExists = (comment_id) => {
  return db
    .query(`SELECT * from comments WHERE comment_id=$1;`, [comment_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.fetchAllUsers = () => {
  return db.query("SELECT * FROM users").then(({ rows }) => {
    return rows;
  });
};

exports.addVotes = (article_id, votes) => {
  const { inc_votes } = votes;
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return rows;
    });
};
