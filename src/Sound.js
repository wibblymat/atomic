/*global define */
"use strict";
define(["Audio"], function(Audio)
{
	function Sound(buffer)
	{
		this.source = Audio.context.createBufferSource();
		this.source.buffer = buffer;
		this.source.connect(Audio.context.destination);
	}

	Sound.prototype.play = function()
	{
		this.source.noteOn(0);
	};

	return Sound;
});
