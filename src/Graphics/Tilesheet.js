/*global define */
"use strict";
define(function()
{
	// If the source image dimensions are not divided evenly by the tile
	// dimensions then any partial tiles are ignored
	function Tilesheet(source, tileWidth, tileHeight)
	{
		this.source = source;
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;
		this.columns = Math.floor(this.source.width / this.tileWidth);
		this.rows = Math.floor(this.source.height / this.tileHeight);
		this.length = this.columns * this.rows;
	}

	Tilesheet.prototype.index = function(column, row)
	{
		return column + row * Math.floor(this.source.width / this.tileWidth);
	};

	// TODO: Check that (column, row) is inside the source image
	Tilesheet.prototype.getTile = function(column, row)
	{
		var index = this.index(row, column);

		var canvas = document.createElement("canvas");
		canvas.width = this.tileWidth;
		canvas.height = this.tileHeight;

		canvas.getContext("2d").drawImage(this.source, column * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight, 0, 0, this.tileWidth, this.tileHeight);

		return canvas;
	};

	Tilesheet.prototype.getTileAtIndex = function(index)
	{
		var row = Math.floor(index / this.columns);
		var column = index - (row * this.columns);

		return this.getTile(column, row);
	};

	return Tilesheet;
});
