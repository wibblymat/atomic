/*global define */
"use strict";
define(function(require)
{
	window.URL = window.URL || window.webkitURL;
	window.performance = window.performance || window.msperformance || {};
	window.performance.now = window.performance.now || window.performance.webkitNow || Date.now;

	var frameStart = 0;
	var world = null;
	var nextworld = null;
	var atomic = {
		VERSION: "0.1",
		debug: false,
		stage: null,
		scale: 1,
		smooth: true,
		camera: {x: 0, y: 0},
		elapsed: 0,
		backgroundColor: "#000000",
		init: function(options)
		{
			atomic.width  = options.width     || atomic.width;
			atomic.height = options.height    || atomic.height;
			atomic.scale  = options.scale     || atomic.scale;
			atomic.smooth = options.smooth    || atomic.smooth;
			var container = options.container || document.body;
			container.appendChild(atomic.stage);
			// TODO: maybe abstract away atomic.stage elsewhere so that it could have multiple layers, be 2d or webgl or not even canvas or whatever
			atomic.stage.style.backgroundColor = atomic.backgroundColor;
			atomic.stage.width = atomic.width * atomic.scale;
			atomic.stage.height = atomic.height * atomic.scale;
			atomic.stage.style.outline = 0;
			atomic.stage.style.position = "absolute";
			atomic.stage.style.outline = 0;
			atomic.stage.focus();

			var resize = function()
			{
				atomic.stage.style.left = ((container.offsetWidth / 2) - atomic.halfWidth * atomic.scale) + "px";
			};
			$(window).resize(resize);
			resize();

			// TODO: Make the image smoothing option cross-browser, similar to rAF
			atomic.stage.getContext("2d").scale(atomic.scale, atomic.scale);
			atomic.stage.getContext("2d").webkitImageSmoothingEnabled = atomic.smooth; // TODO: webkit prefix!
			frameStart = window.performance.now();
			mainLoop();
		}
	};

	var width = 640;
	var height = 480;
	var halfWidth = Math.round(width / 2);
	var halfHeight = Math.round(height / 2);

	Object.defineProperties( atomic,
	{
		"width": {
			get: function()
			{
				return width;
			},
			set: function(value)
			{
				width = value;
				halfWidth = Math.round(width / 2);
			}
		},
		"height": {
			get: function()
			{
				return height;
			},
			set: function(value)
			{
				height = value;
				halfHeight = Math.round(height / 2);
			}
		},
		"halfWidth": {
			get: function()
			{
				return halfWidth;
			}
		},
		"halfHeight": {
			get: function()
			{
				return halfHeight;
			}
		},
		"world": {
			get: function()
			{
				return world;
			},
			set: function(value)
			{
				if(world === value) return;
				nextworld = value;
			}
		}
	});

	// We don't size the canvas or add it to the document until init()
	// However, we still create the element now so that it is available in sub-modules as they load
	atomic.stage = document.createElement("canvas");
	atomic.stage.tabIndex = 1; // Make the canvas focusable

	var frameRequest;
	var mainLoop = function()
	{
		frameRequest = window.requestAnimationFrame(mainLoop);

		var timestamp = window.performance.now();
		atomic.elapsed = (timestamp - frameStart) / 1000; // Work in seconds rather than milliseconds
		frameStart = timestamp;

		if(nextworld)
		{
			if(world) world.end();
			world = nextworld;
			nextworld = null;
			atomic.camera = world.camera;
			world.begin();
		}

		$(atomic).trigger("startFrame");
		if(atomic.world)
		{
			atomic.world.update();
			atomic.world.draw();
		}
		$(atomic).trigger("endFrame");

		timestamp = window.performance.now();
		atomic.duration = (timestamp - frameStart) / 1000; // Measure the
	};

	// TODO: focus and blur events on the stage should unpause/pause the game

	return atomic;
});


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
