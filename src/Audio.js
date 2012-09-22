/*global define */
"use strict";
define(function()
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
