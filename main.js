const fs = require('fs');
const skipParse = require('./index');

const sourceFile = process.argv[2];
const filter = parseFilterArg(process.argv[3]);

const source = fs.readFileSync(sourceFile, 'utf8');

function parseFilterArg(filterArg) {
  const isRegExp = /^\/(.+)\/(i{0,1}g{0,1}m{0,1}y{0,1})$/;
  const match = isRegExp.exec(filterArg);
  if (match) {
    return new RegExp(match[1], match[2]);
  }
  return filterArg;
}

console.log(skipParse(source, filter));
