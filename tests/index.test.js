const nock = require('nock');
const tag = require('..').templateTags[0];

const jsonString = `[
    {
        "Names": [
            "/foobar"
        ],
        "Ports": [
            {
                "IP": "0.0.0.0",
                "PrivatePort": 80,
                "PublicPort": 8000,
                "Type": "tcp"
            },
            {
                "IP": "0.0.0.0",
                "PrivatePort": 81,
                "PublicPort": 8001,
                "Type": "tcp"
            }
        ]
    },
    {
        "Names": [
            "/foobaz"
        ],
        "Ports": [
            {
                "IP": "0.0.0.0",
                "PrivatePort": 80,
                "PublicPort": 8080,
                "Type": "tcp"
            }
        ]
    }
]`;

const scope = nock('http://localhost:2376');

function assertTemplate(args, expected) {
  return async function() {
    const result = await tag.run(null, ...args);
    expect(result).toBe(expected);
  };
}

function assertTemplateFails(args, expected)
{
  return async function() {
    try {
      await tag.run(null, ...args);
      throw new Error(`Should have thrown "${expected}"`);
    } catch (err) {
      expect(err.message).toContain(expected);
    }
  };
}

describe('docker-port', () => {
  describe('happy path', () => {
    scope.get('/containers/json').reply(200, jsonString);
    scope.get('/containers/json').reply(400, 'we should not end up here');

    it('should work with default arguments',
      assertTemplate(['foobar'], 8000)
    );

    it('should use cached json from last run',
      assertTemplate(['foobar'], 8000)
    );

    it('should work when port number, port protocol and docker url is given',
      assertTemplate(['foobar', '80', 'tcp', 'http://localhost:2376'], 8000)
    );
  });

  describe('sad path', () => {
    it('should throw error for undefined container name',
      assertTemplateFails([''], 'Container name is required')
    );

    scope.get('/containers/json').reply(200, '[invalid json}');
    it('should throw error for invalid json from docker api',
      assertTemplateFails(['foobar'], 'Invalid JSON: ')
    );

    scope.get('/containers/json').reply(200, jsonString);
    it('should throw error for unknown port name',
      assertTemplateFails(['foobar', '9000', 'tcp'], 'Could not find port 9000 on foobar.')
    );

    it('should throw error for unknown docker url',
      assertTemplateFails(['foobar', '', '', 'http://localhost:2377'], 'Could not download json')
    );

    scope.get('/containers/json').reply(200, '[]');
    it('should receive 404 for unknown container',
      assertTemplateFails(['foobar'], 'Could not find container foobar')
    );
  });
});
