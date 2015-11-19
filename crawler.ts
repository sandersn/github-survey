declare var require: any;

var fs = require('fs');
var https = require('https');

var queries = [
    'sort=forks&order=asc',
    'sort=forks&order=desc',
    'sort=stars&order=asc',
    'sort=stars&order=desc',
    'sort=updated&order=asc',
    'sort=updated&order=desc',
    'order=asc',
    'order=desc'
];

var pageNumber = 1;
var activeQuery = queries.pop();
function fetchNext() {
    console.log('Fetch page ' + pageNumber);

    var options = {
        host: 'api.github.com',
        path: '/search/repositories?q=language:typescript&per_page=100&' + activeQuery + '&page=' + pageNumber,
        headers: { 'user-agent': 'Mozilla/5.0' }
    };
    https.get(options, (res: any) => {
        var body = '';
        res.on('data', d => body = body + d);

        res.on('end', () => {
            var parsedData = JSON.parse(body);

            fs.writeFileSync('data_' + queries.length + '_' + pageNumber + '.json', body);

            if (pageNumber === 10) {
                if (queries.length) {
                    activeQuery = queries.pop();
                    console.log(`Next query: ${activeQuery} (${queries.length} left)`);
                    pageNumber = 1;
                    setTimeout(fetchNext, 15000);
                } else {
                    console.log('Done.');
                }
            } else {
                pageNumber++;
                console.log('Wait on next page: ' + pageNumber);
                setTimeout(fetchNext, 15000);
            }
        });
    });

}

fetchNext();
