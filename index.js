const url = require('url');
const http = require('http');
const _get = require('lodash/get');

module.exports.templateTags = [
  {
    name: 'dockerport',
    displayName: 'Docker port',
    description: 'Read contents from a docker container host port',

    args: [
      {
        displayName: 'Container name',
        type: 'string',
        help: 'Run "docker ps" to get names for running containers',
      },
      {
        displayName: 'Port name',
        type: 'string',
        placeholder: '80/tcp',
      },
      {
        displayName: 'Docker URL',
        type: 'string',
        placeholder: 'http://localhost:2376',
      },
    ],

    run(context, containerName, portName, dockerUrl) {
      if (!containerName) {
        throw new Error('Container name is required for prompt tag');
      }

      if (!portName) {
        portName = '80/tcp';
      }

      if (!dockerUrl) {
        dockerUrl = 'http://localhost:2376';
      }

      return getPort(containerName, portName, dockerUrl);
    },
  },
];

async function getPort(containerName, portName, dockerUrl) {
  let jsonString;
  try {
    jsonString = await downdloadJson(containerName, dockerUrl);
  } catch (err) {
    throw new Error(err);
  }

  let json;
  try {
    json = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }

  let port = _get(json, `NetworkSettings.Ports.${portName}.0.HostPort`, 0);
  if (port) {
    return port;
  }

  throw new Error(`Could not find ${portName} in docker output.`);
}

function downdloadJson(containerName, dockerUrl) {
  return new Promise((resolve, reject) => {
    let parsedUrl = url.parse(dockerUrl);
    let options = {
      protocol: parsedUrl.protocol,
      host: parsedUrl.hostname,
      port: parsedUrl.port,
      path: `/containers/${containerName}/json`,
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
