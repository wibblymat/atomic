"use strict";
var Atomic = window.Atomic || {};
Atomic.Audio = (function()
{
	// TODO: Make this work cross-browser, perhaps with a fallback
	var audio = {
		context: new window.webkitAudioContext(),
		createSound: function(data, callback)
		{
			audio.context.decodeAudioData(data, function(buffer)
			{
				var sound = new Atomic.Sound(buffer);
				callback(sound);
			}, function(error){console.log("Error decoding sound:", error);});
		}
	};
	return audio;
}());
