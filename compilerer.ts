/// <reference path="typescriptServices.d.ts" />

declare var require: any;

var path = require('path');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
require('shelljs/global');
declare function exec(cmdLine: string): void;
declare function cd(dir: string): void;

eval(fs.readFileSync('typescriptServices.js', 'utf-8'));

var csvFile = 'data.csv';
var blacklist = ['DefinitelyTyped', 'ext-typescript-generator']; // , 'phpdvr', 'android_development', 'hls-loop', 'test_squeeze_hls', 'MediaSolutions', 'RaspPi', 'Linux-C-Examples', 'iFrameTestRepo', 'streamTest', 'codes'];

var opts: ts.CompilerOptions = { module: ts.ModuleKind.AMD, target: ts.ScriptTarget.ES5 };

var host = ts.createCompilerHost(opts);

var users = fs.readdirSync('repos');

var existing: string[] = [];
if (fs.existsSync(csvFile)) {
    existing = fs.readFileSync(csvFile, 'utf-8').split('\r\n');
}

users.forEach(user => {
    var repos = fs.readdirSync(path.join('repos', user));
    repos.forEach(repo => {
        if (blacklist.indexOf(repo) === -1) {
            compileRepo(path.join('repos', user, repo));
        }
    });
});

function compileRepo(root: string) {
    var oldModuleSyntax = /import\s+(\w+)\s*=\s*module\(/gim;

    function run() {
        try {
            console.log('Compiling ' + root);
            var sources = findAllFiles(root, /\.ts$/);
            if (sources.length === 0) return 'empty';

            if (sources.some(f => f.indexOf('bitcoin') >= 0)) {
                return 'crypto';
            }
            console.log(sources.length + ' input files');
            if (sources.every(fn => fn.indexOf('lib.d.ts') < 0)) {
                sources.unshift('lib.d.ts');
            }

            var fakeTs: string = undefined;
            var anyTranslations = sources.some(s => {
                if (fs.statSync(s).size > 1024 * 1024 * 7) {
                    fakeTs = 'too_large';
                    return true;
                }

                var fd = fs.openSync(s, 'r');
                var buffer = new Buffer(1);
                fs.readSync(fd, buffer, 0, 1, 0);
                fs.closeSync(fd);

                var firstChar = buffer.toString('utf-8', 0, 1);
                if (firstChar === 'G') {
                    fakeTs = 'media';
                    return true;
                }
                var fileContent = fs.readFileSync(s, 'utf-8');
                if (fileContent.indexOf('<translation') > 0) {
                    fakeTs = 'qt';
                    return true;
                } else if (oldModuleSyntax.test(fileContent)) {
                    fakeTs = 'old_module_syntax';
                    return true;
                }
                return false;
            });
            if (fakeTs) {
                return fakeTs;
            }

            // Run tsd if there's a tsd.json file in the root
            if (findAllFiles(root, /tsd\.json/).length > 0) {
                console.log('Exec tsd at ' + root);
                cd(root);
                exec('tsd reinstall --save --overwrite');
                cd('../../..');
            }

            var prog = ts.createProgram(sources, opts, host);
            var synErrors = prog.getDiagnostics();

            var result = 'typescript,' + prog.getSourceFiles().length + ','

            if (synErrors.length > 0) {
                return result + 'syntactic,' + synErrors.length;
            } else {
                var checker = prog.getTypeChecker(true);

                var diags = checker.getDiagnostics();
                prog.getSourceFiles().forEach(sf => diags = diags.concat(checker.getDiagnostics(sf)));

                if (diags.length > 0) {
                    return result + 'semantic,' + diags.length;
                } else {
                    return result + 'clean';
                }
            }
        } catch (e) {
            console.log(e);
            return 'crash';
        }
    }
    if (existing.every(e => e.indexOf(root) === -1)) {
        var result = run();
        console.log(root + ' = ' + result);
        fs.appendFileSync(csvFile, root + ',' + result + '\r\n');
    }
}


function findAllFiles(root: string, pattern?: RegExp): string[] {
    var results: string[] = [];
    var files = fs.readdirSync(root);
    files.forEach(f => {
        f = path.join(root, f);
        var isDir = fs.statSync(f).isDirectory();
        if (isDir) {
            results = results.concat(findAllFiles(f, pattern));
        } else {
            if (!pattern || pattern.test(f)) {
                results.push(f);
            }
        }
    });
    return results;
}
