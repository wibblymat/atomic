"use strict";
var Atomic = window.Atomic || {};
Atomic.Graphics = Atomic.Graphics || {};

Atomic.Graphics.Spritemap = function(source, frameWidth, frameHeight, callback)
{
	frameWidth = frameWidth || 0;
	frameHeight = frameHeight || 0;

	this.complete = true;
	this.callback = callback || null;
	this.rate = 1;

	this._ = this._ || {};
	this._.rectangle = {x: 0, y: 0, width: frameWidth, height: frameHeight};
	if(!frameWidth) this._.rectangle.width = source.width;
	if(!frameHeight) this._.rectangle.height = source.height;
	this._.width = source.width;
	this._.height = source.height;
	this._.columns = this._.width / this._.rectangle.width;
	this._.rows = this._.height / this._.rectangle.height;
	this._.frameCount = this._.columns * this._.rows;
	this._.animations = {};
	this._.animation = null;
	this._.index = null;
	this._.frame = null;
	this._.timer = 0;

	Atomic.Graphics.Image.call(this, source, this._.rectangle);
	this.callback = callback;
	this.updateBuffer();
	this.active = true;
};
Atomic.Utils.extend(Atomic.Graphics.Image, Atomic.Graphics.Spritemap);

Atomic.Graphics.Spritemap.prototype.updateBuffer = function(clearBefore)
{
	clearBefore = clearBefore || false;
	// get position of the current frame
	this._.rectangle.x = this._.rectangle.width * this._.frame;
	this._.rectangle.y = Math.floor(this._.rectangle.x / this._.width) * this._.rectangle.height;
	this._.rectangle.x %= this._.width;

	// update the buffer
	Atomic.Graphics.Image.prototype.updateBuffer.call(this, clearBefore);
};

Atomic.Graphics.Spritemap.prototype.update = function()
{
	if (this._.animation && !this.complete)
	{
		this._.timer += this._.animation.frameRate * Atomic.elapsed * this.rate;
		if (this._.timer >= 1)
		{
			while (this._.timer >= 1)
			{
				this._.timer --;
				this._.index ++;
				if (this._.index === this._.animation.frameCount)
				{
					if (this._.animation.loop)
					{
						this._.index = 0;
						if(this.callback) this.callback();
					}
					else
					{
						this._.index = this._.animation.frameCount - 1;
						this.complete = true;
						if(this.callback) this.callback();
						break;
					}
				}
			}
			var lastFrame = this._.frame;
			if (this._.animation)
			{
				this._.frame = Math.round(this._.animation.frames[this._.index]);
				if(lastFrame !== this._.frame)
				{
					this.updateBuffer();
				}
			}

		}
	}
};

Atomic.Graphics.Spritemap.prototype.add = function(name, frames, frameRate, loop)
{
	frameRate = frameRate || 0;
	if(loop === undefined) loop = true;
	if (this._.animations[name]) throw new Error("Cannot have multiple animations with the same name");
	(this._.animations[name] = new Atomic.Graphics.Animation(name, frames, frameRate, loop)).parent = this;
	return this._.animations[name];
};

Atomic.Graphics.Spritemap.prototype.play = function(name, reset, frame)
{
	name = name || "";
	reset = !!reset;
	frame = frame || 0;
	if(!reset && this._.animation && this._.animation.name === name) return this._.animation;
	this._.animation = this._.animations[name];
	if (!this._.animation)
	{
		this._.frame = this._.index = 0;
		this.complete = true;
		this.updateBuffer();
		return null;
	}
	this._.index = 0;
	this._.timer = 0;
	this._.frame = Math.round(this._.animation.frames[frame % this._.animation.frameCount]);
	this.complete = false;
	this.updateBuffer();
	return this._.animation;
};

Atomic.Graphics.Spritemap.prototype.getFrame = function(column, row)
{
	column = column || 0;
	row    = row    || 0;
	return (row % this._.rows) * this._.columns + (column % this._.columns);
};

Atomic.Graphics.Spritemap.prototype.setFrame = function(column, row)
{
	column = column || 0;
	row    = row    || 0;
	this._.animation = null;
	var frame = (row % this._.rows) * this._.columns + (column % this._.columns);
	if(this._.frame === frame) return;
	this._.frame = frame;
	this._.timer = 0;
	this.updateBuffer();
};

Atomic.Graphics.Spritemap.prototype.randFrame = function()
{
	this.frame = Atomic.Utils.rand(this._.frameCount);
};

Atomic.Graphics.Spritemap.prototype.setAnimationFrame = function(name, index)
{
	var frames = this._.animations[name].frames;
	index %= frames.length;
	if(index < 0) index += frames.length;
	this.frame = frames[index];
};


Object.defineProperties( Atomic.Graphics.Spritemap.prototype,
{
	"frame": {
		get: function(){ return this._.frame; },
		set: function(value)
		{
			this._.animation = null;
			value %= this._.frameCount;
			if(value < 0) value = this._.frameCount + value;
			if(this._.frame === value) return;
			this._.frame = value;
			this._.timer = 0;
			this.updateBuffer();
		}
	},
	"index": {
		get: function() { return this._.animation ? this._.index : 0; },
		set: function(value)
		{
			if(!this._.animation) return;
			value %= this._.animation.frameCount;
			if(this._.index === value) return;
			this._.index = value;
			this._.frame = Math.round(this._.animation.frames[this._.index]);
			this._.timer = 0;
			this.updateBuffer();
		}
	},
	"frameCount": {
		get: function() { return this._.frameCount; }
	},
	"columns": {
		get: function() { return this._.columns; }
	},
	"rows": {
		get: function() { return this._.rows; }
	},
	"currentAnimation": {
		get: function(){ return this._.animation ? this._.animation._name : ""; }
	}
});

