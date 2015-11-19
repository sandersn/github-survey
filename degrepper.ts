declare var require: any;
type Map<T> = { [index: string]: T }
type Result = { project: string, snippet: string }

var fs = require('fs');
const lines = fs.readFileSync('results.txt', 'utf-8').toString().split('\n')
console.log(lines.length);
const regexp = /^(.*)\\([\w.-]+:\d+):\s*(.*)/
const map: Map<Result> = {}
const id = x => x
for (const match of lines.filter(id).map(line => regexp.exec(line)).filter(id)) {
	// create a map of file:line => code
	if (match[2] in map && map[match[2]] !== match[3]) {
		map[match[2] + '-prime'] = {project: match[1], snippet: match[3]}
	} else {
		map[match[2]] = { project: match[1], snippet: match[3] }
	}
}
let i: number = 0
for (const address in map) {
	console.log(`${address}\t${map[address].project}`)
	console.log(`\t${map[address].snippet}`)
	i += 1
}
console.log(i)

