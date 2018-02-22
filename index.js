#!/usr/bin/env node --harmony
// node
const { userInfo } = require('os');
const { exec } = require('child_process');
// npm
const co = require('co');
const ora = require('ora');
const fs = require('fs-extra');
const chalk = require('chalk');
const prompt = require('co-prompt');
const program = require('commander');
const jsonfile = require('jsonfile');

// globals
const CURR_DIR = process.cwd();
const WEBPACK_DIR = `${__dirname}/templates/webpack-project`;
const TEXT_COLORS = {
  pink: '#FF2E88',
  green: '#50E3C2'
};
const cancel = () => process.exit(1);
const chalked = (color, str) => chalk.hex(color).bold(str);
const chalkedConsole = color => (chalkedStr, str = '') => {
  console.log(chalked(color, chalkedStr) + str);
};
const greenLog = chalkedConsole(TEXT_COLORS.green);
const pinkLog = chalkedConsole(TEXT_COLORS.pink);
const adjustPackageJson = (name, author, description) => {
  const jsonFile = CURR_DIR + '/package.json';
  const newJsonObj = {
    name,
    author,
    description
  };
  const jsonfileOpts = {
    spaces: 2,
    EOL: '\r\n'
  };
  jsonfile.readFile(jsonFile, function(err, obj) {
    const newPackageJson = Object.assign({}, obj, newJsonObj);
    jsonfile.writeFile(jsonFile, newPackageJson, jsonfileOpts, err => {
      if (err) {
        console.error(err);
      }
    });
  });
};
const createProject = (projectName, author, description) => {
  greenLog(`Hello ${author}!`);
  fs
    .copy(WEBPACK_DIR, CURR_DIR)
    .then(() => {
      adjustPackageJson(projectName, author, description);
      const spinner = ora('Creating project...').start();
      exec('npm install', (error, stdout, stderr) => {
        spinner.stop();
        console.log('stdout: ' + stdout);
        stderr.split('\n').forEach(value => {
          pinkLog(value);
        });
        greenLog('Project created!');
        cancel();
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    })
    .catch(err => console.error(err));
};
const isProjectName = name => {
  if (typeof name === 'undefined') {
    pinkLog("Project's name is required");
    cancel();
  }
};
const getProjectName = () => {
  let name;
  program
    .arguments('<projectname>')
    .action(projectname => {
      name = projectname;
    })
    .parse(process.argv);
  isProjectName(name);
  greenLog('Project Name: ', name);
  return name;
};
const question = str => chalked(TEXT_COLORS.pink, str);
const setupQuestions = projectName => {
  const sameDir = CURR_DIR === __dirname;
  const { username } = userInfo();
  co(function*() {
    let author = yield prompt(question(`author: (${username}) `));
    if (!author) {
      author = username;
    }
    const description = yield prompt(question('description: '));
    const git = yield prompt(question('git repository: '));
    if (sameDir) {
      pinkLog('Can not create project inside hyperstart module.');
      cancel();
    } else {
      createProject(projectName, author, description);
    }
  });
};
const init = () => {
  const projectName = getProjectName();
  setupQuestions(projectName);
};
init();
