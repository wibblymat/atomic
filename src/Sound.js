"use strict";
var Atomic = window.Atomic || {};

Atomic.Sound = function(buffer)
{
	this.source = Atomic.Audio.context.createBufferSource();
	this.source.buffer = buffer;
	this.source.connect(Atomic.Audio.context.destination);
};

Atomic.Sound.prototype.play = function()
{
	this.source.noteOn(0);
};
