"use strict";
var Atomic = window.Atomic || {};
// For the original FP code, see https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/Entity.as

//TODO: The FP version inherits from Tweener. Make sure we don't need to do that

//TODO: FP properties not implemented:
// Read-only:
//		bottom
//		centerX
//		centerY
//		halfHeight
//		halfWidth
//		left
//		onCamera
//		right
//		top
Atomic.Entity = function(x, y, graphic, mask)
{
	// Not sure about the HITBOX stuff
	// TODO: When Atomic.Mask is written, bring this back
	this._ = this._ || {};
	this._.world = null;
	this._.partMove = {x: 0, y: 0};
	// this._.HITBOX = new Atomic.Mask();
	// this._.HITBOX.assignTo(this);

	this.active = true;
	this.collidable = null;
	this.graphic = graphic || null;
	this.height = null;
	this.layer = null;
	this.mask = mask || null;
	this.name = null;
	this.originX = null;
	this.originY = null;
	this.renderTarget = null;
	this.type = null;
	this.visible = true;
	this.width = null;
	this.x = x || 0;
	this.y = y || 0;

};

// Unimplemented methods from the FP original:
//	addGraphic
//	clampHorizontal
//	clampVertical
//	collide
//	collideInto
//	collideRect
//	collideTypes
//	collideTypeInto
//	collideWith
//	distanceFrom
//	distanceToPoint
//	distanceToRect
//	getClass
//	moveBy
//	moveCollideX
//	moveCollideY
//	moveTo
//	moveTowards
//	render
//	setHitboxTo
//	setOrigin
Atomic.Entity.prototype = {
	added: function(){},
	centerOrigin: function()
	{
		this.originX = this.width / 2;
		this.originY = this.height / 2;
	},
	collide: function(type, x, y)
	{
		if (!this.world || this.world.entities.length === 0) return null;

		var entity, i;

		var _x = this.x, _y = this.y;
		this.x = x; this.y = y;

		// We are only doing the "no mask" collisions for now
		//if (!_mask)
		//{
			for(i in this.world.entities)
			{
				entity = this.world.entities[i];
				if(
					entity.collidable && entity !== this &&
					x - this.originX + this.width > entity.x - entity.originX &&
					y - this.originY + this.height > entity.y - entity.originY &&
					x - this.originX < entity.x - entity.originX + entity.width &&
					y - this.originY < entity.y - entity.originY + entity.height
				)
				{
					// if (!entity._mask || entity._mask.collide(HITBOX))
					// {
						this.x = _x; this.y = _y;
						return entity;
					// }
				}
			}
			this.x = _x; this.y = _y;
			return null;
		//}


		// while (e)
		// {
		// 	if (e.collidable && e !== this
		// 	&& x - originX + width > e.x - e.originX
		// 	&& y - originY + height > e.y - e.originY
		// 	&& x - originX < e.x - e.originX + e.width
		// 	&& y - originY < e.y - e.originY + e.height)
		// 	{
		// 		if (_mask.collide(e._mask ? e._mask : e.HITBOX))
		// 		{
		// 			this.x = _x; this.y = _y;
		// 			return e;
		// 		}
		// 	}
		// 	e = e._typeNext;
		// }
		// this.x = _x; this.y = _y;
		// return null;
	},
	collidePoint: function(x, y, pX, pY)
	{
		if(pX >= x - this.originX && pY >= y - this.originY && pX < x - this.originX + this.width && pY < y - this.originY + this.height)
		{
			return true;
			// TODO: This code uses the hitmask to determine if we've hit
			// For now we are just using the bounding rect of the graphic
			// if(!_mask) return true;
			// var _x = this.x, _y = this.y;
			// this.x = x; this.y = y;
			// FP.entity.x = pX;
			// FP.entity.y = pY;
			// FP.entity.width = 1;
			// FP.entity.height = 1;
			// if (_mask.collide(FP.entity.HITBOX))
			// {
			// 	this.x = _x;
			// 	this.y = _y;
			// 	return true;
			// }
			// this.x = _x; this.y = _y;
			// return false;
		}
		return false;
	},
	moveBy: function(x, y, solidType, sweep)
	{
		// This is keep track of the fractions of a pixel of movement that are rounded off
		this._.partMove.x += x;
		this._.partMove.y += y;
		x = Math.round(this._.partMove.x);
		y = Math.round(this._.partMove.y);
		this._.partMove.x -= x;
		this._.partMove.y -= y;

		// TODO: Totally ignoring collision here
		// if (solidType)
		// {
		// 	var sign:int, e:Entity;
		// 	if (x != 0)
		// 	{
		// 		if (sweep || collideTypes(solidType, this.x + x, this.y))
		// 		{
		// 			sign = x > 0 ? 1 : -1;
		// 			while (x != 0)
		// 			{
		// 				if ((e = collideTypes(solidType, this.x + sign, this.y)))
		// 				{
		// 					if (moveCollideX(e)) break;
		// 					else this.x += sign;
		// 				}
		// 				else this.x += sign;
		// 				x -= sign;
		// 			}
		// 		}
		// 		else this.x += x;
		// 	}
		// 	if (y != 0)
		// 	{
		// 		if (sweep || collideTypes(solidType, this.x, this.y + y))
		// 		{
		// 			sign = y > 0 ? 1 : -1;
		// 			while (y != 0)
		// 			{
		// 				if ((e = collideTypes(solidType, this.x, this.y + sign)))
		// 				{
		// 					if (moveCollideY(e)) break;
		// 					else this.y += sign;
		// 				}
		// 				else this.y += sign;
		// 				y -= sign;
		// 			}
		// 		}
		// 		else this.y += y;
		// 	}
		// }
		// else
		// {
			this.x += x;
			this.y += y;
		// }
	},
	removed: function(){},
	render: function()
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
	},
	setHitbox: function(width, height, originX, originY)
	{
		this.width = width;
		this.height = height;
		this.originX = originX;
		this.originY = originY;
	},
	toString: function()
	{
		return this.constructor.name;
	},
	update: function(){}
};

Object.defineProperties( Atomic.Entity.prototype,
{
	"world": {
		get: function()
		{
			return this._.world;
		}
	}
});

// My original implementation that did animation and not a lot else
/*
Atomic.Entity = function(x, y, graphic, hitmask)
{
	this.layer = 0;
	this.visible = true;
	this.animations = {};
	this.animation = null;

	this.x = x || 0;
	this.y = y || 0;
	this.graphic = graphic || null;
	this.hitmask = hitmask;

	// TODO: Set these based on the graphic or the hitbox or something
	this.width = 0;
	this.height = 0;
};

Atomic.Entity.prototype = {

	setAnimation: function(name)
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
	},
	clearAnimation: function(name)
	{
		if(this.animation && !this.animation.finished())
		{
			this.animation.stop();
			this.animation = null;
		}
	},
	draw: function(context)
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
	}
};
*/
