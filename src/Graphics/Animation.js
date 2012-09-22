/*global define */
"use strict";
define(function()
{
	function Animation(name, frames, frameRate, loop)
	{
		if(loop === undefined) loop = true;

		this.parent = null;
		this.name = name;
		this.frames = frames;
		this.frameRate = frameRate || 0;
		this.loop = loop;
		this.frameCount = frames.length;
	}

	Animation.prototype.play = function(reset)
	{
		this.parent.play(this.name, !!reset);
	};

	return Animation;
});
