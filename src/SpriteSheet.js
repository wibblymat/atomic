"use strict";
var Atomic = window.Atomic || {};

// image is a DOM Image or a canvas
Atomic.SpriteSheet = function(image, tileSize)
{
	this.image = image;
	this.tileSize = tileSize || 16;
};

Atomic.SpriteSheet.prototype.sprite = function(x, y, width, height)
{
	width = width || 1;
	height = height || 1;

	var canvas = document.createElement("canvas");
	canvas.width = this.tileSize * width;
	canvas.height = this.tileSize * height;
	canvas.getContext("2d").drawImage(this.image, x * this.tileSize, y * this.tileSize, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

	return canvas;
};

Atomic.SpriteSheet.prototype.tile = function(index)
{
	var x = index % (this.image.width / this.tileSize);
	var y = Math.floor(index / (this.image.width / this.tileSize));
	var canvas = document.createElement("canvas");
	canvas.width = this.tileSize;
	canvas.height = this.tileSize;
	canvas.getContext("2d").drawImage(this.image, x * this.tileSize, y * this.tileSize, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

	return canvas;
};
