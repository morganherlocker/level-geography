var test = require('tape');
var fs = require('fs');
var queue = require('queue-async');
var level = require('level');
var rimraf = require('rimraf');
var sublevel = require('level-sublevel');
var levelGeo = require('./');

test('insert, query', function(t){
    var dbPath = __dirname+'/point';
    var pts = JSON.parse(fs.readFileSync('./fixtures/points.geojson'));
    var db = levelGeo(sublevel(level(dbPath)));
    var q = queue(1);

    pts.features.forEach(function(pt, i){
        q.defer(db.geoPut, pt, i.toString());
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
            db.bboxQuery([ -107.841796875,34.161818161230386,-103.5791015625,37.16031654673677], function(err, fc){
                t.notOk(err, 'bbox query');
                t.notEqual(fc.features.length, 0);
            });
            db.close(function(err){
                t.notOk(err, 'db closed');
                rimraf(dbPath, function(err){
                    t.notOk(err, 'db destroyed');
                    t.end();
                });
            });
        });
    });
});

test('insert polygon -- verify dedupe', function(t){
    var dbPath = __dirname+'/polygon';
    var poly = JSON.parse(fs.readFileSync('./fixtures/polygon.geojson'));
    var db = levelGeo(sublevel(level(dbPath)));

    db.geoPut(poly, '1', function(err){
        t.notOk(err, 'polygon inserted');
        db.bboxQuery([ 21.9287109375,12.382928338487408,35.5078125,25.720735134412106], function(err, fc){
            t.notOk(err, 'bbox query');
            t.equal(fc.features.length, 1);
            db.close(function(err){
                t.notOk(err, 'db closed');
                rimraf(dbPath, function(err){
                    t.notOk(err, 'db destroyed');
                    t.end();
                });
            });
        });
    });
});