const url = require('url');
const http = require('http');
const _ = require('lodash');
const NodeCache = require('node-cache');

const cache = new NodeCache({stdTTL: 8, checkperiod: 60});

class App {
  async getPort(containerName, portNumber, portType, dockerUrl) {
    let jsonString;
    try {
      jsonString = cache.get(dockerUrl);
      if (!jsonString) {
        jsonString = await this.downdloadJson(dockerUrl);
        this.log(`downloaded json from ${dockerUrl}`);
        cache.set(dockerUrl, jsonString);
      }
    } catch (err) {
      throw new Error(err);
    }

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }

    let container = _.find(json, { 'Names': [`/${containerName}`] });
    if (!container) {
      throw new Error(`Could not find container ${containerName}`);
    }

    let portObject = _.find(container.Ports, { 'Type': portType, 'PrivatePort': parseInt(portNumber) });

    if (portObject) {
      return portObject.PublicPort;
    }

    throw new Error(`Could not find port ${portNumber} on ${containerName}.`);
  }

  async downdloadJson(dockerUrl) {
    return new Promise((resolve, reject) => {
      let parsedUrl = url.parse(dockerUrl);
      let options = {
        protocol: parsedUrl.protocol,
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: '/containers/json',
        timeout: 1200
      };

      http.get(options, (response) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new Error('Failed to download, status code: ' + response.statusCode));
        }

        const body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => resolve(body.join('')));
      }).on('error', () => {
        reject('Could not download json');
      });
    });
  }

  log(str) {
    global.console.log(`[dockerport] ${str}`);
  }
}

module.exports = App;
