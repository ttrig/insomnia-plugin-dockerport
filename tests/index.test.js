const nock = require('nock');
const tag = require('..').templateTags[0];

const jsonString = `{
  "NetworkSettings": {
      "Ports": {
          "80/tcp": [
              {
                  "HostIp": "0.0.0.0",
                  "HostPort": "1337"
              }
          ]
      }
  }
}`;

nock('http://localhost:2376')
  .persist()
  .get('/containers/foobar/json')
  .reply(200, jsonString)
  .get('/containers/invalid/json')
  .reply(200, 'invalid { "json"')
  .get('/containers/unknown/json')
  .reply(404, '{"message":"No such container: unknown"}')
;

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
    it('should work when port name and docker url is set to default',
      assertTemplate(['foobar'], '1337')
    );

    it('should work when port name and docker url is given',
      assertTemplate(['foobar', '80/tcp', 'http://localhost:2376'], '1337')
    );
  });

  describe('sad path', () => {
    it('should throw error for undefined container name',
      assertTemplateFails([''], 'Container name is required for prompt tag')
    );

    it('should throw error for invalid json from docker api',
      assertTemplateFails(['invalid'], 'Invalid JSON: ')
    );

    it('should throw error for unknown port name',
    assertTemplateFails(['foobar', '8080/tcp'], 'Could not find 8080/tcp in docker output.')
    );

    it('should throw error for unknown docker url',
    assertTemplateFails(['foobar', '', 'http://localhost:2377'], 'Could not download json')
    );

    it('should receive 404 for unknown container',
      assertTemplateFails(['unknown'], 'Failed to download, status code: 404')
    );
  });
});
