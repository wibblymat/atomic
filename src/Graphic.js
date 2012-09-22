/*global define */
"use strict";
define(function()
{
	function Graphic()
	{
		this.active = false;
		this.relative = true;
		this.scrollX = 1;
		this.scrollY = 1;
		this.visible = true;
		this.assign = null;
		this.x = 0;
		this.y = 0;
	}

	Graphic.prototype.render = function(target, point, camera)
	{
	};
	Graphic.prototype.update = function()
	{
	};

	return Graphic;
});
