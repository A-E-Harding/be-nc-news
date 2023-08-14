const { request, response } = require("../app");
const { readTopics } = require("../models/models");
const fs = require("fs/promises");

exports.getTopics = (request, response, next) => {
  readTopics().then((topicRows) => {
    response.status(200).send(topicRows);
  });
};

exports.getEndpoints = (request, response, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`, "utf-8").then(
      (fileContents) => {
      response.status(200).send(JSON.parse(fileContents));
    }
  );
};
