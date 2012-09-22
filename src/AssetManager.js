/*global define */
"use strict";
define(["Audio"], function(Audio)
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
