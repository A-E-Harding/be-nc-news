const app = require("../app.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const connection = require("../db/connection");
const endpoints = require("../endpoints.json");
const articles = require("../db/data/test-data/articles.js");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return connection.end();
});

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
        expect(body.msg).toBe("Not a valid input");
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
        const article = response.body;
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
  test("200: adds comment to specified article", () => {
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
  test("404: passed non-existant articleID", () => {
    return request(app)
    .post("/api/articles/9999/comments")
    .send(body)
    .expect(404)
    .then((response) => {
     expect(response.body.msg).toBe('Not Found')
    });
  });
  test("400: passed incomplete body", () => {
    return request(app)
    .post("/api/articles/6/comments")
      .send(
        {
          username: "butter_bridge"
        }
    )
    .expect(400)
    .then((response) => {
     expect(response.body.msg).toBe('Bad request')
    });
  });
});
