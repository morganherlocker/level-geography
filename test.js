var test = require('tape'),
    levelup = require('levelup'),
    fs = require('fs'),
    queue = require('queue-async'),
    geo = require('./');

test('insert, query, and delete', function(t){
    var pts = JSON.parse(fs.readFileSync('./fixtures/points.geojson'));
    var db = levelup('./db');
    var q = queue(1);

    pts.features.forEach(function(pt){
        q.defer(geo.put, db, pt);
    });

    q.awaitAll(function(err){
        t.notOk(err);
        db.createReadStream()
        .on('data', function (data) {
            t.ok(data.key);
            t.ok(data.value)
        })
        .on('error', function (err) {
            t.notOk(err);
        })
        .on('end', function () {
            
            t.end();
        })
    });


})