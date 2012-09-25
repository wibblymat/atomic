/*global define */
"use strict";
define(function()
{
	function Mask(x, y, graphic, mask)
	{
		this.parent = null;
		this.list = null;
		this.check = this.check || {};
		this.check.Mask = collideMask;
		this.check.MaskList = collideMasklist;
	}

	// Ok, so the original in FP uses the actual class name of the object that is doing the colliding.
	// That obviously isn't going to work in JS, so we'll provide a name to use.
	// We just have to be aware that this means creating a custom Mask class involves overriding the MaskType too.
	// This whole business is pretty horrible
	Mask.prototype.MaskType = "Mask";

	Mask.prototype.collide = function(mask)
	{
		if(this.check[mask.MaskType] !== null) return this.check[mask.MaskType].call(this, mask);
		if(mask.check[this.MaskType] !== null) return mask.check[this.MaskType].call(mask, this);
		return false;
	};

	Mask.prototype.assignTo = function(parent)
	{
		this.parent = parent;
		if(!this.list && parent) this.update();
	};

	Mask.prototype.update = function()
	{
	};

	Mask.prototype.renderDebug = function(g)
	{
	};

	var collideMask = function(other)
	{
		return this.parent.x - this.parent.originX + this.parent.width > other.parent.x - other.parent.originX &&
			this.parent.y - this.parent.originY + this.parent.height > other.parent.y - other.parent.originY &&
			this.parent.x - this.parent.originX < other.parent.x - other.parent.originX + other.parent.width &&
			this.parent.y - this.parent.originY < other.parent.y - other.parent.originY + other.parent.height;
	};

	var collideMasklist = function(other)
	{
		return other.collide(this);
	};

	return Mask;
});
