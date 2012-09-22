/*global define */
"use strict";
define(function()
{
	// Objects to represent multi-dimensional data structures, like a 2d grid
	// Maybe use typed arrays for storage - http://www.khronos.org/registry/typedarray/specs/latest/
	function Space()
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
	}

	var getIndex = function()
	{
		var i, index = 0;
		if(arguments.length !== this.multipliers.length)
		{
			throw new TypeError("Not enough arguments passed");
		}

		for(i = 0; i < this.multipliers.length; i++)
		{
			if(arguments[i] < 0) return undefined;
			if(i < this.multipliers.length - 1 && arguments[i] >= this.multipliers[i + 1]) return undefined;
			index += arguments[i] * this.multipliers[i];
		}
		return index;
	};

	Space.prototype.get = function()
	{
		var index = getIndex.apply(this, arguments);
		return index !== undefined ? this.data[index] : undefined;
	};

	Space.prototype.set = function()
	{
		var value = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		var index = getIndex.apply(this, args);
		if(index !== undefined) this.data[index] = value;
	};

	return Space;
});
