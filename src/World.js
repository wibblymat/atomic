/*global define */
"use strict";
define(["Entity", "Atomic", "Utils", "Input"],
function(Entity, Atomic, Utils, Input)
{
	// The FP version of this is at
	// https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/World.as
	// However, not sure we'll be following all that closely

	//TODO: Events when added to or removed from the stage
	function World()
	{
		// In the original this was a Point. Overkill here though probably.
		this.camera = {x: 0, y: 0};
		this.visible = true;
		this.entities = [];
	}

	World.prototype.add = function(entity)
	{
		this.entities.push(entity);
		// Icky, playing with "private" members from out here
		if(!entity._world) entity._world = this;
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

	World.prototype.collideLine = function(type, fromX, fromY, toX, toY, precision, p)
	{
		if(precision === undefined) precision = 1;
		p = p || null;

		// If the distance is less than precision, do the short sweep.
		if(precision < 1) precision = 1;
		if(Utils.distance(fromX, fromY, toX, toY) < precision)
		{
			if(p)
			{
				if(fromX === toX && fromY === toY)
				{
					p.x = toX; p.y = toY;
					return this.collidePoint(type, toX, toY);
				}
				return this.collideLine(type, fromX, fromY, toX, toY, 1, p);
			}
			else return this.collidePoint(type, fromX, toY);
		}

		// Get information about the line we're about to raycast.
		var xDelta = Math.abs(toX - fromX),
			yDelta = Math.abs(toY - fromY),
			xSign = toX > fromX ? precision : -precision,
			ySign = toY > fromY ? precision : -precision,
			x = fromX, y = fromY, e;

		// Do a raycast from the start to the end point.
		if(xDelta > yDelta)
		{
			ySign *= yDelta / xDelta;
			if(xSign > 0)
			{
				while(x < toX)
				{
					if((e = this.collidePoint(type, x, y)))
					{
						if(!p) return e;
						if(precision < 2)
						{
							p.x = x - xSign; p.y = y - ySign;
							return e;
						}
						return this.collideLine(type, x - xSign, y - ySign, toX, toY, 1, p);
					}
					x += xSign; y += ySign;
				}
			}
			else
			{
				while(x > toX)
				{
					if((e = this.collidePoint(type, x, y)))
					{
						if(!p) return e;
						if(precision < 2)
						{
							p.x = x - xSign; p.y = y - ySign;
							return e;
						}
						return this.collideLine(type, x - xSign, y - ySign, toX, toY, 1, p);
					}
					x += xSign; y += ySign;
				}
			}
		}
		else
		{
			xSign *= xDelta / yDelta;
			if(ySign > 0)
			{
				while(y < toY)
				{
					if((e = this.collidePoint(type, x, y)))
					{
						if(!p) return e;
						if(precision < 2)
						{
							p.x = x - xSign; p.y = y - ySign;
							return e;
						}
						return this.collideLine(type, x - xSign, y - ySign, toX, toY, 1, p);
					}
					x += xSign; y += ySign;
				}
			}
			else
			{
				while(y > toY)
				{
					if((e = this.collidePoint(type, x, y)))
					{
						if(!p) return e;
						if(precision < 2)
						{
							p.x = x - xSign; p.y = y - ySign;
							return e;
						}
						return this.collideLine(type, x - xSign, y - ySign, toX, toY, 1, p);
					}
					x += xSign; y += ySign;
				}
			}
		}

		// Check the last position.
		if(precision > 1)
		{
			if(!p) return this.collidePoint(type, toX, toY);
			if(this.collidePoint(type, toX, toY)) return this.collideLine(type, x - xSign, y - ySign, toX, toY, 1, p);
		}

		// No collision, return the end point.
		if(p)
		{
			p.x = toX;
			p.y = toY;
		}
		return null;
	};

	World.prototype.collidePoint = function(type, pX, pY)
	{
		var entities = this.getEntitiesByType(type);

		for(var i in entities)
		{
			var entity = entities[i];
			if (entity.collidePoint(entity.x, entity.y, pX, pY)) return entity;
		}
		return null;
	};

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
				return (Input.mouseX + this.camera.x) / Atomic.scale;
			}
		},
		"mouseY": {
			get: function()
			{
				return (Input.mouseY + this.camera.y) / Atomic.scale;
			}
		}
	});

	return World;
});
