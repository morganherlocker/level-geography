level-geography
---

[![Build Status](https://travis-ci.org/morganherlocker/level-geography.svg)](https://travis-ci.org/morganherlocker/level-geography)

indexed geography storage in leveldb

##install
```bash
npm install level-geography
```

##api

####.geoPut
```js
db.geoPut(feauture, featureID, callback)
```

####.bboxQuery
```js
db.bboxQuery(bbox, callback)
```

##usage
```js
var level = require('level');
var sublevel = require('level-sublevel');
var levelGeo = require('level-geography');

var limits = {min_zoom: 8, max_zoom: 15};
var bbox = [ 21.9287109375,12.382928338487408,35.5078125,25.720735134412106];
var dbPath = __dirname+'/db';
var poly = JSON.parse(fs.readFileSync('./test-polygon.geojson'));
var db = levelGeo(sublevel(level(dbPath)), limits); // limits are optional

//insert polygon
db.geoPut(poly, '1', function(err){
	//retrieve polygon
    db.bboxQuery(bbox, function(err, fc){
        
    });
});
```

##about
level-geography uses [tile-cover](https://github.com/mapbox/tile-cover) to generate [quadkey](http://msdn.microsoft.com/en-us/library/bb259689.aspx) indexes. For points, the quadkey simply represents a tile at the specified or default zoom level. For lines and polygons, the minimum number of tiles are used to cover the geography, and each feature is stored redundantly. level-geography abstracts these details away, however, so queries only return one line or polygon for each feature.
