const app = require("../app.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const connection = require("../db/connection");
const endpoints = require("../endpoints.json");

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
    test('200: responds with array of all article objects', () => {
        return request(app).get("/api/articles")
            .expect(200)
            .then((response) => {
                expect(response.body.length).toBe(13)
                expect(Object.keys(response.body[0])).toEqual([
                    "article_id",
                    "title",
                    "topic",
                    "author",
                    "created_at",
                    "votes",
                    "article_img_url",
                    "comment_count"
                ]);
                
        })
    })
})
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