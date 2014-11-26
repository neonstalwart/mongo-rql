// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
define({
	// Configuration options for the module loader; any AMD configuration options supported by the specified AMD loader
	// can be used here
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [
			{ name: 'mongo-rql', location: '.' },
			{ name: 'dojo', location: './node_modules/intern/node_modules/dojo'  }
		]
	},

	reporters: [ 'console', 'lcovhtml' ],

	// Non-functional test suite(s) to run in each browser
	suites: [ 'mongo-rql/tests/all' ],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(?:tests|node_modules)\//
});
