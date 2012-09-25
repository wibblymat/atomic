//Copyright 2012, etc.

/**
 * almond 0.1.4 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

"use strict";(function(e,t){typeof define=="function"&&define.amd?define(["jquery"],t):e.Atomic=t(e.$)})(this,function(e){var t,n,r;return function(e){function c(e,t){var n,r,i,s,o,u,f,l,c,h,p=t&&t.split("/"),d=a.map,v=d&&d["*"]||{};if(e&&e.charAt(0)==="."&&t){p=p.slice(0,p.length-1),e=p.concat(e.split("/"));for(l=0;l<e.length;l+=1){h=e[l];if(h===".")e.splice(l,1),l-=1;else if(h===".."){if(l===1&&(e[2]===".."||e[0]===".."))break;l>0&&(e.splice(l-1,2),l-=2)}}e=e.join("/")}if((p||v)&&d){n=e.split("/");for(l=n.length;l>0;l-=1){r=n.slice(0,l).join("/");if(p)for(c=p.length;c>0;c-=1){i=d[p.slice(0,c).join("/")];if(i){i=i[r];if(i){s=i,o=l;break}}}if(s)break;!u&&v&&v[r]&&(u=v[r],f=l)}!s&&u&&(s=u,o=f),s&&(n.splice(0,o,s),e=n.join("/"))}return e}function h(t,n){return function(){return s.apply(e,l.call(arguments,0).concat([t,n]))}}function p(e){return function(t){return c(t,e)}}function d(e){return function(t){o[e]=t}}function v(t){if(u.hasOwnProperty(t)){var n=u[t];delete u[t],f[t]=!0,i.apply(e,n)}if(!o.hasOwnProperty(t))throw new Error("No "+t);return o[t]}function m(e,t){var n,r,i=e.indexOf("!");return i!==-1?(n=c(e.slice(0,i),t),e=e.slice(i+1),r=v(n),r&&r.normalize?e=r.normalize(e,p(t)):e=c(e,t)):e=c(e,t),{f:n?n+"!"+e:e,n:e,p:r}}function g(e){return function(){return a&&a.config&&a.config[e]||{}}}var i,s,o={},u={},a={},f={},l=[].slice;i=function(t,n,r,i){var s,a,l,c,p,y=[],b;i=i||t;if(typeof r=="function"){n=!n.length&&r.length?["require","exports","module"]:n;for(p=0;p<n.length;p+=1){c=m(n[p],i),a=c.f;if(a==="require")y[p]=h(t);else if(a==="exports")y[p]=o[t]={},b=!0;else if(a==="module")s=y[p]={id:t,uri:"",exports:o[t],config:g(t)};else if(o.hasOwnProperty(a)||u.hasOwnProperty(a))y[p]=v(a);else if(c.p)c.p.load(c.n,h(i,!0),d(a),{}),y[p]=o[a];else if(!f[a])throw new Error(t+" missing "+a)}l=r.apply(o[t],y);if(t)if(s&&s.exports!==e&&s.exports!==o[t])o[t]=s.exports;else if(l!==e||!b)o[t]=l}else t&&(o[t]=r)},t=n=s=function(t,n,r,o,u){return typeof t=="string"?v(m(t,n).f):(t.splice||(a=t,n.splice?(t=n,n=r,r=null):t=e),n=n||function(){},typeof r=="function"&&(r=o,o=u),o?i(e,t,n,r):setTimeout(function(){i(e,t,n,r)},15),s)},s.config=function(e){return a=e,s},r=function(e,t,n){t.splice||(n=t,t=[]),u[e]=[e,t,n]},r.amd={jQuery:!0}}(),r("../build/almond",function(){}),"use strict",r("Sound",["Audio"],function(e){function t(t){this.source=e.context.createBufferSource(),this.source.buffer=t,this.source.connect(e.context.destination)}return t.prototype.play=function(){this.source.noteOn(0)},t}),"use strict",r("Audio",["Sound"],function(){var e,t={context:new window.webkitAudioContext,createSound:function(r,i){e||(e=n("Sound")),t.context.decodeAudioData(r,function(t){var n=new e(t);i(n)},function(e){console.log("Error decoding sound:",e)})}};return t}),"use strict",r("AssetManager",["Audio"],function(e){var t=0,n=0,r=[],i=function(){return r.length===t+n},s=function(e){t+=1,i()&&e()},o=function(e){n+=1,i()&&e()},u=function(e,t){var n=new Image;n.addEventListener("load",function(){s(t)},!1),n.addEventListener("error",function(){o(t)},!1),n.src=e.path,l.assets[e.id]=n},a=function(t,n){var r=new XMLHttpRequest;r.open("GET",t.path,!0),r.responseType="arraybuffer",r.onload=function(){e.createSound(this.response,function(e){l.assets[t.id]=e,s(n)})},r.onerror=function(){o(n)},r.send()},f=function(e,t){var n=new XMLHttpRequest;n.open("GET",e.path,!0),n.overrideMimeType("text/xml"),n.onload=function(){l.assets[e.id]=this.responseXML,s(t)},n.onerror=function(){o(t)},n.send()},l={assets:{},queue:function(e){r=r.concat(e)},start:function(e){var t;r.length===0&&e();for(var n=0;n<r.length;n++){var i=r[n];i.type==="image"?u(i,e):i.type==="sound"?a(i,e):i.type==="xml"&&f(i,e)}}};return l}),"use strict",r("Atomic",["require"],function(t){window.URL=window.URL||window.webkitURL,window.performance=window.performance||window.msperformance,window.performance.now=window.performance.now||window.performance.webkitNow;var n=0,r=null,i=null,s={VERSION:"0.1",debug:!1,stage:null,scale:1,smooth:!0,camera:{x:0,y:0},elapsed:0,backgroundColor:"#000000",init:function(t){s.width=t.width||s.width,s.height=t.height||s.height,s.scale=t.scale||s.scale,s.smooth=t.smooth||s.smooth;var r=t.container||document.body;r.appendChild(s.stage),s.stage.style.backgroundColor=s.backgroundColor,s.stage.width=s.width*s.scale,s.stage.height=s.height*s.scale,s.stage.style.outline=0,s.stage.style.position="absolute",s.stage.style.outline=0,s.stage.focus();var i=function(){s.stage.style.left=r.offsetWidth/2-s.halfWidth*s.scale+"px"};e(window).resize(i),i(),s.stage.getContext("2d").scale(s.scale,s.scale),s.stage.getContext("2d").webkitImageSmoothingEnabled=s.smooth,n=window.performance.now(),c()}},o=640,u=480,a=Math.round(o/2),f=Math.round(u/2);Object.defineProperties(s,{width:{get:function(){return o},set:function(e){o=e,a=Math.round(o/2)}},height:{get:function(){return u},set:function(e){u=e,f=Math.round(u/2)}},halfWidth:{get:function(){return a}},halfHeight:{get:function(){return f}},world:{get:function(){return r},set:function(e){if(r===e)return;i=e}}}),s.stage=document.createElement("canvas"),s.stage.tabIndex=1;var l,c=function(){l=window.requestAnimationFrame(c);var t=window.performance.now();s.elapsed=(t-n)/1e3,n=t,i&&(r&&r.end(),r=i,i=null,s.camera=r.camera,r.begin()),e(s).trigger("startFrame"),s.world&&(s.world.update(),s.world.draw()),e(s).trigger("endFrame"),t=window.performance.now(),s.duration=(t-n)/1e3};return s}),function(){var e=0,t=["ms","moz","webkit","o"];for(var n=0;n<t.length&&!window.requestAnimationFrame;++n)window.requestAnimationFrame=window[t[n]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[t[n]+"CancelAnimationFrame"]||window[t[n]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(t,n){var r=(new Date).getTime(),i=Math.max(0,16-(r-e)),s=window.setTimeout(function(){t(r+i)},i);return e=r+i,s}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(e){clearTimeout(e)})}(),"use strict",r("Mask",[],function(){function e(e,r,i,s){this.parent=null,this.list=null,this.check=this.check||{},this.check.Mask=t,this.check.MaskList=n}e.prototype.MaskType="Mask",e.prototype.collide=function(e){return this.check[e.MaskType]!==null?this.check[e.MaskType].call(this,e):e.check[this.MaskType]!==null?e.check[this.MaskType].call(e,this):!1},e.prototype.assignTo=function(e){this.parent=e,!this.list&&e&&this.update()},e.prototype.update=function(){},e.prototype.renderDebug=function(e){};var t=function(e){return this.parent.x-this.parent.originX+this.parent.width>e.parent.x-e.parent.originX&&this.parent.y-this.parent.originY+this.parent.height>e.parent.y-e.parent.originY&&this.parent.x-this.parent.originX<e.parent.x-e.parent.originX+e.parent.width&&this.parent.y-this.parent.originY<e.parent.y-e.parent.originY+e.parent.height},n=function(e){return e.collide(this)};return e}),"use strict",r("Entity",["Atomic","Mask"],function(e,t){function n(e,n,r,i){this.active=!0,this.collidable=!0,this.height=0,this.layer=null,this.name=null,this.originX=0,this.originY=0,this.renderTarget=null,this.type=null,this.visible=!0,this.width=0,this.x=e||0,this.y=n||0,this._mask=null,this.graphic=r||null,this.mask=i||null,this._world=null,this._partMove={x:0,y:0},this.HITBOX=new t,this.HITBOX.assignTo(this)}return n.prototype.added=function(){},n.prototype.centerOrigin=function(){this.originX=this.width/2,this.originY=this.height/2},n.prototype.collide=function(e,t,n){if(!this.world||this.world.entities.length===0)return null;var r,i,s=this.x,o=this.y;this.x=t,this.y=n;var u=this.world.getEntitiesByType(e);if(!this.mask){for(i in u){r=u[i];if(r.collidable&&r!==this&&t-this.originX+this.width>r.x-r.originX&&n-this.originY+this.height>r.y-r.originY&&t-this.originX<r.x-r.originX+r.width&&n-this.originY<r.y-r.originY+r.height)if(!r.mask||r.mask.collide(this.HITBOX))return this.x=s,this.y=o,r}return this.x=s,this.y=o,null}for(i in u){r=u[i];if(r.collidable&&r!==this&&this.x-this.originX+this.width>r.x-r.originX&&this.y-this.originY+this.height>r.y-r.originY&&this.x-this.originX<r.x-r.originX+r.width&&this.y-this.originY<r.y-r.originY+r.height&&this.mask.collide(r.mask?r.mask:r.HITBOX))return this.x=s,this.y=o,r}return this.x=s,this.y=o,null},n.prototype.collidePoint=function(e,n,r,i){if(r>=e-this.originX&&i>=n-this.originY&&r<e-this.originX+this.width&&i<n-this.originY+this.height){if(!this.mask)return!0;var s=this.x,o=this.y;this.x=e,this.y=n;var u=new t;return u.assignTo({x:r,y:i,width:1,height:1,originX:0,originY:0}),this.mask.collide(u)?(this.x=s,this.y=o,!0):(this.x=s,this.y=o,!1)}return!1},n.prototype.collideRect=function(e,n,r,i,s,o){if(e-this.originX+this.width>=r&&n-this.originY+this.height>=i&&e-this.originX<=r+s&&n-this.originY<=i+o){if(!this._mask)return!0;var u=this.x,a=this.y;return this.x=e,this.y=n,this._mask.collide(new t(r,i,s,o))?(this.x=u,this.y=a,!0):(this.x=u,this.y=a,!1)}return!1},n.prototype.collideTypes=function(e,t,n){if(!this.world)return null;var r;if(typeof e=="string")return this.collide(e,t,n);if(e.length!==undefined)for(var i in e)if(r=this.collide(i,t,n))return r;return null},n.prototype.collideWith=function(e,t,n){var r=this.x,i=this.y;this.x=t,this.y=n;if(e.collidable&&t-this.originX+this.width>e.x-e.originX&&n-this.originY+this.height>e.y-e.originY&&t-this.originX<e.x-e.originX+e.width&&n-this.originY<e.y-e.originY+e.height){if(!this.mask)return!e.mask||e.mask.collide(this.HITBOX)?(this.x=r,this.y=i,e):(this.x=r,this.y=i,null);if(this.mask.collide(e.mask?e.mask:e.HITBOX))return this.x=r,this.y=i,e}return this.x=r,this.y=i,null},n.prototype.distanceFrom=function(t,n){return n?e.Utils.distanceRects(this.x-this.originX,this.y-this.originY,this.width,this.height,t.x-t.originX,t.y-t.originY,t.width,t.height):Math.sqrt((this.x-t.x)*(this.x-t.x)+(this.y-t.y)*(this.y-t.y))},n.prototype.moveBy=function(e,t,n,r){this._partMove.x+=e,this._partMove.y+=t,e=Math.round(this._partMove.x),t=Math.round(this._partMove.y),this._partMove.x-=e,this._partMove.y-=t;if(n){var i,s;if(e!==0)if(r||this.collideTypes(n,this.x+e,this.y)){i=e>0?1:-1;while(e!==0){if(s=this.collideTypes(n,this.x+i,this.y)){if(this.moveCollideX(s))break;this.x+=i}else this.x+=i;e-=i}}else this.x+=e;if(t!==0)if(r||this.collideTypes(n,this.x,this.y+t)){i=t>0?1:-1;while(t!==0){if(s=this.collideTypes(n,this.x,this.y+i)){if(this.moveCollideY(s))break;this.y+=i}else this.y+=i;t-=i}}else this.y+=t}else this.x+=e,this.y+=t},n.prototype.moveCollideX=function(e){return!0},n.prototype.moveCollideY=function(e){return!0},n.prototype.removed=function(){},n.prototype.render=function(){var t={x:0,y:0};if(this.graphic&&this.graphic.visible){var n=this.renderTarget||e.stage,r=n.getContext("2d");this.graphic.relative&&(t.x=this.x,t.y=this.y);var i=this.world?this.world.camera:e.camera;this.graphic.render(n,t,i)}},n.prototype.setHitbox=function(e,t,n,r){this.width=e||0,this.height=t||0,this.originX=n||0,this.originY=r||0},n.prototype.toString=function(){return this.constructor.name},n.prototype.update=function(){},Object.defineProperties(n.prototype,{graphic:{get:function(){return this._graphic},set:function(e){if(this._graphic===e)return;this._graphic=e,e&&e.assign!==null&&e.assign()}},mask:{get:function(){return this._mask},set:function(e){if(this._mask===e)return;this._mask&&this._mask.assignTo(null),this._mask=e,e&&this._mask.assignTo(this)}},onCamera:{get:function(){return this.collideRect(this.x,this.y,this._world.camera.x,this._world.camera.y,e.width,e.height)}},world:{get:function(){return this._world}}}),n}),"use strict",r("Graphic",[],function(){function e(){this.active=!1,this.relative=!0,this.scrollX=1,this.scrollY=1,this.visible=!0,this.assign=null,this.x=0,this.y=0}return e.prototype.render=function(e,t,n){},e.prototype.update=function(){},e}),"use strict",r("Input",["Atomic"],function(t){var n,r={ANY:{pressed:!1,released:!1,held:!1}},i={},s={lastKey:null,mouseUp:!0,mouseDown:!1,mousePressed:!1,mouseReleased:!1,mouseWheel:!1,mouseWheelDelta:0,mouseX:0,mouseY:0,check:function(e){return r[e]&&r[e].held||!1},clear:function(){this.lastKey=0,this.mouseUp=!0,this.mouseDown=!1,this.mousePressed=!1,this.mouseReleased=!1,this.mouseWheel=!1,this.mouseWheelDelta=0,this.mouseX=0,this.mouseY=0,r={ANY:{pressed:!1,released:!1,held:!1}}},define:function(){var e,t=arguments[0];for(e=1;e<arguments.length;e++)i[arguments[e]]=t},keys:function(e){var t=[];for(var n in i)i[n]===e&&t.push(n)},pressed:function(e){return r[e]&&r[e].pressed||!1},released:function(e){return r[e]&&r[e].released||!1}};return n=e(t.stage),n.mousedown(function(e){s.mouseDown=e.which===1,s.mouseUp=!s.mouseDown,s.mousePressed=s.mouseDown}),n.mouseup(function(e){s.mouseUp=e.which===1,s.mouseDown=!s.mouseDown,s.mouseReleased=s.mouseDown}),n.mouseout(function(e){s.mouseUp=!0,s.mouseDown=!1}),n.mousemove(function(e){var t=0,r=0;e||(e=window.event);if(e.pageX||e.pageY)t=e.pageX,r=e.pageY;else if(e.clientX||e.clientY)t=e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,r=e.clientY+document.body.scrollTop+document.documentElement.scrollTop;var i=n.get(0).getBoundingClientRect();t-=i.left+window.scrollX,r-=i.top+window.scrollY,s.mouseDown=e.which===1,s.mouseUp=!s.mouseDown,s.mouseX=t,s.mouseY=r}),n.bind("mousewheel DOMMouseScroll",function(e){e=e||window.event,s.mouseWheel=!0,s.mouseWheelDelta=e.originalEvent.detail*40||-e.originalEvent.wheelDelta}),n.keydown(function(e){var n=t.Key[e.which],o=i[n]||n||null;s.lastKey=n,o!==null&&(r[o]=r[o]||{released:!1},r[o].pressed=!r[o].held,r[o].held=!0),r.ANY.pressed=!0,r.ANY.held=!0}),n.keyup(function(e){var n=t.Key[e.which],s=i[n]||n||null;s!==null&&(r[s]=r[s]||{pressed:!1},r[s].released=!0,r[s].held=!1),r.ANY.released=!0,r.ANY.held=!1;for(s in r)if(r[s].held){r.ANY.held=!0;break}}),n.blur(function(e){r={ANY:{pressed:!1,released:!1,held:!1}},s.mouseUp=!0,s.mouseDown=!1}),e(t).bind("endFrame",function(){var e,t;s.mousePressed=!1,s.mouseReleased=!1,s.mouseWheel=!1,s.mouseWheelDelta=0;for(t in r)e=r[t],e.pressed=!1,e.released=!1}),s}),"use strict",r("Key",{8:"BACKSPACE",9:"TAB",13:"ENTER",16:"SHIFT",17:"CONTROL",18:"ALT",20:"CAPS_LOCK",27:"ESCAPE",32:"SPACE",33:"PAGE_UP",34:"PAGE_DOWN",35:"END",36:"HOME",37:"LEFT_ARROW",38:"UP_ARROW",39:"RIGHT_ARROW",40:"DOWN_ARROW",44:"PRINT_SCREEN",45:"INSERT",46:"DELETE",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",59:";",61:"=",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",93:"MENU"}),"use strict",r("Space",[],function(){function e(){if(arguments.length===0)throw new TypeError("Tried to create a zero-dimensional space");this.multipliers=[];var e=1;for(var t=0;t<arguments.length;t++)this.multipliers[t]=e,e*=arguments[t];this.data=[]}var t=function(){var e,t=0;if(arguments.length!==this.multipliers.length)throw new TypeError("Not enough arguments passed");for(e=0;e<this.multipliers.length;e++){if(arguments[e]<0)return undefined;if(e<this.multipliers.length-1&&arguments[e]>=this.multipliers[e+1])return undefined;t+=arguments[e]*this.multipliers[e]}return t};return e.prototype.get=function(){var e=t.apply(this,arguments);return e!==undefined?this.data[e]:undefined},e.prototype.set=function(){var e=arguments[0],n=Array.prototype.slice.call(arguments,1),r=t.apply(this,n);r!==undefined&&(this.data[r]=e)},e}),"use strict",r("Tween",["Atomic"],function(t){var n=[],r=["ease","delay","onComplete","onUpdate"],i={delayedCall:function(e,t,n){var r=function(){t.apply(null,n)};setTimeout(r,e*1e3)},killTweensOf:function(e){var t=n.length;while(t>0)t--,n[t].target===e&&n.splice(t,1)},to:function(e,t,i){var s,o={target:e,duration:t,elapsed:0,startValues:{},endValues:{},ease:null,delay:0,onComplete:null,onUpdate:null};for(s in r)i[r[s]]&&(o[r[s]]=i[r[s]],delete i[r[s]]);for(s in i)i.hasOwnProperty(s)&&(o.startValues[s]=e[s],o.endValues[s]=i[s]);n.push(o)},from:function(e,t,n){var s={};for(var o in n)n.hasOwnProperty(o)&&(r.indexOf(o)<0?(s[o]=e[o],e[o]=n[o]):s[o]=n[o]);i.to(e,t,s)}},s=function(e,t,n){return n===undefined&&(n=1),e+(t-e)*n},o=function(){var e=n.length,r,i;while(e>0){e--;var o=n[e];if(o.delay>0){o.delay-=t.elapsed;if(o.delay>0)continue;o.delay=0,o.elapsed-=o.delay}else o.elapsed+=t.elapsed;if(o.elapsed>=o.duration){for(r in o.endValues)o.endValues.hasOwnProperty(r)&&(o.target[r]=o.endValues[r]);o.onComplete&&o.onComplete.call(null),n.splice(e,1)}else{i=o.elapsed/o.duration,o.ease&&(i=o.ease(i));for(r in o.endValues)o.endValues.hasOwnProperty(r)&&(o.target[r]=s(o.startValues[r],o.endValues[r],i))}}};return e(t).bind("startFrame",o),i}),"use strict",r("Utils",{DEG:-180/Math.PI,RAD:Math.PI/-180,angle:function(e,t,n,r){var i=Math.atan2(r-t,n-e)*this.DEG;return i<0?i+360:i},angleXY:function(e,t,n,r,i){n===undefined&&(n=1),t*=this.RAD,e.x=Math.cos(t)*n+(r||0),e.y=Math.sin(t)*n+(i||0)},choose:function(){var e=arguments.length===1&&arguments[0].splice?arguments[0]:arguments;return e[this.rand(e.length)]},clamp:function(e,t,n){return n>t?e<t?t:e>n?n:e:e<n?n:e>t?t:e},distance:function(e,t,n,r){return e=+e,t=+t,n=+n,r=+r,Math.sqrt((n-e)*(n-e)+(r-t)*(r-t))},distanceRects:function(e,t,n,r,i,s,o,u){return e<i+o&&i<e+n?t<s+u&&s<t+r?0:t>s?t-(s+u):s-(t+r):t<s+u&&s<t+r?e>i?e-(i+o):i-(e+n):e>i?t>s?this.distance(e,t,i+o,s+u):this.distance(e,t+r,i+o,s):t>s?this.distance(e+n,t,i,s+u):this.distance(e+n,t+r,i,s)},extend:function(e,t){function n(){}n.prototype=e.prototype,t.prototype=new n,t.base=e,t.prototype.constructor=t},rand:function(e){return Math.floor(this.random()*e)},random:function(){return Math.random()},removeElement:function(e,t,n){n=!!n;var r=t.length-1;while(r>=0){if(e===t[r]){t.splice(r,1);if(!n)return}r--}},scale:function(e,t,n,r,i){return r+(e-t)/(n-t)*(i-r)},scaleClamp:function(e,t,n,r,i){return e=r+(e-t)/(n-t)*(i-r),i>r?(e=e<i?e:i,e>r?e:r):(e=e<r?e:r,e>i?e:i)},parseText:function(e){return/^\s*$/.test(e)?null:/^(?:true|false)$/i.test(e)?e.toLowerCase()==="true":isFinite(e)?parseFloat(e):isFinite(Date.parse(e))?new Date(e):e},getXML:function(e){if(e.nodeType===9)return this.getXML(e.documentElement);var t=null,n=0,r="",i,s,o,u,a;if(e.hasAttributes()){t={};for(n=0;n<e.attributes.length;n++)i=e.attributes.item(n),t["@"+i.name]=this.parseText(i.value.trim())}if(e.hasChildNodes())for(a=0;a<e.childNodes.length;a++)s=e.childNodes.item(a),s.nodeType===4?r+=s.nodeValue:s.nodeType===3?r+=s.nodeValue.trim():s.nodeType===1&&!s.prefix&&(n===0&&(t={}),o=s.nodeName,u=this.getXML(s),t.hasOwnProperty(o)?(t[o].constructor!==Array&&(t[o]=[t[o]]),t[o].push(u)):(t[o]=u,n++));return r&&(r=this.parseText(r),Object.defineProperty(t,"toString",{value:function(){return r}})),n>0&&Object.freeze(t),t},getColorRGBA:function(e,t){var n=(e&16711680)>>16,r=(e&65280)>>8,i=e&255;return"rgba("+n+", "+r+", "+i+", "+t+")"}}),"use strict",r("World",["Entity","Atomic","Utils","Input"],function(e,t,n,r){function i(){this.camera={x:0,y:0},this.visible=!0,this.entities=[]}return i.prototype.add=function(e){return this.entities.push(e),e._world||(e._world=this),e.added(),e},i.prototype.addGraphic=function(t,n,r,i){n=n||0,r=r||0,i=i||0;var s=new e(r,i,t);return s.layer=n,s.active=!1,this.add(s)},i.prototype.addMask=function(t,n,r,i){var s=new e(r||0,i||0,null,t);return n&&(s.type=n),s.active=s.visible=!1,this.add(s)},i.prototype.begin=function(){},i.prototype.collideLine=function(e,t,r,i,s,o,u){o===undefined&&(o=1),u=u||null,o<1&&(o=1);if(n.distance(t,r,i,s)<o)return u?t===i&&r===s?(u.x=i,u.y=s,this.collidePoint(e,i,s)):this.collideLine(e,t,r,i,s,1,u):this.collidePoint(e,t,s);var a=Math.abs(i-t),f=Math.abs(s-r),l=i>t?o:-o,c=s>r?o:-o,h=t,p=r,d;if(a>f){c*=f/a;if(l>0)while(h<i){if(d=this.collidePoint(e,h,p))return u?o<2?(u.x=h-l,u.y=p-c,d):this.collideLine(e,h-l,p-c,i,s,1,u):d;h+=l,p+=c}else while(h>i){if(d=this.collidePoint(e,h,p))return u?o<2?(u.x=h-l,u.y=p-c,d):this.collideLine(e,h-l,p-c,i,s,1,u):d;h+=l,p+=c}}else{l*=a/f;if(c>0)while(p<s){if(d=this.collidePoint(e,h,p))return u?o<2?(u.x=h-l,u.y=p-c,d):this.collideLine(e,h-l,p-c,i,s,1,u):d;h+=l,p+=c}else while(p>s){if(d=this.collidePoint(e,h,p))return u?o<2?(u.x=h-l,u.y=p-c,d):this.collideLine(e,h-l,p-c,i,s,1,u):d;h+=l,p+=c}}if(o>1){if(!u)return this.collidePoint(e,i,s);if(this.collidePoint(e,i,s))return this.collideLine(e,h-l,p-c,i,s,1,u)}return u&&(u.x=i,u.y=s),null},i.prototype.collidePoint=function(e,t,n){var r=this.getEntitiesByType(e);for(var i in r){var s=r[i];if(s.collidePoint(s.x,s.y,t,n))return s}return null},i.prototype.create=function(e,t){t===undefined&&(t=!0);var n=new e;return t?this.add(n):n},i.prototype.draw=function(){var e,n;t.stage.getContext("2d").clearRect(0,0,t.stage.width,t.stage.height);for(n=0;n<this.entities.length;n++)e=this.entities[n],e.visible&&e.render()},i.prototype.end=function(){},i.prototype.getEntitiesByClass=function(e){var t=[];for(var n=0;n<this.entities.length;n++)this.entities[n]instanceof e&&t.push(this.entities[n]);return t},i.prototype.getEntitiesByType=function(e){var t=[];for(var n=0;n<this.entities.length;n++)this.entities[n].type===e&&t.push(this.entities[n]);return t},i.prototype.remove=function(e){n.removeElement(e,this.entities)},i.prototype.update=function(){for(var e in this.entities){var t=this.entities[e];t.active&&t.update(),t.graphic&&t.graphic.active&&t.graphic.update()}},Object.defineProperties(i.prototype,{mouseX:{get:function(){return r.mouseX+this.camera.x}},mouseY:{get:function(){return r.mouseY+this.camera.y}}}),i}),"use strict",r("Graphics/Animation",[],function(){function e(e,t,n,r){r===undefined&&(r=!0),this.parent=null,this.name=e,this.frames=t,this.frameRate=n||0,this.loop=r,this.frameCount=t.length}return e.prototype.play=function(e){this.parent.play(this.name,!!e)},e}),"use strict",r("Graphics/Graphiclist",["Utils","Graphic"],function(e,t){function n(){this._graphics=[],this._temp=[],this._count=0,this._camera={x:0,y:0},t.call(this);for(var e=0;e<arguments.length;e++)this.add(arguments[e])}return e.extend(t,n),n.prototype.update=function(){for(var e in this._graphics){var t=this._graphics[e];t.active&&t.update()}},n.prototype.render=function(e,t,n){t.x+=this.x,t.y+=this.y,n.x*=this.scrollX,n.y*=this.scrollY;var r={x:0,y:0};for(var i in this._graphics){var s=this._graphics[i];s.visible&&(s.relative?(r.x=t.x,r.y=t.y):r.x=r.y=0,this._camera.x=n.x,this._camera.y=n.y,s.render(e,r,this._camera))}},n.prototype.add=function(e){return this._graphics[this._count++]=e,this.active||(this.active=e.active),e},n.prototype.remove=function(e){if(this._graphics.indexOf(e)<0)return e;this._temp.length=0;for(var t in this._graphics){var n=this._graphics[t];n===e?this._count--:this._temp[this._temp.length]=n}var r=this._graphics;return this._graphics=this._temp,this._temp=r,this.updateCheck(),e},n.prototype.removeAt=function(e){e=e||0;if(!this._graphics.length)return;e%=this._graphics.length,this.remove(this._graphics[e%this._graphics.length]),this.updateCheck()},n.prototype.removeAll=function(){this._graphics.length=this._temp.length=this._count=0,this.active=!1},n.prototype.updateCheck=function(){this.active=!1;for(var e in this._graphics){var t=this._graphics[e];if(t.active){this.active=!0;return}}},Object.defineProperties(n.prototype,{children:{get:function(){return this._graphics}},count:{get:function(){return this._count}}}),n}),"use strict",r("Graphics/Image",["Utils","Graphic"],function(e,t){function n(e,r){t.call(this);if(e.nodeName===undefined||e.nodeName.toLowerCase()!=="img"&&e.nodeName.toLowerCase()!=="canvas")throw new TypeError("source must be a DOM element of type image or canvas");r=r||{},r.x=r.x||0,r.y=r.y||0,r.width=r.width||e.width,r.height=r.height||e.height;var i=document.createElement("canvas");i.width=r.width,i.height=r.height,this._source=e,this._buffer=i,this._clipRect=r,this._locked=!1,this._needsUpdate=!1,this._needsClear=!1,this._alpha=1,this._color=16777215,this._tinting=1,this._tintMode=n.TINTING_MULTIPLY,this._flipped=!1,this._drawMask=null,this._tint=null,this.angle=0,this.blend=null,this.originX=0,this.originY=0,this.scale=1,this.scaleX=1,this.scaleY=1,this.smooth=!1,this.xor=!1,this.updateColorTransform(),this.updateBuffer()}return e.extend(t,n),n.TINTING_COLORIZE=0,n.TINTING_MULTIPLY=1,n.createCircle=function(t,r,i){r===undefined&&(r=16777215),i===undefined&&(i=1);var s=document.createElement("canvas"),o=s.getContext("2d");return r=e.getColorRGBA(r,i),s.width=s.height=t*2,o.fillStyle=r,o.beginPath(),o.arc(t,t,t,0,Math.PI*2,!0),o.closePath(),o.fill(),new n(s)},n.createRect=function(t,r,i,s){i===undefined&&(i=16777215),s===undefined&&(s=1);var o=document.createElement("canvas"),u=o.getContext("2d");return i=e.getColorRGBA(i,s),o.width=t,o.height=r,u.fillStyle=i,u.beginPath(),u.rect(0,0,t,r),u.closePath(),u.fill(),new n(o)},n.prototype.centerOrigin=function(){this.originX=Math.round(this.width/2),this.originY=Math.round(this.height/2)},n.prototype.clear=function(){this._buffer.getContext("2d").clearRect(0,0,this._buffer.width,this._buffer.height)},n.prototype.lock=function(){this._locked=!0},n.prototype.render=function(t,n,r){var i=this.scaleX*this.scale,s=this.scaleY*this.scale,o={x:n.x,y:n.y};o.x+=this.x-r.x*this.scrollX,o.y+=this.y-r.y*this.scrollY;var u=t.getContext("2d");u.save(),this.xor&&(u.globalCompositeOperation="xor"),u.translate(o.x,o.y),u.rotate(this.angle*e.RAD),u.translate(-this.originX*i,-this.originY*s),u.scale(i,s),u.globalAlpha=this.alpha,u.drawImage(this._buffer,0,0),u.restore()},n.prototype.unlock=function(){this._locked=!1},n.prototype.updateBuffer=function(t){if(this.locked)this._needsUpdate=!0,this._needsClear=this._needsClear||t||!1;else{var r=this._buffer.getContext("2d");this.clear(),r.save(),this.flipped&&(r.translate(this._buffer.width,0),r.scale(-1,1)),r.drawImage(this._source,this._clipRect.x,this._clipRect.y,this._clipRect.width,this._clipRect.height,0,0,this._buffer.width,this._buffer.height),this._tintMode===n.TINTING_MULTIPLY&&this._color!==16777215&&(r.globalCompositeOperation="source-atop",r.fillStyle=e.getColorRGBA(this._color,this._tinting),r.fillRect(0,0,this._buffer.width,this._buffer.height)),r.restore();if(this._tint){var i=r.getImageData(0,0,this._buffer.width,this._buffer.height),s=i.data;for(var o=0;o<this._buffer.width*this._buffer.height*4;o+=4)s[o]=s[o]*this._tint.redMultiplier+this._tint.redOffset,s[o+1]=s[o]*this._tint.greenMultiplier+this._tint.greenOffset,s[o+2]=s[o]*this._tint.blueMultiplier+this._tint.blueOffset;r.putImageData(i,0,0)}}},n.prototype.updateColorTransform=function(){if(this._tinting===0)return this._tint=null,this.updateBuffer();if(this._tintMode===n.TINTING_MULTIPLY)return this._tint=null,this.updateBuffer();this._tint={},this._tint.redMultiplier=this._tintMode*(1-this._tinting)+(1-this._tintMode)*(this._tinting*(Number(this._color>>16&255)/255-1)+1),this._tint.greenMultiplier=this._tintMode*(1-this._tinting)+(1-this._tintMode)*(this._tinting*(Number(this._color>>8&255)/255-1)+1),this._tint.blueMultiplier=this._tintMode*(1-this._tinting)+(1-this._tintMode)*(this._tinting*(Number(this._color&255)/255-1)+1),this._tint.redOffset=(this._color>>16&255)*this._tinting*this._tintMode,this._tint.greenOffset=(this._color>>8&255)*this._tinting*this._tintMode,this._tint.blueOffset=(this._color&255)*this._tinting*this._tintMode,this.updateBuffer()},Object.defineProperties(n.prototype,{clipRect:{get:function(){return this._clipRect}},width:{get:function(){return this._buffer.width}},height:{get:function(){return this._buffer.height}},scaledWidth:{get:function(){return this.width*this.scale*this.scaleX}},scaledHeight:{get:function(){return this.height*this.scale*this.scaleY}},locked:{get:function(){return this._locked}},alpha:{get:function(){return this._alpha},set:function(e){e=e<0?0:e>1?1:e;if(this._alpha===e)return;this._alpha=e}},color:{get:function(){return this._color},set:function(e){e&=16777215;if(this._color===e)return;this._color=e,this.updateColorTransform()}},tinting:{get:function(){return this._tinting},set:function(e){if(this._tinting===e)return;this._tinting=e,this.updateColorTransform()}},tintMode:{get:function(){return this._tintMode},set:function(e){if(this._tintMode===e)return;this._tintMode=e,this.updateColorTransform()}},flipped:{get:function(){return this._flipped},set:function(e){if(this._flipped===e)return;this._flipped=e,this.updateBuffer()}},drawMask:{get:function(){return this._drawMask},set:function(e){this._drawMask=e,this.updateBuffer(!0)}}}),n}),"use strict",r("Graphics/Spritemap",["Utils","Graphic","Graphics/Image","Atomic","Graphics/Animation"],function(e,t,n,r,i){function s(e,t,r,i){t=t||0,r=r||0,this.complete=!0,this.callback=i||null,this.rate=1,this._rectangle={x:0,y:0,width:t,height:r},t||(this._rectangle.width=e.width),r||(this._rectangle.height=e.height),this._width=e.width,this._height=e.height,this._columns=this._width/this._rectangle.width,this._rows=this._height/this._rectangle.height,this._frameCount=this._columns*this._rows,this._animations={},this._animation=null,this._index=null,this._frame=null,this._timer=0,n.call(this,e,this._rectangle),this.callback=i,this.updateBuffer(),this.active=!0}return e.extend(n,s),s.prototype.updateBuffer=function(e){e=e||!1,this._rectangle.x=this._rectangle.width*this._frame,this._rectangle.y=Math.floor(this._rectangle.x/this._width)*this._rectangle.height,this._rectangle.x%=this._width,n.prototype.updateBuffer.call(this,e)},s.prototype.update=function(){if(this._animation&&!this.complete){this._timer+=this._animation.frameRate*r.elapsed*this.rate;if(this._timer>=1){while(this._timer>=1){this._timer--,this._index++;if(this._index===this._animation.frameCount){if(!this._animation.loop){this._index=this._animation.frameCount-1,this.complete=!0,this.callback&&this.callback();break}this._index=0,this.callback&&this.callback()}}var e=this._frame;this._animation&&(this._frame=Math.round(this._animation.frames[this._index]),e!==this._frame&&this.updateBuffer())}}},s.prototype.add=function(e,t,n,r){n=n||0,r===undefined&&(r=!0);if(this._animations[e])throw new Error("Cannot have multiple animations with the same name");return(this._animations[e]=new i(e,t,n,r)).parent=this,this._animations[e]},s.prototype.play=function(e,t,n){return e=e||"",t=!!t,n=n||0,!t&&this._animation&&this._animation.name===e?this._animation:(this._animation=this._animations[e],this._animation?(this._index=0,this._timer=0,this._frame=Math.round(this._animation.frames[n%this._animation.frameCount]),this.complete=!1,this.updateBuffer(),this._animation):(this._frame=this._index=0,this.complete=!0,this.updateBuffer(),null))},s.prototype.getFrame=function(e,t){return e=e||0,t=t||0,t%this._rows*this._columns+e%this._columns},s.prototype.setFrame=function(e,t){e=e||0,t=t||0,this._animation=null;var n=t%this._rows*this._columns+e%this._columns;if(this._frame===n)return;this._frame=n,this._timer=0,this.updateBuffer()},s.prototype.randFrame=function(){this.frame=e.rand(this._frameCount)},s.prototype.setAnimationFrame=function(e,t){var n=this._animations[e].frames;t%=n.length,t<0&&(t+=n.length),this.frame=n[t]},Object.defineProperties(s.prototype,{frame:{get:function(){return this._frame},set:function(e){this._animation=null,e%=this._frameCount,e<0&&(e=this._frameCount+e);if(this._frame===e)return;this._frame=e,this._timer=0,this.updateBuffer()}},index:{get:function(){return this._animation?this._index:0},set:function(e){if(!this._animation)return;e%=this._animation.frameCount;if(this._index===e)return;this._index=e,this._frame=Math.round(this._animation.frames[this._index]),this._timer=0,this.updateBuffer()}},frameCount:{get:function(){return this._frameCount}},columns:{get:function(){return this._columns}},rows:{get:function(){return this._rows}},currentAnimation:{get:function(){return this._animation?this._animation.name:""}}}),s}),"use strict",r("Graphics/TiledImage",["Utils","Graphics/Image"],function(e,t){function n(e,n,r,i){this._offsetX=0,this._offsetY=0,t.call(this,e,i),this._buffer.width=n||0,this._buffer.height=r||0,this.updateBuffer()}return e.extend(t,n),n.prototype.updateBuffer=function(){if(!this._source)return;var e=this._buffer.getContext("2d");e.clearRect(0,0,e.canvas.width,e.canvas.height);var t=(this._offsetX%this._source.width+this._source.width)%this._source.width-this._source.width,n,r=(this._offsetY%this._source.height+this._source.height)%this._source.height-this._source.height;while(t<this._buffer.width){n=r;while(n<this._buffer.height)e.save(),e.translate(t,n),e.drawImage(this._source,0,0,this._source.width,this._source.height,0,0,this._source.width,this._source.height),n+=this._source.height,e.restore();t+=this._source.width}},n.prototype.setOffset=function(e,t){if(this._offsetX===e&&this._offsetY===t)return;this._offsetX=e,this._offsetY=t,this.updateBuffer()},Object.defineProperties(n.prototype,{offsetX:{get:function(){return this._offsetX},set:function(e){if(this._offsetX===e)return;this._offsetX=e,this.updateBuffer()}},offsetY:{get:function(){return this._offsetY},set:function(e){if(this._offsetY===e)return;this._offsetY=e,this.updateBuffer()}}}),n}),"use strict",r("Graphics/Tilemap",["Utils","Graphic","Space"],function(e,t,n){function r(e,r,i,s,o){t.call(this),this.tileset=e,this.width=r,this.height=i,this.tileWidth=s,this.tileHeight=o,this.rows=Math.ceil(i/o),this.columns=Math.ceil(r/s),this.setColumns=Math.ceil(e.width/s),this.setRows=Math.ceil(e.height/o),this.setCount=this.setColumns*this.setRows,this.map=new n(this.columns,this.rows),this.canvas=document.createElement("canvas"),this.canvas.width=r,this.canvas.height=i}return e.extend(t,r),r.prototype.loadFromString=function(e,t,n){t=t||",",n=n||"\n";var r=String(e).split(n),i=r.length,s,o,u,a;for(a=0;a<i;a++){if(r[a]==="")continue;s=r[a].split(t),o=s.length;for(u=0;u<o;u++){if(s[u]==="")continue;this.setTile(u,a,parseInt(s[u],10))}}},r.prototype.render=function(e,t,n){var r={x:0,y:0};r.x=t.x+this.x-n.x*this.scrollX,r.y=t.y+this.y-n.y*this.scrollY,e.getContext("2d").drawImage(this.canvas,0,0,this.width,this.height,r.x,r.y,this.width,this.height)},r.prototype.setTile=function(e,t,n){n===undefined&&(n=0),n%=this.setCount,e%=this.columns,t%=this.rows;var r=n%this.setColumns*this.tileWidth,i=Math.floor(n/this.setColumns)*this.tileHeight,s=e*this.tileWidth,o=t*this.tileHeight;this.map.set(e,t,n),n>=0?this.canvas.getContext("2d").drawImage(this.tileset,r,i,this.tileWidth,this.tileHeight,s,o,this.tileWidth,this.tileHeight):this.canvas.getContext("2d").clearRect(s,o,this.tileWidth,this.tileHeight)},Object.defineProperties(r.prototype,{}),r}),"use strict",r("Masks/Hitbox",["Utils","Mask"],function(e,t){function n(e,n,s,o){t.call(this),this._width=e===undefined?1:e,this._height=n===undefined?1:n,this._x=s||0,this._y=o||0,this.check.Mask=r,this.check.Hitbox=i}e.extend(t,n),n.prototype.MaskType="Hitbox",n.prototype.update=function(){this.list?this.list.update():this.parent&&(this.parent.originX=-this._x,this.parent.originY=-this._y,this.parent.width=this._width,this.parent.height=this._height)};var r=function(e){return this.parent.x+this.x+this.width>e.parent.x-e.parent.originX&&this.parent.y+this.y+this.height>e.parent.y-e.parent.originY&&this.parent.x+this.x<e.parent.x-e.parent.originX+e.parent.width&&this.parent.y+this.y<e.parent.y-e.parent.originY+e.parent.height},i=function(e){return this.parent.x+this.x+this.width>e.parent.x+e.x&&this.parent.y+this.y+this.height>e.parent.y+e.y&&this.parent.x+this.x<e.parent.x+e.x+e.width&&this.parent.y+this.y<e.parent.y+e.y+e.height};return Object.defineProperties(n.prototype,{x:{get:function(){return this._x},set:function(e){if(this._x===e)return;this._x=e,this.list?this.list.update():this.parent&&this.update()},enumerable:!0},y:{get:function(){return this._y},set:function(e){if(this._y===e)return;this._y=e,this.list?this.list.update():this.parent&&this.update()},enumerable:!0},width:{get:function(){return this._width},set:function(e){if(this._width===e)return;this._width=e,this.list?this.list.update():this.parent&&this.update()},enumerable:!0},height:{get:function(){return this._height},set:function(e){if(this._height===e)return;this._height=e,this.list?this.list.update():this.parent&&this.update()},enumerable:!0}}),n}),"use strict",r("Masks/Grid",["Utils","Masks/Hitbox","Space"],function(e,t,n){function r(e,r,a,f,l,c){t.call(this),this.usePositions=!1;if(!e||!r||!a||!f)throw new Error("Illegal Grid, sizes cannot be 0.");this.columns=e/a,this.rows=r/f,this.data=new n(this.columns,this.rows),this.tileWidth=a,this.tileHeight=f,this._x=l||0,this._y=c||0,this._width=e,this._height=r,this.check.Mask=i,this.check.Hitbox=s,this.check.Pixelmask=o,this.check.Grid=u}e.extend(t,r),r.prototype.MaskType="Grid",r.prototype.setTile=function(e,t,n){e=e||0,t=t||0,n=n===undefined||n,this.usePositions&&(e/=this.tileWidth,t/=this.tileHeight),this.data.set(n,e,t)},r.prototype.clearTile=function(e,t){this.setTile(e||0,t||0,!1)},r.prototype.getTile=function(e,t){return e=e||0,t=t||0,this.usePositions&&(e/=this.tileWidth,t/=this.tileHeight),!!this.data.get(e,t)},r.prototype.setRect=function(e,t,n,r,i){e=e||0,t=t||0,n=n===undefined?1:n,r=r===undefined?1:r,i=i===undefined||i,this.usePositions&&(e/=this.tileWidth,t/=this.tileHeight,n/=this.tileWidth,r/=this.tileHeight);for(var s=0;s<n;s++)for(var o=0;o<n;o++)this.data.set(i,e+s,t+o)},r.prototype.clearRect=function(e,t,n,r){this.setRect(e,t,n,r,!1)},r.prototype.loadFromString=function(e,t,n){t=t||",",n=n||"\n";var r=String(e).split(n),i=r.length,s,o,u,a;for(a=0;a<i;a++){if(r[a]==="")continue;s=r[a].split(t),o=s.length;for(u=0;u<o;u++){if(s[u]==="")continue;this.setTile(u,a,parseInt(s[u],10))}}};var i=function(e){var t=e.parent.x-e.parent.originX-this.parent.x+this.parent.originX,n=e.parent.y-e.parent.originY-this.parent.y+this.parent.originY,r=Math.floor((t+e.parent.width-1)/this.tileWidth)+1,i=Math.floor((n+e.parent.height-1)/this.tileHeight)+1;t=Math.floor(t/this.tileWidth),n=Math.floor(n/this.tileHeight);for(var s=t;s<r;s++)for(var o=n;o<i;o++)if(this.data.get(s,o))return!0;return!1},s=function(e){var t=e.parent.x+e.x-parent.x-this.x,n=e.parent.y+e.y-parent.y-this.y,r=Math.floor((t+e.width-1)/this.tileWidth)+1,i=Math.floor((n+e.height-1)/this.tileHeight)+1;t=Math.floor(t/this.tileWidth),n=Math.floor(n/this.tileHeight);for(var s=t;s<r;s++)for(var o=n;o<i;o++)if(this.data.get(s,o))return!0;return!1},o=function(e){throw new Error("Not implemented")},u=function(e){throw new Error("Not implemented")};return r}),"use strict",r("main",["require","AssetManager","Audio","Entity","Graphic","Input","Key","Mask","Sound","Space","Tween","Utils","World","Graphics/Animation","Graphics/Graphiclist","Graphics/Image","Graphics/Spritemap","Graphics/TiledImage","Graphics/Tilemap","Masks/Grid","Masks/Hitbox","Atomic"],function(e){var t=e("AssetManager"),n=e("Audio"),r=e("Entity"),i=e("Graphic"),s=e("Input"),o=e("Key"),u=e("Mask"),a=e("Sound"),f=e("Space"),l=e("Tween"),c=e("Utils"),h=e("World"),p={};p.Animation=e("Graphics/Animation"),p.Graphiclist=e("Graphics/Graphiclist"),p.Image=e("Graphics/Image"),p.Spritemap=e("Graphics/Spritemap"),p.TiledImage=e("Graphics/TiledImage"),p.Tilemap=e("Graphics/Tilemap");var d={};d.Grid=e("Masks/Grid"),d.Hitbox=e("Masks/Hitbox");var v=e("Atomic");return v.AssetManager=t,v.Audio=n,v.Entity=r,v.Graphic=i,v.Graphics=p,v.Input=s,v.Key=o,v.Mask=u,v.Masks=d,v.Sound=a,v.Space=f,v.Tween=l,v.Utils=c,v.World=h,v}),r("jquery",function(){return e}),n("main")})