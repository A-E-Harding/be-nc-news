# Northcoders News API
## Project Summary

Welcome to my Northcoders backend project! During this project I used Express and Node.js to create an API allowing access to data from Northcoders News, including data about posted articles, comments and users.

The below project link shows information on all available endpoints and associated queries created as part of this project.

### Project Link
[be-nc-news](https://nc-news-0876.onrender.com/api)

This project forms the backend of my Northcoders frontend project, please see the [fe-nc-news GitHub repo](https://github.com/A-E-Harding/fe-nc-news.git), or visit the below link to view the project.

[fe-nc-news](https://nc-news-alice-harding.netlify.app)

## Set-up instructions

Minimum versions:<br>
Node.js v20.3.0<br>
Postgres 15.3

This repo can be cloned from GitHub by copying the repo link into your terminal.

```console
git clone <insert link>
```

The dependences required by this repo can be installed using the following command line prompt. A full list of all dependencies can be viewed in the **package.json** file

```console
npm install
```

### Setting up .env files
This repo also requires two .env files, a data file containing development data, and a test file containing test data. PDGATABASE should be set in each of these .env files as requried. Database names are contained within the **setup.sql** file.

<br />

### Seetting up and seeding the database
To seed the database, run the following terminal commands.<br>
_For a full list of all scripts, please see the **package.json** file_
```console
npm run setup-dbs
npm run seed
```

### Running tests
Use the below script to run tests.
```console 
npm run test
```
<br />



