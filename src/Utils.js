"use strict";
var Atomic = window.Atomic || {};
Atomic.Utils = {
	extend: function(base, subclass)
	{
		function F(){}
		F.prototype = base.prototype;
		subclass.prototype = new F();
		subclass.base = base;
		subclass.prototype.constructor = subclass;
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
				delete array[i];
				if(!all)
				{
					return;
				}
			}
		}
	}
};
