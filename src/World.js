/*global define */
"use strict";
define(["Entity", "Atomic", "Utils", "Input"], function(Entity, Atomic, Utils, Input)
{
	// The FP version of this is at https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/World.as
	// However, not sure we'll be following all that closely

	//TODO: Events when added to or removed from the stage
	function World()
	{
		this.camera = {x: 0, y: 0}; // In the original this was a Point. Overkill here though probably.
		this.visible = true;
		this.entities = [];
	}

	World.prototype.add = function(entity)
	{
		this.entities.push(entity);
		if(!entity._world) entity._world = this; // Icky, playing with "private" members from out here
		entity.added();
		return entity;
	};

	World.prototype.addGraphic = function(graphic, layer, x, y)
	{
		layer = layer || 0;
		x     = x     || 0;
		y     = y     || 0;

		var entity = new Entity(x, y, graphic);
		entity.layer = layer;
		entity.active = false;
		return this.add(entity);
	};

	World.prototype.addMask = function(mask, type, x, y)
	{
		var entity = new Entity(x || 0, y || 0, null, mask);
		if(type) entity.type = type;
		entity.active = entity.visible = false;
		return this.add(entity);
	};

	World.prototype.begin = function(){};

	World.prototype.create = function(Constructor, addToWorld)
	{
		if(addToWorld === undefined) addToWorld = true;
		//TODO: entity recycling
		// var entity = _recycled[classType];
		// if(entity)
		// {
		// 	_recycled[classType] = entity._recycleNext;
		// 	entity._recycleNext = null;
		// }
		// else
		// {
			var entity = new Constructor();
		// }
		if(addToWorld) return this.add(entity);
		return entity;
	};

	World.prototype.draw = function()
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
	};

	World.prototype.end = function(){};

	World.prototype.getEntitiesByClass = function(constructor)
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
	};

	World.prototype.getEntitiesByType = function(type)
	{
		var result = [];
		for(var i = 0; i < this.entities.length; i++)
		{
			if(this.entities[i].type === type)
			{
				result.push(this.entities[i]);
			}
		}
		return result;
	};

	World.prototype.remove = function(entity)
	{
		Utils.removeElement(entity, this.entities);
	};

	World.prototype.update = function()
	{
		for(var i in this.entities)
		{
			var entity = this.entities[i];
			if(entity.active) entity.update();
			if(entity.graphic && entity.graphic.active) entity.graphic.update();
		}
	};

	Object.defineProperties( World.prototype,
	{
		"mouseX": {
			get: function()
			{
				return Input.mouseX + this.camera.x;
			}
		},
		"mouseY": {
			get: function()
			{
				return Input.mouseY + this.camera.y;
			}
		}
	});

	return World;
});
