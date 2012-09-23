//Copyright 2012, etc.
"use strict";
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD.
		define(['jquery'], factory);
	} else {
		// Browser globals
		root.Atomic = factory(root.$);
	}
}(this, function ($) {


/**
 * almond 0.1.4 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("../build/almond", function(){});

/*global define */
"use strict";
define('Sound',["Audio"], function(Audio)
{
	function Sound(buffer)
	{
		this.source = Audio.context.createBufferSource();
		this.source.buffer = buffer;
		this.source.connect(Audio.context.destination);
	}

	Sound.prototype.play = function()
	{
		this.source.noteOn(0);
	};

	return Sound;
});

/*global define */
"use strict";
define('Audio',['Sound'],function()
{
	var Sound;
	// TODO: Make this work cross-browser, perhaps with a fallback
	var audio = {
		context: new window.webkitAudioContext(),
		createSound: function(data, callback)
		{
			if(!Sound) Sound = require("Sound"); // Circular dependency correction

			audio.context.decodeAudioData(data, function(buffer)
			{
				var sound = new Sound(buffer);
				callback(sound);
			}, function(error){console.log("Error decoding sound:", error);});
		}
	};
	return audio;
});

/*global define */
"use strict";
define('AssetManager',["Audio"], function(Audio)
{
	// TODO: We want this to work for images, sounds, JSON files (maps, etc.) and maybe others
	// TODO: Look in our filesystem store before going to the network
	// TODO: Progress monitor
	// TODO: At the moment, calling start() twice will download things twice
	// Check out http://smus.com/game-asset-loader/ for more ideas
	var successCount = 0;
	var errorCount = 0;
	var queue = [];
	var finished = function()
	{
		return queue.length === successCount + errorCount;
	};

	var onload = function(callback)
	{
		successCount += 1;
		if(finished()) callback();
	};
	var onerror = function(callback)
	{
		errorCount += 1;
		if(finished()) callback();
	};

	var loadImage = function(item, callback)
	{
		var img = new Image();
		img.addEventListener("load", function(){onload(callback);}, false);
		img.addEventListener("error", function(){onerror(callback);}, false);
		img.src = item.path;
		assetManager.assets[item.id] = img;
	};

	var loadSound = function(item, callback)
	{
		var request = new XMLHttpRequest();
		request.open('GET', item.path, true);
		request.responseType = 'arraybuffer';
		request.onload = function()
		{
			Audio.createSound(this.response, function(sound)
			{
				assetManager.assets[item.id] = sound;
				onload(callback);
			});
		};
		request.onerror = function(){onerror(callback);};
		request.send();
	};

	var loadXML = function(item, callback)
	{
		var request = new XMLHttpRequest();
		request.open('GET', item.path, true);
		request.overrideMimeType("text/xml");
		request.onload = function()
		{
			assetManager.assets[item.id] = this.responseXML;
			onload(callback);
		};
		request.onerror = function(){onerror(callback);};
		request.send();
	};

	var assetManager = {
		assets: {},
		// items is an array of objects. The objects have the form {id: "", path: "", type: ""}
		queue: function(items)
		{
			queue = queue.concat(items);
		},
		start : function(callback)
		{
			var request;

			if(queue.length === 0)
			{
				callback();
			}

			for(var i = 0; i < queue.length; i++)
			{
				var item = queue[i];
				if(item.type === "image")
				{
					loadImage(item, callback);
				}
				else if(item.type === "sound")
				{
					loadSound(item, callback);
				}
				else if(item.type === "xml")
				{
					loadXML(item, callback);
				}
			}
		}
	};

	return assetManager;
});

/*global define */
"use strict";
define('Atomic',['require'],function(require)
{
	window.URL = window.URL || window.webkitURL;
	window.performance = window.performance || window.msperformance;
	window.performance.now = window.performance.now || window.performance.webkitNow;

	var frameStart = 0;
	var world = null;
	var nextworld = null;
	var atomic = {
		VERSION: "0.1",
		debug: false,
		stage: null,
		scale: 1,
		smooth: true,
		camera: {x: 0, y: 0},
		elapsed: 0,
		backgroundColor: "#000000",
		init: function(options)
		{
			atomic.width  = options.width     || atomic.width;
			atomic.height = options.height    || atomic.height;
			atomic.scale  = options.scale     || atomic.scale;
			atomic.smooth  = options.smooth     || atomic.smooth;
			var container = options.container || document.body;
			container.appendChild(atomic.stage);
			// TODO: maybe abstract away atomic.stage elsewhere so that it could have multiple layers, be 2d or webgl or not even canvas or whatever
			atomic.stage.style.backgroundColor = atomic.backgroundColor;
			atomic.stage.width = atomic.width * atomic.scale;
			atomic.stage.height = atomic.height * atomic.scale;
			atomic.stage.style.outline = 0;
			atomic.stage.style.position = "absolute";
			atomic.stage.style.left = ((container.offsetWidth / 2) - atomic.halfWidth) + "px";
			atomic.stage.style.outline = 0;
			atomic.stage.focus();

			var resize = function()
			{
				atomic.stage.style.left = ((container.offsetWidth / 2) - atomic.halfWidth) + "px";
			};
			$(window).resize(resize);

			// TODO: Make the image smoothing option cross-browser, similar to rAF
			atomic.stage.getContext("2d").scale(atomic.scale, atomic.scale);
			atomic.stage.getContext("2d").webkitImageSmoothingEnabled = atomic.smooth; // TODO: webkit prefix!
			frameStart = window.performance.now();
			mainLoop();
		}
	};

	var width = 640;
	var height = 480;
	var halfWidth = Math.round(width / 2);
	var halfHeight = Math.round(height / 2);

	Object.defineProperties( atomic,
	{
		"width": {
			get: function()
			{
				return width;
			},
			set: function(value)
			{
				width = value;
				halfWidth = Math.round(width / 2);
			}
		},
		"height": {
			get: function()
			{
				return height;
			},
			set: function(value)
			{
				height = value;
				halfHeight = Math.round(height / 2);
			}
		},
		"halfWidth": {
			get: function()
			{
				return halfWidth;
			}
		},
		"halfHeight": {
			get: function()
			{
				return halfHeight;
			}
		},
		"world": {
			get: function()
			{
				return world;
			},
			set: function(value)
			{
				if(world === value) return;
				nextworld = value;
			}
		}
	});

	// We don't size the canvas or add it to the document until init()
	// However, we still create the element now so that it is available in sub-modules as they load
	atomic.stage = document.createElement("canvas");
	atomic.stage.tabIndex = 1; // Make the canvas focusable

	var frameRequest;
	var mainLoop = function()
	{
		frameRequest = window.requestAnimationFrame(mainLoop);

		var timestamp = window.performance.now();
		atomic.elapsed = (timestamp - frameStart) / 1000; // Work in seconds rather than milliseconds
		frameStart = timestamp;

		if(nextworld)
		{
			if(world) world.end();
			world = nextworld;
			nextworld = null;
			atomic.camera = world.camera;
			world.begin();
		}

		$(atomic).trigger("startFrame");
		if(atomic.world)
		{
			atomic.world.update();
			atomic.world.draw();
		}
		$(atomic).trigger("endFrame");

		timestamp = window.performance.now();
		atomic.duration = (timestamp - frameStart) / 1000; // Measure the
	};

	// TODO: focus and blur events on the stage should unpause/pause the game

	return atomic;
});


// Before we finish we need to set up our environment the way we like it
// Set up requestAnimationFrame
// Here seems as good a place as any other
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// Original by Erik Möller with fixes from Paul Irish and Tino Zijdel
(function()
{
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if(!window.requestAnimationFrame)
	{
		window.requestAnimationFrame = function(callback, element)
		{
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if(!window.cancelAnimationFrame)
	{
		window.cancelAnimationFrame = function(id)
		{
			clearTimeout(id);
		};
	}
}());

/*global define */
"use strict";
define('Mask',[],function()
{
	function Mask(x, y, graphic, mask)
	{
		this.parent = null;
		this.list = null;
		this.check = this.check || {};
		this.check.Mask = collideMask;
		this.check.MaskList = collideMasklist;
	}

	// Ok, so the original in FP uses the actual class name of the object that is doing the colliding.
	// That obviously isn't going to work in JS, so we'll provide a name to use.
	// We just have to be aware that this means creating a custom Mask class involved overriding the MaskType too.
	// This whole business is pretty horrible
	Mask.prototype.MaskType = "Mask";

	Mask.prototype.collide = function(mask)
	{
		if(this.check[mask.MaskType] !== null) return this.check[mask.MaskType].call(this, mask);
		if(mask.check[this.MaskType] !== null) return mask.check[this.MaskType].call(mask, this);
		return false;
	};

	Mask.prototype.assignTo = function(parent)
	{
		this.parent = parent;
		if(!this.list && parent) this.update();
	};

	Mask.prototype.update = function()
	{
	};

	Mask.prototype.renderDebug = function(g)
	{
	};

	var collideMask = function(other)
	{
		return this.parent.x - this.parent.originX + this.parent.width > other.parent.x - other.parent.originX &&
			this.parent.y - this.parent.originY + this.parent.height > other.parent.y - other.parent.originY &&
			this.parent.x - this.parent.originX < other.parent.x - other.parent.originX + other.parent.width &&
			this.parent.y - this.parent.originY < other.parent.y - other.parent.originY + other.parent.height;
	};

	var collideMasklist = function(other)
	{
		return other.collide(this);
	};

	return Mask;
});

/*global define */
"use strict";
define('Entity',["Atomic", "Mask"], function(Atomic, Mask)
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
			var testMask = new Mask();
			testMask.assignTo({x: pX, y: pY, width: 1, height:1, originX: 0, originY: 0});
			if(this.mask.collide(testMask))
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

/*global define */
"use strict";
define('Graphic',[],function()
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

/*global define */
"use strict";
define('Input',["Atomic"], function(Atomic)
{
	var stage, inputState = {"ANY":{pressed: false, released: false, held: false}};
	// For the sake of simplicity, we only ever care about the left mouse button

	// Input map is backwards from what you might expect. It is:
	//	{
	//		'W': 'Jump',
	//		'SPACE': 'Jump',
	//		'UP': 'Jump',
	//	}
	//
	//	rather than
	//
	//	{
	//		'Jump: ['W', 'SPACE', 'UP']
	//	}
	var inputMap = {};
	var input = {
		'lastKey': null,
		'mouseUp': true,
		'mouseDown': false,
		'mousePressed': false,
		'mouseReleased': false,
		'mouseWheel': false,
		'mouseWheelDelta': 0,
		'mouseX': 0,
		'mouseY': 0,
		'check': function(input)
		{
			return (inputState[input] && inputState[input].held) || false;
		},
		'clear': function()
		{
			this.lastKey = 0;
			this.mouseUp = true;
			this.mouseDown = false;
			this.mousePressed = false;
			this.mouseReleased = false;
			this.mouseWheel = false;
			this.mouseWheelDelta = 0;
			this.mouseX = 0;
			this.mouseY = 0;

			inputState = {"ANY":{pressed: false, released: false, held: false}};
		},
		'define': function()
		{
			var i, name = arguments[0];
			for(i = 1; i < arguments.length; i++)
			{
				inputMap[arguments[i]] = name;
			}
		},
		'keys': function(name)
		{
			var result = [];
			for(var key in inputMap)
			{
				if(inputMap[key] === name)
				{
					result.push(key);
				}
			}
		},
		'pressed': function(input)
		{
			return (inputState[input] && inputState[input].pressed) || false;
		},
		'released': function(input)
		{
			return (inputState[input] && inputState[input].released) || false;
		}
	};

	stage = $(Atomic.stage);

	stage.mousedown(function(event)
	{
		input.mouseDown = event.which === 1;
		input.mouseUp = !input.mouseDown;
		input.mousePressed = input.mouseDown;
	});

	stage.mouseup(function(event)
	{
		input.mouseUp = event.which === 1;
		input.mouseDown = !input.mouseDown;
		input.mouseReleased = input.mouseDown;
	});

	stage.mouseout(function(event)
	{
		input.mouseUp = true;
		input.mouseDown = false;
	});

	stage.mousemove(function(event)
	{
		var posx = 0;
		var posy = 0;

		if(!event) event = window.event;
		if(event.pageX || event.pageY)
		{
			posx = event.pageX;
			posy = event.pageY;
		}
		else if(event.clientX || event.clientY)
		{
			posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		// We have the position relative to the page
		// Now to get it relative to our element
		var rect = stage.get(0).getBoundingClientRect();
		posx -= (rect.left + window.scrollX);
		posy -= (rect.top + window.scrollY);

		// This should deal with the situation where the mouse was clicked while off the stage, then dragged over the stage while the button is still down.
		input.mouseDown = event.which === 1;
		input.mouseUp = !input.mouseDown;

		input.mouseX = posx;
		input.mouseY = posy;
	});

	stage.bind('mousewheel DOMMouseScroll', function(event)
	{
		event = event || window.event;
		input.mouseWheel = true;
		input.mouseWheelDelta = event.originalEvent.detail * 40 || -event.originalEvent.wheelDelta;
	});

	stage.keydown(function(event)
	{
		var key = Atomic.Key[event.which];
		var name = inputMap[key] || key || null;

		input.lastKey = key;

		if(name !== null)
		{
			inputState[name] = inputState[name] || {released: false};
			// Determine wether or not this is a keyboard repeat or a genuine
			// user keypress. If the key was already marked as held (meaning
			// no previous keyup) then it wasn't really pressed this frame.
			inputState[name].pressed = !inputState[name].held;
			inputState[name].held = true;
		}

		inputState["ANY"].pressed = true;
		inputState["ANY"].held = true;
	});

	stage.keyup(function(event)
	{
		var key = Atomic.Key[event.which];
		var name = inputMap[key] || key || null;

		if(name !== null)
		{
			inputState[name] = inputState[name] || {pressed: false};
			inputState[name].released = true;
			inputState[name].held = false;
		}

		inputState["ANY"].released = true;
		inputState["ANY"].held = false;
		for(name in inputState)
		{
			if(inputState[name].held)
			{
				inputState["ANY"].held = true;
				break;
			}
		}
	});

	stage.blur(function(event)
	{
		inputState = {"ANY":{pressed: false, released: false, held: false}};
		input.mouseUp = true;
		input.mouseDown = false;
	});

	// To be called once a frame so we know when to clear per-frame states
	$(Atomic).bind("endFrame", function()
	{
		var state, name;
		input.mousePressed = false;
		input.mouseReleased = false;
		input.mouseWheel = false;
		input.mouseWheelDelta = 0;

		for(name in inputState)
		{
			state = inputState[name];
			state.pressed = false;
			state.released = false;
		}
	});


	return input;
});

/*global define */
"use strict";
define('Key',{
	// This list based on:
	// https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent#Virtual_key_codes
	// TODO: This does not fully map all of the keys in the article linked above.
	// TODO: Some keys on my keyboard do not return the codes I'm expecting, ";" for e.g.
	8: "BACKSPACE",
	9: "TAB",
	13: "ENTER",
	16: "SHIFT",
	17: "CONTROL",
	18: "ALT",
	20: "CAPS_LOCK",
	27: "ESCAPE",
	32: "SPACE",
	33: "PAGE_UP",
	34: "PAGE_DOWN",
	35: "END",
	36: "HOME",
	37: "LEFT_ARROW",
	38: "UP_ARROW",
	39: "RIGHT_ARROW",
	40: "DOWN_ARROW",
	44: "PRINT_SCREEN",
	45: "INSERT",
	46: "DELETE",
	48: "0",
	49: "1",
	50: "2",
	51: "3",
	52: "4",
	53: "5",
	54: "6",
	55: "7",
	56: "8",
	57: "9",
	59: ";",
	61: "=",
	65: "A",
	66: "B",
	67: "C",
	68: "D",
	69: "E",
	70: "F",
	71: "G",
	72: "H",
	73: "I",
	74: "J",
	75: "K",
	76: "L",
	77: "M",
	78: "N",
	79: "O",
	80: "P",
	81: "Q",
	82: "R",
	83: "S",
	84: "T",
	85: "U",
	86: "V",
	87: "W",
	88: "X",
	89: "Y",
	90: "Z",
	93: "MENU"
});

/*global define */
"use strict";
define('Space',[],function()
{
	// Objects to represent multi-dimensional data structures, like a 2d grid
	// Maybe use typed arrays for storage - http://www.khronos.org/registry/typedarray/specs/latest/
	function Space()
	{
		if(arguments.length === 0) throw new TypeError("Tried to create a zero-dimensional space");
		this.multipliers = [];
		var total = 1;
		for(var i = 0; i < arguments.length; i++)
		{
			this.multipliers[i] = total;
			total *= arguments[i];
		}

		this.data = [];
	}

	var getIndex = function()
	{
		var i, index = 0;
		if(arguments.length !== this.multipliers.length)
		{
			throw new TypeError("Not enough arguments passed");
		}

		for(i = 0; i < this.multipliers.length; i++)
		{
			if(arguments[i] < 0) return undefined;
			if(i < this.multipliers.length - 1 && arguments[i] >= this.multipliers[i + 1]) return undefined;
			index += arguments[i] * this.multipliers[i];
		}
		return index;
	};

	Space.prototype.get = function()
	{
		var index = getIndex.apply(this, arguments);
		return index !== undefined ? this.data[index] : undefined;
	};

	Space.prototype.set = function()
	{
		var value = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		var index = getIndex.apply(this, args);
		if(index !== undefined) this.data[index] = value;
	};

	return Space;
});

/*global define */
"use strict";
define('Tween',["Atomic"], function(Atomic)
{
	var tweens = [];
	var specials = ["ease", "delay", "onComplete", "onUpdate"];

	var Tween = {
		delayedCall: function(delay, onComplete, onCompleteParams)
		{
			var callback = function()
			{
				onComplete.apply(null, onCompleteParams);
			};

			setTimeout(callback, delay * 1000);
		},
		killTweensOf: function(target)
		{
			var i = tweens.length;

			while(i > 0)
			{
				i--;
				if(tweens[i].target === target)
				{
					tweens.splice(i, 1);
				}
			}
		},
		to: function(target, duration, options)
		{
			var i;
			var tween = {
				target: target,
				duration: duration,
				elapsed: 0,
				startValues: {},
				endValues: {},
				ease: null,
				delay: 0,
				onComplete: null,
				onUpdate: null
			};

			for(i in specials)
			{
				if(options[specials[i]])
				{
					tween[specials[i]] = options[specials[i]];
					delete options[specials[i]];
				}
			}

			for(i in options)
			{
				if(options.hasOwnProperty(i))
				{
					tween.startValues[i] = target[i];
					tween.endValues[i] = options[i];
				}
			}
			tweens.push(tween);
		},
		from: function(target, duration, options)
		{
			var values = {};
			for(var i in options)
			{
				if(options.hasOwnProperty(i))
				{
					if(specials.indexOf(i) < 0)
					{
						values[i] = target[i];
						target[i] = options[i];
					}
					else
					{
						values[i] = options[i];
					}
				}
			}

			Tween.to(target, duration, values);
		}
	};

	var lerp = function(a, b, t)
	{
		if(t === undefined) t = 1;
		return a + (b - a) * t;
	};

	var doTweens = function()
	{
		var i = tweens.length, j, t;

		while(i > 0)
		{
			i--;
			var tween = tweens[i];

			if(tween.delay > 0)
			{
				tween.delay -= Atomic.elapsed;

				if(tween.delay > 0)
				{
					continue;
				}

				tween.delay = 0;
				tween.elapsed -= tween.delay; // delay <= 0
			}
			else
			{
				tween.elapsed += Atomic.elapsed;
			}

			if(tween.elapsed >= tween.duration)
			{
				for(j in tween.endValues)
				{
					if(tween.endValues.hasOwnProperty(j))
					{
						tween.target[j] = tween.endValues[j];
					}
				}
				if(tween.onComplete) tween.onComplete.call(null);
				tweens.splice(i, 1);
			}
			else
			{
				t = tween.elapsed / tween.duration;
				if(tween.ease) t = tween.ease(t);

				for(j in tween.endValues)
				{
					if(tween.endValues.hasOwnProperty(j))
					{
						tween.target[j] = lerp(tween.startValues[j], tween.endValues[j], t);
					}
				}
			}
		}
	};

	$(Atomic).bind("startFrame", doTweens);

	return Tween;
});

/*global define */
"use strict";
define('Utils',{
	DEG: -180 / Math.PI,
	RAD: Math.PI / -180,
	angle: function(x1, y1, x2, y2)
	{
		var a = Math.atan2(y2 - y1, x2 - x1) * this.DEG;
		return a < 0 ? a + 360 : a;
	},
	angleXY: function(object, angle, length, x, y)
	{
		if(length === undefined) length = 1;
		angle *= this.RAD;
		object.x = Math.cos(angle) * length + (x || 0);
		object.y = Math.sin(angle) * length + (y || 0);
	},
	choose: function()
	{
		var c = (arguments.length === 1 && (arguments[0].splice)) ? arguments[0] : arguments;
		return c[this.rand(c.length)];
	},
	clamp: function(value, min, max)
	{
		if(max > min)
		{
			if(value < min) return min;
			else if(value > max) return max;
			else return value;
		}
		else
		{
			// Min/max swapped
			if(value < max) return max;
			else if(value > min) return min;
			else return value;
		}
	},
	distance: function(x1, y1, x2, y2)
	{
		// Cast all to Number
		x1 = +x1;
		y1 = +y1;
		x2 = +x2;
		y2 = +y2;

		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	},
	distanceRects: function(x1, y1, w1, h1, x2, y2, w2, h2)
	{
		if(x1 < x2 + w2 && x2 < x1 + w1)
		{
			if(y1 < y2 + h2 && y2 < y1 + h1) return 0;
			if(y1 > y2) return y1 - (y2 + h2);
			return y2 - (y1 + h1);
		}
		if(y1 < y2 + h2 && y2 < y1 + h1)
		{
			if(x1 > x2) return x1 - (x2 + w2);
			return x2 - (x1 + w1);
		}
		if(x1 > x2)
		{
			if(y1 > y2) return this.distance(x1, y1, (x2 + w2), (y2 + h2));
			return this.distance(x1, y1 + h1, x2 + w2, y2);
		}
		if(y1 > y2) return this.distance(x1 + w1, y1, x2, y2 + h2);
		return this.distance(x1 + w1, y1 + h1, x2, y2);
	},
	extend: function(base, subclass)
	{
		function F(){}
		F.prototype = base.prototype;
		subclass.prototype = new F();
		subclass.base = base;
		subclass.prototype.constructor = subclass;
	},
	rand: function(max)
	{
		return Math.floor(this.random() * max);
	},
	random: function()
	{
		//TODO: FP has this method because it allows you to set the seed and therefore "replay" random events. I haven't done that yet
		return Math.random();
	},
	removeElement: function(item, array, all)
	{
		// The all parameter determines whether we should stop after finding one occurrence or keep going
		all = !!all;
		var i = array.length - 1;
		while(i >= 0)
		{
			if(item === array[i])
			{
				array.splice(i, 1);
				if(!all)
				{
					return;
				}
			}
			i--;
		}
	},
	scale: function(value, min, max, min2, max2)
	{
		return min2 + ((value - min) / (max - min)) * (max2 - min2);
	},
	scaleClamp: function(value, min, max, min2, max2)
	{
		value = min2 + ((value - min) / (max - min)) * (max2 - min2);
		if(max2 > min2)
		{
			value = value < max2 ? value : max2;
			return value > min2 ? value : min2;
		}
		value = value < min2 ? value : min2;
		return value > max2 ? value : max2;
	},
	// JXON implementation, based on https://developer.mozilla.org/en-US/docs/JXON
	parseText: function(sValue)
	{
		if(/^\s*$/.test(sValue))
		{
			return null;
		}
		if(/^(?:true|false)$/i.test(sValue))
		{
			return sValue.toLowerCase() === "true";
		}
		if(isFinite(sValue))
		{
			return parseFloat(sValue);
		}
		if(isFinite(Date.parse(sValue)))
		{
			return new Date(sValue);
		}
		return sValue;
	},
	getXML: function(xml)
	{
		if(xml.nodeType === 9) // nodeType is "Document"
		{
			return this.getXML(xml.documentElement);
		}

		var result = null, childCount = 0, text = "", attribute, node, propertyName, content, i;
		if(xml.hasAttributes())
		{
			result = {};
			for(childCount = 0; childCount < xml.attributes.length; childCount++)
			{
				attribute = xml.attributes.item(childCount);
				result["@" + attribute.name] = this.parseText(attribute.value.trim());
			}
		}

		if(xml.hasChildNodes())
		{
			for(i = 0; i < xml.childNodes.length; i++)
			{
				node = xml.childNodes.item(i);
				if(node.nodeType === 4) /* nodeType is "CDATASection" (4) */
				{
					text += node.nodeValue;
				}
				else if(node.nodeType === 3) /* nodeType is "Text" (3) */
				{
					text += node.nodeValue.trim();
				}
				else if(node.nodeType === 1 && !node.prefix) /* nodeType is "Element" (1) */
				{
					if(childCount === 0)
					{
						result = {};
					}
					propertyName = node.nodeName;
					content = this.getXML(node);
					if(result.hasOwnProperty(propertyName))
					{
						if(result[propertyName].constructor !== Array)
						{
							result[propertyName] = [result[propertyName]];
						}
						result[propertyName].push(content);
					}
					else
					{
						result[propertyName] = content;
						childCount++;
					}
				}
			}
		}

		if(text)
		{
			text = this.parseText(text);
			// Possibly a bit too clever for my own good
			Object.defineProperty(result, "toString", {
				value: function(){ return text ;}
			});
		}

		if(childCount > 0)
		{
			Object.freeze(result);
		}

		return result;
	},
	// Parses a color value and returns a string in the form "rgba(0, 0, 0, 0)"
	// Colors (for the moment) are integers
	getColorRGBA: function(color, alpha)
	{
		/*jshint bitwise: false */
		var r = (color & 0xFF0000) >> 16;
		var g = (color & 0x00FF00) >> 8;
		var b = (color & 0x0000FF);
		/*jshint bitwise: true */

		return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
	}
});

/*global define */
"use strict";
define('World',["Entity", "Atomic", "Utils", "Input"], function(Entity, Atomic, Utils, Input)
{
	// The FP version of this is at https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/World.as
	// However, not sure we'll be following all that closely

	//TODO: Events when added to or removed from the stage
	function World()
	{
		this.camera = {x: 0, y: 0}; // In the original this was a Point. Overkill here though probably.
		this.visible = true;
		this.entities = [];
	}

	World.prototype.add = function(entity)
	{
		this.entities.push(entity);
		if(!entity._world) entity._world = this; // Icky, playing with "private" members from out here
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
				return Input.mouseX + this.camera.x;
			}
		},
		"mouseY": {
			get: function()
			{
				return Input.mouseY + this.camera.y;
			}
		}
	});

	return World;
});

/*global define */
"use strict";
define('Graphics/Animation',[],function()
{
	function Animation(name, frames, frameRate, loop)
	{
		if(loop === undefined) loop = true;

		this.parent = null;
		this.name = name;
		this.frames = frames;
		this.frameRate = frameRate || 0;
		this.loop = loop;
		this.frameCount = frames.length;
	}

	Animation.prototype.play = function(reset)
	{
		this.parent.play(this.name, !!reset);
	};

	return Animation;
});

/*global define */
"use strict";
define('Graphics/Graphiclist',["Utils", "Graphic"], function(Utils, Graphic)
{
	function Graphiclist()
	{
		this._graphics = [];
		this._temp = [];
		this._count = 0;
		this._camera = {x: 0, y: 0};

		Graphic.call(this);

		for(var i = 0; i < arguments.length; i++)
		{
			this.add(arguments[i]);
		}
	}

	Utils.extend(Graphic, Graphiclist);

	Graphiclist.prototype.update = function()
	{
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g.active) g.update();
		}
	};

	Graphiclist.prototype.render = function(target, point, camera)
	{
		point.x += this.x;
		point.y += this.y;
		camera.x *= this.scrollX;
		camera.y *= this.scrollY;
		var temp = {x: 0, y: 0};
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g.visible)
			{
				if(g.relative)
				{
					temp.x = point.x;
					temp.y = point.y;
				}
				else temp.x = temp.y = 0;
				this._camera.x = camera.x;
				this._camera.y = camera.y;
				g.render(target, temp, this._camera);
			}
		}
	};

	Graphiclist.prototype.add = function(graphic)
	{
		this._graphics[this._count ++] = graphic;
		if(!this.active) this.active = graphic.active;
		return graphic;
	};

	Graphiclist.prototype.remove = function(graphic)
	{
		if(this._graphics.indexOf(graphic) < 0) return graphic;
		this._temp.length = 0;
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g === graphic) this._count --;
			else this._temp[this._temp.length] = g;
		}
		var temp = this._graphics;
		this._graphics = this._temp;
		this._temp = temp;
		this.updateCheck();
		return graphic;
	};

	Graphiclist.prototype.removeAt = function(index)
	{
		index = index || 0;
		if(!this._graphics.length) return;
		index %= this._graphics.length;
		this.remove(this._graphics[index % this._graphics.length]);
		this.updateCheck();
	};

	Graphiclist.prototype.removeAll = function()
	{
		this._graphics.length = this._temp.length = this._count = 0;
		this.active = false;
	};

	Graphiclist.prototype.updateCheck = function()
	{
		this.active = false;
		for(var index in this._graphics)
		{
			var g = this._graphics[index];
			if(g.active)
			{
				this.active = true;
				return;
			}
		}
	};

	Object.defineProperties( Graphiclist.prototype,
	{
		"children": {
			get: function(){ return this._graphics; }
		},
		"count": {
			get: function() { return this._count; }
		}
	});

	return Graphiclist;
});

