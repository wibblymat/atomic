"use strict";
var Atomic = window.Atomic || {};

Atomic.Entity = function(x, y, graphic, hitmask)
{
	this.x = x || 0;
	this.y = y || 0;
	this.layer = 0;
	this.visible = true;
	this.graphic = graphic || null;
	this.hitmask = hitmask;
	this.animations = {};
	this.animation = null;

	// TODO: Set these based on the graphic or the hitbox or something
	this.width = 0;
	this.height = 0;
};

Atomic.Entity.prototype.setAnimation = function(name)
{
	if(this.animations[name])
	{
		if(this.animation === this.animations[name] && !this.animation.finished())
		{
			return;
		}

		this.animation = this.animations[name];
		this.animation.start();
	}
};

Atomic.Entity.prototype.clearAnimation = function(name)
{
	if(this.animation && !this.animation.finished())
	{
		this.animation.stop();
		this.animation = null;
	}
};

Atomic.Entity.prototype.draw = function(context)
{
	if(!this.visible) return;

	var graphic = this.graphic;
	if(this.animation && !this.animation.finished())
	{
		graphic = this.animation.getFrame();
	}

	if(graphic)
	{
		context.drawImage(graphic, this.x, this.y);
	}
};
