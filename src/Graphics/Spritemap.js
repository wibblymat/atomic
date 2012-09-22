/*global define */
"use strict";
define(["Utils", "Graphic", "Graphics/Image", "Atomic", "Graphics/Animation"], function(Utils, Graphic, Image, Atomic, Animation)
{
	function Spritemap(source, frameWidth, frameHeight, callback)
	{
		frameWidth = frameWidth || 0;
		frameHeight = frameHeight || 0;

		this.complete = true;
		this.callback = callback || null;
		this.rate = 1;

		this._rectangle = {x: 0, y: 0, width: frameWidth, height: frameHeight};
		if(!frameWidth) this._rectangle.width = source.width;
		if(!frameHeight) this._rectangle.height = source.height;
		this._width = source.width;
		this._height = source.height;
		this._columns = this._width / this._rectangle.width;
		this._rows = this._height / this._rectangle.height;
		this._frameCount = this._columns * this._rows;
		this._animations = {};
		this._animation = null;
		this._index = null;
		this._frame = null;
		this._timer = 0;

		Image.call(this, source, this._rectangle);
		this.callback = callback;
		this.updateBuffer();
		this.active = true;
	}
	Utils.extend(Image, Spritemap);

	Spritemap.prototype.updateBuffer = function(clearBefore)
	{
		clearBefore = clearBefore || false;
		// get position of the current frame
		this._rectangle.x = this._rectangle.width * this._frame;
		this._rectangle.y = Math.floor(this._rectangle.x / this._width) * this._rectangle.height;
		this._rectangle.x %= this._width;

		// update the buffer
		Image.prototype.updateBuffer.call(this, clearBefore);
	};

	Spritemap.prototype.update = function()
	{
		if (this._animation && !this.complete)
		{
			this._timer += this._animation.frameRate * Atomic.elapsed * this.rate;
			if (this._timer >= 1)
			{
				while (this._timer >= 1)
				{
					this._timer --;
					this._index ++;
					if (this._index === this._animation.frameCount)
					{
						if (this._animation.loop)
						{
							this._index = 0;
							if(this.callback) this.callback();
						}
						else
						{
							this._index = this._animation.frameCount - 1;
							this.complete = true;
							if(this.callback) this.callback();
							break;
						}
					}
				}
				var lastFrame = this._frame;
				if (this._animation)
				{
					this._frame = Math.round(this._animation.frames[this._index]);
					if(lastFrame !== this._frame)
					{
						this.updateBuffer();
					}
				}

			}
		}
	};

	Spritemap.prototype.add = function(name, frames, frameRate, loop)
	{
		frameRate = frameRate || 0;
		if(loop === undefined) loop = true;
		if (this._animations[name]) throw new Error("Cannot have multiple animations with the same name");
		(this._animations[name] = new Animation(name, frames, frameRate, loop)).parent = this;
		return this._animations[name];
	};

	Spritemap.prototype.play = function(name, reset, frame)
	{
		name = name || "";
		reset = !!reset;
		frame = frame || 0;
		if(!reset && this._animation && this._animation.name === name) return this._animation;
		this._animation = this._animations[name];
		if (!this._animation)
		{
			this._frame = this._index = 0;
			this.complete = true;
			this.updateBuffer();
			return null;
		}
		this._index = 0;
		this._timer = 0;
		this._frame = Math.round(this._animation.frames[frame % this._animation.frameCount]);
		this.complete = false;
		this.updateBuffer();
		return this._animation;
	};

	Spritemap.prototype.getFrame = function(column, row)
	{
		column = column || 0;
		row    = row    || 0;
		return (row % this._rows) * this._columns + (column % this._columns);
	};

	Spritemap.prototype.setFrame = function(column, row)
	{
		column = column || 0;
		row    = row    || 0;
		this._animation = null;
		var frame = (row % this._rows) * this._columns + (column % this._columns);
		if(this._frame === frame) return;
		this._frame = frame;
		this._timer = 0;
		this.updateBuffer();
	};

	Spritemap.prototype.randFrame = function()
	{
		this.frame = Utils.rand(this._frameCount);
	};

	Spritemap.prototype.setAnimationFrame = function(name, index)
	{
		var frames = this._animations[name].frames;
		index %= frames.length;
		if(index < 0) index += frames.length;
		this.frame = frames[index];
	};


	Object.defineProperties( Spritemap.prototype,
	{
		"frame": {
			get: function(){ return this._frame; },
			set: function(value)
			{
				this._animation = null;
				value %= this._frameCount;
				if(value < 0) value = this._frameCount + value;
				if(this._frame === value) return;
				this._frame = value;
				this._timer = 0;
				this.updateBuffer();
			}
		},
		"index": {
			get: function() { return this._animation ? this._index : 0; },
			set: function(value)
			{
				if(!this._animation) return;
				value %= this._animation.frameCount;
				if(this._index === value) return;
				this._index = value;
				this._frame = Math.round(this._animation.frames[this._index]);
				this._timer = 0;
				this.updateBuffer();
			}
		},
		"frameCount": {
			get: function() { return this._frameCount; }
		},
		"columns": {
			get: function() { return this._columns; }
		},
		"rows": {
			get: function() { return this._rows; }
		},
		"currentAnimation": {
			get: function(){ return this._animation ? this._animation.name : ""; }
		}
	});

	return Spritemap;
});
