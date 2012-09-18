"use strict";
var Atomic = window.Atomic || {};

Atomic.Graphic = function()
{
	this.active = false;
	this.relative = true;
	this.scrollX = 1;
	this.scrollY = 1;
	this.visible = true;
	this.x = 0;
	this.y = 0;
};

Atomic.Graphic.prototype = {
	render: function(target, point, camera)
	{
	},
	update: function()
	{
	}
};
