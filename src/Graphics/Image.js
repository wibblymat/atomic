"use strict";
var Atomic = window.Atomic || {};
Atomic.Graphics = Atomic.Graphics || {};

// Source must be an image element or a canvas element
// Either way it should have a nodeName, so we can tell what we've got
// clipRect tells us which part of the source image we should actually use
Atomic.Graphics.Image = function(source, clipRect)
{
	Atomic.Graphic.call(this);

	if(source.nodeName === undefined || (source.nodeName.toLowerCase() !== "img" && source.nodeName.toLowerCase() !== "canvas"))
	{
		throw new TypeError("source must be a DOM element of type image or canvas");
	}

	clipRect        = clipRect        || {};
	clipRect.x      = clipRect.x      || 0;
	clipRect.y      = clipRect.y      || 0;
	clipRect.width  = clipRect.width  || source.width;
	clipRect.height = clipRect.height || source.height;

	var buffer = document.createElement("canvas");
	buffer.width = clipRect.width;
	buffer.height = clipRect.height;

	// A lame way to do private/protected values that can still be accessed from the prototype and descendants
	this._ = this._ || {}; // Don't just trash any "private" variables on ancestors
	this._.source = source;
	this._.buffer = buffer;
	this._.clipRect = clipRect;
	this._.locked = false;
	this._.needsUpdate = false;
	this._.needsClear = false;
	this._.tint = function()
	{
		// Add an appropriate tint to the image
		// TODO: Not implemented
	};

	// TODO: Most of these need to be properties so that the setters can cause a buffer update
	this.alpha = 1;
	this.angle = 0;
	this.blend = null; // TODO: BlendModes don't have an equivalent in HTML5 so this isn't going to work
	this.color = "#000000";
	this.drawMask = null;
	this.flipped = false;
	this.originX = 0;
	this.originY = 0;
	this.scale = 1;
	this.scaleX = 1;
	this.scaleY = 1;
	this.smooth = false;
	this.tinting = 0;
	this.tintMode = Atomic.Graphics.Image.TINTING_COLORIZE;

	// TODO: the xor property is just a test
	this.xor = false;

	this.updateBuffer();

};
Atomic.Utils.extend(Atomic.Graphic, Atomic.Graphics.Image);

Atomic.Graphics.Image.TINTING_COLORIZE = 0;
Atomic.Graphics.Image.TINTING_MULTIPLY = 1;

Atomic.Graphics.Image.createCircle = function(radius, color, alpha)
{
	if(color === undefined) color = 0xFFFFFF;
	if(alpha === undefined) alpha = 1;

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	// Turn an integer color into an "rgba()" string
	color = Atomic.Utils.getColorRGBA(color, alpha);
	canvas.width = canvas.height = radius * 2;
	context.fillStyle = color;
	context.beginPath();
	context.arc(radius, radius, radius, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();

	return new Atomic.Graphics.Image(canvas);
};

Atomic.Graphics.Image.createRect = function(width, height, color, alpha)
{
	if(color === undefined) color = 0xFFFFFF;
	if(alpha === undefined) alpha = 1;

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	// Turn an integer color into an "rgba()" string
	color = Atomic.Utils.getColorRGBA(color, alpha);
	canvas.width = width;
	canvas.height = height;
	context.fillStyle = color;
	context.beginPath();
	context.rect(0, 0, width, height);
	context.closePath();
	context.fill();

	return new Atomic.Graphics.Image(canvas);
};

Atomic.Graphics.Image.prototype = {
	centerOrigin: function()
	{
		this.originX = Math.round(this.width / 2);
		this.originY = Math.round(this.height / 2);
	},
	clear: function()
	{
		this._.buffer.getContext("2d").clearRect(0, 0, this._.buffer.width, this._.buffer.height);
	},
	lock: function()
	{
		this._.locked = true;
	},
	render: function(target, point, camera)
	{
		// TODO: Add in transformations. See the original implementation at https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/graphics/Image.as
		var temp = {x: point.x, y: point.y};
		temp.x += this.x - this.originX - camera.x * this.scrollX;
		temp.y += this.y - this.originY - camera.y * this.scrollY;

		var context = target.getContext("2d");

		context.save();
		// TODO: xor is a test!
		if(this.xor) context.globalCompositeOperation = "xor";
		context.drawImage(this._.buffer, temp.x, temp.y);
		context.restore();
	},
	unlock: function()
	{
		this._.locked = false;
	},
	updateBuffer: function(clearFirst)
	{
		if(this.locked)
		{
			this._.needsUpdate = true;
			this._.needsClear = this._.needsClear || clearFirst || false;
		}
		else
		{
			if(clearFirst) this.clear();
			this._.buffer.getContext("2d").drawImage(this._.source, this._.clipRect.x, this._.clipRect.y, this._.clipRect.width, this._.clipRect.height, 0, 0, this._.buffer.width, this._.buffer.height);
			this._.tint();
		}
	}
};

Object.defineProperties( Atomic.Graphics.Image.prototype,
{
	"clipRect": {
		get: function()
		{
			return this._.clipRect;
		}
	},
	"width": {
		get: function()
		{
			return this._.buffer.width;
		}
	},
	"height": {
		get: function()
		{
			return this._.buffer.height;
		}
	},
	"scaledWidth": {
		get: function()
		{
			return this.width * this.scale * this.scaleX;
		}
	},
	"scaledHeight": {
		get: function()
		{
			return this.height * this.scale * this.scaleY;
		}
	},
	"locked": {
		get: function()
		{
			return this._.locked;
		}
	}
});
