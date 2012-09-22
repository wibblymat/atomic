/*global define */
"use strict";
define(["Utils", "Mask"], function(Utils, Mask)
{
	function Hitbox(width, height, x, y)
	{
		Mask.call(this);

		this._width = width === undefined ? 1 : width;
		this._height = height === undefined ? 1 : height;
		this._x = x || 0;
		this._y = y || 0;

		this.check.Mask = collideMask;
		this.check.Hitbox = collideHitbox;
	}

	Utils.extend(Mask, Hitbox);

	Hitbox.prototype.MaskType = "Hitbox";

	Hitbox.prototype.update = function()
	{
		if(this.list)
		{
			// update parent list
			this.list.update();
		}
		else if(this.parent)
		{
			// update entity bounds
			this.parent.originX = -this._x;
			this.parent.originY = -this._y;
			this.parent.width = this._width;
			this.parent.height = this._height;
		}
	};

	var collideMask = function(other)
	{
		return this.parent.x + this.x + this.width > other.parent.x - other.parent.originX &&
			this.parent.y + this.y + this.height > other.parent.y - other.parent.originY &&
			this.parent.x + this.x < other.parent.x - other.parent.originX + other.parent.width &&
			this.parent.y + this.y < other.parent.y - other.parent.originY + other.parent.height;
	};

	var collideHitbox = function(other)
	{
		return this.parent.x + this.x + this.width > other.parent.x + other.x &&
			this.parent.y + this.y + this.height > other.parent.y + other.y &&
			this.parent.x + this.x < other.parent.x + other.x + other.width &&
			this.parent.y + this.y < other.parent.y + other.y + other.height;
	};

	Object.defineProperties(Hitbox.prototype, {
		"x": {
			get: function(){ return this._x; },
			set: function(value)
			{
				if(this._x === value) return;
				this._x = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		},
		"y": {
			get: function(){ return this._y; },
			set: function(value)
			{
				if(this._y === value) return;
				this._y = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		},
		"width": {
			get: function(){ return this._width; },
			set: function(value)
			{
				if(this._width === value) return;
				this._width = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		},
		"height": {
			get: function(){ return this._height; },
			set: function(value)
			{
				if(this._height === value) return;
				this._height = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		}
	});

	return Hitbox;
});
