const app = require('../app.js')
const request = require('supertest')
const testData = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')
const connection = require('../db/connection')

beforeEach(() => {
    return seed(testData)
})

afterAll(() => {
    return connection.end()
})

describe('/api/topics', () => {
    test('200: array of topic objects returned with slug and description properties', () => {
        return request(app).get('/api/topics')
            .expect(200).then((response) => {
                expect(response.body.length).toBe(3)
                for (const obj of response.body) {
                    expect(Object.keys(obj)).toEqual(['slug', 'description'])
                }
                
            })
    })
})

describe('/api/articles/:article_id', () => {
    test('200: responds with correct article', () => {
        return request(app).get('/api/articles/1')
            .expect(200)
            .then((response) => {
                expect(response.body).toEqual({
                article_id:1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                created_at: '2020-07-09T20:11:00.000Z',
                votes: 100,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              })
        })
    })
    test('400: passed non number parameter', () => {
        return request(app).get('/api/articles/notNumber')
            .expect(400)
            .then(({ body }) => {
            expect(body.msg).toBe('Not a valid input')
        })
    })
    test('404: passed id that does not exist', () => {
        return request(app).get('/api/articles/1234')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Input not found")
        })
    })
})

//err - invalid number 404 or NaN 400