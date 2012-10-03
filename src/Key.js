/*global define */
"use strict";
define({
	// This list based on:
	// https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent#Virtual_key_codes
	// TODO: This does not fully map all of the keys in the article linked above.
	// TODO: Some keys on my keyboard do not return the codes I'm expecting, ";" for e.g.
	// Ah, from http://www.javascripter.net/faq/keycodes.htm it looks like not all key codes are safe :(
	// Also, a lot of the names will be wrong on international keyboards (like mine...)
	// TODO: We'll need to do keypress() handling to manage the actual text typed
	8: "BACKSPACE",
	9: "TAB",
	13: "ENTER",
	16: "SHIFT",
	17: "CONTROL",
	18: "ALT",
	19: "PAUSE", // Pause/Break key
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
	44: "PRINT_SCREEN", // Probably wont trigger on keydown, only key up
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
	112: "F1",
	113: "F2",
	114: "F3",
	115: "F4",
	116: "F5",
	117: "F6",
	118: "F7",
	119: "F8",
	120: "F9",
	121: "F10",
	122: "F11",
	123: "F12",
	144: "NUM_LOCK",
	145: "SCROLL_LOCK",
	188: ".", // Also <
	190: ",", // Also >
	191: "/",
	192: "`",
	219: "[", // Also {
	220: "\\", // Also |
	221: "]", // Also }
	222: "'" // Also "

});
