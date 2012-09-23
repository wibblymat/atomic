/*global define */
"use strict";
define(["Utils", "Graphic"], function(Utils, Graphic)
{
	// Source must be an image element or a canvas element
	// Either way it should have a nodeName, so we can tell what we've got
	// clipRect tells us which part of the source image we should actually use
	function Image(source, clipRect)
	{
		Graphic.call(this);

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

		this._source = source;
		this._buffer = buffer;
		this._clipRect = clipRect;
		this._locked = false;
		this._needsUpdate = false;
		this._needsClear = false;

		this._alpha = 1;
		this._color = 0x00FFFFFF;
		this._tinting = 1;
		this._tintMode = Image.TINTING_MULTIPLY;
		this._flipped = false;
		this._drawMask = null;
		this._tint = null;

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

	}

	Utils.extend(Graphic, Image);

	Image.TINTING_COLORIZE = 0;
	Image.TINTING_MULTIPLY = 1;

	Image.createCircle = function(radius, color, alpha)
	{
		if(color === undefined) color = 0xFFFFFF;
		if(alpha === undefined) alpha = 1;

		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		// Turn an integer color into an "rgba()" string
		color = Utils.getColorRGBA(color, alpha);
		canvas.width = canvas.height = radius * 2;
		context.fillStyle = color;
		context.beginPath();
		context.arc(radius, radius, radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();

		return new Image(canvas);
	};

	Image.createRect = function(width, height, color, alpha)
	{
		if(color === undefined) color = 0xFFFFFF;
		if(alpha === undefined) alpha = 1;

		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		// Turn an integer color into an "rgba()" string
		color = Utils.getColorRGBA(color, alpha);
		canvas.width = width;
		canvas.height = height;
		context.fillStyle = color;
		context.beginPath();
		context.rect(0, 0, width, height);
		context.closePath();
		context.fill();

		return new Image(canvas);
	};

	Image.prototype.centerOrigin = function()
	{
		this.originX = Math.round(this.width / 2);
		this.originY = Math.round(this.height / 2);
	};

	Image.prototype.clear = function()
	{
		this._buffer.getContext("2d").clearRect(0, 0, this._buffer.width, this._buffer.height);
	};

	Image.prototype.lock = function()
	{
		this._locked = true;
	};

	// TODO: Change it so that we only call updateBuffer when render gets called (if things have changed)
	// That way we don't do an update for a change of color, and then another when we flip, and then another when the alpha changes, etc.
	Image.prototype.render = function(target, point, camera)
	{
		// TODO: Check that we support all of the transformations in https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/graphics/Image.as
		var scaleX = this.scaleX * this.scale;
		var scaleY = this.scaleY * this.scale;

		var temp = {x: point.x, y: point.y};
		temp.x += this.x - camera.x * this.scrollX;
		temp.y += this.y - camera.y * this.scrollY;

		var context = target.getContext("2d");

		context.save();
		// TODO: xor is a test! Blend modes might be possible
		if(this.xor) context.globalCompositeOperation = "xor";

		context.translate(temp.x, temp.y);
		context.rotate(this.angle * Utils.RAD);
		context.translate(-this.originX * scaleX, -this.originY * scaleY);
		context.scale(scaleX, scaleY);
		context.globalAlpha = this.alpha;
		context.drawImage(this._buffer, 0, 0);
		context.restore();
	};

	Image.prototype.unlock = function()
	{
		this._locked = false;
	};

	Image.prototype.updateBuffer = function(clearFirst)
	{
		//TODO: Cache transformed buffers? Lookup on all state that can change what updateBuffer does
		if(this.locked)
		{
			this._needsUpdate = true;
			this._needsClear = this._needsClear || clearFirst || false;
		}
		else
		{
			var context = this._buffer.getContext("2d");
			//TODO: Why would I ever not clear if I'm drawing?
			//if(clearFirst)
				this.clear();
			context.save();
			if(this.flipped)
			{
				context.translate(this._buffer.width, 0);
				context.scale(-1, 1);
			}
			context.drawImage(this._source, this._clipRect.x, this._clipRect.y, this._clipRect.width, this._clipRect.height, 0, 0, this._buffer.width, this._buffer.height);
			if(this._tintMode === Image.TINTING_MULTIPLY && this._color !== 0xFFFFFF)
			{
				context.globalCompositeOperation = "source-atop";
				context.fillStyle = Utils.getColorRGBA(this._color, this._tinting);
				context.fillRect(0, 0, this._buffer.width, this._buffer.height);
			}
			context.restore();
			if(this._tint)
			{
				var struct = context.getImageData(0, 0, this._buffer.width, this._buffer.height);
				var data = struct.data;
				for(var i = 0; i < this._buffer.width * this._buffer.height * 4; i += 4)
				{
					data[i] = data[i] * this._tint.redMultiplier + this._tint.redOffset;
					data[i + 1] = data[i] * this._tint.greenMultiplier + this._tint.greenOffset;
					data[i + 2] = data[i] * this._tint.blueMultiplier + this._tint.blueOffset;
				}
				context.putImageData(struct, 0, 0);
			}
		}
	};

	Image.prototype.updateColorTransform = function()
	{
		// TODO: Tidy up. This is now only for TINTING_COLORIZE
		// MIGHT be able to do the COLORIZE using globalCompositeMode = "darker"
		/*jshint bitwise: false */
		if(this._tinting === 0)
		{
			this._tint = null;
			return this.updateBuffer();
		}
		if(this._tintMode === Image.TINTING_MULTIPLY)
		{
			this._tint = null;
			return this.updateBuffer();
		}

		this._tint = {};

		this._tint.redMultiplier   = this._tintMode * (1.0 - this._tinting) + (1-this._tintMode) * (this._tinting * (Number(this._color >> 16 & 0xFF) / 255 - 1) + 1);
		this._tint.greenMultiplier = this._tintMode * (1.0 - this._tinting) + (1-this._tintMode) * (this._tinting * (Number(this._color >> 8 & 0xFF) / 255 - 1) + 1);
		this._tint.blueMultiplier  = this._tintMode * (1.0 - this._tinting) + (1-this._tintMode) * (this._tinting * (Number(this._color & 0xFF) / 255 - 1) + 1);
		this._tint.redOffset       = (this._color >> 16 & 0xFF) * this._tinting * this._tintMode;
		this._tint.greenOffset     = (this._color >> 8 & 0xFF) * this._tinting * this._tintMode;
		this._tint.blueOffset      = (this._color & 0xFF) * this._tinting * this._tintMode;
		this.updateBuffer();
		/*jshint bitwise: true */
	};

	Object.defineProperties( Image.prototype,
	{
		"clipRect": {
			get: function()
			{
				return this._clipRect;
			}
		},
		"width": {
			get: function()
			{
				return this._buffer.width;
			}
		},
		"height": {
			get: function()
			{
				return this._buffer.height;
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
				return this._locked;
			}
		},
		"alpha": {
			get: function(){ return this._alpha; },
			set: function(value)
			{
				value = value < 0 ? 0 : (value > 1 ? 1 : value);
				if(this._alpha === value) return;
				this._alpha = value;
				//this.updateBuffer();
			}
		},
		"color": {
			get: function(){ return this._color; },
			set: function(value)
			{
				/*jshint bitwise: false */
				value = value & 0xFFFFFF;
				/*jshint bitwise: true */
				if(this._color === value) return;
				this._color = value;
				this.updateColorTransform();
			}
		},
		"tinting": {
			get: function(){ return this._tinting; },
			set: function(value)
			{
				if(this._tinting === value) return;
				this._tinting = value;
				this.updateColorTransform();
			}
		},
		"tintMode": {
			get: function(){ return this._tintMode; },
			set: function(value)
			{
				if(this._tintMode === value) return;
				this._tintMode = value;
				this.updateColorTransform();
			}
		},
		"flipped": {
			get: function(){ return this._flipped; },
			set: function(value)
			{
				if(this._flipped === value) return;
				this._flipped = value;
				this.updateBuffer();
			}
		},
		"drawMask": {
			get: function(){ return this._drawMask; },
			set: function(value)
			{
				this._drawMask = value;
				this.updateBuffer(true);
			}
		}
	});

	return Image;
});
