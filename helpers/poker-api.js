const { stringify } = require('querystring');
const fetch = require('node-fetch');

const baseUrl = process.env.POKER_MAVENS_URL;
const pw = process.env.POKER_MAVENS_API_PASSWORD;
const url = `${baseUrl}/api`;

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
