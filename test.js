var test = require('tape'),
    levelup = require('levelup'),
    leveldown = require('leveldown'),
    fs = require('fs'),
    queue = require('queue-async'),
    geo = require('./');

test('insert, query', function(t){
    var pts = JSON.parse(fs.readFileSync('./fixtures/points.geojson'));
    var db = levelup('./db');
    var q = queue(1);

    pts.features.forEach(function(pt, i){
        q.defer(geo.put, db, pt, i.toString());
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
            db.close(function(err){
                t.notOk(err, 'db closed');
                leveldown.destroy('./db', function(err){
                    t.notOk(err, 'db destroyed')
                    t.end()
                });
            });
        });
    });
});

test('insert polygon -- verify dedupe', function(t){
    var poly = JSON.parse(fs.readFileSync('./fixtures/polygon.geojson'));
    var db = levelup('./db');

    geo.put(db, poly, '1', function(err){
        t.notOk(err, 'polygon inserted');
        geo.bboxQuery(db, [ -127.61718749999999,21.94304553343818,-60.46875,47.98992166741417], function(err, fc){
            t.notOk(err, 'bbox query');
            t.equal(fc.features.length, 1);
            db.close(function(err){
                t.notOk(err, 'db closed');
                leveldown.destroy('./db', function(err){
                    t.notOk(err, 'db destroyed')
                    t.end()
                });
            });
        });
    });
});