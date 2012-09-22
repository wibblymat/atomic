/*global define */
"use strict";
define(["Utils", "Graphic"], function(Utils, Graphic)
{
	function Graphiclist()
	{
		this._graphics = [];
		this._temp = [];
		this._count = 0;
		this._camera = {x: 0, y: 0};

		Graphic.call(this);

		for(var i = 0; i < arguments.length; i++)
		{
			this.add(arguments[i]);
		}
	}

	Utils.extend(Graphic, Graphiclist);

	Graphiclist.prototype.update = function()
	{
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g.active) g.update();
		}
	};

	Graphiclist.prototype.render = function(target, point, camera)
	{
		point.x += this.x;
		point.y += this.y;
		camera.x *= this.scrollX;
		camera.y *= this.scrollY;
		var temp = {x: 0, y: 0};
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g.visible)
			{
				if(g.relative)
				{
					temp.x = point.x;
					temp.y = point.y;
				}
				else temp.x = temp.y = 0;
				this._camera.x = camera.x;
				this._camera.y = camera.y;
				g.render(target, temp, this._camera);
			}
		}
	};

	Graphiclist.prototype.add = function(graphic)
	{
		this._graphics[this._count ++] = graphic;
		if(!this.active) this.active = graphic.active;
		return graphic;
	};

	Graphiclist.prototype.remove = function(graphic)
	{
		if(this._graphics.indexOf(graphic) < 0) return graphic;
		this._temp.length = 0;
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g === graphic) this._count --;
			else this._temp[this._temp.length] = g;
		}
		var temp = this._graphics;
		this._graphics = this._temp;
		this._temp = temp;
		this.updateCheck();
		return graphic;
	};

	Graphiclist.prototype.removeAt = function(index)
	{
		index = index || 0;
		if(!this._graphics.length) return;
		index %= this._graphics.length;
		this.remove(this._graphics[index % this._graphics.length]);
		this.updateCheck();
	};

	Graphiclist.prototype.removeAll = function()
	{
		this._graphics.length = this._temp.length = this._count = 0;
		this.active = false;
	};

	Graphiclist.prototype.updateCheck = function()
	{
		this.active = false;
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g.active)
			{
				this.active = true;
				return;
			}
		}
	};

	Object.defineProperties( Graphiclist.prototype,
	{
		"children": {
			get: function(){ return this._graphics; }
		},
		"count": {
			get: function() { return this._count; }
		}
	});

	return Graphiclist;
});
