level-geography
===============

indexed geography storage in leveldb


##install
```bash
npm install level-geography
```

##api

###.put
```js
geo.put(db, feauture, featureID, function(err){
	
})
```

###.put
```js
geo.bboxQuery(db, 
	[-111.3134765625,33.90689555128866,-99.00878906249999,42.16340342422401], 
	function(err, fc){
	
})
```

##usage
```js
var geo = require('level-geography'),
	queue = require('queue-async'),
	levelup = require('levelup');

var pts = JSON.parse(fs.readFileSync('./fixtures/points.geojson'));
var db = levelup('./db');
var q = queue(1);

pts.features.forEach(function(pt, i){
	var featureID = i.toString();
    q.defer(geo.put, db, pt, featureID);
});

q.awaitAll(function(err){
    geo.bboxQuery(db, 
    	[-111.3134765625,33.90689555128866,-99.00878906249999,42.16340342422401], function(err, fc){
        console.log(JSON.stringify(fc))
    });
});
```

