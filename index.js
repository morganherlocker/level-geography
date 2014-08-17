var cover = require('tile-cover'),
    bboxPolygon = require('turf-bbox-polygon');

module.exports.put = function(db, feature, done){
    var indexes = cover.indexes(feature.geometry, {min_zoom: 3, max_zoom: 14})
    var items = indexes.map(function(index){
        return {
            type: 'put',
            key: index,
            value: feature
        };
    });
    db.batch(items, function(err){
        done(err);
    });
}

module.exports.bboxQuery = function(db, bbox, done){
    var poly = bboxPolygon(bbox);


    db.createReadStream()
    .on('data', function (data) {
        console.log(data.key, '=', data.value)
    })
    .on('error', function (err) {
        t.notOk(err);
    })
    .on('end', function () {
        console.log('Stream closed');
        t.end();
    })
}