/*global define */
"use strict";
define('Graphics/Image',["Utils", "Graphic"], function(Utils, Graphic)
{
	// Source must be an image element or a canvas element
	// Either way it should have a nodeName, so we can tell what we've got
	// clipRect tells us which part of the source image we should actually use
	function Image(source, clipRect)
	{
		Graphic.call(this);

		if(source.nodeName === undefined || (source.nodeName.toLowerCase() !== "img" && source.nodeName.toLowerCase() !== "canvas"))
		{
			throw new TypeError("source must be a DOM element of type image or canvas");
		}

		clipRect        = clipRect        || {};
		clipRect.x      = clipRect.x      || 0;
		clipRect.y      = clipRect.y      || 0;
		clipRect.width  = clipRect.width  || source.width;
		clipRect.height = clipRect.height || source.height;

		var buffer = document.createElement("canvas");
		buffer.width = clipRect.width;
		buffer.height = clipRect.height;

		this._source = source;
		this._buffer = buffer;
		this._clipRect = clipRect;
		this._locked = false;
		this._needsUpdate = false;
		this._needsClear = false;

		this._alpha = 1;
		this._color = 0x00FFFFFF;
		this._tinting = 1;
		this._tintMode = Image.TINTING_MULTIPLY;
		this._flipped = false;
		this._drawMask = null;
		this._tint = null;

		this.angle = 0; // TODO: Not implemented
		// TODO: Blend modes in HTML5: https://github.com/pnitsch/BitmapData.js/blob/master/js/BitmapData.js
		// Note the lack of INVERT
		this.blend = null;
		this.originX = 0;
		this.originY = 0;
		this.scale = 1;
		this.scaleX = 1;
		this.scaleY = 1;
		this.smooth = false; // TODO: Not implemented

		// TODO: the xor property is just a test
		this.xor = false;

		this.updateColorTransform();
		this.updateBuffer();

	}

	Utils.extend(Graphic, Image);

	Image.TINTING_COLORIZE = 0;
	Image.TINTING_MULTIPLY = 1;

	Image.createCircle = function(radius, color, alpha)
	{
		if(color === undefined) color = 0xFFFFFF;
		if(alpha === undefined) alpha = 1;

		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		// Turn an integer color into an "rgba()" string
		color = Utils.getColorRGBA(color, alpha);
		canvas.width = canvas.height = radius * 2;
		context.fillStyle = color;
		context.beginPath();
		context.arc(radius, radius, radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();

		return new Image(canvas);
	};

	Image.createRect = function(width, height, color, alpha)
	{
		if(color === undefined) color = 0xFFFFFF;
		if(alpha === undefined) alpha = 1;

		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		// Turn an integer color into an "rgba()" string
		color = Utils.getColorRGBA(color, alpha);
		canvas.width = width;
		canvas.height = height;
		context.fillStyle = color;
		context.beginPath();
		context.rect(0, 0, width, height);
		context.closePath();
		context.fill();

		return new Image(canvas);
	};

	Image.prototype.centerOrigin = function()
	{
		this.originX = Math.round(this.width / 2);
		this.originY = Math.round(this.height / 2);
	};

	Image.prototype.clear = function()
	{
		this._buffer.getContext("2d").clearRect(0, 0, this._buffer.width, this._buffer.height);
	};

	Image.prototype.lock = function()
	{
		this._locked = true;
	};

	// TODO: Change it so that we only call updateBuffer when render gets called (if things have changed)
	// That way we don't do an update for a change of color, and then another when we flip, and then another when the alpha changes, etc.
	Image.prototype.render = function(target, point, camera)
	{
		// TODO: Check that we support all of the transformations in https://github.com/Draknek/FlashPunk/blob/master/net/flashpunk/graphics/Image.as
		var scaleX = this.scaleX * this.scale;
		var scaleY = this.scaleY * this.scale;

		var temp = {x: point.x, y: point.y};
		temp.x += this.x - camera.x * this.scrollX;
		temp.y += this.y - camera.y * this.scrollY;

		var context = target.getContext("2d");

		context.save();
		// TODO: xor is a test! Blend modes might be possible
		if(this.xor) context.globalCompositeOperation = "xor";

		context.translate(temp.x, temp.y);
		context.rotate(this.angle * Utils.RAD);
		context.translate(-this.originX * scaleX, -this.originY * scaleY);
		context.scale(scaleX, scaleY);
		context.globalAlpha = this.alpha;
		context.drawImage(this._buffer, 0, 0);
		context.restore();
	};

	Image.prototype.unlock = function()
	{
		this._locked = false;
	};

	Image.prototype.updateBuffer = function(clearFirst)
	{
		//TODO: Cache transformed buffers? Lookup on all state that can change what updateBuffer does
		if(this.locked)
		{
			this._needsUpdate = true;
			this._needsClear = this._needsClear || clearFirst || false;
		}
		else
		{
			var context = this._buffer.getContext("2d");
			//TODO: Why would I ever not clear if I'm drawing?
			//if(clearFirst)
				this.clear();
			context.save();
			if(this.flipped)
			{
				context.translate(this._buffer.width, 0);
				context.scale(-1, 1);
			}
			context.drawImage(this._source, this._clipRect.x, this._clipRect.y, this._clipRect.width, this._clipRect.height, 0, 0, this._buffer.width, this._buffer.height);
			if(this._tintMode === Image.TINTING_MULTIPLY && this._color !== 0xFFFFFF)
			{
				context.globalCompositeOperation = "source-atop";
				context.fillStyle = Utils.getColorRGBA(this._color, this._tinting);
				context.fillRect(0, 0, this._buffer.width, this._buffer.height);
			}
			context.restore();
			if(this._tint)
			{
				var struct = context.getImageData(0, 0, this._buffer.width, this._buffer.height);
				var data = struct.data;
				for(var i = 0; i < this._buffer.width * this._buffer.height * 4; i += 4)
				{
					data[i] = data[i] * this._tint.redMultiplier + this._tint.redOffset;
					data[i + 1] = data[i] * this._tint.greenMultiplier + this._tint.greenOffset;
					data[i + 2] = data[i] * this._tint.blueMultiplier + this._tint.blueOffset;
				}
				context.putImageData(struct, 0, 0);
			}
		}
	};

	Image.prototype.updateColorTransform = function()
	{
		// TODO: Tidy up. This is now only for TINTING_COLORIZE
		/*jshint bitwise: false */
		if(this._tinting === 0)
		{
			this._tint = null;
			return this.updateBuffer();
		}
		if(this._tintMode === Image.TINTING_MULTIPLY)
		{
			this._tint = null;
			return this.updateBuffer();
		}

		this._tint = {};

		this._tint.redMultiplier   = this._tintMode * (1.0 - this._tinting) + (1-this._tintMode) * (this._tinting * (Number(this._color >> 16 & 0xFF) / 255 - 1) + 1);
		this._tint.greenMultiplier = this._tintMode * (1.0 - this._tinting) + (1-this._tintMode) * (this._tinting * (Number(this._color >> 8 & 0xFF) / 255 - 1) + 1);
		this._tint.blueMultiplier  = this._tintMode * (1.0 - this._tinting) + (1-this._tintMode) * (this._tinting * (Number(this._color & 0xFF) / 255 - 1) + 1);
		this._tint.redOffset       = (this._color >> 16 & 0xFF) * this._tinting * this._tintMode;
		this._tint.greenOffset     = (this._color >> 8 & 0xFF) * this._tinting * this._tintMode;
		this._tint.blueOffset      = (this._color & 0xFF) * this._tinting * this._tintMode;
		this.updateBuffer();
		/*jshint bitwise: true */
	};

	Object.defineProperties( Image.prototype,
	{
		"clipRect": {
			get: function()
			{
				return this._clipRect;
			}
		},
		"width": {
			get: function()
			{
				return this._buffer.width;
			}
		},
		"height": {
			get: function()
			{
				return this._buffer.height;
			}
		},
		"scaledWidth": {
			get: function()
			{
				return this.width * this.scale * this.scaleX;
			}
		},
		"scaledHeight": {
			get: function()
			{
				return this.height * this.scale * this.scaleY;
			}
		},
		"locked": {
			get: function()
			{
				return this._locked;
			}
		},
		"alpha": {
			get: function(){ return this._alpha; },
			set: function(value)
			{
				value = value < 0 ? 0 : (value > 1 ? 1 : value);
				if(this._alpha === value) return;
				this._alpha = value;
				//this.updateBuffer();
			}
		},
		"color": {
			get: function(){ return this._color; },
			set: function(value)
			{
				/*jshint bitwise: false */
				value = value & 0xFFFFFF;
				/*jshint bitwise: true */
				if(this._color === value) return;
				this._color = value;
				this.updateColorTransform();
			}
		},
		"tinting": {
			get: function(){ return this._tinting; },
			set: function(value)
			{
				if(this._tinting === value) return;
				this._tinting = value;
				this.updateColorTransform();
			}
		},
		"tintMode": {
			get: function(){ return this._tintMode; },
			set: function(value)
			{
				if(this._tintMode === value) return;
				this._tintMode = value;
				this.updateColorTransform();
			}
		},
		"flipped": {
			get: function(){ return this._flipped; },
			set: function(value)
			{
				if(this._flipped === value) return;
				this._flipped = value;
				this.updateBuffer();
			}
		},
		"drawMask": {
			get: function(){ return this._drawMask; },
			set: function(value)
			{
				this._drawMask = value;
				this.updateBuffer(true);
			}
		}
	});

	return Image;
});

/*global define */
"use strict";
define('Graphics/Spritemap',["Utils", "Graphic", "Graphics/Image", "Atomic", "Graphics/Animation"], function(Utils, Graphic, Image, Atomic, Animation)
{
	function Spritemap(source, frameWidth, frameHeight, callback)
	{
		frameWidth = frameWidth || 0;
		frameHeight = frameHeight || 0;

		this.complete = true;
		this.callback = callback || null;
		this.rate = 1;

		this._rectangle = {x: 0, y: 0, width: frameWidth, height: frameHeight};
		if(!frameWidth) this._rectangle.width = source.width;
		if(!frameHeight) this._rectangle.height = source.height;
		this._width = source.width;
		this._height = source.height;
		this._columns = this._width / this._rectangle.width;
		this._rows = this._height / this._rectangle.height;
		this._frameCount = this._columns * this._rows;
		this._animations = {};
		this._animation = null;
		this._index = null;
		this._frame = null;
		this._timer = 0;

		Image.call(this, source, this._rectangle);
		this.callback = callback;
		this.updateBuffer();
		this.active = true;
	}
	Utils.extend(Image, Spritemap);

	Spritemap.prototype.updateBuffer = function(clearBefore)
	{
		clearBefore = clearBefore || false;
		// get position of the current frame
		this._rectangle.x = this._rectangle.width * this._frame;
		this._rectangle.y = Math.floor(this._rectangle.x / this._width) * this._rectangle.height;
		this._rectangle.x %= this._width;

		// update the buffer
		Image.prototype.updateBuffer.call(this, clearBefore);
	};

	Spritemap.prototype.update = function()
	{
		if (this._animation && !this.complete)
		{
			this._timer += this._animation.frameRate * Atomic.elapsed * this.rate;
			if (this._timer >= 1)
			{
				while (this._timer >= 1)
				{
					this._timer --;
					this._index ++;
					if (this._index === this._animation.frameCount)
					{
						if (this._animation.loop)
						{
							this._index = 0;
							if(this.callback) this.callback();
						}
						else
						{
							this._index = this._animation.frameCount - 1;
							this.complete = true;
							if(this.callback) this.callback();
							break;
						}
					}
				}
				var lastFrame = this._frame;
				if (this._animation)
				{
					this._frame = Math.round(this._animation.frames[this._index]);
					if(lastFrame !== this._frame)
					{
						this.updateBuffer();
					}
				}

			}
		}
	};

	Spritemap.prototype.add = function(name, frames, frameRate, loop)
	{
		frameRate = frameRate || 0;
		if(loop === undefined) loop = true;
		if (this._animations[name]) throw new Error("Cannot have multiple animations with the same name");
		(this._animations[name] = new Animation(name, frames, frameRate, loop)).parent = this;
		return this._animations[name];
	};

	Spritemap.prototype.play = function(name, reset, frame)
	{
		name = name || "";
		reset = !!reset;
		frame = frame || 0;
		if(!reset && this._animation && this._animation.name === name) return this._animation;
		this._animation = this._animations[name];
		if (!this._animation)
		{
			this._frame = this._index = 0;
			this.complete = true;
			this.updateBuffer();
			return null;
		}
		this._index = 0;
		this._timer = 0;
		this._frame = Math.round(this._animation.frames[frame % this._animation.frameCount]);
		this.complete = false;
		this.updateBuffer();
		return this._animation;
	};

	Spritemap.prototype.getFrame = function(column, row)
	{
		column = column || 0;
		row    = row    || 0;
		return (row % this._rows) * this._columns + (column % this._columns);
	};

	Spritemap.prototype.setFrame = function(column, row)
	{
		column = column || 0;
		row    = row    || 0;
		this._animation = null;
		var frame = (row % this._rows) * this._columns + (column % this._columns);
		if(this._frame === frame) return;
		this._frame = frame;
		this._timer = 0;
		this.updateBuffer();
	};

	Spritemap.prototype.randFrame = function()
	{
		this.frame = Utils.rand(this._frameCount);
	};

	Spritemap.prototype.setAnimationFrame = function(name, index)
	{
		var frames = this._animations[name].frames;
		index %= frames.length;
		if(index < 0) index += frames.length;
		this.frame = frames[index];
	};


	Object.defineProperties( Spritemap.prototype,
	{
		"frame": {
			get: function(){ return this._frame; },
			set: function(value)
			{
				this._animation = null;
				value %= this._frameCount;
				if(value < 0) value = this._frameCount + value;
				if(this._frame === value) return;
				this._frame = value;
				this._timer = 0;
				this.updateBuffer();
			}
		},
		"index": {
			get: function() { return this._animation ? this._index : 0; },
			set: function(value)
			{
				if(!this._animation) return;
				value %= this._animation.frameCount;
				if(this._index === value) return;
				this._index = value;
				this._frame = Math.round(this._animation.frames[this._index]);
				this._timer = 0;
				this.updateBuffer();
			}
		},
		"frameCount": {
			get: function() { return this._frameCount; }
		},
		"columns": {
			get: function() { return this._columns; }
		},
		"rows": {
			get: function() { return this._rows; }
		},
		"currentAnimation": {
			get: function(){ return this._animation ? this._animation.name : ""; }
		}
	});

	return Spritemap;
});

/*global define */
"use strict";
define('Graphics/TiledImage',["Utils", "Graphics/Image"], function(Utils, Image)
{
	function TiledImage(texture, width, height, clipRect)
	{
		// /** @private */ private var _graphics:Graphics = FP.sprite.graphics;
		// /** @private */ private var _texture:BitmapData;

		this._offsetX = 0;
		this._offsetY = 0;
		Image.call(this, texture, clipRect);
		this._buffer.width = width || 0;
		this._buffer.height = height || 0;
		this.updateBuffer();
	}

	Utils.extend(Image, TiledImage);

	TiledImage.prototype.updateBuffer = function()
	{
		if(!this._source) return;

		var context = this._buffer.getContext("2d");
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		// TODO: This is generally pretty slow.
		// TODO: Not working right
		// Refactor!

		// Workaround JS modulo bug for negative numbers
		var x = (((this._offsetX % this._source.width) + this._source.width) % this._source.width) - this._source.width;
		var y;
		var ystart = (((this._offsetY % this._source.height) + this._source.height) % this._source.height) - this._source.height;

		while(x < this._buffer.width)
		{
			y = ystart;
			while(y < this._buffer.height)
			{
				context.save();
				context.translate(x, y);
				context.drawImage(this._source, 0, 0, this._source.width, this._source.height, 0, 0, this._source.width, this._source.height);
				y += this._source.height;
				context.restore();
			}
			x += this._source.width;
		}
	};

	TiledImage.prototype.setOffset = function(x, y)
	{
		if(this._offsetX === x && this._offsetY === y) return;
		this._offsetX = x;
		this._offsetY = y;
		this.updateBuffer();
	};

	Object.defineProperties( TiledImage.prototype, {
		"offsetX": {
			get: function() { return this._offsetX; },
			set: function(value)
			{
				if(this._offsetX === value) return;
				this._offsetX = value;
				this.updateBuffer();
			}
		},
		"offsetY": {
			get: function() { return this._offsetY; },
			set: function(value)
			{
				if(this._offsetY === value) return;
				this._offsetY = value;
				this.updateBuffer();
			}
		}
	});

	return TiledImage;
});

/*global define */
"use strict";
define('Graphics/Tilemap',["Utils", "Graphic", "Space"], function(Utils, Graphic, Space)
{
	// The original of this in FP extended the FP Canvas class... I think I can do something simpler here with HTML5 canvas
	// Also, for simplicity, we always use grid rows and columns
	function Tilemap(tileset, width, height, tileWidth, tileHeight)
	{
		Graphic.call(this);
		this.tileset = tileset;
		this.width = width;
		this.height = height;
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;
		this.rows = Math.ceil(height/tileHeight);
		this.columns = Math.ceil(width/tileWidth);
		this.setColumns = Math.ceil(tileset.width / tileWidth);
		this.setRows = Math.ceil(tileset.height / tileHeight);
		this.setCount = this.setColumns * this.setRows;

		this.map = new Space(this.columns, this.rows);
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
	}

	Utils.extend(Graphic, Tilemap);

	Tilemap.prototype.loadFromString = function(str, columnSep, rowSep)
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

	Tilemap.prototype.render = function(target, point, camera)
	{
		var temp = {x: 0, y: 0};
		// determine drawing location
		temp.x = point.x + this.x - camera.x * this.scrollX;
		temp.y = point.y + this.y - camera.y * this.scrollY;

		// Seems a bit too simple. Shouldn't we be only drawing what can be seen?
		target.getContext("2d").drawImage(this.canvas, 0, 0, this.width, this.height, temp.x, temp.y, this.width, this.height);
	};

	Tilemap.prototype.setTile = function(column, row, index)
	{
		if(index === undefined) index = 0;

		index %= this.setCount;
		column %= this.columns;
		row %= this.rows;

		var setX = (index % this.setColumns) * this.tileWidth;
		var setY = Math.floor(index / this.setColumns) * this.tileHeight;

		var mapX = column * this.tileWidth;
		var mapY = row * this.tileHeight;

		this.map.set(column, row, index);
		if(index >= 0)
		{
			this.canvas.getContext("2d").drawImage(this.tileset, setX, setY, this.tileWidth, this.tileHeight, mapX, mapY, this.tileWidth, this.tileHeight);
		}
		else
		{
			this.canvas.getContext("2d").clearRect(mapX, mapY, this.tileWidth, this.tileHeight);
		}
	};

	Object.defineProperties( Tilemap.prototype,
	{
	});

	//			/**
	//			 * Clears the tile at the position.
	//			 * @param	column		Tile column.
	//			 * @param	row			Tile row.
	//			 */
	//			public function clearTile(column:uint, row:uint):void
	//			{
	//				if (usePositions)
	//				{
	//					column /= _tile.width;
	//					row /= _tile.height;
	//				}
	//				column %= _columns;
	//				row %= _rows;
	//				_tile.x = column * _tile.width;
	//				_tile.y = row * _tile.height;
	//				fill(_tile, 0, 0);
	//			}

	//			/**
	//			 * Gets the tile index at the position.
	//			 * @param	column		Tile column.
	//			 * @param	row			Tile row.
	//			 * @return	The tile index.
	//			 */
	//			public function getTile(column:uint, row:uint):uint
	//			{
	//				if (usePositions)
	//				{
	//					column /= _tile.width;
	//					row /= _tile.height;
	//				}
	//				return _map.getPixel(column % _columns, row % _rows);
	//			}

	//			/**
	//			 * Sets a rectangular region of tiles to the index.
	//			 * @param	column		First tile column.
	//			 * @param	row			First tile row.
	//			 * @param	width		Width in tiles.
	//			 * @param	height		Height in tiles.
	//			 * @param	index		Tile index.
	//			 */
	//			public function setRect(column:uint, row:uint, width:uint = 1, height:uint = 1, index:uint = 0):void
	//			{
	//				if (usePositions)
	//				{
	//					column /= _tile.width;
	//					row /= _tile.height;
	//					width /= _tile.width;
	//					height /= _tile.height;
	//				}
	//				column %= _columns;
	//				row %= _rows;
	//				var c:uint = column,
	//					r:uint = column + width,
	//					b:uint = row + height,
	//					u:Boolean = usePositions;
	//				usePositions = false;
	//				while (row < b)
	//				{
	//					while (column < r)
	//					{
	//						setTile(column, row, index);
	//						column ++;
	//					}
	//					column = c;
	//					row ++;
	//				}
	//				usePositions = u;
	//			}

	//			/**
	//			 * Makes a flood fill on the tilemap
	//			 * @param	column		Column to place the flood fill
	//			 * @param	row			Row to place the flood fill
	//			 * @param	index		Tile index.
	//			 */
	//			public function floodFill(column:uint, row:uint, index:uint = 0):void
	//			{
	//				if(usePositions)
	//				{
	//					column /= _tile.width;
	//					row /= _tile.height;
	//				}

	//				column %= _columns;
	//				row %= _rows;

	//				_map.floodFill(column, row, index);

	//				updateAll();
	//			}

	//			/**
	//			 * Draws a line of tiles
	//			 *
	//			 * @param	x1		The x coordinate to start
	//			 * @param	y1		The y coordinate to start
	//			 * @param	x2		The x coordinate to end
	//			 * @param	y2		The y coordinate to end
	//			 * @param	id		The tiles id to draw
	//			 *
	//			 */
	//			public function line(x1:int, y1:int, x2:int, y2:int, id:int):void
	//			{
	//				if(usePositions)
	//				{
	//					x1 /= _tile.width;
	//					y1 /= _tile.height;
	//					x2 /= _tile.width;
	//					y2 /= _tile.height;
	//				}

	//				x1 %= _columns;
	//				y1 %= _rows;
	//				x2 %= _columns;
	//				y2 %= _rows;

	//				Draw.setTarget(_map);
	//				Draw.line(x1, y1, x2, y2, id, 0);
	//				updateAll();
	//			}

	//			/**
	//			 * Draws an outline of a rectangle of tiles
	//			 *
	//			 * @param	x		The x coordinate of the rectangle
	//			 * @param	y		The y coordinate of the rectangle
	//			 * @param	width	The width of the rectangle
	//			 * @param	height	The height of the rectangle
	//			 * @param	id		The tiles id to draw
	//			 *
	//			 */
	//			public function setRectOutline(x:int, y:int, width:int, height:int, id:int):void
	//			{
	//				if(usePositions)
	//				{
	//					x /= _tile.width;
	//					y /= _tile.height;

	//					// TODO: might want to use difference between converted start/end coordinates instead?
	//					width /= _tile.width;
	//					height /= _tile.height;
	//				}

	//				x %= _columns;
	//				y %= _rows;

	//				Draw.setTarget(_map);
	//				Draw.line(x, y, x + width, y, id, 0);
	//				Draw.line(x, y + height, x + width, y + height, id, 0);
	//				Draw.line(x, y, x, y + height, id, 0);
	//				Draw.line(x + width, y, x + width, y + height, id, 0);
	//				updateAll();
	//			}

	//			/**
	//			 * Updates the graphical cache for the whole tilemap.
	//			 */
	//			public function updateAll():void
	//			{
	//				_rect.x = 0;
	//				_rect.y = 0;
	//				_rect.width = _columns;
	//				_rect.height = _rows;
	//				updateRect(_rect, false);
	//			}

	//			/**
	//			 * Clears the rectangular region of tiles.
	//			 * @param	column		First tile column.
	//			 * @param	row			First tile row.
	//			 * @param	width		Width in tiles.
	//			 * @param	height		Height in tiles.
	//			 */
	//			public function clearRect(column:uint, row:uint, width:uint = 1, height:uint = 1):void
	//			{
	//				if (usePositions)
	//				{
	//					column /= _tile.width;
	//					row /= _tile.height;
	//					width /= _tile.width;
	//					height /= _tile.height;
	//				}
	//				column %= _columns;
	//				row %= _rows;
	//				var c:uint = column,
	//					r:uint = column + width,
	//					b:uint = row + height,
	//					u:Boolean = usePositions;
	//				usePositions = false;
	//				while (row < b)
	//				{
	//					while (column < r)
	//					{
	//						clearTile(column, row);
	//						column ++;
	//					}
	//					column = c;
	//					row ++;
	//				}
	//				usePositions = u;
	//			}


	//			/**
	//			* Saves the Tilemap tile index data to a string.
	//			* @param columnSep		The string that separates each tile value on a row, default is ",".
	//			* @param rowSep			The string that separates each row of tiles, default is "\n".
	//			*/
	//			public function saveToString(columnSep:String = ",", rowSep:String = "\n"): String
	//			{
	//				var s:String = '',
	//					x:int, y:int;
	//				for (y = 0; y < _rows; y ++)
	//				{
	//					for (x = 0; x < _columns; x ++)
	//					{
	//						s += String(_map.getPixel(x, y));
	//						if (x != _columns - 1) s += columnSep;
	//					}
	//					if (y != _rows - 1) s += rowSep;
	//				}
	//				return s;
	//			}

	//			/**
	//			 * Gets the 1D index of a tile from a 2D index (its column and row in the tileset image).
	//			 * @param	tilesColumn		Tileset column.
	//			 * @param	tilesRow		Tileset row.
	//			 * @return	Index of the tile.
	//			 */
	//			public function getIndex(tilesColumn:uint, tilesRow:uint):uint
	//			{
	//				if (usePositions) {
	//					tilesColumn /= _tile.width;
	//					tilesRow /= _tile.height;
	//				}

	//				return (tilesRow % _setRows) * _setColumns + (tilesColumn % _setColumns);
	//			}

	//			/**
	//			 * Shifts all the tiles in the tilemap.
	//			 * @param	columns		Horizontal shift.
	//			 * @param	rows		Vertical shift.
	//			 * @param	wrap		If tiles shifted off the canvas should wrap around to the other side.
	//			 */
	//			public function shiftTiles(columns:int, rows:int, wrap:Boolean = false):void
	//			{
	//				if (usePositions)
	//				{
	//					columns /= _tile.width;
	//					rows /= _tile.height;
	//				}

	//				if (!wrap) _temp.fillRect(_temp.rect, 0);

	//				if (columns != 0)
	//				{
	//					shift(columns * _tile.width, 0);
	//					if (wrap) _temp.copyPixels(_map, _map.rect, FP.zero);
	//					_map.scroll(columns, 0);
	//					_point.y = 0;
	//					_point.x = columns > 0 ? columns - _columns : columns + _columns;
	//					_map.copyPixels(_temp, _temp.rect, _point);

	//					_rect.x = columns > 0 ? 0 : _columns + columns;
	//					_rect.y = 0;
	//					_rect.width = Math.abs(columns);
	//					_rect.height = _rows;
	//					updateRect(_rect, !wrap);
	//				}

	//				if (rows != 0)
	//				{
	//					shift(0, rows * _tile.height);
	//					if (wrap) _temp.copyPixels(_map, _map.rect, FP.zero);
	//					_map.scroll(0, rows);
	//					_point.x = 0;
	//					_point.y = rows > 0 ? rows - _rows : rows + _rows;
	//					_map.copyPixels(_temp, _temp.rect, _point);

	//					_rect.x = 0;
	//					_rect.y = rows > 0 ? 0 : _rows + rows;
	//					_rect.width = _columns;
	//					_rect.height = Math.abs(rows);
	//					updateRect(_rect, !wrap);
	//				}
	//			}

	//			/**
	//			 * Get a subregion of the tilemap and return it as a new Tilemap.
	//			 */
	//			public function getSubMap (x:int, y:int, w:int, h:int):Tilemap
	//			{
	//				if (usePositions) {
	//					x /= _tile.width;
	//					y /= _tile.height;
	//					w /= _tile.width;
	//					h /= _tile.height;
	//				}

	//				var newMap:Tilemap = new Tilemap(_set, w*_tile.width, h*_tile.height, _tile.width, _tile.height);

	//				_rect.x = x;
	//				_rect.y = y;
	//				_rect.width = w;
	//				_rect.height = h;

	//				newMap._map.copyPixels(_map, _rect, FP.zero);
	//				newMap.drawGraphic(-x * _tile.width, -y * _tile.height, this);

	//				return newMap;
	//			}

	//			/** Updates the graphical cache of a region of the tilemap. */
	//			public function updateRect(rect:Rectangle, clear:Boolean):void
	//			{
	//				var x:int = rect.x,
	//					y:int = rect.y,
	//					w:int = x + rect.width,
	//					h:int = y + rect.height,
	//					u:Boolean = usePositions;
	//				usePositions = false;
	//				if (clear)
	//				{
	//					while (y < h)
	//					{
	//						while (x < w) clearTile(x ++, y);
	//						x = rect.x;
	//						y ++;
	//					}
	//				}
	//				else
	//				{
	//					while (y < h)
	//					{
	//						while (x < w) updateTile(x ++, y);
	//						x = rect.x;
	//						y ++;
	//					}
	//				}
	//				usePositions = u;
	//			}

	//			/** @private Used by shiftTiles to update a tile from the tilemap. */
	//			private function updateTile(column:uint, row:uint):void
	//			{
	//				setTile(column, row, _map.getPixel(column % _columns, row % _rows));
	//			}

	//			/**
	//			* Create a Grid object from this tilemap.
	//			* @param	solidTiles		Array of tile indexes that should be solid.
	//			* @return Grid
	//			*/
	//			public function createGrid(solidTiles:Array, cls:Class=null):Grid
	//			{
	//				if (cls === null) cls = Grid;
	//				var grid:Grid = new cls(width, height, _tile.width, _tile.height, 0) as Grid;
	//				for (var row:uint = 0; row < _rows; ++row)
	//				{
	//					for (var col:uint = 0; col < _columns; ++col)
	//					{
	//						if (solidTiles.indexOf(_map.getPixel(col, row)) !== -1)
	//						{
	//							grid.setTile(col, row, true);
	//						}
	//					}
	//				}
	//				return grid;
	//			}


	//			// Tilemap information.
	//			/** @private */ private var _temp:BitmapData;

	//			// Global objects.
	//			/** @private */ private var _rect:Rectangle = FP.rect;
	//		}
	// }

	return Tilemap;
});

/*global define */
"use strict";
define('Masks/Hitbox',["Utils", "Mask"], function(Utils, Mask)
{
	function Hitbox(width, height, x, y)
	{
		Mask.call(this);

		this._width = width === undefined ? 1 : width;
		this._height = height === undefined ? 1 : height;
		this._x = x || 0;
		this._y = y || 0;

		this.check.Mask = collideMask;
		this.check.Hitbox = collideHitbox;
	}

	Utils.extend(Mask, Hitbox);

	Hitbox.prototype.MaskType = "Hitbox";

	Hitbox.prototype.update = function()
	{
		if(this.list)
		{
			// update parent list
			this.list.update();
		}
		else if(this.parent)
		{
			// update entity bounds
			this.parent.originX = -this._x;
			this.parent.originY = -this._y;
			this.parent.width = this._width;
			this.parent.height = this._height;
		}
	};

	var collideMask = function(other)
	{
		return this.parent.x + this.x + this.width > other.parent.x - other.parent.originX &&
			this.parent.y + this.y + this.height > other.parent.y - other.parent.originY &&
			this.parent.x + this.x < other.parent.x - other.parent.originX + other.parent.width &&
			this.parent.y + this.y < other.parent.y - other.parent.originY + other.parent.height;
	};

	var collideHitbox = function(other)
	{
		return this.parent.x + this.x + this.width > other.parent.x + other.x &&
			this.parent.y + this.y + this.height > other.parent.y + other.y &&
			this.parent.x + this.x < other.parent.x + other.x + other.width &&
			this.parent.y + this.y < other.parent.y + other.y + other.height;
	};

	Object.defineProperties(Hitbox.prototype, {
		"x": {
			get: function(){ return this._x; },
			set: function(value)
			{
				if(this._x === value) return;
				this._x = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		},
		"y": {
			get: function(){ return this._y; },
			set: function(value)
			{
				if(this._y === value) return;
				this._y = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		},
		"width": {
			get: function(){ return this._width; },
			set: function(value)
			{
				if(this._width === value) return;
				this._width = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		},
		"height": {
			get: function(){ return this._height; },
			set: function(value)
			{
				if(this._height === value) return;
				this._height = value;
				if(this.list) this.list.update();
				else if(this.parent) this.update();
			},
			enumerable: true
		}
	});

	return Hitbox;
});

/*global define */
"use strict";
define('Masks/Grid',["Utils", "Masks/Hitbox", "Space"], function(Utils, Hitbox, Space)
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

/*global define */
"use strict";
define('main',['require','AssetManager','Audio','Entity','Graphic','Input','Key','Mask','Sound','Space','Tween','Utils','World','Graphics/Animation','Graphics/Graphiclist','Graphics/Image','Graphics/Spritemap','Graphics/TiledImage','Graphics/Tilemap','Masks/Grid','Masks/Hitbox','Atomic'],function(require)
{
	var AssetManager = require("AssetManager");
	var Audio        = require("Audio");
	var Entity       = require("Entity");
	var Graphic      = require("Graphic");
	var Input        = require("Input");
	var Key          = require("Key");
	var Mask         = require("Mask");
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
	atomic.Sound        = Sound;
	atomic.Space        = Space;
	atomic.Tween        = Tween;
	atomic.Utils        = Utils;
	atomic.World        = World;


	return atomic;
});

	//Register in the values from the outer closure for common dependencies
	//as local almond modules
	define('jquery', function () {
		return $;
	});

	//Use almond's special top-level, synchronous require to trigger factory
	//functions, get the final module value, and export it as the public
	//value.
	return require('main');
}));
