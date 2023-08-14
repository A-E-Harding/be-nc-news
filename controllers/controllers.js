const {readTopics, readArticles} = require('../models/models')

exports.getTopics = (request, response, next) => {
    const {article_id} =request.params
    readTopics().then((topicRows) => {
        response.status(200).send(topicRows)
    })

}

exports.getArticles = (request, response, next) => {
    readArticles().then((articleRows) => {
        console.log(articleRows)
    })
}