const db = require('../db/connection')

exports.readTopics = () => {
    return db.query('SELECT * FROM topics').then(({ rows }) => {
        return rows
    })
}

exports.getArticles = () => {
    return db.query('SELECT * FROM articles ')
}