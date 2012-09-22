/*global define */
"use strict";
define(["Atomic", "Mask"], function(Atomic, Mask)
{
	// For the original FP code, see https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/Entity.as
	//TODO: The FP version inherits from Tweener. Make sure we don't need to do that

	function Entity(x, y, graphic, mask)
	{
		this.active = true;
		this.collidable = true;
		this.height = 0;
		this.layer = null;
		this.name = null;
		this.originX = 0;
		this.originY = 0;
		this.renderTarget = null;
		this.type = null;
		this.visible = true;
		this.width = 0;
		this.x = x || 0;
		this.y = y || 0;
		this._mask = null;

		this.graphic = graphic || null;
		this.mask = mask || null;

		this._world = null;
		this._partMove = {x: 0, y: 0};
		this.HITBOX = new Mask();
		this.HITBOX.assignTo(this);
	}

	// Unimplemented methods from the FP original:
	//	addGraphic
	//	clampHorizontal
	//	clampVertical
	//	collideInto
	//	collideRect
	//	collideTypes
	//	collideTypeInto
	//	distanceToPoint
	//	distanceToRect
	//	getClass
	//	moveTo
	//	moveTowards
	//	setHitboxTo
	//	setOrigin

	Entity.prototype.added = function(){};
	Entity.prototype.centerOrigin = function()
	{
		this.originX = this.width / 2;
		this.originY = this.height / 2;
	};
	Entity.prototype.collide = function(type, x, y)
	{
		if(!this.world || this.world.entities.length === 0) return null;

		var entity, i;

		var _x = this.x, _y = this.y;
		this.x = x; this.y = y;

		var entities = this.world.getEntitiesByType(type);

		if(!this.mask)
		{
			for(i in entities)
			{
				entity = entities[i];
				if(
					entity.collidable && entity !== this &&
					x - this.originX + this.width > entity.x - entity.originX &&
					y - this.originY + this.height > entity.y - entity.originY &&
					x - this.originX < entity.x - entity.originX + entity.width &&
					y - this.originY < entity.y - entity.originY + entity.height
				)
				{
					if(!entity.mask || entity.mask.collide(this.HITBOX))
					{
						this.x = _x; this.y = _y;
						return entity;
					}
				}
			}
			this.x = _x; this.y = _y;
			return null;
		}


		for(i in entities)
		{
			entity = entities[i];
			if(entity.collidable && entity !== this &&
				this.x - this.originX + this.width > entity.x - entity.originX &&
				this.y - this.originY + this.height > entity.y - entity.originY &&
				this.x - this.originX < entity.x - entity.originX + entity.width &&
				this.y - this.originY < entity.y - entity.originY + entity.height)
			{
				if(this.mask.collide(entity.mask ? entity.mask : entity.HITBOX))
				{
					this.x = _x; this.y = _y;
					return entity;
				}
			}
		}
		this.x = _x; this.y = _y;
		return null;
	};
	Entity.prototype.collidePoint = function(x, y, pX, pY)
	{
		if(pX >= x - this.originX && pY >= y - this.originY && pX < x - this.originX + this.width && pY < y - this.originY + this.height)
		{
			if(!this.mask) return true;
			var _x = this.x, _y = this.y;
			this.x = x; this.y = y;

			if(this.mask.collide(new Mask(pX, pY, 1, 1)))
			{
					this.x = _x;
					this.y = _y;
					return true;
			}
			this.x = _x; this.y = _y;
			return false;
		}
		return false;
	};
	Entity.prototype.collideRect = function(x, y, rX, rY, rWidth, rHeight)
	{
		if(x - this.originX + this.width >= rX && y - this.originY + this.height >= rY &&
			x - this.originX <= rX + rWidth && y - this.originY <= rY + rHeight)
		{
			if(!this._mask) return true;
			var _x = this.x, _y = this.y;
			this.x = x; this.y = y;
			if(this._mask.collide(new Mask(rX, rY, rWidth, rHeight)))
			{
				this.x = _x; this.y = _y;
				return true;
			}
			this.x = _x; this.y = _y;
			return false;
		}
		return false;
	};
	Entity.prototype.collideTypes = function(types, x, y)
	{
		if(!this.world) return null;

		var entity;

		if(typeof types === "string")
		{
			return this.collide(types, x, y);
		}
		else if(types.length !== undefined)
		{
			for(var type in types)
			{
				if((entity = this.collide(type, x, y))) return entity;
			}
		}

		return null;
	},
	Entity.prototype.collideWith = function(entity, x, y)
	{
		var _x = this.x;
		var _y = this.y;
		this.x = x;
		this.y = y;

		if(entity.collidable &&
			x - this.originX + this.width > entity.x - entity.originX &&
			y - this.originY + this.height > entity.y - entity.originY &&
			x - this.originX < entity.x - entity.originX + entity.width &&
			y - this.originY < entity.y - entity.originY + entity.height)
		{
			if(!this.mask)
			{
				if(!entity.mask || entity.mask.collide(this.HITBOX))
				{
					this.x = _x;
					this.y = _y;
					return entity;
				}
				this.x = _x;
				this.y = _y;
				return null;
			}
			if(this.mask.collide(entity.mask ? entity.mask : entity.HITBOX))
			{
					this.x = _x;
					this.y = _y;
					return entity;
			}
		}
		this.x = _x;
		this.y = _y;
		return null;
	};
	Entity.prototype.distanceFrom = function(entity, useHitboxes)
	{
		if(!useHitboxes)
		{
			return Math.sqrt((this.x - entity.x) * (this.x - entity.x) + (this.y - entity.y) * (this.y - entity.y));
		}

		return Atomic.Utils.distanceRects(this.x - this.originX, this.y - this.originY, this.width, this.height, entity.x - entity.originX, entity.y - entity.originY, entity.width, entity.height);
	};
	Entity.prototype.moveBy = function(x, y, solidType, sweep)
	{
		// This is keep track of the fractions of a pixel of movement that are rounded off
		this._partMove.x += x;
		this._partMove.y += y;
		x = Math.round(this._partMove.x);
		y = Math.round(this._partMove.y);
		this._partMove.x -= x;
		this._partMove.y -= y;

		if(solidType)
		{
				var sign, entity;
				if(x !== 0)
				{
					if(sweep || this.collideTypes(solidType, this.x + x, this.y))
					{
						sign = x > 0 ? 1 : -1;
						while (x !== 0)
						{
							if((entity = this.collideTypes(solidType, this.x + sign, this.y)))
							{
								if(this.moveCollideX(entity)) break;
								else this.x += sign;
							}
							else this.x += sign;
							x -= sign;
						}
					}
					else this.x += x;
				}
				if(y !== 0)
				{
					if(sweep || this.collideTypes(solidType, this.x, this.y + y))
					{
						sign = y > 0 ? 1 : -1;
						while (y !== 0)
						{
							if((entity = this.collideTypes(solidType, this.x, this.y + sign)))
							{
								if(this.moveCollideY(entity)) break;
								else this.y += sign;
							}
							else this.y += sign;
							y -= sign;
						}
					}
					else this.y += y;
				}
		}
		else
		{
			this.x += x;
			this.y += y;
		}
	};
	Entity.prototype.moveCollideX = function(entity)
	{
		return true;
	};
	Entity.prototype.moveCollideY = function(entity)
	{
		return true;
	};
	Entity.prototype.removed = function(){};
	Entity.prototype.render = function()
	{
		var point = {x: 0, y: 0};

		if(this.graphic && this.graphic.visible)
		{
			// TODO: Stuff with layers. Involves expanding Atomic.stage
			var target = this.renderTarget || Atomic.stage;
			var context = target.getContext("2d");

			if(this.graphic.relative)
			{
				point.x = this.x;
				point.y = this.y;
			}

			var camera = this.world ? this.world.camera : Atomic.camera;
			this.graphic.render(target, point, camera);
		}
	};
	Entity.prototype.setHitbox = function(width, height, originX, originY)
	{
		this.width = width || 0;
		this.height = height || 0;
		this.originX = originX || 0;
		this.originY = originY || 0;
	};
	Entity.prototype.toString = function()
	{
		return this.constructor.name;
	};
	Entity.prototype.update = function(){};

	//TODO: FP properties not implemented:
	// Read-only:
	//		bottom
	//		centerX
	//		centerY
	//		halfHeight
	//		halfWidth
	//		left
	//		right
	//		top
	Object.defineProperties( Entity.prototype,
	{
		"graphic": {
			get: function(){ return this._graphic; },
			set: function(value)
			{
				if(this._graphic === value) return;
				this._graphic = value;
				if(value && value.assign !== null) value.assign();
			}
		},
		"mask": {
			get: function(){ return this._mask; },
			set: function(value)
			{
				if(this._mask === value) return;
				if(this._mask) this._mask.assignTo(null);
				this._mask = value;
				if(value) this._mask.assignTo(this);
			}
		},
		"onCamera":	{
			"get": function()
			{
				return this.collideRect(this.x, this.y, this._world.camera.x, this._world.camera.y, Atomic.width, Atomic.height);
			}
		},
		"world": {
			get: function()
			{
				return this._world;
			}
		}
	});

	return Entity;
});
