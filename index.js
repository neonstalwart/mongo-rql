module.exports = parse;

var parseRql = require('rql/parser').parse,
	isOperatorKey = /^\$/;

function parse(query, options) {
	options = options || {};
	query = parseRql(query, options.parameters);

	return toMongo(query);
}

function toMongo(value, query) {
	query = query || {
		skip: 0,
		limit: 0,
		criteria: {},
		sort: null,
		projections: null
	};

	var operators = parse.operators,
		operator;

	if (value && typeof value === 'object' && !(value instanceof RegExp)) {
		if (Array.isArray(value)) {
			return value.map(function (v) {
				return toMongo(v);
			});
		}
		else {
			operator = operators[ value.name ];
			if (operator) {
				return operator.apply(query, toMongo(value.args));
			}
			else {
				throw new Error('unsupported operator: ' + value.name);
			}
		}
	}
	else {
		return value;
	}
}

parse.operators = {
	// TODO: is it possible to sort by nested properties?
	sort: reducer(function (query, attribute) {
		var sort = query.sort || (query.sort = {}),
			firstChar = attribute[0],
			descending = false;

		if (firstChar === '-') {
			descending = true;
			attribute = attribute.slice(1);
		}
		else if (firstChar === '+') {
			attribute = attribute.slice(1);
		}

		sort[ attribute ] = descending ? -1 : 1;

		return query;
	}),

	limit: function (limit, start) {
		this.limit = limit || 0;
		this.skip = start || 0;

		return this;
	},

	and: reducer(and),

	or: selectCriteria(function () {
		this.criteria.$or = Array.prototype.slice.call(arguments);
		return this;
	}),

	eq: path(function (prop, value) {
		this.criteria[ prop ] = value;
	}),

	ne: path(criteria('$ne')),

	gt: path(criteria('$gt')),

	lt: path(criteria('$lt')),

	ge: path(criteria('$gte')),

	le: path(criteria('$lte')),

	in: path(criteria('$in')),

	out: path(criteria('$nin')),

	contains: path(function (prop, value) {
		return criteria('$in').call(this, prop, [ value ]);
	}),

	excludes: path(function (prop, value) {
		return criteria('$nin').call(this, prop, [ value ]);
	}),

	unselect: reducer(function (query, prop) {
		return path(projection).call(query, prop, 0);
	}),

	select: reducer(function (query, prop) {
		return path(projection).call(query, prop, 1);
	}),

	match: path(function (prop, value) {
		// TODO: use $regex if/when needed
		this.criteria[ prop ] = value;
	})
};

function reducer(reduce) {
	return function () {
		return Array.prototype.reduce.call(arguments, reduce, this);
	};
}

function path(operator) {
	return function (path, value) {
		if (Array.isArray(path)) {
			path = path.join('.');
		}

		operator.call(this, path, value);

		return this;
	};
}

function and(a, b) {
	Object.keys(b).reduce(function (term, key) {
		var source = b[ key ],
			dest = term[ key ],
			terms;

		// use $and if the same operator exists in the current term
		if (isOperatorKey.test(key) && key in term && source !== dest) {
			dest = null;
			terms = a.$and;
			term = {};
			if (!terms) {
				a = { $and: [ a, term ] };
			}
			else {
				terms.push(term);
			}
		}

		if (source && typeof source === 'object' && !(source instanceof RegExp)) {
			if (Array.isArray(source)) {
				// shallow copy arrays
				source = (dest || []).concat(source);
			}
			else {
				source = and(dest || {}, source);
			}
		}

		term[ key ] = source;

		return term;
	}, a);

	return a;
}

function projection(prop, value) {
	var projections = this.projections || (this.projections = {});

	projections[ prop ] = value;

	return this;
}

function criteria(key) {
	return function (prop, value) {
		var criteria = this.criteria[ prop ] || (this.criteria[ prop ] = {});

		criteria[ key ] = value;

		return this;
	};
}

function selectCriteria(operator) {
	return function () {
		return operator.apply(this, Array.prototype.map.call(arguments, function (q) {
			return q.criteria;
		}));
	};
}
