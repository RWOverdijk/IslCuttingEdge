# IslCuttingEdge
An islive custom built using nodeJS. This project is an experiment to figure out what the possibilities for production are.

## Installation
### Install node deps
`npm install`

### Copy config file
`cp config/local.js.dist config/local.js`

### Install app deps

**Note:** If you don't want to use mongodb, only install `phantomjs` and change the key `default` in `config/adapters.js` to `disk`.

#### For Mac OS
`brew install mongodb phantomjs`

#### For ubuntu**
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install mongodb-10gen phantomjs
sudo service mongodb start
```

### Create user

Run `mongo` to open the shell and execute the following commands:

`use cuttingedge`

```
db.addUser({
    user: "USER",
    pwd: "PASSWORD",
    roles: [ "readWrite" ]
})
```

**Note:** Don't forget to replace USER and PASSWORD. Afterwards, also set these values in `config/local.js`.

### Run application
`sails lift`

In your browser, navigate to 127.0.0.1:1337
