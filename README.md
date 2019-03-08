# Insomnia Docker Port Template Tag

![Travis (.org)](https://img.shields.io/travis/ttrig/insomnia-plugin-dockerport.svg)

This is a plugin for [Insomnia](https://insomnia.rest) that provides a host port number
for a docker container.

## Usage

![Add tag](https://raw.githubusercontent.com/ttrig/insomnia-plugin-dockerport/master/screenshots/1.png "Add tag")

![Use tag as variable](https://raw.githubusercontent.com/ttrig/insomnia-plugin-dockerport/master/screenshots/2.png "Use as variable")

You can get container name and port with `docker ps`.

```shell
$ docker ps --format "table {{.Names}}\t{{.Ports}}"
NAMES               PORTS
foo                 0.0.0.0:32768->80/tcp
bar                 0.0.0.0:32770->80/tcp
```

Container *foo*  will return *32768*.

## Installation

Place the plugin in a directory that Insomnia knows about.

* Linux: `$XDG_CONFIG_HOME/Insomnia/plugins/` or `~/.config/Insomnia/plugins/`
* MacOS: `~/Library/Application\ Support/Insomnia/plugins/`
* Windows: `%APPDATA%\Insomnia\plugins\`

```shell
$ git clone https://github.com/ttrig/insomnia-plugin-dockerport.git
$ cd insomnia-plugin-dockerport
$ npm install
```

Install the plugin from `Preferences > Plugins`.

### Docker

Run dockerd with `-H tcp://0.0.0.0:2376` to
<a href="https://docs.docker.com/engine/reference/commandline/dockerd/#bind-docker-to-another-host-port-or-a-unix-socket" target="_blank">make the Docker daemon listen for Docker Engine API requests via tcp</a>.
