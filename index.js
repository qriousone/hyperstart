#!/usr/bin/env node --harmony
// node
const os = require('os');
const exec = require('child_process').exec;
// npm
const co = require('co');
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
let projectName;
const cancel = () => {
  process.exit(1);
};
const chalked = (color, str) => chalk.hex(color).bold(str);
const chalkedConsole = color => (chalkedStr, str = '') => {
  console.log(chalked(color, chalkedStr) + str);
};
const green = chalkedConsole(TEXT_COLORS.green);
const pink = chalkedConsole(TEXT_COLORS.pink);

const adjustPackageJson = (name, author, description) => {
  const packageJsonFile = CURR_DIR + '/package.json';
  const newPackageJsonProp = {
    name,
    author,
    description
  };
  jsonfile.readFile(packageJsonFile, function(err, obj) {
    const newPackageJson = Object.assign({}, obj, newPackageJsonProp);
    jsonfile.writeFile(
      packageJsonFile,
      newPackageJson,
      {
        spaces: 2,
        EOL: '\r\n'
      },
      function(err) {
        if (err) {
          console.error(err);
        }
      }
    );
  });
};

const createProject = (projectName, author, description) => {
  green(`Hello ${author}!`);
  pink('Creating project...');
  fs
    .copy(WEBPACK_DIR, CURR_DIR)
    .then(() => {
      green('Directories created.');
      adjustPackageJson(projectName, author, description);
      pink('Installing node modules...');
      exec('npm install', (error, stdout, stderr) => {
        console.log('stdout: ' + stdout);
        pink('stderr:');
        stderr.split('\n').forEach(value => {
          pink(value);
        });
        green('Node modules installed.');
        cancel();
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    })
    .catch(err => console.error(err));
};

program.arguments('<projectname>').action(projectname => {
  projectName = projectname;
});

program.parse(process.argv);

if (typeof projectName === 'undefined') {
  pink("Project's name is required");
  cancel();
} else {
  green('Project Name: ', projectName);
  co(function*() {
    let author = yield prompt(
      chalked(TEXT_COLORS.pink, `author: (${os.userInfo().username}) `)
    );
    if (!author) {
      author = os.userInfo().username;
    }
    const description = yield prompt(
      chalked(TEXT_COLORS.pink, `description: `)
    );
    const git = yield prompt(chalked(TEXT_COLORS.pink, `git repository: `));
    if (CURR_DIR !== __dirname) {
      createProject(projectName, author, description);
    } else {
      pink('Can not create project inside hyperstart module.');
      cancel();
    }
  });
}
