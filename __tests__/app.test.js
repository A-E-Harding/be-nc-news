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
                for (const obj of response.body) {
                    expect(Object.keys(obj)).toEqual(['slug', 'description'])
                }
                
            })
    })
})