const app = require('../app.js')
const request = require('supertest')
const testData = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')
const connection = require('../db/connection')
const endpoints = require('../endpoints.json')


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
    describe('/api', () => {
        test('200: returns all available endpoints and descriptions', () => {
            return request(app).get('/api')
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual({endpoints})
            })
        })
    })
})