# mongo-rql

Convert [RQL](https://github.com/persvr/rql) into MongoDB queries

[![Build
Status](https://travis-ci.org/neonstalwart/mongo-rql.svg?branch=master)](https://travis-ci.org/neonstalwart/mongo-rql)

# Example

```js
var mongoRql = require('mongo-rql'),
	Query = require('rql/query').Query,
	color = 'yellow',
	query = new Query().eq('color', color).sort('-size', 'price'),
	mongoQuery = mongoRql(query),
	cursor = db.collection.find(mongoQuery.criteria, {
		skip: mongoQuery.skip,
		limit: mongoQuery.limit,
		fields: mongoQuery.projection,
		sort: mongoQuery.sort
	});

	cursor.toArray(function (err, docs) {
		// ...
	});
```

# Install

With [npm](https://npmjs.org/package/npm) do:

```sh
npm install mongo-query
```

# License

[New BSD License](LICENSE). All code is developed under the terms of the [Dojo Foundation CLA](http://dojofoundation.org/about/cla).

© 2014 Ben Hockey
