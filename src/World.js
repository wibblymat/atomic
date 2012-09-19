"use strict";
var Atomic = window.Atomic || {};

// The FP version of this is at https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/World.as
// However, not sure we'll be following all that closely

//TODO: Events when added to or removed from the stage
Atomic.World = function()
{
	this.camera = {x: 0, y: 0}; // In the original this was a Point. Overkill here though probably.
	this.visible = true;
	this.entities = [];

	$(this).bind("frame", function(){
		this.update();
		this.draw();
	});
};

Atomic.World.prototype = {
	add: function(entity)
	{
		this.entities.push(entity);
		if(!entity._.world) entity._.world = this; // Icky, playing with "private" members from out here
		entity.added();
		return entity;
	},
	addGraphic: function(graphic, layer, x, y)
	{
		layer = layer || 0;
		x     = x     || 0;
		y     = y     || 0;

		var entity = new Atomic.Entity(x, y, graphic);
		entity.layer = layer;
		entity.active = false;
		return this.add(entity);
	},
	begin: function(){},
	draw: function()
	{
		var entity, i;

		// TODO: This line wont be neccessary once Atomic.Stage is working correctly
		Atomic.stage.getContext("2d").clearRect(0, 0, Atomic.stage.width, Atomic.stage.height);

		for(i = 0; i < this.entities.length; i++)
		{
			entity = this.entities[i];
			if(entity.visible)
			{
				// Since entity stores it's own layer number and since seperate
				// layers will be seperate canvases, we don't need to do
				// anything exciting with layers here
				entity.render();
			}
		}
	},
	end: function(){},
	getEntitiesByClass: function(constructor)
	{
		var result = [];
		for(var i = 0; i < this.entities.length; i++)
		{
			if(this.entities[i] instanceof constructor)
			{
				result.push(this.entities[i]);
			}
		}
		return result;
	},
	remove: function(entity)
	{
		Atomic.Utils.removeElement(entity, this.entities);
	},
	update: function()
	{
		for(var i in this.entities)
		{
			var entity = this.entities[i];
			if(entity.active) entity.update();
			if(entity.graphic && entity.graphic.active) entity.graphic.update();
		}
	}
};

Object.defineProperties( Atomic.World.prototype,
{
	"mouseX": {
		get: function()
		{
			return Atomic.Input.mouseX + this.camera.x;
		}
	},
	"mouseY": {
		get: function()
		{
			return Atomic.Input.mouseY + this.camera.y;
		}
	}
});
