"use strict";
var Atomic = window.Atomic || {};

Atomic.Animation = function(spritesheet, options)
{
	var frameWidth      = options.frameWidth      || 16;
	var frames          = options.frames          || Math.floor(spritesheet.width / frameWidth);
	var framesPerSecond = options.framesPerSecond || 10;
	var loop            = options.loop            || false;
	var startTime       = null; // null means not started yet
	var cache = [];
	var canvas;

	for(var i = 0; i < frames; i++)
	{
		canvas = document.createElement("canvas");
		canvas.width = frameWidth;
		canvas.height = spritesheet.height;
		canvas.getContext("2d").drawImage(spritesheet, i * frameWidth, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		cache[i] = canvas;
	}

	var animation = {
		width: frameWidth,
		height: spritesheet.height,
		start: function()
		{
			startTime = window.performance.now();
		},
		stop: function()
		{
			startTime = null;
		},
		finished: function()
		{
			if(loop) return false;
			if(startTime === null) return true;

			return window.performance.now() > startTime + (frames / framesPerSecond) * 1000;
		},
		getFrame: function()
		{
			if(animation.finished() || startTime === null) return cache[0];
			var current = Math.floor((window.performance.now() - startTime) * framesPerSecond / 1000) % frames;
			return cache[current];
		}
	};

	return animation;
};
