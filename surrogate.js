/*
 * www.keithclark.co.uk  |  github.com/keithclark  |  twitter.com/keithclarkcouk
 *
 * This is a tiny JavaScript library targeted at grown-up web browsers. It's designed to 
 * mimic the jQuery syntax so it can be dropped into projects that have a jQuery dependency 
 * but don't need to worry about legacy browser support.
 *
 * So we're clear, this is not meant to be a cross browser solution. It's based on modern 
 * ECMAScript and DOM implementations, and that's how I plan to keep it.
 *
 * Internet Explorer - let's be 'avin ya!
 *
 * PLEASE NOTE: THIS IS NOT A PRODUCTION READY SCRIPT AND IT'S FAR FROM FEATURE COMPLETE!
 */

(function(){
	var doc = document;
	var docElm = doc.documentElement;
	var AP = Array.prototype;
	var HP = HTMLElement.prototype;
	var donor = doc.createElement("div");
	
	var getMember = function(obj, member) {
		var prefixes = "moz webkit o ms".split(" ");
		var uCase = member.charAt(0).toUpperCase() + member.slice(1);
		return obj[member] || prefixes.some( function( prefix ) {
			return (member = prefix+uCase) && obj[member];
		}) && obj[member];
	};

	var matchesSelector = getMember( HP, "matchesSelector" );

	function forEach( ctx, fn ) {
		AP.forEach.call( ctx, fn );
		return ctx;
	}
	
	function nodeChain( nodeList ) {
		AP.push.apply(this, nodeList);
	}
	
	nodeChain.prototype = {
		find: function( selector ) {
			var results = [];
			forEach(this, function(e) {
				AP.push.apply(results, AP.slice.call(e.querySelectorAll(selector), 0).filter(function(e, i, a) {
					return !~results.indexOf(e);
				}));
			})
			return new nodeChain( results );
		},
		each: function( fn ) {
			return forEach(this, function(e, i) {
				fn.call(e, i, e);
			});
		},
		is: function( selector ) {
			return AP.some.call(this, function(e) {
				return matchesSelector.call(e,selector);
			});
		},
		hasClass: function( className ) {
			return AP.some.call(this, function(e) {
				return e.classList.contains(className);
			});
		},
		addClass: function( className ) {
			return forEach(this, function(e) {
				e.classList.add(className);
			});
		},
		removeClass: function( className ) {
			return forEach(this, function(e) {
				e.classList.remove(className);
			});
		},
		bind: function( type, handler ) {
			return forEach(this, function(e) {
				e.addEventListener( type, handler, false );
			});
		},
		unbind: function( type, handler ) {
			return forEach(this, function(e) {
				e.removeEventListener( type, handler, false );
			});
		},
		ready: function( handler ) {
			document.addEventListener( "DOMContentLoaded", handler, false ); // TODO: not sure about having this here
		},
		attr: function( att, val ) {
			if (val !== undefined) {
				return forEach(this, (val === null) ? 
					function(e) {
						e.removeAttribute( att ); // TODO: jQuery.attr() returns undefined when removing an attribute
					}
				:
					function(e) {
						e.setAttribute( att, val );
					}
				);
			}
			return this[0] ? this[0].getAttribute( att ) : undefined;
		},
		html: function( value ) {
			if (value === undefined) {
				return this[0] ? this[0].innerHTML : null;
			} else {
				return forEach( this, function(e) {
					e.innerHTML = value;
				});
			}
		},
		css: function( prop, value ) {
			var cssText = "";
			if (value === undefined) {
				if (typeof prop !== "string") {
					for (var name in prop) {
						cssText += name + ":" + prop[name]+";"
					}
				} else {
					return this[0].ownerDocument.defaultView.getComputedStyle(this[0], null)[prop];
				}
			} else {
				cssText = prop + ":" + value + ";"
			}
			return forEach( this, function(e) {
				e.style.cssText += cssText;
			})

		}
	}

	// Alias common events
	// TODO: finialise this list
	forEach("click mouseover mouseout".split(" "), function(n,e) {
		nodeChain.prototype[n] = function(fn) {
			return this.bind(n,fn);
		}
	});

	
	this.$ = function( subject ) {
		var nodes;
		// TODO: handle subject when it's a function
		if (typeof subject === "string") {
			if (subject.charAt(0) === "<") {
				donor.innerHTML = subject;
				nodes = donor.childNodes;
			} else {
				nodes = doc.querySelectorAll( subject );
			}
		} else {
			if (subject.nodeType) {
				nodes = [subject];
			}
		}
		// TODO: jQuery returns an array?.
		return new nodeChain( nodes );
	}
})();