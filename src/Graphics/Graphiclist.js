"use strict";
var Atomic = window.Atomic || {};
Atomic.Graphics = Atomic.Graphics || {};

Atomic.Graphics.Graphiclist = function()
{
	this._ = this._ || {};
	this._.graphics = [];
	this._.temp = [];
	this._.count = 0;
	this._.camera = {x: 0, y: 0};

	Atomic.Graphic.call(this);

	for(var i = 0; i < arguments.length; i++)
	{
		this.add(arguments[i]);
	}
};
Atomic.Utils.extend(Atomic.Graphic, Atomic.Graphics.Graphiclist);

Atomic.Graphics.Graphiclist.prototype = {
	update: function()
	{
		for(var index in this._.graphics)
		{
			var g = this._.graphics[index];
			if(g.active) g.update();
		}
	},
	render: function(target, point, camera)
	{
		point.x += this.x;
		point.y += this.y;
		camera.x *= this.scrollX;
		camera.y *= this.scrollY;
		var temp = {x: 0, y: 0};
		for(var index in this._.graphics)
		{
			var g = this._.graphics[index];
			if(g.visible)
			{
				if(g.relative)
				{
					temp.x = point.x;
					temp.y = point.y;
				}
				else temp.x = temp.y = 0;
				this._.camera.x = camera.x;
				this._.camera.y = camera.y;
				g.render(target, temp, this._.camera);
			}
		}
	},
	add: function(graphic)
	{
		this._.graphics[this._.count ++] = graphic;
		if(!this.active) this.active = graphic.active;
		return graphic;
	},
	remove: function(graphic)
	{
		if(this._.graphics.indexOf(graphic) < 0) return graphic;
		this._.temp.length = 0;
		for(var index in this._.graphics)
		{
			var g = this._.graphics[index];
			if(g === graphic) this._.count --;
			else this._.temp[this._.temp.length] = g;
		}
		var temp = this._.graphics;
		this._.graphics = this._.temp;
		this._.temp = temp;
		this.updateCheck();
		return graphic;
	},
	removeAt: function(index)
	{
		index = index || 0;
		if(!this._.graphics.length) return;
		index %= this._.graphics.length;
		this.remove(this._.graphics[index % this._.graphics.length]);
		this.updateCheck();
	},
	removeAll: function()
	{
		this._.graphics.length = this._.temp.length = this._.count = 0;
		this.active = false;
	},
	updateCheck: function()
	{
		this.active = false;
		for(var index in this._.graphics)
		{
			var g = this._.graphics[index];
			if(g.active)
			{
				this.active = true;
				return;
			}
		}
	}
};


Object.defineProperties( Atomic.Graphics.Graphiclist.prototype,
{
	"children": {
		get: function(){ return this._.graphics; }
	},
	"count": {
		get: function() { return this._.count; }
	}
});
