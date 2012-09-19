// Objects to represent multi-dimensional data structures, like a 2d grid
// Maybe use typed arrays for storage - http://www.khronos.org/registry/typedarray/specs/latest/
"use strict";
var Atomic = window.Atomic || {};
Atomic.Space = function()
{
	if(arguments.length === 0) throw new TypeError("Tried to create a zero-dimensional space");
	this.multipliers = [];
	var total = 1;
	for(var i = 0; i < arguments.length; i++)
	{
		this.multipliers[i] = total;
		total *= arguments[i];
	}

	this.data = [];
};

Atomic.Space.prototype = {
	getIndex: function()
	{
		var i, index = 0;
		if(arguments.length !== this.multipliers.length)
		{
			throw new TypeError("Not enough arguments passed");
		}

		for(i = 0; i < this.multipliers.length; i++)
		{
			index += arguments[i] * this.multipliers[i];
		}
		return index;
	},
	get: function()
	{
		return this.data[this.getIndex.apply(this, arguments)];
	},
	set: function()
	{
		var value = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		var index = this.getIndex.apply(this, args);
		this.data[index] = value;
	}
};
