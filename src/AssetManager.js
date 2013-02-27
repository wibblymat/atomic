/*global define */
"use strict";
define(["Audio"], function(Audio)
{
	// TODO: We want this to work for images, sounds, JSON files (maps, etc.)
	// and maybe others
	// TODO: Look in our filesystem store before going to the network
	// TODO: Progress monitor
	// TODO: At the moment, calling start() twice will download things twice
	// TODO: This is all ripe for Promises
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

	var loaders = {
		image: function(item, callback)
		{
			var img = new Image();
			img.addEventListener("load", onload.bind(null, callback), false);
			img.addEventListener("error", onerror.bind(null, callback), false);
			img.src = item.path;
			assetManager.assets[item.id] = img;
		},
		sound: function(item, callback)
		{
			var request = new XMLHttpRequest();
			request.open("GET", item.path, true);
			request.responseType = "arraybuffer";
			request.onload = function()
			{
				Audio.createSound(this.response, function(sound)
				{
					assetManager.assets[item.id] = sound;
					onload(callback);
				});
			};
			request.onerror = onerror.bind(null, callback);
			request.send();
		},
		xml: function(item, callback)
		{
			var request = new XMLHttpRequest();
			request.open("GET", item.path, true);
			request.overrideMimeType("text/xml");
			request.onload = function()
			{
				assetManager.assets[item.id] = this.responseXML;
				onload(callback);
			};
			request.onerror = onerror.bind(null, callback);
			request.send();
		}
	};

	var assetManager = {
		assets: {},
		// items is an array of objects. The objects have the form:
		// {id: "", path: "", type: ""}
		queue: function(items)
		{
			queue = queue.concat(items);
		},
		start : function(callback)
		{
			if(queue.length === 0)
			{
				callback();
			}

			queue.forEach(function(item)
			{
				loaders[item.type](item, callback);
			});
		}
	};

	return assetManager;
});
