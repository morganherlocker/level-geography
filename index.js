var cover = require('tile-cover');

module.exports.put = function(db, feature, done){
    var indexes = cover.indexes(feature.geometry, {min_zoom: 3, max_zoom: 14})
    var items = indexes.map(function(index){
        return {
            type: 'put',
            key: index,
            value: JSON.stringify(feature)
        };
    });
    db.batch(items, function(err){
        done(err);
    });
}

module.exports.bboxQuery = function(db, bbox, done){
    var fc = {
        type: 'FeatureCollection',
        features: []
    }
    var lowGeometry = {
        type: 'Point',
        coordinates: [bbox[0], bbox[3]]
    };
    var highGeometry = {
        type: 'Point',
        coordinates: [bbox[2], bbox[1]]
    };
    var lowIndex = cover.indexes(lowGeometry, {min_zoom: 3, max_zoom: 14})[0];
    var highIndex = cover.indexes(highGeometry, {min_zoom: 3, max_zoom: 14})[0];

    db.createReadStream({gte: lowIndex, lte: highIndex})
    .on('data', function (data) {
        fc.features.push(JSON.parse(data.value));
    })
    .on('error', function (err) {
        done(err);
    })
    .on('end', function () {
        done(null, fc);
    });
}