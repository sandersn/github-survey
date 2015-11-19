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
	let key = match[2]
	if (match[2] in map && map[match[2]].snippet !== match[3]) {
		key += '-prime'
	}
	map[key] = { project: match[1], snippet: match[3] }
}
let i: number = 0
for (const address of Object.keys(map).sort()) {
	console.log(`${address}\t${map[address].project}`)
	console.log(`\t${map[address].snippet}`)
	i += 1
}
console.log(i)

