declare var require: any;
type Map<T> = { [index: string]: T }

var fs = require('fs');
const lines = fs.readFileSync('results.txt', 'utf-8').toString().split('\n')
console.log(lines.length);
const regexp = /\w+\\([\w.]+:\d +):\s*(.*$)/
const map: Map<string> = {}
for(const line of lines) {
	// create a map of file:line => code
	const match = regexp.exec(line)
	if(match) {
		map[match[1]] = match[2]
	}
	else {
		console.log(`whoa, '${line}' didn't match for some reason`)
	}
}
let i: number = 0
for(const address in map) {
	i += 1
}
console.log(i)

