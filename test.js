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
            t.ok(data.value, 'value ok')
        })
        .on('error', function (err) {
            t.notOk(err);
        })
        .on('end', function () {
            geo.bboxQuery(db, [-111.3134765625,33.90689555128866,-99.00878906249999,42.16340342422401], function(err, fc){
                t.notOk(err, 'bbox query');
                t.notEqual(fc.features.length, 0)
            })
            t.end();
        })
    });
});