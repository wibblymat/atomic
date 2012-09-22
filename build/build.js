{
	"baseUrl": "../src",
	"paths": {
		"jquery": "../lib/jquery-1.8.1"
	},
	"include": ["../build/almond", "main"],
	"exclude": ["jquery"],
	"out": "../dist/atomic.js",
	"wrap": {
		"startFile": "wrap.start",
		"endFile": "wrap.end"
	},
	"optimize": "none",
	"useStrict": true
}
