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
			if(childCount > 0)
			{
				result.keyValue = text;
			}
			else
			{
				result = text;
			}
		}
		/* if (childCount > 0) { Object.freeze(result); } */
		return result;
	}
};
