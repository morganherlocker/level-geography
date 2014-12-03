var cover = require('tile-cover'),
    getCoords = require('geojson-coords');

module.exports = function (db, limits) {
    if(!limits) limits = {min_zoom: 3, max_zoom: 9};
    db.geoPut = function geoPut(feature, featureId, done) {
        var indexes = cover.indexes(feature.geometry, limits);
        var items = indexes.map(function(index){
            return {
                type: 'put',
                key: index+'!'+featureId,
                value: JSON.stringify(feature)
            };
        });
        db.batch(items, function(err){
            done(err);
        });
    };

    db.bboxQuery = function(bbox, done) {
        var fc = {
            type: 'FeatureCollection',
            features: []
        };
        var featureIds = [];
        var lowGeometry = {
            type: 'Point',
            coordinates: [bbox[0], bbox[3]]
        };
        var highGeometry = {
            type: 'Point',
            coordinates: [bbox[2], bbox[1]]
        };
        var lowIndex = cover.indexes(lowGeometry, {min_zoom: 1, max_zoom: 30})[0];
        var highIndex = cover.indexes(highGeometry, {min_zoom: 1, max_zoom: 30})[0];

        db.createReadStream({gte: lowIndex, lte: highIndex})
        .on('data', function (data) {
            var featureId = data.key.split('!')[data.key.split('!').length - 1]
            if(featureIds.indexOf(featureId) === -1) {
                featureIds.push(featureId)
                fc.features.push(JSON.parse(data.value));
            }
        })
        .on('error', function (err) {
            done(err);
        })
        .on('end', function () {
            done(null, fc);
        });
    };

    return db;
};