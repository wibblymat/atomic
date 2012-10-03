/*global define */
// Based on http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Point.html
"use strict";
define(function()
{
	var Point = function(x, y)
	{
		this.x = x || 0;
		this.y = y || 0;
	};

	Object.defineProperty( Point.prototype, "length", {
			get: function()
			{
				return Point.distance(this, new Point(0, 0));
			}
	});

	Point.prototype.add = function(point)
	{
		return new Point(this.x + point.x, this.y + point.y);
	};

	Point.prototype.clone = function()
	{
		return new Point(this.x, this.y);
	};

	Point.prototype.copyFrom = function(point)
	{
		this.x = point.x;
		this.y = point.y;
	};

	Point.prototype.equals = function(point)
	{
		return this.x === point.x && this.y === point.y;
	};

	Point.prototype.normalize = function(length)
	{
		var scale = length / this.length;
		this.x *= scale;
		this.y *= scale;
	};

	Point.prototype.offset = function(dx, dy)
	{
		this.x += dx;
		this.y += dy;
	};

	Point.prototype.setTo = function(x, y)
	{
		this.x = x;
		this.y = y;
	};

	Point.prototype.substract = function(point)
	{
		return new Point(this.x - point.x, this.y - point.y);
	};

	// The AS3 Point class has a seperate toString method but we're fine with the built-in one here

	// Static methods
	Point.distance = function(point1, point2)
	{
		var x = point1.x - point2.x;
		var y = point1.y - point2.y;
		return Math.sqrt(x * x + y * y);
	};

	Point.interpolate = function(point1, point2, f)
	{
		var x = (point1.x - point2.x) * f + point2.x;
		var y = (point1.y - point2.y) * f + point2.y;
		return new Point(x, y);
	};

	Point.polar = function(length, angle)
	{
		return new Point(length * Math.cos(angle), length * Math.sin(angle));
};

	return Point;
});
