/*global define */
"use strict";
define(function(require)
{
	var AssetManager = require("AssetManager");
	var Audio        = require("Audio");
	var Entity       = require("Entity");
	var Graphic      = require("Graphic");
	var Input        = require("Input");
	var Key          = require("Key");
	var Mask         = require("Mask");
	var Point        = require("Point");
	var Sound        = require("Sound");
	var Space        = require("Space");
	var Tween        = require("Tween");
	var Utils        = require("Utils");
	var World        = require("World");

	var Graphics         = {};
	Graphics.Animation   = require("Graphics/Animation");
	Graphics.Graphiclist = require("Graphics/Graphiclist");
	Graphics.Image       = require("Graphics/Image");
	Graphics.Spritemap   = require("Graphics/Spritemap");
	Graphics.TiledImage  = require("Graphics/TiledImage");
	Graphics.Tilemap     = require("Graphics/Tilemap");
	Graphics.Tilesheet   = require("Graphics/Tilesheet");

	var Masks    = {};
	Masks.Grid   = require("Masks/Grid");
	Masks.Hitbox = require("Masks/Hitbox");

	// We build it this way to deal with dependency order
	var atomic = require("Atomic");
	atomic.AssetManager = AssetManager;
	atomic.Audio        = Audio;
	atomic.Entity       = Entity;
	atomic.Graphic      = Graphic;
	atomic.Graphics     = Graphics;
	atomic.Input        = Input;
	atomic.Key          = Key;
	atomic.Mask         = Mask;
	atomic.Masks        = Masks;
	atomic.Point        = Point;
	atomic.Sound        = Sound;
	atomic.Space        = Space;
	atomic.Tween        = Tween;
	atomic.Utils        = Utils;
	atomic.World        = World;

	return atomic;
});

