#!/usr/bin/env node
const os = require('os')
const exec = require('util').promisify(require('child_process').exec)
const {readFileSync} = require('fs')
const {resolve} = require('path')
const readline = require('readline')
const uuid = require('uuid')

var argv = require('minimist')(process.argv.slice(2));
// console.log('argv', argv);

function help() {
  const man = readFileSync(resolve(__dirname, './man.txt'), {encoding: 'utf-8'});
  console.log(man);
}

// --help
if (argv.help) {
  help()
  process.exit(0);
}

function readStdin() {
  //
  // resolve with text when stdin ends
  //

  return new Promise(function (resolve, reject) {
    let ret = ""

    //
    // stdin > ret variable
    //
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk
      while ((chunk = process.stdin.read()) !== null) {
        ret += chunk
      }
    });
    process.stdin.on('end', () => {
      resolve(ret)
    });

    var rl = readline.createInterface({
      input: process.stdin,
      prompt: ''
    });
  
    rl.prompt()
  })
  
}

function isUrl(str) {
  try {
    new URL(str)
  } catch(e) {
    return false;
  }

  return true;
}

function randStudent(list) {
  return list[Math.floor(Math.random()*list.length)]
}

async function main() {
  //
  // node --inspect bin.js
  //

  let jsonUrlOrPath = argv._[0] || '-'

  //
  // If `jsonUrlOrPath` is a URL => dump it to a local file
  //

  if (isUrl(jsonUrlOrPath)) {
    debugger;
    const tmpfile = `${os.tmpdir()}/${uuid.v4()}`

    await exec(`curl -L --silent --fail "${jsonUrlOrPath}" >${tmpfile}`)
    jsonUrlOrPath = tmpfile // local file becomes `csvUrlOrPath`
  }
  
  //
  // students list
  //
  // Either from stdin, or from file
  //

  let students;
  if (jsonUrlOrPath === '-') {
    const txt = await readStdin()
    students = txt.split(/[\r\n]+/) // see: https://stackoverflow.com/a/21895354/133327
  } else {
    students = JSON.parse(readFileSync(jsonUrlOrPath, {encoding: 'utf-8'}))
  }

  // Outputs
  const ret = randStudent(students)
  console.log(ret)
}

// Run
main().catch(err => {
  console.error(err)
  process.exit(1);
})