const app = require("../app.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const connection = require("../db/connection");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(testData));

afterAll(() => connection.end());

describe("GET /api/topics", () => {
  test("200: array of topic objects returned with slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(3);
        for (const obj of response.body) {
          expect(Object.keys(obj)).toEqual(["slug", "description"]);
        }
      });
  });
});

describe("GET /api", () => {
  test("200: returns all available endpoints and descriptions", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({ endpoints });
      });
  });
});

describe("GET api/articles/:article_id", () => {
  test("200: responds with correct article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("article_id", 1);
        expect(Object.keys(response.body)).toEqual([
          "article_id",
          "title",
          "topic",
          "author",
          "body",
          "created_at",
          "votes",
          "article_img_url",
        ]);
      });
  });
  test("400: passed non number parameter", () => {
    return request(app)
      .get("/api/articles/notNumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: passed id that does not exist", () => {
    return request(app)
      .get("/api/articles/1234")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Input not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with array of all article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(13);
        expect(response.body).toBeSortedBy("created_at", { descending: true });
        const articles = response.body;
        articles.forEach((article) => {
          expect(article).hasOwnProperty("article_id", expect.any(Number));
          expect(article).hasOwnProperty("title", expect.any(String));
          expect(article).hasOwnProperty("topic", expect.any(String));
          expect(article).hasOwnProperty("author", expect.any(String));
          expect(article).hasOwnProperty("created_at", expect.any(String));
          expect(article).hasOwnProperty("votes", expect.any(Number));
          expect(article).hasOwnProperty("article_img_url", expect.any(String));
          expect(article).hasOwnProperty("comment_count", expect.any(Number));
        });
      });
  });
});
describe("ALL /notValidPath", () => {
  test("404: responsds with custom error message when invalid path passed", () => {
    return request(app)
      .get("/api/articlezzz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  const body = {
    username: "butter_bridge",
    body: "A new comment",
  };
  test("201: adds comment to specified article", () => {
    return request(app)
      .post("/api/articles/6/comments")
      .send(body)
      .expect(201)
      .then((response) => {
        expect(response.body).hasOwnProperty("article_id", expect(6));
        expect(response.body).hasOwnProperty("author", expect("butter_bridge"));
        expect(response.body).hasOwnProperty("body", expect("A new comment"));
        expect(response.body).hasOwnProperty("comment_id", expect.any(Number));
        expect(response.body).hasOwnProperty("votes", expect.any(Number));
        expect(response.body).hasOwnProperty("created_at", expect.any(String));
      });
  });
  test("201: ignores extra properties", () => {
    return request(app)
      .post("/api/articles/6/comments")
      .send({
        username: "butter_bridge",
        body: "A new comment",
        extra: "an extra property",
      })
      .expect(201)
      .then((response) => {
        expect(response.body).hasOwnProperty("article_id", expect(6));
        expect(response.body).hasOwnProperty("author", expect("butter_bridge"));
        expect(response.body).hasOwnProperty("body", expect("A new comment"));
        expect(response.body).hasOwnProperty("comment_id", expect.any(Number));
        expect(response.body).hasOwnProperty("votes", expect.any(Number));
        expect(response.body).hasOwnProperty("created_at", expect.any(String));
      });
  });
  test("404: passed non-existant articleID", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send(body)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found");
      });
  });
  test("400: passed incomplete body", () => {
    return request(app)
      .post("/api/articles/6/comments")
      .send({
        username: "butter_bridge",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("400: passed invalid ID", () => {
    return request(app)
      .post("/api/articles/notANumber/comments")
      .send(body)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("404: username does not exist", () => {
    return request(app)
      .post("/api/articles/6/comments")
      .send({
        username: "not_A_User",
        body: "A new comment",
      })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found");
      });
  });

  describe("GET /api/articles/:article_id/comments", () => {
    test("200: returns array of comment objects for given article_id, in date order", () => {
      return request(app)
        .get("/api/articles/5/comments")
        .expect(200)
        .then((response) => {
          const comments = response.body;
          expect(comments.length).toBe(2);
          expect(comments).toBeSortedBy("created_at", { descending: true });
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id", expect.any(Number));
            expect(comment).toHaveProperty("votes", expect.any(Number));
            expect(comment).toHaveProperty("author", expect.any(String));
            expect(comment).toHaveProperty("created_at", expect.any(String));
            expect(comment).toHaveProperty("body", expect.any(String));
            expect(comment).toHaveProperty("article_id", expect.any(Number));
          });
        });
    });
    test("200: article has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.msg).toBe("No comments on that article");
        });
    });
    test("400: passed non number parameter", () => {
      return request(app)
        .get("/api/articles/notNumber/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("404: passed articleID that does not exist", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual("Article not found");
        });
    });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: updates article votes for passed article_id and returns updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
        const article = response.body[0];
        expect(article).toHaveProperty("article_id", expect.any(Number));
        expect(article).toHaveProperty("title", expect.any(String));
        expect(article).toHaveProperty("topic", expect.any(String));
        expect(article).toHaveProperty("author", expect.any(String));
        expect(article).toHaveProperty("created_at", expect.any(String));
        expect(article).toHaveProperty("votes");
        expect(article.votes).toBe(101);
        expect(article).toHaveProperty("article_img_url", expect.any(String));
      });
  });
  test("200: also works to decrement votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -101 })
      .expect(200)
      .then((response) => {
        const article = response.body[0];
        expect(article).toHaveProperty("article_id", expect.any(Number));
        expect(article).toHaveProperty("title", expect.any(String));
        expect(article).toHaveProperty("topic", expect.any(String));
        expect(article).toHaveProperty("author", expect.any(String));
        expect(article).toHaveProperty("created_at", expect.any(String));
        expect(article).toHaveProperty("votes");
        expect(article.votes).toBe(-1);
        expect(article).toHaveProperty("article_img_url", expect.any(String));
      });
  });
  test("200: ignores extra properties", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        inc_votes: 1,
        extraKey: "extraValue",
      })
      .expect(200)
      .then((response) => {
        const article = response.body[0];
        expect(article).hasOwnProperty("article_i", expect.any(Number));
        expect(article).hasOwnProperty("title", expect.any(String));
        expect(article).hasOwnProperty("topic", expect.any(String));
        expect(article).hasOwnProperty("author", expect.any(String));
        expect(article).hasOwnProperty("created_at", expect.any(String));
        expect(article).hasOwnProperty("votes");
        expect(article.votes).toBe(101);
        expect(article).hasOwnProperty("article_img_url", expect.any(String));
      });
  });
  test("400: passed invalid article_id", () => {
    return request(app)
      .patch("/api/articles/notNumber")
      .send({
        inc_votes: 1,
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("400: missing required fields on request body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        not_inc_votes: 1,
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("404: article_id provided does not exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({
        inc_votes: 1,
      })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found");
      });
  });
});
