"use strict";
var Atomic = window.Atomic || {};

Atomic.Mask = function(x, y, graphic, mask)
{
	this.parent = null;
	this.list = null;

	// // Mask information.
	// /** @private */ private var _class:Class;
	// /** @private */ protected var _check:Dictionary = new Dictionary;

	_class = Class(getDefinitionByName(getQualifiedClassName(this)));
	_check[Mask] = collideMask;
	_check[Masklist] = collideMasklist;
};

Atomic.Mask.prototype.collide = function(mask)
{
	if(_check[mask._class] != null) return _check[mask._class](mask);
	if(mask._check[_class] != null) return mask._check[_class](this);
	return false;
};

Atomic.Mask.prototype.collideMask = function(other)
{
	return parent.x - parent.originX + parent.width > other.parent.x - other.parent.originX &&
		parent.y - parent.originY + parent.height > other.parent.y - other.parent.originY &&
		parent.x - parent.originX < other.parent.x - other.parent.originX + other.parent.width &&
		parent.y - parent.originY < other.parent.y - other.parent.originY + other.parent.height;
};

Atomic.Mask.prototype.collideMasklist = function(other)
{
	return other.collide(this);
};

Atomic.Mask.prototype.assignTo = function(parent)
{
	this.parent = parent;
	if(!this.list && parent) this.update();
};

Atomic.Mask.prototype.update = function()
{
};

Atomic.Mask.prototype.renderDebug = function(g)
{
};
