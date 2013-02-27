/*global Atomic */
"use strict";
window.onload = function()
{
	Atomic.AssetManager.queue([
		{id: "image/tiles", path: "assets/platformer-tiles.png", type: "image"},
		{id: "level/single-room", path: "assets/single-room.oel", type: "xml"}
	]);
	Atomic.AssetManager.start(function()
	{
		Atomic.init({width: 800, height: 600});

		var world = new Atomic.World();
		Atomic.world = world;

		var level = Atomic.Utils.getXML(Atomic.AssetManager.assets["level/single-room"]);

		var width = level["@width"];
		var height = level["@height"];

		var tiles = Atomic.AssetManager.assets["image/tiles"];
		var tilesheet = new Atomic.Graphics.Tilesheet(tiles, 50, 50);

		var bgTiles = new Atomic.Graphics.Tilemap(tilesheet, width, height);
		bgTiles.loadFromString(level.Background, ",");
		bgTiles.scrollX = 0.5;
		bgTiles.scollY = 0.5;
		world.addGraphic(bgTiles, 10);

		var fgTiles = new Atomic.Graphics.Tilemap(tilesheet, width, height);
		var solids = new Atomic.Masks.Grid(width, height, 50, 50);
		world.addGraphic(fgTiles, -10);
		world.addMask(solids, "Solid");

		var rows = String(level.Foreground).split("\n");
		for(var row = 0; row < rows.length; row++)
		{
			var cols = rows[row].split(",");
			for(var col = 0; col < cols.length; col++)
			{
				var tile = parseInt(cols[col], 10);
				if(tile >= 0)
				{
					fgTiles.setTile(col, row, tile);
					solids.setTile(col, row, true);
				}
			}
		}

		var graphic = Atomic.Graphics.Image.createRect(50, 100, 0xFF4444, 1);

		Atomic.Input.define("Left", "LEFT_ARROW", "A");
		Atomic.Input.define("Right", "RIGHT_ARROW", "D");
		Atomic.Input.define("Up", "UP_ARROW", "W");
		Atomic.Input.define("Down", "DOWN_ARROW", "S");

		var velocity = {x: 0, y: 0};
		var player = new Atomic.Entity(100, 300, graphic);
		player.setHitbox(50, 100);
		player.type = "Player";

		player.update = function()
		{
			world.camera.x = Atomic.Utils.clamp(player.x - Atomic.halfWidth, 0, width - Atomic.width);
			world.camera.y = Atomic.Utils.clamp(player.y - Atomic.halfHeight, 0, height - Atomic.height);

			velocity.x = 0;
			if(Atomic.Input.check("Left"))
			{
				velocity.x = -Atomic.elapsed * 300;
			}
			if(Atomic.Input.check("Right"))
			{
				velocity.x = Atomic.elapsed * 300;
			}
			if(Atomic.Input.check("Up"))
			{
				if(this.collide("Solid", this.x, this.y + 1) !== null)
				{
					velocity.y = -20;
				}
			}
			velocity.y += 1;

			this.moveBy(velocity.x, velocity.y, "Solid");
		};

		player.moveCollideX = function(entity)
		{
			velocity.x = 0;
			return Atomic.Entity.prototype.moveCollideX.call(this, entity);
		};

		player.moveCollideY = function(entity)
		{
			velocity.y = 0;
			return Atomic.Entity.prototype.moveCollideY.call(this, entity);
		};

		world.add(player);
	});
};
