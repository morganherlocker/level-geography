var test = require('tape'),
    leveldb = require('level'),
    fs = require('fs'),
    queue = require('queue-async'),
    Geo = require('./');

test('insert, query, and delete', function(t){
    var pts = fs.readFileSync('./fixtures/points.geojson');
    var db = levelup('./mydb');
    var geo = Geo(db);

    var q = queue(1);

    pts.features.forEach(function(pt){
        q.defer(geo.put, pt);
    });

    q.awaitAll(function(err){
        t.notOk(err);
        console.log('PUT Complete');
    });


})