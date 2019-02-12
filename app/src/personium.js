const fetch = require('electron-fetch').default;
const config = require('./config');
const agent = require('./common/net');

const OAUTH_URL = `${config.cellURL}__token`;
const OAUTH_BODY = `grant_type=password&username=${config.adminUser}&password=${config.adminPass}`;

function getToken() {
  return fetch(OAUTH_URL, {
    method:'POST', body: OAUTH_BODY,
    user: config.proxy.user,
    password: config.proxy.pass,
    headers: {
      'Content-Type': "application/x-www-form-urlencoded"
    }
  }).then(res => res.json());
}


module.exports = {
  getToken
};