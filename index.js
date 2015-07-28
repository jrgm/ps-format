const exec = require('child_process').exec
const sprintf = require("sprintf-js").sprintf

const truthy = function(value) { return !!value }

function processLine(line) {
  if (line.match(/^\s*PID/)) {
    console.log(line)
    return
  }

  var match = line.match(/^\s*(\d+)\s+(\d+)\s+(.{24})\s+(.*)/)
  if (!match) {
    return
  }

  if (match.index !== 0 || match.length !== 5) {
    console.error('Bad match "' + line + '"')
    return
  }
      
  var lstart = new Date(match[3]).valueOf()
  return {
    pid: match[1],
    ppid: match[2],
    lstart: lstart,
    command: match[4].slice(0,60)
  }
}

function output(line) {
  line = sprintf('%8d %8d %s %s',
                 line.pid,
                 line.ppid,
                 new Date(line.lstart).toISOString(),
                 line.command)
  console.log(line)
}

function sorter(a, b) {
  return a.lstart - b.lstart
}

function handler(err, stdout, stderr) {
  if (err) throw err
  if (stderr) console.log(stderr)

  stdout.split('\n')
    .map(processLine)
    .filter(truthy)
    .sort(sorter)
    .map(output)
}

exec('ps -eo pid,ppid,lstart,command', handler)
