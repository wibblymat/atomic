"use strict";
var Atomic = window.Atomic || {};
Atomic.Input = (function()
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

		// TODO: Work out the wierdness with relatively positioned elements
		posx -= stage.get(0).parentElement.offsetLeft;
		posy -= stage.get(0).parentElement.offsetTop;

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
		inputState["ANY"].pressed = true;
		inputState["ANY"].held = true;

		if(name !== null)
		{
			inputState[name] = inputState[name] || {released: false};
			inputState[name].pressed = true;
			inputState[name].held = true;
		}
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
	});

	// To be called once a frame so we know when to clear per-frame states
	$(Atomic).bind("endFrame", function()
	{
		var input, state;
		this.mousePressed = false;
		this.mouseReleased = false;
		this.mouseWheel = false;
		this.mouseWheelDelta = 0;

		for(input in inputState)
		{
			state = inputState[input];
			state.pressed = false;
			state.released = false;
		}
	});


	return input;
}());
