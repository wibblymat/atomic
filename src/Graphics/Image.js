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

	this._.alpha = 1;
	this._.color = 0x00FFFFFF;
	this._.tinting = 1;
	this._.tintMode = Atomic.Graphics.Image.TINTING_MULTIPLY;
	this._.flipped = false;
	this._.drawMask = null;
	this._.tint = null;

	this.angle = 0; // TODO: Not implemented
	// TODO: Blend modes in HTML5: https://github.com/pnitsch/BitmapData.js/blob/master/js/BitmapData.js
	// Note the lack of INVERT
	this.blend = null;
	this.originX = 0;
	this.originY = 0;
	this.scale = 1;
	this.scaleX = 1;
	this.scaleY = 1;
	this.smooth = false; // TODO: Not implemented

	// TODO: the xor property is just a test
	this.xor = false;

	this.updateColorTransform();
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

Atomic.Graphics.Image.prototype.centerOrigin = function()
{
	this.originX = Math.round(this.width / 2);
	this.originY = Math.round(this.height / 2);
};

Atomic.Graphics.Image.prototype.clear = function()
{
	this._.buffer.getContext("2d").clearRect(0, 0, this._.buffer.width, this._.buffer.height);
};

Atomic.Graphics.Image.prototype.lock = function()
{
	this._.locked = true;
};

Atomic.Graphics.Image.prototype.render = function(target, point, camera)
{
	// TODO: Check that we support all of the transformations in https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/graphics/Image.as
	var scaleX = this.scaleX * this.scale;
	var scaleY = this.scaleY * this.scale;

	var temp = {x: point.x, y: point.y};
	temp.x += this.x - this.originX * scaleX - camera.x * this.scrollX;
	temp.y += this.y - this.originY * scaleY - camera.y * this.scrollY;

	var context = target.getContext("2d");

	context.save();
	// TODO: xor is a test!
	if(this.xor) context.globalCompositeOperation = "xor";
	context.translate(temp.x, temp.y);
	context.scale(scaleX, scaleY);
	context.drawImage(this._.buffer, 0, 0);
	context.restore();
};

Atomic.Graphics.Image.prototype.unlock = function()
{
	this._.locked = false;
};

Atomic.Graphics.Image.prototype.updateBuffer = function(clearFirst)
{
	//TODO: Cache transformed buffers. Lookup on all state that can change what updateBuffer does
	if(this.locked)
	{
		this._.needsUpdate = true;
		this._.needsClear = this._.needsClear || clearFirst || false;
	}
	else
	{
		var context = this._.buffer.getContext("2d");
		//TODO: Why would I ever not clear if I'm drawing?
		//if(clearFirst)
			this.clear();
		context.save();
		if(this.flipped)
		{
			context.translate(this._.buffer.width, 0);
			context.scale(-1, 1);
		}
		context.globalAlpha = this.alpha;
		context.drawImage(this._.source, this._.clipRect.x, this._.clipRect.y, this._.clipRect.width, this._.clipRect.height, 0, 0, this._.buffer.width, this._.buffer.height);
		context.restore();
		if(this._.tint)
		{
			var struct = context.getImageData(0, 0, this._.buffer.width, this._.buffer.height);
			var data = struct.data;
			for(var i = 0; i < this._.buffer.width * this._.buffer.height * 4; i += 4)
			{
				data[i] = data[i] * this._.tint.redMultiplier + this._.tint.redOffset;
				data[i + 1] = data[i] * this._.tint.greenMultiplier + this._.tint.greenOffset;
				data[i + 2] = data[i] * this._.tint.blueMultiplier + this._.tint.blueOffset;
			}
			context.putImageData(struct, 0, 0);
		}
	}
};

Atomic.Graphics.Image.prototype.updateColorTransform = function()
{
	/*jshint bitwise: false */
	if(this._.tinting === 0)
	{
		this._.tint = null;
		return this.updateBuffer();
	}
	if((this._.tintMode === Atomic.Graphics.Image.TINTING_MULTIPLY) && (this._.color === 0xFFFFFF))
	{
		this._.tint = null;
		return this.updateBuffer();
	}

	this._.tint = {};

	this._.tint.redMultiplier   = this._.tintMode * (1.0 - this._.tinting) + (1-this._.tintMode) * (this._.tinting * (Number(this._.color >> 16 & 0xFF) / 255 - 1) + 1);
	this._.tint.greenMultiplier = this._.tintMode * (1.0 - this._.tinting) + (1-this._.tintMode) * (this._.tinting * (Number(this._.color >> 8 & 0xFF) / 255 - 1) + 1);
	this._.tint.blueMultiplier  = this._.tintMode * (1.0 - this._.tinting) + (1-this._.tintMode) * (this._.tinting * (Number(this._.color & 0xFF) / 255 - 1) + 1);
	this._.tint.redOffset       = (this._.color >> 16 & 0xFF) * this._.tinting * this._.tintMode;
	this._.tint.greenOffset     = (this._.color >> 8 & 0xFF) * this._.tinting * this._.tintMode;
	this._.tint.blueOffset      = (this._.color & 0xFF) * this._.tinting * this._.tintMode;
	this.updateBuffer();
	/*jshint bitwise: true */
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
	},
	"alpha": {
		get: function(){ return this._.alpha; },
		set: function(value)
		{
			value = value < 0 ? 0 : (value > 1 ? 1 : value);
			if(this._.alpha === value) return;
			this._.alpha = value;
			this.updateBuffer();
		}
	},
	"color": {
		get: function(){ return this._.color; },
		set: function(value)
		{
			/*jshint bitwise: false */
			value = value & 0xFFFFFF;
			/*jshint bitwise: true */
			if(this._.color === value) return;
			this._.color = value;
			this.updateColorTransform();
		}
	},
	"tinting": {
		get: function(){ return this._.tinting; },
		set: function(value)
		{
			if(this._.tinting === value) return;
			this._.tinting = value;
			this.updateColorTransform();
		}
	},
	"tintMode": {
		get: function(){ return this._.tintMode; },
		set: function(value)
		{
			if(this._.tintMode === value) return;
			this._.tintMode = value;
			this.updateColorTransform();
		}
	},
	"flipped": {
		get: function(){ return this._.flipped; },
		set: function(value)
		{
			if(this._.flipped === value) return;
			this._.flipped = value;
			this.updateBuffer();
		}
	},
	"drawMask": {
		get: function(){ return this._.drawMask; },
		set: function(value)
		{
			this._.drawMask = value;
			this.updateBuffer(true);
		}
	}
});
