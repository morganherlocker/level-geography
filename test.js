var test = require('tape'),
    levelup = require('levelup'),
    fs = require('fs'),
    queue = require('queue-async'),
    geo = require('./');

test('insert, query', function(t){
    var pts = JSON.parse(fs.readFileSync('./fixtures/points.geojson'));
    var db = levelup('./db');
    var q = queue(1);

    pts.features.forEach(function(pt){
        q.defer(geo.put, db, pt);
    });

    q.awaitAll(function(err){
        t.notOk(err, 'put all');
        db.createReadStream()
        .on('data', function (data) {
            t.ok(data.key, 'key ok');
            t.ok(data.value, 'value ok');
        })
        .on('error', function (err) {
            t.notOk(err);
        })
        .on('end', function () {
            geo.bboxQuery(db, [ -107.841796875,34.161818161230386,-103.5791015625,37.16031654673677], function(err, fc){
                t.notOk(err, 'bbox query');
                t.notEqual(fc.features.length, 0);
            });
            t.end();
        });
    });
});