# github-survey
Survey github for typescript code with interesting properties

## Requirements

You need node and typescript to use this code.

## Usage

1. `node tsc.js crawler.ts; node crawler.js`
2. `mkdir repoData`
3. `mv data*.json repoData/`
4. `node tsc.js merger.ts; node merger.js`
5. `node tsc.js fetcher.ts; node fetcher.js`
6. `cd repos`
7. `dir -r *ts | sls '<your-regex-here>' > ../results.txt`
8. `cd ..`
6. `node tsc.js degrepper.ts; node degrepper.js >final-results.txt`
