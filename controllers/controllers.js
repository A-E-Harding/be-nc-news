const {readTopics} = require('../models/models')

exports.getTopics = (request, response, next) => {
    readTopics().then((topicRows) => {
        response.status(200).send(topicRows)
    })

}

