/*global head: true */
"use strict";

window.URL = window.URL || window.webkitURL;
window.performance = window.performance || window.msperformance;
window.performance.now = window.performance.now || window.performance.webkitNow;

var Atomic = (function()
{
	var scriptQueue = []; // Array of JS scripts to be loaded (in order)
	var frameStart = window.performance.now();
	var atomic = {
		VERSION: "0.1",
		debug: false,
		stage: null,
		width: 640,
		height: 480,
		scale: 1,
		world: null,
		elapsed: 0,
		ready: function(callback)
		{
			// Register a callback for when the ready event fires
			// The ready event happens when all required JS has been loaded
			// TODO: What to do if the ready event already fired?
			// * Call the callback directly (taking flow away from the caller)
			// * Call the callback via setTimeout or similar
			// * Return a false value here or similar
			// * Ignore it
			// * Log it
			$(document).bind("Atomic.ready", callback);
		},
		require: function() // Load JS files
		{
			// If head.js is already loaded then go ahead and load. Otherwise queue for later.
			if(head !== undefined)
			{
				head.js.apply(head, arguments);
			}
			else
			{
				scriptQueue = scriptQueue.concat(arguments);
			}
		},
		init: function(options)
		{
			atomic.width  = options.width     || atomic.width;
			atomic.height = options.height    || atomic.height;
			atomic.scale  = options.scale     || atomic.scale;
			var container = options.container || document.body;
			container.appendChild(atomic.stage);
			// TODO: maybe abstract away atomic.stage elsewhere so that it could have multiple layers, be 2d or webgl or not even canvas or whatever
			atomic.stage.width = atomic.width * atomic.scale;
			atomic.stage.height = atomic.height * atomic.scale;
			atomic.stage.focus();
			// TODO: Make the image smoothing option cross-browser, similar to rAF
			atomic.stage.getContext("2d").scale(atomic.scale, atomic.scale);
			atomic.stage.getContext("2d").webkitImageSmoothingEnabled = false;
			mainLoop();
		}
	};

	scriptQueue = [
		"http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js",
		"libs/atomic/Animation.js",
		"libs/atomic/AssetManager.js",
		"libs/atomic/Audio.js",
		"libs/atomic/Entity.js",
		"libs/atomic/Input.js",
		"libs/atomic/Key.js",
		"libs/atomic/Sound.js",
		"libs/atomic/SpriteSheet.js",
		"libs/atomic/Utils.js",
		"libs/atomic/World.js",
		"js/main.js"
	];

	var headScript = document.createElement("script");
	headScript.src = "libs/head.load.min.js";
	headScript.onload = function()
	{
		head.js.apply(head, scriptQueue);
		head.ready(function()
		{
			$(document).trigger("Atomic.ready");
		});
		scriptQueue = [];
	};
	document.head.appendChild(headScript);

	// We don't size the canvas or add it to the document until init()
	// However, we still create the element now so that it is available in sub-modules as they load
	atomic.stage = document.createElement("canvas");
	atomic.stage.tabIndex = 1; // Make the canvas focusable

	var frameRequest;
	var mainLoop = function(timestamp)
	{
		frameRequest = window.requestAnimationFrame(mainLoop);
		atomic.elapsed = timestamp - frameStart;
		frameStart = timestamp;

		$(atomic).trigger("startFrame");
		if(atomic.world)
		{
			$(atomic.world).trigger("frame");
		}
		$(atomic).trigger("endFrame");
	};

	// TODO: focus and blur events on the stage should unpause/pause the game

	return atomic;
}());


// Before we finish we need to set up our environment the way we like it
// Set up requestAnimationFrame
// Here seems as good a place as any other
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// Original by Erik Möller with fixes from Paul Irish and Tino Zijdel
(function()
{
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if(!window.requestAnimationFrame)
	{
		window.requestAnimationFrame = function(callback, element)
		{
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if(!window.cancelAnimationFrame)
	{
		window.cancelAnimationFrame = function(id)
		{
			clearTimeout(id);
		};
	}
}());
