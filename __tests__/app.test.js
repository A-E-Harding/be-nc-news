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
        let article = response.body
        expect(article).toHaveProperty("article_id", 1);
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("topic", expect.any(String));
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
        expect(article).toHaveProperty("comment_count", expect.any(String));
      });
  });
  test("200: responds with comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("comment_count", "11")
        expect(Object.keys(response.body)).toEqual([
          "article_id",
          "title",
          "topic",
          "author",
          "body",
          "created_at",
          "votes",
          "article_img_url",
          "comment_count"
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
          expect(article).toHaveProperty("article_id", expect.any(Number));
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("topic", expect.any(String));
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
          expect(article).toHaveProperty("comment_count", expect.any(String));
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
        expect(response.body).toHaveProperty("article_id");
        expect(response.body.article_id).toEqual(6)
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("butter_bridge")
        expect(response.body).toHaveProperty("body");
        expect(response.body.body).toEqual("A new comment")
        expect(response.body).toHaveProperty("comment_id", expect.any(Number));
        expect(response.body).toHaveProperty("votes", expect.any(Number));
        expect(response.body).toHaveProperty("created_at", expect.any(String));
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
        expect(response.body).toHaveProperty("article_id");
        expect(response.body.article_id).toEqual(6)
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("butter_bridge")
        expect(response.body).toHaveProperty("body");
        expect(response.body.body).toEqual("A new comment")
        expect(response.body).toHaveProperty("comment_id", expect.any(Number));
        expect(response.body).toHaveProperty("votes", expect.any(Number));
        expect(response.body).toHaveProperty("created_at", expect.any(String));
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
          expect(body.msg).toEqual('Article not found')
        })
    })
  })
})


describe("GET /api/users", () => {
  test("200: returns all users ", () => {
    return request(app).get('/api/users')
      .expect(200)
      .then((response) => {
        let users = response.body
        users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
    })
  })
  test("404: responsds with custom error message when invalid path passed", () => {
    return request(app)
      .get("/api/userz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path not found");
      });
  });
})

describe('DELETE /api/comments/:comment_id', () => {
  test('204: resource deleted successfully, delete by comment_id', () => {
    return request(app).delete('/api/comments/1')
    .expect(204)
  })
  test('400: comment_id not valid', () => {
    return request(app).delete('/api/comments/notNumber')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('Bad request')
      })
  })
  test('404: comment_id not found', () => {
    return request(app).delete('/api/comments/10000')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('Comment not found')
      })
  })
})

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


describe("GET /api/articles?topic=:topic", () => {
  test("200: topic query provided, filters by topic and returns articles", () => {
    return request(app)
      .get("/api/articles?topic=cats")
    .expect(200)
    .then((response) => {
      let articles = response.body
      expect(articles.length).toBe(1)
      articles.forEach((article) => {
        expect(article).toHaveProperty("article_id", expect.any(Number));
        expect(article).toHaveProperty("title", expect.any(String));
        expect(article).toHaveProperty("topic", expect.any(String));
        expect(article).toHaveProperty("author", expect.any(String));
        expect(article).toHaveProperty("created_at", expect.any(String));
        expect(article).toHaveProperty("votes", expect.any(Number));
        expect(article).toHaveProperty("article_img_url", expect.any(String));
        expect(article).toHaveProperty("comment_count", expect.any(String));
      });
  })
  })
  test('404: topic provided does not exist', () => {
    return request(app)
      .get("/api/articles?topic=dogs")
    .expect(404)
      .then((response) => {
      expect(response.body.msg).toBe('Topic not found')
  })
  })
  test('200: valid topic, no articles, return empty array', () => {
    return request(app)
      .get("/api/articles?topic=paper")
    .expect(200)
      .then((response) => {
      expect(response.body).toEqual([])
  })
  })
})
describe("GET /api/articles?sort_by=:property", () => {
  test("200: sort_by query provided, sorts by property, returns articles", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
    .expect(200)
      .then((response) => {
        let articles = response.body
        expect(articles).toBeSortedBy('votes', { descending: true })
        expect(articles.length).toBe(13)
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id", expect.any(Number));
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("topic", expect.any(String));
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
          expect(article).toHaveProperty("comment_count", expect.any(String));
        });
      
  })
  })
  test('200: if no sort_by query provided, defaults to created_at', () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) =>{
        let articles = response.body
        expect(articles).toBeSortedBy('created_at', { descending: true })
    })
  })

  test('400: property provided does not exist', () => {
    return request(app)
      .get("/api/articles?sort_by=dogs")
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
  })
  })

})

describe("GET /api/articles?order=:order", () => {
  test('200: sets order to asc or desc', () => {
    return request(app)
      .get("/api/articles?order=asc")
    .expect(200)
      .then((response) => {
        let articles = response.body
        expect(articles).toBeSortedBy('created_at', { descending: false })
  })
  })
  test('200: sets order to asc or desc', () => {
    return request(app)
      .get("/api/articles?order=desc")
    .expect(200)
      .then((response) => {
        let articles = response.body
        expect(articles).toBeSortedBy('created_at', { descending: true })
  })
  })
  test('400: property provided does not exist', () => {
    return request(app)
      .get("/api/articles?order=dogs")
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
  })
  })
  test('200: topic, sort_by and order queries can be used together', () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=votes&order=asc")
    .expect(200)
      .then((response) => {
      const articles = response.body
      expect(articles).toBeSortedBy('votes', { ascending: true })
        expect(articles.length).toBe(12)
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id", expect.any(Number));
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("topic")
          expect(article.topic).toBe('mitch');
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
          expect(article).toHaveProperty("comment_count", expect.any(String));
        })
  })
  })
})

