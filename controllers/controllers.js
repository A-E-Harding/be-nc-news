const {readTopics, readArticles} = require('../models/models')

exports.getTopics = (request, response, next) => {
    readTopics().then((topicRows) => {
        response.status(200).send(topicRows)
    })

}

exports.getArticles = (request, response, next) => {
    const { article_id } = request.params
    readArticles(article_id).then((articleObj) => {
        response.status(200).send(articleObj)
    })
        .catch((err) => {
        next(err)
    })
}