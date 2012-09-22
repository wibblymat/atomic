/*global define */
"use strict";
define(["Utils", "Masks/Hitbox", "Space"], function(Utils, Hitbox, Space)
{
	function Grid(width, height, tileWidth, tileHeight, x, y)
	{
		Hitbox.call(this);

		/**
		 * If x/y positions should be used instead of columns/rows.
		 */
		// TODO: Probably don't need this
		this.usePositions = false;

		// check for illegal grid size
		if(!width || !height || !tileWidth || !tileHeight) throw new Error("Illegal Grid, sizes cannot be 0.");

		// set grid properties
		this.columns = width / tileWidth;
		this.rows = height / tileHeight;
		this.data = new Space(this.columns, this.rows);
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;
		this._x = x || 0;
		this._y = y || 0;
		this._width = width;
		this._height = height;

		// set callback functions
		this.check.Mask = collideMask;
		this.check.Hitbox = collideHitbox;
		this.check.Pixelmask = collidePixelmask;
		this.check.Grid = collideGrid;
	}

	Utils.extend(Hitbox, Grid);

	Grid.prototype.MaskType = "Grid";

	Grid.prototype.setTile = function(column, row, solid)
	{
		column = column || 0;
		row = row || 0;
		solid = solid === undefined || solid;

		if(this.usePositions)
		{
			column /= this.tileWidth;
			row /= this.tileHeight;
		}
		this.data.set(solid, column, row);
	};

	Grid.prototype.clearTile = function(column, row)
	{
		this.setTile(column || 0, row || 0, false);
	};

	Grid.prototype.getTile = function(column, row)
	{
		column = column || 0;
		row = row || 0;

		if(this.usePositions)
		{
			column /= this.tileWidth;
			row /= this.tileHeight;
		}
		return !!this.data.get(column, row);
	};

	Grid.prototype.setRect = function(column, row, width, height, solid)
	{
		column = column || 0;
		row = row || 0;
		width = width === undefined ? 1 : width;
		height = height === undefined ? 1 : height;
		solid = solid === undefined || solid;

		if(this.usePositions)
		{
			column /= this.tileWidth;
			row /= this.tileHeight;
			width /= this.tileWidth;
			height /= this.tileHeight;
		}

		for(var i = 0; i < width; i++)
		{
			for(var j = 0; j < width; j++)
			{
				this.data.set(solid, column + i, row + j);
			}
		}
	};

	Grid.prototype.clearRect = function(column, row, width, height)
	{
		this.setRect(column, row, width, height, false);
	};

	Grid.prototype.loadFromString = function(str, columnSep, rowSep)
	{
		columnSep = columnSep || ",";
		rowSep = rowSep || "\n";
		var row = String(str).split(rowSep),
			rows = row.length,
			col, cols, x, y;
		for(y = 0; y < rows; y ++)
		{
			if (row[y] === '') continue;
			col = row[y].split(columnSep),
			cols = col.length;
			for(x = 0; x < cols; x ++)
			{
				if (col[x] === '') continue;
				this.setTile(x, y, parseInt(col[x], 10));
			}
		}
	};

	//Grid.prototype.saveToString = function(columnSep:String = ",", rowSep:String = "\n"): String
	//{
	//	var s:String = '',
	//		x:int, y:int;
	//	for (y = 0; y < _rows; y ++)
	//	{
	//		for (x = 0; x < _columns; x ++)
	//		{
	//			s += getTile(x, y) ? '1' : '0';
	//			if(x != _columns - 1) s += columnSep;
	//		}
	//		if(y != _rows - 1) s += rowSep;
	//	}
	//	return s;
	//};

	// Grid.prototype.renderDebug = function(g:Graphics):void
	//{
	//	var sx:Number = FP.screen.scaleX * FP.screen.scale;
	//	var sy:Number = FP.screen.scaleY * FP.screen.scale;

	//	var x:int, y:int;

	//	g.lineStyle(1, 0xFFFFFF, 0.25);

	//	for (y = 0; y < _rows; y ++)
	//	{
	//		for (x = 0; x < _columns; x ++)
	//		{
	//			if(_data.getPixel32(x, y))
	//			{
	//				g.drawRect((parent.x - parent.originX - FP.camera.x + x * _tile.width) * sx, (parent.y - parent.originY - FP.camera.y + y * _tile.height) * sy, _tile.width * sx, _tile.height * sy);
	//			}
	//		}
	//	}
	//}

	var collideMask = function(other)
	{
		var left = other.parent.x - other.parent.originX - this.parent.x + this.parent.originX;
		var top = other.parent.y - other.parent.originY - this.parent.y + this.parent.originY;
		var right = Math.floor((left + other.parent.width - 1) / this.tileWidth) + 1;
		var bottom = Math.floor((top + other.parent.height -1) / this.tileHeight) + 1;
		left = Math.floor(left / this.tileWidth);
		top = Math.floor(top / this.tileHeight);

		for(var x = left; x < right; x++)
		{
			for(var y = top; y < bottom; y++)
			{
				if(this.data.get(x, y)) return true;
			}
		}
		return false;
	};

	var collideHitbox = function(other)
	{
		var left = other.parent.x + other.x - parent.x - this.x;
		var top = other.parent.y + other.y - parent.y - this.y;
		var right = Math.floor((left + other.width - 1) / this.tileWidth) + 1;
		var bottom = Math.floor((top + other.height - 1) / this.tileHeight) + 1;
		left = Math.floor(left / this.tileWidth);
		top = Math.floor(top / this.tileHeight);

		for(var x = left; x < right; x++)
		{
			for(var y = top; y < bottom; y++)
			{
				if(this.data.get(x, y)) return true;
			}
		}
		return false;
	};

	var collidePixelmask = function(other)
	{
		throw new Error("Not implemented");
		// var x1 = other.parent.x + other.x - parent.x - this.x,
		// 	y1 = other.parent.y + other.y - parent.y - this.y,
		// 	x2 = ((x1 + other._width - 1) / this.tileWidth),
		// 	y2 = ((y1 + other._height - 1) / this.tileHeight);
		// _point.x = x1;
		// _point.y = y1;
		// x1 /= this.tileWidth;
		// y1 /= this.tileHeight;
		// _tile.x = x1 * this.tileWidth;
		// _tile.y = y1 * this.tileHeight;
		// var xx = x1;
		// while (y1 <= y2)
		// {
		// 	while (x1 <= x2)
		// 	{
		// 		if(_data.getPixel32(x1, y1))
		// 		{
		// 			if(other._data.hitTest(_point, 1, _tile)) return true;
		// 		}
		// 		x1 ++;
		// 		_tile.x += this.tileWidth;
		// 	}
		// 	x1 = xx;
		// 	y1 ++;
		// 	_tile.x = x1 * this.tileWidth;
		// 	_tile.y += this.tileHeight;
		// }
		// return false;
	};

	var collideGrid = function(other)
	{
		throw new Error("Not implemented");
		// // Find the X edges
		// var ax1:Number = parent.x + _x;
		// var ax2:Number = ax1 + _width;
		// var bx1:Number = other.parent.x + other._x;
		// var bx2:Number = bx1 + other._width;
		// if(ax2 < bx1 || ax1 > bx2) return false;

		// // Find the Y edges
		// var ay1:Number = parent.y + _y;
		// var ay2:Number = ay1 + _height;
		// var by1:Number = other.parent.y + other._y;
		// var by2:Number = by1 + other._height;
		// if(ay2 < by1 || ay1 > by2) return false;

		// // Find the overlapping area
		// var ox1:Number = ax1 > bx1 ? ax1 : bx1;
		// var oy1:Number = ay1 > by1 ? ay1 : by1;
		// var ox2:Number = ax2 < bx2 ? ax2 : bx2;
		// var oy2:Number = ay2 < by2 ? ay2 : by2;

		// // Find the smallest tile size, and snap the top and left overlapping
		// // edges to that tile size. This ensures that corner checking works
		// // properly.
		// var tw:Number, th:Number;
		// if(_tile.width < other._tile.width)
		// {
		// 	tw = _tile.width;
		// 	ox1 -= parent.x + _x;
		// 	ox1 = int(ox1 / tw) * tw;
		// 	ox1 += parent.x + _x;
		// }
		// else
		// {
		// 	tw = other._tile.width;
		// 	ox1 -= other.parent.x + other._x;
		// 	ox1 = int(ox1 / tw) * tw;
		// 	ox1 += other.parent.x + other._x;
		// }
		// if(_tile.height < other._tile.height)
		// {
		// 	th = _tile.height;
		// 	oy1 -= parent.y + _y;
		// 	oy1 = int(oy1 / th) * th;
		// 	oy1 += parent.y + _y;
		// }
		// else
		// {
		// 	th = other._tile.height;
		// 	oy1 -= other.parent.y + other._y;
		// 	oy1 = int(oy1 / th) * th;
		// 	oy1 += other.parent.y + other._y;
		// }

		// // Step through the overlapping rectangle
		// for (var y:Number = oy1; y < oy2; y += th)
		// {
		// 	// Get the row indices for the top and bottom edges of the tile
		// 	var ar1:int = (y - parent.y - _y) / _tile.height;
		// 	var br1:int = (y - other.parent.y - other._y) / other._tile.height;
		// 	var ar2:int = ((y - parent.y - _y) + (th - 1)) / _tile.height;
		// 	var br2:int = ((y - other.parent.y - other._y) + (th - 1)) / other._tile.height;
		// 	for (var x:Number = ox1; x < ox2; x += tw)
		// 	{
		// 		// Get the column indices for the left and right edges of the tile
		// 		var ac1:int = (x - parent.x - _x) / _tile.width;
		// 		var bc1:int = (x - other.parent.x - other._x) / other._tile.width;
		// 		var ac2:int = ((x - parent.x - _x) + (tw - 1)) / _tile.width;
		// 		var bc2:int = ((x - other.parent.x - other._x) + (tw - 1)) / other._tile.width;

		// 		// Check all the corners for collisions
		// 		if((_data.getPixel32(ac1, ar1) > 0 && other._data.getPixel32(bc1, br1) > 0)
		// 			|| (_data.getPixel32(ac2, ar1) > 0 && other._data.getPixel32(bc2, br1) > 0)
		// 			|| (_data.getPixel32(ac1, ar2) > 0 && other._data.getPixel32(bc1, br2) > 0)
		// 			|| (_data.getPixel32(ac2, ar2) > 0 && other._data.getPixel32(bc2, br2) > 0))
		// 		{
		// 			return true;
		// 		}
		// 	}
		// }

		// return false;
	};

	return Grid;
});
