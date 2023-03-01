const { stringify } = require('querystring');
const fetch = require('isomorphic-fetch');
const config = require('../config');

const baseUrl = config.POKER_URL;
const pw = config.POKER_PWD;
const url = baseUrl;

async function PokerAPI(params) {
  const fetchParams = {
    password: pw,
    json: 'yes',
    ...params
  };

  const query = stringify(fetchParams);
  const fetchOptions = { method: 'post' };

  const response = await fetch(`${url}?${query}`, fetchOptions);
  const json = await response.json();

  if (json.Result === 'Error') {
    throw new Error(json.Error);
  }

  if (!json || !json.Result) {
    throw new Error('Connection failed');
  }

  return json;
}

module.exports = PokerAPI;
