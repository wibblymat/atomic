/*global define */
"use strict";
define(["Utils", "Graphic", "Graphics/Image", "Atomic", "Graphics/Animation"], function(Utils, Graphic, Image, Atomic, Animation)
{
	function Spritemap(tilesheet, callback)
	{
		this.complete = true;
		this.callback = callback || null;
		this.rate = 1;

		this.tilesheet = tilesheet;
		this._frameCount = this.tilesheet.columns * this.tilesheet.rows;
		this._animations = {};
		this._animation = null;
		this._index = null;
		this._frame = null;
		this._timer = 0;

		Image.call(this, this.tilesheet.getTileAtIndex(0));
		this.callback = callback;
		this.updateBuffer();
		this.active = true;
	}
	Utils.extend(Image, Spritemap);

	Spritemap.prototype.updateBuffer = function(clearBefore)
	{
		clearBefore = clearBefore || false;
		this._source = this.tilesheet.getTileAtIndex(this._frame);

		// update the buffer
		Image.prototype.updateBuffer.call(this, clearBefore);
	};

	Spritemap.prototype.update = function()
	{
		if(this._animation && !this.complete)
		{
			this._timer += this._animation.frameRate * Atomic.elapsed * this.rate;
			if (this._timer >= 1)
			{
				while(this._timer >= 1)
				{
					this._timer--;
					this._index++;
					if (this._index === this._animation.frameCount)
					{
						if(this._animation.loop)
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
					this._frame = this._animation.frames[this._index];
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
		return this.tilesheet.index(column, row);
	};

	Spritemap.prototype.setFrame = function(column, row)
	{
		column = column || 0;
		row    = row    || 0;
		this._animation = null;
		var frame = this.getFrame(column, row);
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
			get: function() { return this.tilesheet.columns; }
		},
		"rows": {
			get: function() { return this.tilesheet.rows; }
		},
		"currentAnimation": {
			get: function(){ return this._animation ? this._animation.name : ""; }
		}
	});

	return Spritemap;
});
