define(function (require) {
	var test = require('intern!object'),
		assert = require('intern/chai!assert'),
		mongoRql = require('dojo/node!../index'),
		Query = require('dojo/node!rql/query').Query,
		expected;

	test({
		name: 'mongo-rql parse tests',

		beforeEach: function () {
			expected = {
				criteria: {},
				skip: 0,
				limit: 0,
				sort: null,
				projections: null
			};
		},

		'is a function': function () {
			assert.typeOf(mongoRql, 'function', 'mongo-rql is a function');
		},

		'returns a query with criteria, skip, limit, sort, and projections': function () {
			var actual = mongoRql();

			assert.typeOf(actual, 'object');
			assert.property(actual, 'criteria');
			assert.property(actual, 'skip');
			assert.property(actual, 'limit');
			assert.property(actual, 'sort');
			assert.property(actual, 'projections');
		},

		'empty query': function () {
			var actual = mongoRql();

			assert.deepEqual(actual, expected);
		},

		'converts rql queries to mongo objects': function () {
			var query = new Query().gt('qty', 25),
				actual = mongoRql(query);

			expected.criteria = {
				qty: { $gt: 25 }
			};

			assert.deepEqual(actual, expected);
		},

		'parses strings': function () {
			var query = 'gt(qty,25)',
				actual = mongoRql(query);

			expected.criteria = {
				qty: { $gt: 25 }
			};

			assert.deepEqual(actual, expected);
		},

		operators: {
			sort: function () {
				var color = 'yellow',
					query = new Query().eq('color', color).sort('-size', 'price'),
					actual = mongoRql(query);

				expected.criteria = {
					color: color
				};

				expected.sort = {
					size: -1,
					price: 1
				};

				assert.deepEqual(actual, expected);
			},

			match: function () {
				var colors = /yellow|red|blue/,
					query = new Query().match('color', colors),
					actual = mongoRql(query);

				expected.criteria = {
					color: colors
				};

				assert.deepEqual(actual, expected);
			},

			in: function () {
				var colors = [ 'yellow', 'red', 'orange' ],
					query = new Query().in('color', colors),
					actual = mongoRql(query);

				expected.criteria = {
					color: { $in: colors }
				};

				assert.deepEqual(actual, expected);
			},

			out: function () {
				var colors = [ 'yellow', 'red', 'orange' ],
					query = new Query().out('color', colors),
					actual = mongoRql(query);

				expected.criteria = {
					color: { $nin: colors }
				};

				assert.deepEqual(actual, expected);
			},

			or: function () {
				var color = 'yellow',
					price = 7.95,
					query = new Query().or(new Query().eq('color', color), new Query().lt('price', price)),
					actual = mongoRql(query);

				expected.criteria = {
					$or: [
						{ color: color },
						{ price: { $lt: price } }
					]
				};

				assert.deepEqual(actual, expected);
			},

			and: function () {
				var color = 'yellow',
					price = 7.95,
					query = new Query().and(new Query().eq('color', color), new Query().lt('price', price)),
					actual = mongoRql(query);

				expected.criteria = {
					color: color,
					price: { $lt: price }
				};

				assert.deepEqual(actual, expected);
			},

			select: function () {
				var color = 'yellow',
					query = new Query().eq('color', color).select('size', 'description'),
					actual = mongoRql(query);

				expected.criteria = {
					color: color
				};

				expected.projections = {
					size: 1,
					description: 1
				};

				assert.deepEqual(actual, expected);
			},

			unselect: function () {
				// TODO: unselect is not supported in rql/query
				var color = 'yellow',
					query = 'eq(color,yellow)&unselect(manufacturer,secret)',
					actual = mongoRql(query);

				expected.criteria = {
					color: color
				};

				expected.projections = {
					manufacturer: 0,
					secret: 0
				};

				assert.deepEqual(actual, expected);
			},

			contains: function () {
				var color = 'yellow',
					query = new Query().contains('colors', color),
					actual = mongoRql(query);

				expected.criteria = {
					colors: { $in: [ color ] }
				};

				assert.deepEqual(actual, expected);
			},

			excludes: function () {
				var color = 'yellow',
					query = new Query().excludes('colors', color),
					actual = mongoRql(query);

				expected.criteria = {
					colors: { $nin: [ color ] }
				};

				assert.deepEqual(actual, expected);
			},

			limit: function () {
				var color = 'yellow',
					query = new Query().eq('color', color).limit(20, 3),
					actual = mongoRql(query);

				expected.criteria = {
					color: color
				};

				expected.skip = 3;
				expected.limit = 20;

				assert.deepEqual(actual, expected);
			},

			eq: function () {
				var name = 'Bob',
					query = new Query().eq([ 'name', 'first' ], name),
					actual = mongoRql(query);

				expected.criteria = {
					'name.first': name
				};

				assert.deepEqual(actual, expected);
			},

			ne: function () {
				var name = 'Bob',
					query = new Query().ne([ 'name', 'first' ], name),
					actual = mongoRql(query);

				expected.criteria = {
					'name.first': { $ne: name }
				};

				assert.deepEqual(actual, expected);
			},

			le: function () {
				var name = 'Bob',
					query = new Query().le([ 'name', 'first' ], name),
					actual = mongoRql(query);

				expected.criteria = {
					'name.first': { $lte: name }
				};

				assert.deepEqual(actual, expected);
			},

			ge: function () {
				var name = 'Bob',
					query = new Query().ge([ 'name', 'first' ], name),
					actual = mongoRql(query);

				expected.criteria = {
					'name.first': { $gte: name }
				};

				assert.deepEqual(actual, expected);
			},

			lt: function () {
				var name = 'Bob',
					query = new Query().lt([ 'name', 'first' ], name),
					actual = mongoRql(query);

				expected.criteria = {
					'name.first': { $lt: name }
				};

				assert.deepEqual(actual, expected);
			},

			gt: function () {
				var name = 'Bob',
					query = new Query().gt([ 'name', 'first' ], name),
					actual = mongoRql(query);

				expected.criteria = {
					'name.first': { $gt: name }
				};

				assert.deepEqual(actual, expected);
			}
		},

		'query a range': function () {
			var lower = 'lower',
				upper = 'upper',
				query = new Query().gt('field', lower).lt('field', upper),
				actual = mongoRql(query);

			expected.criteria = {
				field: {
					$gt: lower,
					$lt: upper
				}
			};

			assert.deepEqual(actual, expected);
		},

		'and queries with multiple expressions specifying the same operator': function () {
			// see http://docs.mongodb.org/manual/reference/operator/query/and/#and-queries-with-multiple-expressions-specifying-the-same-operator
			var price99 = new Query().eq('price', 0.99),
				price199 = new Query().eq('price', 1.99),
				onSale = new Query().eq('sale', true),
				quantityLt20 = new Query().lt('qty', 20),
				query = new Query().and(new Query().or(price99, price199), new Query().or(onSale, quantityLt20)),
				actual = mongoRql(query);

			expected.criteria = {
				$and: [
					{ $or: [ { price: 0.99 }, { price: 1.99 } ] },
					{ $or: [ { sale: true }, { qty: { $lt: 20 } } ] }
				]
			};

			assert.deepEqual(actual, expected);
		},

		'properly merges queries': function () {
			var query = 'sort(+headline)&limit(10,0)',
				actual = mongoRql(query);

			expected.sort = { headline: 1 };
			expected.limit = 10;

			assert.deepEqual(actual, expected);
		}
	});
});
