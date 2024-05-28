const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: `http://${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}` });

module.exports = client;
