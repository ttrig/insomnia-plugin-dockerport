const App = require('./app');

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
        displayName: 'Port number',
        type: 'number',
        placeholder: '80'
      },
      {
        displayName: 'Port protocol',
        defaultValue: 'tcp',
        type: 'enum',
        options: [
          { displayName: 'TCP', value: 'tcp' },
          { displayName: 'UDP', value: 'udp' },
        ],
      },
      {
        displayName: 'Docker URL',
        type: 'string',
        placeholder: 'http://localhost:2376'
      },
    ],

    run(context, containerName, portNumber, portType, dockerUrl) {
      if (!containerName) {
        throw new Error('Container name is required');
      }

      if (!portNumber || portNumber == 'NaN') {
        portNumber = '80';
      }

      if (!portType) {
        portType = 'tcp';
      }

      if (!dockerUrl) {
        dockerUrl = 'http://localhost:2376';
      }

      const app = new App();

      return app.getPort(containerName, portNumber, portType, dockerUrl);
    }
  }
];
