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
describe("GET /api/articles/:article_id/comments", () => {
  test("200: returns array of comment objects for given article_id, in date order", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body
        expect(comments.length).toBe(2)
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comments).hasOwnProperty("comment_id", expect.any(Number));
          expect(comments).hasOwnProperty("votes", expect.any(Number));
          expect(comments).hasOwnProperty("author", expect.any(String));
          expect(comments).hasOwnProperty("created_at", expect.any(String));
          expect(comments).hasOwnProperty("body", expect.any(String));
          expect(comments).hasOwnProperty("article_id", expect.any(Number));
        });
      });
  })
});
