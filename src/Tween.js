/*global define */
"use strict";
define(["Atomic"], function(Atomic)
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
