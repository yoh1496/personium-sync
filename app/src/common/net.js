const URL = require('url').URL;
const globalAgent = require('https').globalAgent;
const httpsOverHttp = require('tunnel').httpsOverHttp;

function getAgent(url = process.env.HTTPS_PROXY) {
  if (!url) { return globalAgent; }
  try {
    const { hostname, port, username, password } = new URL(url);
    const proxyAuth = username && password && `${username}:${password}`;
    return httpsOverHttp({proxy: {host: hostname, port, proxyAuth}});
  } catch(e) {
    console.error(`HTTPS_PROXY environment variable ignored: ${e.message}`);
    return globalAgent;
  }
}

module.exports = getAgent();