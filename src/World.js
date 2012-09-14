"use strict";
var Atomic = window.Atomic || {};

//TODO: Events when added to or removed from the stage
Atomic.World = function()
{
	this.camera = null;
	this.visible = true;

	this.entities = [];
	this.layers = [];

	$(this).bind("frame", function(){
		this.update();
		this.draw();
	});
};

Atomic.World.prototype.update = function()
{
};

Atomic.World.prototype.draw = function()
{
	Atomic.stage.getContext("2d").clearRect(0, 0, Atomic.stage.width, Atomic.stage.height);
	for(var i = 0; i < this.entities.length; i++)
	{
		this.entities[i].draw(Atomic.stage.getContext("2d"));
	}
};

Atomic.World.prototype.add = function(entity)
{
	this.entities.push(entity);
};

Atomic.World.prototype.remove = function(entity)
{
	Atomic.Utils.removeElement(entity, this.entities);
};
