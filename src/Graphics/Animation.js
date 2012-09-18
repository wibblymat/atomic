"use strict";
var Atomic = window.Atomic || {};
Atomic.Graphics = Atomic.Graphics || {};

Atomic.Graphics.Animation = function(name, frames, frameRate, loop)
{
	if(loop === undefined) loop = true;

	this.parent = null;
	this.name = name;
	this.frames = frames;
	this.frameRate = frameRate || 0;
	this.loop = loop;
	this.frameCount = frames.length;
};

Atomic.Graphics.Animation.prototype = {
	play: function(reset)
	{
		this.parent.play(this.name, !!reset);
	}
};
