'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function random(low, high) {
  return Math.random() * (high - low) + low;
}

var Visual = function () {
  function Visual() {
    _classCallCheck(this, Visual);

    this.canvas = document.querySelector('.canvas');
    this.context = this.canvas.getContext('2d');
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.particleLength = 70;
    this.particles = [];
    this.particleMaxRadius = 8;

    this.handleMouseMoveBind = this.handleMouseMove.bind(this);
    this.handleClickBind = this.handleClick.bind(this);
    this.handleResizeBind = this.handleResize.bind(this);

    this.initialize();
    this.render();
  }

  _createClass(Visual, [{
    key: 'initialize',
    value: function initialize() {
      this.resizeCanvas();
      for (var i = 0; i < this.particleLength; i++) {
        this.particles.push(this.createParticle(i));
      }
      this.bind();
    }
  }, {
    key: 'bind',
    value: function bind() {
      document.body.addEventListener('mousemove', this.handleMouseMoveBind, false);
      document.body.addEventListener('click', this.handleClickBind, false);
      window.addEventListener('resize', this.handleResizeBind, false);
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      document.body.removeEventListener('mousemove', this.handleMouseMoveBind, false);
      document.body.removeEventListener('click', this.handleClickBind, false);
      window.removeEventListener('resize', this.handleResizeBind, false);
    }
  }, {
    key: 'handleMouseMove',
    value: function handleMouseMove(e) {
      this.enlargeParticle(e.clientX, e.clientY);
    }
  }, {
    key: 'handleClick',
    value: function handleClick(e) {
      this.burstParticle(e.clientX, e.clientY);
    }
  }, {
    key: 'handleResize',
    value: function handleResize() {
      this.resizeCanvas();
    }
  }, {
    key: 'resizeCanvas',
    value: function resizeCanvas() {
      this.canvasWidth = document.body.offsetWidth;
      this.canvasHeight = document.body.offsetHeight;
      this.canvas.width = this.canvasWidth * window.devicePixelRatio;
      this.canvas.height = this.canvasHeight * window.devicePixelRatio;
      this.context = this.canvas.getContext('2d');
      this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, {
    key: 'createParticle',
    value: function createParticle(id, isRecreate) {
      var radius = random(1, this.particleMaxRadius);
      var x = isRecreate ? -radius - random(this.particleMaxRadius * 2, this.canvasWidth) : random(0, this.canvasWidth);
      var y = random(this.canvasHeight / 2 - 150, this.canvasHeight / 2 + 150);
      y += random(-100, 100);
      var alpha = random(0.05, 1);

      return {
        id: id,
        x: x,
        y: y,
        startY: y,
        radius: radius,
        defaultRadius: radius,
        startAngle: 0,
        endAngle: Math.PI * 2,
        alpha: alpha,
        color: { r: 255, g: 255, b: 255 },
        speed: alpha + 1,
        amplitude: random(50, 200),
        isBurst: false
      };
    }
  }, {
    key: 'drawParticles',
    value: function drawParticles() {
      var _this = this;

      this.particles.forEach(function (particle) {
        // ??????????????????
        _this.moveParticle(particle);

        // particle??????
        _this.context.beginPath();
        _this.context.fillStyle = 'rgba(' + particle.color.r + ', ' + particle.color.g + ', ' + particle.color.b + ', ' + particle.alpha + ')';
        _this.context.arc(particle.x, particle.y, particle.radius, particle.startAngle, particle.endAngle);
        _this.context.fill();
      });
    }
  }, {
    key: 'moveParticle',
    value: function moveParticle(particle) {
      particle.x += particle.speed;
      particle.y = particle.startY + particle.amplitude * Math.sin(particle.x / 5 * Math.PI / 180);
    }
  }, {
    key: 'enlargeParticle',
    value: function enlargeParticle(clientX, clientY) {

      this.particles.forEach(function (particle) {
        if (particle.isBurst) return;

        var distance = Math.hypot(particle.x - clientX, particle.y - clientY);

        if (distance <= 100) {
          var scaling = (100 - distance) / 1.5;
          TweenMax.to(particle, 0.5, {
            radius: particle.defaultRadius + scaling,
            ease: Power2.easeOut
          });
        } else {
          TweenMax.to(particle, 0.5, {
            radius: particle.defaultRadius,
            ease: Power2.easeOut
          });
        }
      });
    }
  }, {
    key: 'burstParticle',
    value: function burstParticle(clientX, clientY) {
      var _this2 = this;

      this.particles.forEach(function (particle) {
        var distance = Math.hypot(particle.x - clientX, particle.y - clientY);

        if (distance <= 100) {
          particle.isBurst = true;
          TweenMax.to(particle, 0.5, {
            radius: particle.defaultRadius + 200,
            alpha: 0,
            ease: Power2.easeOut,
            onComplete: function onComplete() {
              _this2.particles[particle.id] = _this2.createParticle(particle.id, true);
            }
          });
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      // canvas?????????
      this.context.clearRect(0, 0, this.canvasWidth + this.particleMaxRadius * 2, this.canvasHeight);

      // particle?????????
      this.drawParticles();

      // ?????????????????????????????????particle???????????????
      this.particles.forEach(function (particle) {
        if (particle.x - particle.radius >= _this3.canvasWidth) {
          _this3.particles[particle.id] = _this3.createParticle(particle.id, true);
        }
      });

      requestAnimationFrame(this.render.bind(this));
    }
  }]);

  return Visual;
}();

new Visual();

// Because only Chrome supports offset-path, feGaussianBlur for now

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

if (!isChrome) {
  document.getElementsByClassName('infinityChrome')[0].style.display = "none";
  document.getElementsByClassName('infinity')[0].style.display = "block";
}

/**!
 * MixItUp v3.3.1
 * A high-performance, dependency-free library for animated filtering, sorting and more
 * Build 94e0fbf6-cd0b-4987-b3c0-14b59b67b8a0
 *
 * @copyright Copyright 2014-2018 KunkaLabs Limited.
 * @author    KunkaLabs Limited.
 * @link      https://www.kunkalabs.com/mixitup/
 *
 * @license   Commercial use requires a commercial license.
 *            https://www.kunkalabs.com/mixitup/licenses/
 *
 *            Non-commercial use permitted under same terms as CC BY-NC 3.0 license.
 *            http://creativecommons.org/licenses/by-nc/3.0/
 */
!function (t) {
  "use strict";
  var _e = null,
      n = null;!function () {
    var e = ["webkit", "moz", "o", "ms"],
        n = t.document.createElement("div"),
        a = -1;for (a = 0; a < e.length && !t.requestAnimationFrame; a++) {
      t.requestAnimationFrame = t[e[a] + "RequestAnimationFrame"];
    }"undefined" == typeof n.nextElementSibling && Object.defineProperty(t.Element.prototype, "nextElementSibling", { get: function get() {
        for (var t = this.nextSibling; t;) {
          if (1 === t.nodeType) return t;t = t.nextSibling;
        }return null;
      } }), function (t) {
      t.matches = t.matches || t.machesSelector || t.mozMatchesSelector || t.msMatchesSelector || t.oMatchesSelector || t.webkitMatchesSelector || function (t) {
        return Array.prototype.indexOf.call(this.parentElement.querySelectorAll(t), this) > -1;
      };
    }(t.Element.prototype), Object.keys || (Object.keys = function () {
      var t = Object.prototype.hasOwnProperty,
          e = !1,
          n = [],
          a = -1;return e = !{ toString: null }.propertyIsEnumerable("toString"), n = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"], a = n.length, function (i) {
        var o = [],
            r = "",
            s = -1;if ("object" != (typeof i === 'undefined' ? 'undefined' : _typeof(i)) && ("function" != typeof i || null === i)) throw new TypeError("Object.keys called on non-object");for (r in i) {
          t.call(i, r) && o.push(r);
        }if (e) for (s = 0; s < a; s++) {
          t.call(i, n[s]) && o.push(n[s]);
        }return o;
      };
    }()), Array.isArray || (Array.isArray = function (t) {
      return "[object Array]" === Object.prototype.toString.call(t);
    }), "function" != typeof Object.create && (Object.create = function (t) {
      var e = function e() {};return function (n, a) {
        if (n !== Object(n) && null !== n) throw TypeError("Argument must be an object, or null");e.prototype = n || {};var i = new e();return e.prototype = null, a !== t && Object.defineProperties(i, a), null === n && (i.__proto__ = null), i;
      };
    }()), String.prototype.trim || (String.prototype.trim = function () {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    }), Array.prototype.indexOf || (Array.prototype.indexOf = function (t) {
      var e, n, a, i;if (null === this) throw new TypeError();if (a = Object(this), i = a.length >>> 0, 0 === i) return -1;if (e = 0, arguments.length > 1 && (e = Number(arguments[1]), e !== e ? e = 0 : 0 !== e && e !== 1 / 0 && e !== -(1 / 0) && (e = (e > 0 || -1) * Math.floor(Math.abs(e)))), e >= i) return -1;for (n = e >= 0 ? e : Math.max(i - Math.abs(e), 0); n < i; n++) {
        if (n in a && a[n] === t) return n;
      }return -1;
    }), Function.prototype.bind || (Function.prototype.bind = function (t) {
      var e, n, a, i;if ("function" != typeof this) throw new TypeError();return e = Array.prototype.slice.call(arguments, 1), n = this, a = function a() {}, i = function i() {
        return n.apply(this instanceof a ? this : t, e.concat(Array.prototype.slice.call(arguments)));
      }, this.prototype && (a.prototype = this.prototype), i.prototype = new a(), i;
    }), t.Element.prototype.dispatchEvent || (t.Element.prototype.dispatchEvent = function (t) {
      try {
        return this.fireEvent("on" + t.type, t);
      } catch (e) {}
    });
  }(), _e = function e(a, i, o) {
    var r = null,
        s = !1,
        l = null,
        c = null,
        u = null,
        f = null,
        h = [],
        d = "",
        m = [],
        g = -1;if (u = o || t.document, (s = arguments[3]) && (s = "boolean" == typeof s), "string" == typeof a) m = u.querySelectorAll(a);else if (a && "object" == (typeof a === 'undefined' ? 'undefined' : _typeof(a)) && n.isElement(a, u)) m = [a];else {
      if (!a || "object" != (typeof a === 'undefined' ? 'undefined' : _typeof(a)) || !a.length) throw new Error(_e.messages.errorFactoryInvalidContainer());m = a;
    }if (m.length < 1) throw new Error(_e.messages.errorFactoryContainerNotFound());for (g = 0; (r = m[g]) && (!(g > 0) || s); g++) {
      r.id ? d = r.id : (d = "MixItUp" + n.randomHex(), r.id = d), _e.instances[d] instanceof _e.Mixer ? (l = _e.instances[d], (!i || i && i.debug && i.debug.showWarnings !== !1) && console.warn(_e.messages.warningFactoryPreexistingInstance())) : (l = new _e.Mixer(), l.attach(r, u, d, i), _e.instances[d] = l), c = new _e.Facade(l), i && i.debug && i.debug.enable ? h.push(l) : h.push(c);
    }return f = s ? new _e.Collection(h) : h[0];
  }, _e.use = function (t) {
    _e.Base.prototype.callActions.call(_e, "beforeUse", arguments), "function" == typeof t && "mixitup-extension" === t.TYPE ? "undefined" == typeof _e.extensions[t.NAME] && (t(_e), _e.extensions[t.NAME] = t) : t.fn && t.fn.jquery && (_e.libraries.$ = t), _e.Base.prototype.callActions.call(_e, "afterUse", arguments);
  }, _e.instances = {}, _e.extensions = {}, _e.libraries = {}, n = { hasClass: function hasClass(t, e) {
      return !!t.className.match(new RegExp("(\\s|^)" + e + "(\\s|$)"));
    }, addClass: function addClass(t, e) {
      this.hasClass(t, e) || (t.className += t.className ? " " + e : e);
    }, removeClass: function removeClass(t, e) {
      if (this.hasClass(t, e)) {
        var n = new RegExp("(\\s|^)" + e + "(\\s|$)");t.className = t.className.replace(n, " ").trim();
      }
    }, extend: function extend(t, e, n, a) {
      var i = [],
          o = "",
          r = -1;n = n || !1, a = a || !1;try {
        if (Array.isArray(e)) for (r = 0; r < e.length; r++) {
          i.push(r);
        } else e && (i = Object.keys(e));for (r = 0; r < i.length; r++) {
          o = i[r], !n || "object" != _typeof(e[o]) || this.isElement(e[o]) ? t[o] = e[o] : Array.isArray(e[o]) ? (t[o] || (t[o] = []), this.extend(t[o], e[o], n, a)) : (t[o] || (t[o] = {}), this.extend(t[o], e[o], n, a));
        }
      } catch (s) {
        if (!a) throw s;this.handleExtendError(s, t);
      }return t;
    }, handleExtendError: function handleExtendError(t, n) {
      var a = /property "?(\w*)"?[,:] object/i,
          i = null,
          o = "",
          r = "",
          s = "",
          l = "",
          c = "",
          u = -1,
          f = -1;if (t instanceof TypeError && (i = a.exec(t.message))) {
        o = i[1];for (c in n) {
          for (f = 0; f < o.length && o.charAt(f) === c.charAt(f);) {
            f++;
          }f > u && (u = f, l = c);
        }throw u > 1 && (s = _e.messages.errorConfigInvalidPropertySuggestion({ probableMatch: l })), r = _e.messages.errorConfigInvalidProperty({ erroneous: o, suggestion: s }), new TypeError(r);
      }throw t;
    }, template: function template(t) {
      for (var e = /\${([\w]*)}/g, n = {}, a = null; a = e.exec(t);) {
        n[a[1]] = new RegExp("\\${" + a[1] + "}", "g");
      }return function (e) {
        var a = "",
            i = t;e = e || {};for (a in n) {
          i = i.replace(n[a], "undefined" != typeof e[a] ? e[a] : "");
        }return i;
      };
    }, on: function on(e, n, a, i) {
      e && (e.addEventListener ? e.addEventListener(n, a, i) : e.attachEvent && (e["e" + n + a] = a, e[n + a] = function () {
        e["e" + n + a](t.event);
      }, e.attachEvent("on" + n, e[n + a])));
    }, off: function off(t, e, n) {
      t && (t.removeEventListener ? t.removeEventListener(e, n, !1) : t.detachEvent && (t.detachEvent("on" + e, t[e + n]), t[e + n] = null));
    }, getCustomEvent: function getCustomEvent(e, n, a) {
      var i = null;return a = a || t.document, "function" == typeof t.CustomEvent ? i = new t.CustomEvent(e, { detail: n, bubbles: !0, cancelable: !0 }) : "function" == typeof a.createEvent ? (i = a.createEvent("CustomEvent"), i.initCustomEvent(e, !0, !0, n)) : (i = a.createEventObject(), i.type = e, i.returnValue = !1, i.cancelBubble = !1, i.detail = n), i;
    }, getOriginalEvent: function getOriginalEvent(t) {
      return t.touches && t.touches.length ? t.touches[0] : t.changedTouches && t.changedTouches.length ? t.changedTouches[0] : t;
    }, index: function index(t, e) {
      for (var n = 0; null !== (t = t.previousElementSibling);) {
        e && !t.matches(e) || ++n;
      }return n;
    }, camelCase: function camelCase(t) {
      return t.toLowerCase().replace(/([_-][a-z])/g, function (t) {
        return t.toUpperCase().replace(/[_-]/, "");
      });
    }, pascalCase: function pascalCase(t) {
      return (t = this.camelCase(t)).charAt(0).toUpperCase() + t.slice(1);
    }, dashCase: function dashCase(t) {
      return t.replace(/([A-Z])/g, "-$1").replace(/^-/, "").toLowerCase();
    }, isElement: function isElement(e, n) {
      return n = n || t.document, !!(t.HTMLElement && e instanceof t.HTMLElement) || !!(n.defaultView && n.defaultView.HTMLElement && e instanceof n.defaultView.HTMLElement) || null !== e && 1 === e.nodeType && "string" == typeof e.nodeName;
    }, createElement: function createElement(e, n) {
      var a = null,
          i = null;for (n = n || t.document, a = n.createDocumentFragment(), i = n.createElement("div"), i.innerHTML = e.trim(); i.firstChild;) {
        a.appendChild(i.firstChild);
      }return a;
    }, removeWhitespace: function removeWhitespace(t) {
      for (var e; t && "#text" === t.nodeName;) {
        e = t, t = t.previousSibling, e.parentElement && e.parentElement.removeChild(e);
      }
    }, isEqualArray: function isEqualArray(t, e) {
      var n = t.length;if (n !== e.length) return !1;for (; n--;) {
        if (t[n] !== e[n]) return !1;
      }return !0;
    }, deepEquals: function deepEquals(t, e) {
      var n;if ("object" == (typeof t === 'undefined' ? 'undefined' : _typeof(t)) && t && "object" == (typeof e === 'undefined' ? 'undefined' : _typeof(e)) && e) {
        if (Object.keys(t).length !== Object.keys(e).length) return !1;for (n in t) {
          if (!e.hasOwnProperty(n) || !this.deepEquals(t[n], e[n])) return !1;
        }
      } else if (t !== e) return !1;return !0;
    }, arrayShuffle: function arrayShuffle(t) {
      for (var e = t.slice(), n = e.length, a = n, i = -1, o = []; a--;) {
        i = ~~(Math.random() * n), o = e[a], e[a] = e[i], e[i] = o;
      }return e;
    }, arrayFromList: function arrayFromList(t) {
      var e, n;try {
        return Array.prototype.slice.call(t);
      } catch (a) {
        for (e = [], n = 0; n < t.length; n++) {
          e.push(t[n]);
        }return e;
      }
    }, debounce: function debounce(t, e, n) {
      var a;return function () {
        var i = this,
            o = arguments,
            r = n && !a,
            s = null;s = function s() {
          a = null, n || t.apply(i, o);
        }, clearTimeout(a), a = setTimeout(s, e), r && t.apply(i, o);
      };
    }, position: function position(t) {
      for (var e = 0, n = 0, a = t; t;) {
        e -= t.scrollLeft, n -= t.scrollTop, t === a && (e += t.offsetLeft, n += t.offsetTop, a = t.offsetParent), t = t.parentElement;
      }return { x: e, y: n };
    }, getHypotenuse: function getHypotenuse(t, e) {
      var n = t.x - e.x,
          a = t.y - e.y;return n = n < 0 ? n * -1 : n, a = a < 0 ? a * -1 : a, Math.sqrt(Math.pow(n, 2) + Math.pow(a, 2));
    }, getIntersectionRatio: function getIntersectionRatio(t, e) {
      var n = t.width * t.height,
          a = -1,
          i = -1,
          o = -1,
          r = -1;return a = Math.max(0, Math.min(t.left + t.width, e.left + e.width) - Math.max(t.left, e.left)), i = Math.max(0, Math.min(t.top + t.height, e.top + e.height) - Math.max(t.top, e.top)), o = i * a, r = o / n;
    }, closestParent: function closestParent(e, n, a, i) {
      var o = e.parentNode;if (i = i || t.document, a && e.matches(n)) return e;for (; o && o != i.body;) {
        if (o.matches && o.matches(n)) return o;if (!o.parentNode) return null;o = o.parentNode;
      }return null;
    }, children: function children(e, n, a) {
      var i = [],
          o = "";return a = a || t.doc, e && (e.id || (o = "Temp" + this.randomHexKey(), e.id = o), i = a.querySelectorAll("#" + e.id + " > " + n), o && e.removeAttribute("id")), i;
    }, clean: function clean(t) {
      var e = [],
          n = -1;for (n = 0; n < t.length; n++) {
        "" !== t[n] && e.push(t[n]);
      }return e;
    }, defer: function defer(n) {
      var a = null,
          i = null,
          o = null;return i = new this.Deferred(), _e.features.has.promises ? i.promise = new Promise(function (t, e) {
        i.resolve = t, i.reject = e;
      }) : (o = t.jQuery || n.$) && "function" == typeof o.Deferred ? (a = o.Deferred(), i.promise = a.promise(), i.resolve = a.resolve, i.reject = a.reject) : t.console && console.warn(_e.messages.warningNoPromiseImplementation()), i;
    }, all: function all(n, a) {
      var i = null;return _e.features.has.promises ? Promise.all(n) : (i = t.jQuery || a.$) && "function" == typeof i.when ? i.when.apply(i, n).done(function () {
        return arguments;
      }) : (t.console && console.warn(_e.messages.warningNoPromiseImplementation()), []);
    }, getPrefix: function getPrefix(t, e, a) {
      var i = -1,
          o = "";if (n.dashCase(e) in t.style) return "";for (i = 0; o = a[i]; i++) {
        if (o + e in t.style) return o.toLowerCase();
      }return "unsupported";
    }, randomHex: function randomHex() {
      return ("00000" + (16777216 * Math.random() << 0).toString(16)).substr(-6).toUpperCase();
    }, getDocumentState: function getDocumentState(e) {
      return e = "object" == _typeof(e.body) ? e : t.document, { scrollTop: t.pageYOffset, scrollLeft: t.pageXOffset, docHeight: e.documentElement.scrollHeight, docWidth: e.documentElement.scrollWidth, viewportHeight: e.documentElement.clientHeight, viewportWidth: e.documentElement.clientWidth };
    }, bind: function bind(t, e) {
      return function () {
        return e.apply(t, arguments);
      };
    }, isVisible: function isVisible(e) {
      var n = null;return !!e.offsetParent || (n = t.getComputedStyle(e), "fixed" === n.position && "hidden" !== n.visibility && "0" !== n.opacity);
    }, seal: function seal(t) {
      "function" == typeof Object.seal && Object.seal(t);
    }, freeze: function freeze(t) {
      "function" == typeof Object.freeze && Object.freeze(t);
    }, compareVersions: function compareVersions(t, e) {
      var n = t.split("."),
          a = e.split("."),
          i = -1,
          o = -1,
          r = -1;for (r = 0; r < n.length; r++) {
        if (i = parseInt(n[r].replace(/[^\d.]/g, "")), o = parseInt(a[r].replace(/[^\d.]/g, "") || 0), o < i) return !1;if (o > i) return !0;
      }return !0;
    }, Deferred: function Deferred() {
      this.promise = null, this.resolve = null, this.reject = null, this.id = n.randomHex();
    }, isEmptyObject: function isEmptyObject(t) {
      var e = "";if ("function" == typeof Object.keys) return 0 === Object.keys(t).length;for (e in t) {
        if (t.hasOwnProperty(e)) return !1;
      }return !0;
    }, getClassname: function getClassname(t, e, n) {
      var a = "";return a += t.block, a.length && (a += t.delineatorElement), a += t["element" + this.pascalCase(e)], n ? (a.length && (a += t.delineatorModifier), a += n) : a;
    }, getProperty: function getProperty(t, e) {
      var n = e.split("."),
          a = null,
          i = "",
          o = 0;if (!e) return t;for (a = function a(t) {
        return t ? t[i] : null;
      }; o < n.length;) {
        i = n[o], t = a(t), o++;
      }return "undefined" != typeof t ? t : null;
    } }, _e.h = n, _e.Base = function () {}, _e.Base.prototype = { constructor: _e.Base, callActions: function callActions(t, e) {
      var a = this,
          i = a.constructor.actions[t],
          o = "";if (i && !n.isEmptyObject(i)) for (o in i) {
        i[o].apply(a, e);
      }
    }, callFilters: function callFilters(t, e, a) {
      var i = this,
          o = i.constructor.filters[t],
          r = e,
          s = "";if (!o || n.isEmptyObject(o)) return r;a = a || [];for (s in o) {
        a = n.arrayFromList(a), a.unshift(r), r = o[s].apply(i, a);
      }return r;
    } }, _e.BaseStatic = function () {
    this.actions = {}, this.filters = {}, this.extend = function (t) {
      n.extend(this.prototype, t);
    }, this.registerAction = function (t, e, n) {
      (this.actions[t] = this.actions[t] || {})[e] = n;
    }, this.registerFilter = function (t, e, n) {
      (this.filters[t] = this.filters[t] || {})[e] = n;
    };
  }, _e.Features = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.boxSizingPrefix = "", this.transformPrefix = "", this.transitionPrefix = "", this.boxSizingPrefix = "", this.transformProp = "", this.transformRule = "", this.transitionProp = "", this.perspectiveProp = "", this.perspectiveOriginProp = "", this.has = new _e.Has(), this.canary = null, this.BOX_SIZING_PROP = "boxSizing", this.TRANSITION_PROP = "transition", this.TRANSFORM_PROP = "transform", this.PERSPECTIVE_PROP = "perspective", this.PERSPECTIVE_ORIGIN_PROP = "perspectiveOrigin", this.VENDORS = ["Webkit", "moz", "O", "ms"], this.TWEENABLE = ["opacity", "width", "height", "marginRight", "marginBottom", "x", "y", "scale", "translateX", "translateY", "translateZ", "rotateX", "rotateY", "rotateZ"], this.callActions("afterConstruct");
  }, _e.BaseStatic.call(_e.Features), _e.Features.prototype = Object.create(_e.Base.prototype), n.extend(_e.Features.prototype, { constructor: _e.Features, init: function init() {
      var t = this;t.callActions("beforeInit", arguments), t.canary = document.createElement("div"), t.setPrefixes(), t.runTests(), t.callActions("beforeInit", arguments);
    }, runTests: function runTests() {
      var e = this;e.callActions("beforeRunTests", arguments), e.has.promises = "function" == typeof t.Promise, e.has.transitions = "unsupported" !== e.transitionPrefix, e.callActions("afterRunTests", arguments), n.freeze(e.has);
    }, setPrefixes: function setPrefixes() {
      var t = this;t.callActions("beforeSetPrefixes", arguments), t.transitionPrefix = n.getPrefix(t.canary, "Transition", t.VENDORS), t.transformPrefix = n.getPrefix(t.canary, "Transform", t.VENDORS), t.boxSizingPrefix = n.getPrefix(t.canary, "BoxSizing", t.VENDORS), t.boxSizingProp = t.boxSizingPrefix ? t.boxSizingPrefix + n.pascalCase(t.BOX_SIZING_PROP) : t.BOX_SIZING_PROP, t.transitionProp = t.transitionPrefix ? t.transitionPrefix + n.pascalCase(t.TRANSITION_PROP) : t.TRANSITION_PROP, t.transformProp = t.transformPrefix ? t.transformPrefix + n.pascalCase(t.TRANSFORM_PROP) : t.TRANSFORM_PROP, t.transformRule = t.transformPrefix ? "-" + t.transformPrefix + "-" + t.TRANSFORM_PROP : t.TRANSFORM_PROP, t.perspectiveProp = t.transformPrefix ? t.transformPrefix + n.pascalCase(t.PERSPECTIVE_PROP) : t.PERSPECTIVE_PROP, t.perspectiveOriginProp = t.transformPrefix ? t.transformPrefix + n.pascalCase(t.PERSPECTIVE_ORIGIN_PROP) : t.PERSPECTIVE_ORIGIN_PROP, t.callActions("afterSetPrefixes", arguments);
    } }), _e.Has = function () {
    this.transitions = !1, this.promises = !1, n.seal(this);
  }, _e.features = new _e.Features(), _e.features.init(), _e.ConfigAnimation = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.enable = !0, this.effects = "fade scale", this.effectsIn = "", this.effectsOut = "", this.duration = 600, this.easing = "ease", this.applyPerspective = !0, this.perspectiveDistance = "3000px", this.perspectiveOrigin = "50% 50%", this.queue = !0, this.queueLimit = 3, this.animateResizeContainer = !0, this.animateResizeTargets = !1, this.staggerSequence = null, this.reverseOut = !1, this.nudge = !0, this.clampHeight = !0, this.clampWidth = !0, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigAnimation), _e.ConfigAnimation.prototype = Object.create(_e.Base.prototype), _e.ConfigAnimation.prototype.constructor = _e.ConfigAnimation, _e.ConfigBehavior = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.liveSort = !1, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigBehavior), _e.ConfigBehavior.prototype = Object.create(_e.Base.prototype), _e.ConfigBehavior.prototype.constructor = _e.ConfigBehavior, _e.ConfigCallbacks = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.onMixStart = null, this.onMixBusy = null, this.onMixEnd = null, this.onMixFail = null, this.onMixClick = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigCallbacks), _e.ConfigCallbacks.prototype = Object.create(_e.Base.prototype), _e.ConfigCallbacks.prototype.constructor = _e.ConfigCallbacks, _e.ConfigControls = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.enable = !0, this.live = !1, this.scope = "global", this.toggleLogic = "or", this.toggleDefault = "all", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigControls), _e.ConfigControls.prototype = Object.create(_e.Base.prototype), _e.ConfigControls.prototype.constructor = _e.ConfigControls, _e.ConfigClassNames = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.block = "mixitup", this.elementContainer = "container", this.elementFilter = "control", this.elementSort = "control", this.elementMultimix = "control", this.elementToggle = "control", this.modifierActive = "active", this.modifierDisabled = "disabled", this.modifierFailed = "failed", this.delineatorElement = "-", this.delineatorModifier = "-", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigClassNames), _e.ConfigClassNames.prototype = Object.create(_e.Base.prototype), _e.ConfigClassNames.prototype.constructor = _e.ConfigClassNames, _e.ConfigData = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.uidKey = "", this.dirtyCheck = !1, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigData), _e.ConfigData.prototype = Object.create(_e.Base.prototype), _e.ConfigData.prototype.constructor = _e.ConfigData, _e.ConfigDebug = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.enable = !1, this.showWarnings = !0, this.fauxAsync = !1, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigDebug), _e.ConfigDebug.prototype = Object.create(_e.Base.prototype), _e.ConfigDebug.prototype.constructor = _e.ConfigDebug, _e.ConfigLayout = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.allowNestedTargets = !0, this.containerClassName = "", this.siblingBefore = null, this.siblingAfter = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigLayout), _e.ConfigLayout.prototype = Object.create(_e.Base.prototype), _e.ConfigLayout.prototype.constructor = _e.ConfigLayout, _e.ConfigLoad = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.filter = "all", this.sort = "default:asc", this.dataset = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigLoad), _e.ConfigLoad.prototype = Object.create(_e.Base.prototype), _e.ConfigLoad.prototype.constructor = _e.ConfigLoad, _e.ConfigSelectors = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.target = ".mix", this.control = "", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigSelectors), _e.ConfigSelectors.prototype = Object.create(_e.Base.prototype), _e.ConfigSelectors.prototype.constructor = _e.ConfigSelectors, _e.ConfigRender = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.target = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigRender), _e.ConfigRender.prototype = Object.create(_e.Base.prototype), _e.ConfigRender.prototype.constructor = _e.ConfigRender, _e.ConfigTemplates = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.ConfigTemplates), _e.ConfigTemplates.prototype = Object.create(_e.Base.prototype), _e.ConfigTemplates.prototype.constructor = _e.ConfigTemplates, _e.Config = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.animation = new _e.ConfigAnimation(), this.behavior = new _e.ConfigBehavior(), this.callbacks = new _e.ConfigCallbacks(), this.controls = new _e.ConfigControls(), this.classNames = new _e.ConfigClassNames(), this.data = new _e.ConfigData(), this.debug = new _e.ConfigDebug(), this.layout = new _e.ConfigLayout(), this.load = new _e.ConfigLoad(), this.selectors = new _e.ConfigSelectors(), this.render = new _e.ConfigRender(), this.templates = new _e.ConfigTemplates(), this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.Config), _e.Config.prototype = Object.create(_e.Base.prototype), _e.Config.prototype.constructor = _e.Config, _e.MixerDom = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.document = null, this.body = null, this.container = null, this.parent = null, this.targets = [], this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.MixerDom), _e.MixerDom.prototype = Object.create(_e.Base.prototype), _e.MixerDom.prototype.constructor = _e.MixerDom, _e.UiClassNames = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.base = "", this.active = "", this.disabled = "", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.UiClassNames), _e.UiClassNames.prototype = Object.create(_e.Base.prototype), _e.UiClassNames.prototype.constructor = _e.UiClassNames, _e.CommandDataset = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.dataset = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.CommandDataset), _e.CommandDataset.prototype = Object.create(_e.Base.prototype), _e.CommandDataset.prototype.constructor = _e.CommandDataset, _e.CommandMultimix = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.filter = null, this.sort = null, this.insert = null, this.remove = null, this.changeLayout = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.CommandMultimix), _e.CommandMultimix.prototype = Object.create(_e.Base.prototype), _e.CommandMultimix.prototype.constructor = _e.CommandMultimix, _e.CommandFilter = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.selector = "", this.collection = null, this.action = "show", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.CommandFilter), _e.CommandFilter.prototype = Object.create(_e.Base.prototype), _e.CommandFilter.prototype.constructor = _e.CommandFilter, _e.CommandSort = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.sortString = "", this.attribute = "", this.order = "asc", this.collection = null, this.next = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.CommandSort), _e.CommandSort.prototype = Object.create(_e.Base.prototype), _e.CommandSort.prototype.constructor = _e.CommandSort, _e.CommandInsert = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.index = 0, this.collection = [], this.position = "before", this.sibling = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.CommandInsert), _e.CommandInsert.prototype = Object.create(_e.Base.prototype), _e.CommandInsert.prototype.constructor = _e.CommandInsert, _e.CommandRemove = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.targets = [], this.collection = [], this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.CommandRemove), _e.CommandRemove.prototype = Object.create(_e.Base.prototype), _e.CommandRemove.prototype.constructor = _e.CommandRemove, _e.CommandChangeLayout = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.containerClassName = "", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.CommandChangeLayout), _e.CommandChangeLayout.prototype = Object.create(_e.Base.prototype), _e.CommandChangeLayout.prototype.constructor = _e.CommandChangeLayout, _e.ControlDefinition = function (t, a, i, o) {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.type = t, this.selector = a, this.live = i || !1, this.parent = o || "", this.callActions("afterConstruct"), n.freeze(this), n.seal(this);
  }, _e.BaseStatic.call(_e.ControlDefinition), _e.ControlDefinition.prototype = Object.create(_e.Base.prototype), _e.ControlDefinition.prototype.constructor = _e.ControlDefinition, _e.controlDefinitions = [], _e.controlDefinitions.push(new _e.ControlDefinition("multimix", "[data-filter][data-sort]")), _e.controlDefinitions.push(new _e.ControlDefinition("filter", "[data-filter]")), _e.controlDefinitions.push(new _e.ControlDefinition("sort", "[data-sort]")), _e.controlDefinitions.push(new _e.ControlDefinition("toggle", "[data-toggle]")), _e.Control = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.el = null, this.selector = "", this.bound = [], this.pending = -1, this.type = "", this.status = "inactive", this.filter = "", this.sort = "", this.canDisable = !1, this.handler = null, this.classNames = new _e.UiClassNames(), this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.Control), _e.Control.prototype = Object.create(_e.Base.prototype), n.extend(_e.Control.prototype, { constructor: _e.Control, init: function init(t, n, a) {
      var i = this;if (this.callActions("beforeInit", arguments), i.el = t, i.type = n, i.selector = a, i.selector) i.status = "live";else switch (i.canDisable = "boolean" == typeof i.el.disable, i.type) {case "filter":
          i.filter = i.el.getAttribute("data-filter");break;case "toggle":
          i.filter = i.el.getAttribute("data-toggle");break;case "sort":
          i.sort = i.el.getAttribute("data-sort");break;case "multimix":
          i.filter = i.el.getAttribute("data-filter"), i.sort = i.el.getAttribute("data-sort");}i.bindClick(), _e.controls.push(i), this.callActions("afterInit", arguments);
    }, isBound: function isBound(t) {
      var e = this,
          n = !1;return this.callActions("beforeIsBound", arguments), n = e.bound.indexOf(t) > -1, e.callFilters("afterIsBound", n, arguments);
    }, addBinding: function addBinding(t) {
      var e = this;this.callActions("beforeAddBinding", arguments), e.isBound() || e.bound.push(t), this.callActions("afterAddBinding", arguments);
    }, removeBinding: function removeBinding(t) {
      var n = this,
          a = -1;this.callActions("beforeRemoveBinding", arguments), (a = n.bound.indexOf(t)) > -1 && n.bound.splice(a, 1), n.bound.length < 1 && (n.unbindClick(), a = _e.controls.indexOf(n), _e.controls.splice(a, 1), "active" === n.status && n.renderStatus(n.el, "inactive")), this.callActions("afterRemoveBinding", arguments);
    }, bindClick: function bindClick() {
      var t = this;this.callActions("beforeBindClick", arguments), t.handler = function (e) {
        t.handleClick(e);
      }, n.on(t.el, "click", t.handler), this.callActions("afterBindClick", arguments);
    }, unbindClick: function unbindClick() {
      var t = this;this.callActions("beforeUnbindClick", arguments), n.off(t.el, "click", t.handler), t.handler = null, this.callActions("afterUnbindClick", arguments);
    }, handleClick: function handleClick(t) {
      var a = this,
          i = null,
          o = null,
          r = !1,
          s = void 0,
          l = {},
          c = null,
          u = [],
          f = -1;if (this.callActions("beforeHandleClick", arguments), this.pending = 0, o = a.bound[0], i = a.selector ? n.closestParent(t.target, o.config.selectors.control + a.selector, !0, o.dom.document) : a.el, !i) return void a.callActions("afterHandleClick", arguments);switch (a.type) {case "filter":
          l.filter = a.filter || i.getAttribute("data-filter");break;case "sort":
          l.sort = a.sort || i.getAttribute("data-sort");break;case "multimix":
          l.filter = a.filter || i.getAttribute("data-filter"), l.sort = a.sort || i.getAttribute("data-sort");break;case "toggle":
          l.filter = a.filter || i.getAttribute("data-toggle"), r = "live" === a.status ? n.hasClass(i, a.classNames.active) : "active" === a.status;}for (f = 0; f < a.bound.length; f++) {
        c = new _e.CommandMultimix(), n.extend(c, l), u.push(c);
      }for (u = a.callFilters("commandsHandleClick", u, arguments), a.pending = a.bound.length, f = 0; o = a.bound[f]; f++) {
        l = u[f], l && (o.lastClicked || (o.lastClicked = i), _e.events.fire("mixClick", o.dom.container, { state: o.state, instance: o, originalEvent: t, control: o.lastClicked }, o.dom.document), "function" == typeof o.config.callbacks.onMixClick && (s = o.config.callbacks.onMixClick.call(o.lastClicked, o.state, t, o), s === !1) || ("toggle" === a.type ? r ? o.toggleOff(l.filter) : o.toggleOn(l.filter) : o.multimix(l)));
      }this.callActions("afterHandleClick", arguments);
    }, update: function update(t, n) {
      var a = this,
          i = new _e.CommandMultimix();a.callActions("beforeUpdate", arguments), a.pending--, a.pending = Math.max(0, a.pending), a.pending > 0 || ("live" === a.status ? a.updateLive(t, n) : (i.sort = a.sort, i.filter = a.filter, a.callFilters("actionsUpdate", i, arguments), a.parseStatusChange(a.el, t, i, n)), a.callActions("afterUpdate", arguments));
    }, updateLive: function updateLive(t, n) {
      var a = this,
          i = null,
          o = null,
          r = null,
          s = -1;if (a.callActions("beforeUpdateLive", arguments), a.el) {
        for (i = a.el.querySelectorAll(a.selector), s = 0; r = i[s]; s++) {
          switch (o = new _e.CommandMultimix(), a.type) {case "filter":
              o.filter = r.getAttribute("data-filter");break;case "sort":
              o.sort = r.getAttribute("data-sort");break;case "multimix":
              o.filter = r.getAttribute("data-filter"), o.sort = r.getAttribute("data-sort");break;case "toggle":
              o.filter = r.getAttribute("data-toggle");}o = a.callFilters("actionsUpdateLive", o, arguments), a.parseStatusChange(r, t, o, n);
        }a.callActions("afterUpdateLive", arguments);
      }
    }, parseStatusChange: function parseStatusChange(t, e, n, a) {
      var i = this,
          o = "",
          r = "",
          s = -1;switch (i.callActions("beforeParseStatusChange", arguments), i.type) {case "filter":
          e.filter === n.filter ? i.renderStatus(t, "active") : i.renderStatus(t, "inactive");break;case "multimix":
          e.sort === n.sort && e.filter === n.filter ? i.renderStatus(t, "active") : i.renderStatus(t, "inactive");break;case "sort":
          e.sort.match(/:asc/g) && (o = e.sort.replace(/:asc/g, "")), e.sort === n.sort || o === n.sort ? i.renderStatus(t, "active") : i.renderStatus(t, "inactive");break;case "toggle":
          for (a.length < 1 && i.renderStatus(t, "inactive"), e.filter === n.filter && i.renderStatus(t, "active"), s = 0; s < a.length; s++) {
            if (r = a[s], r === n.filter) {
              i.renderStatus(t, "active");break;
            }i.renderStatus(t, "inactive");
          }}i.callActions("afterParseStatusChange", arguments);
    }, renderStatus: function renderStatus(t, e) {
      var a = this;switch (a.callActions("beforeRenderStatus", arguments), e) {case "active":
          n.addClass(t, a.classNames.active), n.removeClass(t, a.classNames.disabled), a.canDisable && (a.el.disabled = !1);break;case "inactive":
          n.removeClass(t, a.classNames.active), n.removeClass(t, a.classNames.disabled), a.canDisable && (a.el.disabled = !1);break;case "disabled":
          a.canDisable && (a.el.disabled = !0), n.addClass(t, a.classNames.disabled), n.removeClass(t, a.classNames.active);}"live" !== a.status && (a.status = e), a.callActions("afterRenderStatus", arguments);
    } }), _e.controls = [], _e.StyleData = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.x = 0, this.y = 0, this.top = 0, this.right = 0, this.bottom = 0, this.left = 0, this.width = 0, this.height = 0, this.marginRight = 0, this.marginBottom = 0, this.opacity = 0, this.scale = new _e.TransformData(), this.translateX = new _e.TransformData(), this.translateY = new _e.TransformData(), this.translateZ = new _e.TransformData(), this.rotateX = new _e.TransformData(), this.rotateY = new _e.TransformData(), this.rotateZ = new _e.TransformData(), this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.StyleData), _e.StyleData.prototype = Object.create(_e.Base.prototype), _e.StyleData.prototype.constructor = _e.StyleData, _e.TransformData = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.value = 0, this.unit = "", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.TransformData), _e.TransformData.prototype = Object.create(_e.Base.prototype), _e.TransformData.prototype.constructor = _e.TransformData, _e.TransformDefaults = function () {
    _e.StyleData.apply(this), this.callActions("beforeConstruct"), this.scale.value = .01, this.scale.unit = "", this.translateX.value = 20, this.translateX.unit = "px", this.translateY.value = 20, this.translateY.unit = "px", this.translateZ.value = 20, this.translateZ.unit = "px", this.rotateX.value = 90, this.rotateX.unit = "deg", this.rotateY.value = 90, this.rotateY.unit = "deg", this.rotateX.value = 90, this.rotateX.unit = "deg", this.rotateZ.value = 180, this.rotateZ.unit = "deg", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.TransformDefaults), _e.TransformDefaults.prototype = Object.create(_e.StyleData.prototype), _e.TransformDefaults.prototype.constructor = _e.TransformDefaults, _e.transformDefaults = new _e.TransformDefaults(), _e.EventDetail = function () {
    this.state = null, this.futureState = null, this.instance = null, this.originalEvent = null;
  }, _e.Events = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.mixStart = null, this.mixBusy = null, this.mixEnd = null, this.mixFail = null, this.mixClick = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.Events), _e.Events.prototype = Object.create(_e.Base.prototype), _e.Events.prototype.constructor = _e.Events, _e.Events.prototype.fire = function (t, a, i, o) {
    var r = this,
        s = null,
        l = new _e.EventDetail();if (r.callActions("beforeFire", arguments), "undefined" == typeof r[t]) throw new Error('Event type "' + t + '" not found.');l.state = new _e.State(), n.extend(l.state, i.state), i.futureState && (l.futureState = new _e.State(), n.extend(l.futureState, i.futureState)), l.instance = i.instance, i.originalEvent && (l.originalEvent = i.originalEvent), s = n.getCustomEvent(t, l, o), r.callFilters("eventFire", s, arguments), a.dispatchEvent(s);
  }, _e.events = new _e.Events(), _e.QueueItem = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.args = [], this.instruction = null, this.triggerElement = null, this.deferred = null, this.isToggling = !1, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.QueueItem), _e.QueueItem.prototype = Object.create(_e.Base.prototype), _e.QueueItem.prototype.constructor = _e.QueueItem, _e.Mixer = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.config = new _e.Config(), this.id = "", this.isBusy = !1, this.isToggling = !1, this.incPadding = !0, this.controls = [], this.targets = [], this.origOrder = [], this.cache = {}, this.toggleArray = [], this.targetsMoved = 0, this.targetsImmovable = 0, this.targetsBound = 0, this.targetsDone = 0, this.staggerDuration = 0, this.effectsIn = null, this.effectsOut = null, this.transformIn = [], this.transformOut = [], this.queue = [], this.state = null, this.lastOperation = null, this.lastClicked = null, this.userCallback = null, this.userDeferred = null, this.dom = new _e.MixerDom(), this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.Mixer), _e.Mixer.prototype = Object.create(_e.Base.prototype), n.extend(_e.Mixer.prototype, { constructor: _e.Mixer, attach: function attach(a, i, o, r) {
      var s = this,
          l = null,
          c = -1;for (s.callActions("beforeAttach", arguments), s.id = o, r && n.extend(s.config, r, !0, !0), s.sanitizeConfig(), s.cacheDom(a, i), s.config.layout.containerClassName && n.addClass(s.dom.container, s.config.layout.containerClassName), _e.features.has.transitions || (s.config.animation.enable = !1), "undefined" == typeof t.console && (s.config.debug.showWarnings = !1), s.config.data.uidKey && (s.config.controls.enable = !1), s.indexTargets(), s.state = s.getInitialState(), c = 0; l = s.lastOperation.toHide[c]; c++) {
        l.hide();
      }s.config.controls.enable && (s.initControls(), s.buildToggleArray(null, s.state), s.updateControls({ filter: s.state.activeFilter, sort: s.state.activeSort })), s.parseEffects(), s.callActions("afterAttach", arguments);
    }, sanitizeConfig: function sanitizeConfig() {
      var t = this;t.callActions("beforeSanitizeConfig", arguments), t.config.controls.scope = t.config.controls.scope.toLowerCase().trim(), t.config.controls.toggleLogic = t.config.controls.toggleLogic.toLowerCase().trim(), t.config.controls.toggleDefault = t.config.controls.toggleDefault.toLowerCase().trim(), t.config.animation.effects = t.config.animation.effects.trim(), t.callActions("afterSanitizeConfig", arguments);
    }, getInitialState: function getInitialState() {
      var t = this,
          n = new _e.State(),
          a = new _e.Operation();if (t.callActions("beforeGetInitialState", arguments), n.activeContainerClassName = t.config.layout.containerClassName, t.config.load.dataset) {
        if (!t.config.data.uidKey || "string" != typeof t.config.data.uidKey) throw new TypeError(_e.messages.errorConfigDataUidKeyNotSet());a.startDataset = a.newDataset = n.activeDataset = t.config.load.dataset.slice(), a.startContainerClassName = a.newContainerClassName = n.activeContainerClassName, a.show = t.targets.slice(), n = t.callFilters("stateGetInitialState", n, arguments);
      } else n.activeFilter = t.parseFilterArgs([t.config.load.filter]).command, n.activeSort = t.parseSortArgs([t.config.load.sort]).command, n.totalTargets = t.targets.length, n = t.callFilters("stateGetInitialState", n, arguments), n.activeSort.collection || n.activeSort.attribute || "random" === n.activeSort.order || "desc" === n.activeSort.order ? (a.newSort = n.activeSort, t.sortOperation(a), t.printSort(!1, a), t.targets = a.newOrder) : a.startOrder = a.newOrder = t.targets, a.startFilter = a.newFilter = n.activeFilter, a.startSort = a.newSort = n.activeSort, a.startContainerClassName = a.newContainerClassName = n.activeContainerClassName, "all" === a.newFilter.selector ? a.newFilter.selector = t.config.selectors.target : "none" === a.newFilter.selector && (a.newFilter.selector = "");return a = t.callFilters("operationGetInitialState", a, [n]), t.lastOperation = a, a.newFilter && t.filterOperation(a), n = t.buildState(a);
    }, cacheDom: function cacheDom(t, e) {
      var n = this;n.callActions("beforeCacheDom", arguments), n.dom.document = e, n.dom.body = n.dom.document.querySelector("body"), n.dom.container = t, n.dom.parent = t, n.callActions("afterCacheDom", arguments);
    }, indexTargets: function indexTargets() {
      var t = this,
          a = null,
          i = null,
          o = null,
          r = -1;if (t.callActions("beforeIndexTargets", arguments), t.dom.targets = t.config.layout.allowNestedTargets ? t.dom.container.querySelectorAll(t.config.selectors.target) : n.children(t.dom.container, t.config.selectors.target, t.dom.document), t.dom.targets = n.arrayFromList(t.dom.targets), t.targets = [], (o = t.config.load.dataset) && o.length !== t.dom.targets.length) throw new Error(_e.messages.errorDatasetPrerenderedMismatch());if (t.dom.targets.length) {
        for (r = 0; i = t.dom.targets[r]; r++) {
          a = new _e.Target(), a.init(i, t, o ? o[r] : void 0), a.isInDom = !0, t.targets.push(a);
        }t.dom.parent = t.dom.targets[0].parentElement === t.dom.container ? t.dom.container : t.dom.targets[0].parentElement;
      }t.origOrder = t.targets, t.callActions("afterIndexTargets", arguments);
    }, initControls: function initControls() {
      var t = this,
          n = "",
          a = null,
          i = null,
          o = null,
          r = null,
          s = null,
          l = -1,
          c = -1;switch (t.callActions("beforeInitControls", arguments), t.config.controls.scope) {case "local":
          o = t.dom.container;break;case "global":
          o = t.dom.document;break;default:
          throw new Error(_e.messages.errorConfigInvalidControlsScope());}for (l = 0; n = _e.controlDefinitions[l]; l++) {
        if (t.config.controls.live || n.live) {
          if (n.parent) {
            if (r = t.dom[n.parent], !r || r.length < 0) continue;"number" != typeof r.length && (r = [r]);
          } else r = [o];for (c = 0; i = r[c]; c++) {
            s = t.getControl(i, n.type, n.selector), t.controls.push(s);
          }
        } else for (a = o.querySelectorAll(t.config.selectors.control + n.selector), c = 0; i = a[c]; c++) {
          s = t.getControl(i, n.type, ""), s && t.controls.push(s);
        }
      }t.callActions("afterInitControls", arguments);
    }, getControl: function getControl(t, a, i) {
      var o = this,
          r = null,
          s = -1;if (o.callActions("beforeGetControl", arguments), !i) for (s = 0; r = _e.controls[s]; s++) {
        if (r.el === t && r.isBound(o)) return o.callFilters("controlGetControl", null, arguments);if (r.el === t && r.type === a && r.selector === i) return r.addBinding(o), o.callFilters("controlGetControl", r, arguments);
      }return r = new _e.Control(), r.init(t, a, i), r.classNames.base = n.getClassname(o.config.classNames, a), r.classNames.active = n.getClassname(o.config.classNames, a, o.config.classNames.modifierActive), r.classNames.disabled = n.getClassname(o.config.classNames, a, o.config.classNames.modifierDisabled), r.addBinding(o), o.callFilters("controlGetControl", r, arguments);
    }, getToggleSelector: function getToggleSelector() {
      var t = this,
          e = "or" === t.config.controls.toggleLogic ? ", " : "",
          a = "";return t.callActions("beforeGetToggleSelector", arguments), t.toggleArray = n.clean(t.toggleArray), a = t.toggleArray.join(e), "" === a && (a = t.config.controls.toggleDefault), t.callFilters("selectorGetToggleSelector", a, arguments);
    }, buildToggleArray: function buildToggleArray(t, e) {
      var a = this,
          i = "";if (a.callActions("beforeBuildToggleArray", arguments), t && t.filter) i = t.filter.selector.replace(/\s/g, "");else {
        if (!e) return;i = e.activeFilter.selector.replace(/\s/g, "");
      }i !== a.config.selectors.target && "all" !== i || (i = ""), "or" === a.config.controls.toggleLogic ? a.toggleArray = i.split(",") : a.toggleArray = a.splitCompoundSelector(i), a.toggleArray = n.clean(a.toggleArray), a.callActions("afterBuildToggleArray", arguments);
    }, splitCompoundSelector: function splitCompoundSelector(t) {
      var e = t.split(/([\.\[])/g),
          n = [],
          a = "",
          i = -1;for ("" === e[0] && e.shift(), i = 0; i < e.length; i++) {
        i % 2 === 0 && (a = ""), a += e[i], i % 2 !== 0 && n.push(a);
      }return n;
    }, updateControls: function updateControls(t) {
      var a = this,
          i = null,
          o = new _e.CommandMultimix(),
          r = -1;for (a.callActions("beforeUpdateControls", arguments), t.filter ? o.filter = t.filter.selector : o.filter = a.state.activeFilter.selector, t.sort ? o.sort = a.buildSortString(t.sort) : o.sort = a.buildSortString(a.state.activeSort), o.filter === a.config.selectors.target && (o.filter = "all"), "" === o.filter && (o.filter = "none"), n.freeze(o), r = 0; i = a.controls[r]; r++) {
        i.update(o, a.toggleArray);
      }a.callActions("afterUpdateControls", arguments);
    }, buildSortString: function buildSortString(t) {
      var e = this,
          n = "";return n += t.sortString, t.next && (n += " " + e.buildSortString(t.next)), n;
    }, insertTargets: function insertTargets(t, a) {
      var i = this,
          o = null,
          r = -1,
          s = null,
          l = null,
          c = null,
          u = -1;if (i.callActions("beforeInsertTargets", arguments), "undefined" == typeof t.index && (t.index = 0), o = i.getNextSibling(t.index, t.sibling, t.position), s = i.dom.document.createDocumentFragment(), r = o ? n.index(o, i.config.selectors.target) : i.targets.length, t.collection) {
        for (u = 0; c = t.collection[u]; u++) {
          if (i.dom.targets.indexOf(c) > -1) throw new Error(_e.messages.errorInsertPreexistingElement());c.style.display = "none", s.appendChild(c), s.appendChild(i.dom.document.createTextNode(" ")), n.isElement(c, i.dom.document) && c.matches(i.config.selectors.target) && (l = new _e.Target(), l.init(c, i), l.isInDom = !0, i.targets.splice(r, 0, l), r++);
        }i.dom.parent.insertBefore(s, o);
      }a.startOrder = i.origOrder = i.targets, i.callActions("afterInsertTargets", arguments);
    }, getNextSibling: function getNextSibling(t, e, n) {
      var a = this,
          i = null;return t = Math.max(t, 0), e && "before" === n ? i = e : e && "after" === n ? i = e.nextElementSibling || null : a.targets.length > 0 && "undefined" != typeof t ? i = t < a.targets.length || !a.targets.length ? a.targets[t].dom.el : a.targets[a.targets.length - 1].dom.el.nextElementSibling : 0 === a.targets.length && a.dom.parent.children.length > 0 && (a.config.layout.siblingAfter ? i = a.config.layout.siblingAfter : a.config.layout.siblingBefore ? i = a.config.layout.siblingBefore.nextElementSibling : a.dom.parent.children[0]), a.callFilters("elementGetNextSibling", i, arguments);
    }, filterOperation: function filterOperation(t) {
      var e = this,
          n = !1,
          a = -1,
          i = "",
          o = null,
          r = -1;for (e.callActions("beforeFilterOperation", arguments), i = t.newFilter.action, r = 0; o = t.newOrder[r]; r++) {
        n = t.newFilter.collection ? t.newFilter.collection.indexOf(o.dom.el) > -1 : "" !== t.newFilter.selector && o.dom.el.matches(t.newFilter.selector), e.evaluateHideShow(n, o, i, t);
      }if (t.toRemove.length) for (r = 0; o = t.show[r]; r++) {
        t.toRemove.indexOf(o) > -1 && (t.show.splice(r, 1), (a = t.toShow.indexOf(o)) > -1 && t.toShow.splice(a, 1), t.toHide.push(o), t.hide.push(o), r--);
      }t.matching = t.show.slice(), 0 === t.show.length && "" !== t.newFilter.selector && 0 !== e.targets.length && (t.hasFailed = !0), e.callActions("afterFilterOperation", arguments);
    }, evaluateHideShow: function evaluateHideShow(t, e, n, a) {
      var i = this,
          o = !1,
          r = Array.prototype.slice.call(arguments, 1);o = i.callFilters("testResultEvaluateHideShow", t, r), i.callActions("beforeEvaluateHideShow", arguments), o === !0 && "show" === n || o === !1 && "hide" === n ? (a.show.push(e), !e.isShown && a.toShow.push(e)) : (a.hide.push(e), e.isShown && a.toHide.push(e)), i.callActions("afterEvaluateHideShow", arguments);
    }, sortOperation: function sortOperation(t) {
      var a = this,
          i = [],
          o = null,
          r = null,
          s = -1;if (a.callActions("beforeSortOperation", arguments), t.startOrder = a.targets, t.newSort.collection) {
        for (i = [], s = 0; r = t.newSort.collection[s]; s++) {
          if (a.dom.targets.indexOf(r) < 0) throw new Error(_e.messages.errorSortNonExistentElement());o = new _e.Target(), o.init(r, a), o.isInDom = !0, i.push(o);
        }t.newOrder = i;
      } else "random" === t.newSort.order ? t.newOrder = n.arrayShuffle(t.startOrder) : "" === t.newSort.attribute ? (t.newOrder = a.origOrder.slice(), "desc" === t.newSort.order && t.newOrder.reverse()) : (t.newOrder = t.startOrder.slice(), t.newOrder.sort(function (e, n) {
        return a.compare(e, n, t.newSort);
      }));n.isEqualArray(t.newOrder, t.startOrder) && (t.willSort = !1), a.callActions("afterSortOperation", arguments);
    }, compare: function compare(t, e, n) {
      var a = this,
          i = n.order,
          o = a.getAttributeValue(t, n.attribute),
          r = a.getAttributeValue(e, n.attribute);return isNaN(1 * o) || isNaN(1 * r) ? (o = o.toLowerCase(), r = r.toLowerCase()) : (o = 1 * o, r = 1 * r), o < r ? "asc" === i ? -1 : 1 : o > r ? "asc" === i ? 1 : -1 : o === r && n.next ? a.compare(t, e, n.next) : 0;
    }, getAttributeValue: function getAttributeValue(t, n) {
      var a = this,
          i = "";return i = t.dom.el.getAttribute("data-" + n), null === i && a.config.debug.showWarnings && console.warn(_e.messages.warningInconsistentSortingAttributes({ attribute: "data-" + n })), a.callFilters("valueGetAttributeValue", i || 0, arguments);
    }, printSort: function printSort(e, a) {
      var i = this,
          o = e ? a.newOrder : a.startOrder,
          r = e ? a.startOrder : a.newOrder,
          s = o.length ? o[o.length - 1].dom.el.nextElementSibling : null,
          l = t.document.createDocumentFragment(),
          c = null,
          u = null,
          f = null,
          h = -1;for (i.callActions("beforePrintSort", arguments), h = 0; u = o[h]; h++) {
        f = u.dom.el, "absolute" !== f.style.position && (n.removeWhitespace(f.previousSibling), f.parentElement.removeChild(f));
      }for (c = s ? s.previousSibling : i.dom.parent.lastChild, c && "#text" === c.nodeName && n.removeWhitespace(c), h = 0; u = r[h]; h++) {
        f = u.dom.el, n.isElement(l.lastChild) && l.appendChild(t.document.createTextNode(" ")), l.appendChild(f);
      }i.dom.parent.firstChild && i.dom.parent.firstChild !== s && l.insertBefore(t.document.createTextNode(" "), l.childNodes[0]), s ? (l.appendChild(t.document.createTextNode(" ")), i.dom.parent.insertBefore(l, s)) : i.dom.parent.appendChild(l), i.callActions("afterPrintSort", arguments);
    }, parseSortString: function parseSortString(t, a) {
      var i = this,
          o = t.split(" "),
          r = a,
          s = [],
          l = -1;for (l = 0; l < o.length; l++) {
        switch (s = o[l].split(":"), r.sortString = o[l], r.attribute = n.dashCase(s[0]), r.order = s[1] || "asc", r.attribute) {case "default":
            r.attribute = "";break;case "random":
            r.attribute = "", r.order = "random";}if (!r.attribute || "random" === r.order) break;l < o.length - 1 && (r.next = new _e.CommandSort(), n.freeze(r), r = r.next);
      }return i.callFilters("commandsParseSort", a, arguments);
    }, parseEffects: function parseEffects() {
      var t = this,
          n = "",
          a = t.config.animation.effectsIn || t.config.animation.effects,
          i = t.config.animation.effectsOut || t.config.animation.effects;t.callActions("beforeParseEffects", arguments), t.effectsIn = new _e.StyleData(), t.effectsOut = new _e.StyleData(), t.transformIn = [], t.transformOut = [], t.effectsIn.opacity = t.effectsOut.opacity = 1, t.parseEffect("fade", a, t.effectsIn, t.transformIn), t.parseEffect("fade", i, t.effectsOut, t.transformOut, !0);for (n in _e.transformDefaults) {
        _e.transformDefaults[n] instanceof _e.TransformData && (t.parseEffect(n, a, t.effectsIn, t.transformIn), t.parseEffect(n, i, t.effectsOut, t.transformOut, !0));
      }t.parseEffect("stagger", a, t.effectsIn, t.transformIn), t.parseEffect("stagger", i, t.effectsOut, t.transformOut, !0), t.callActions("afterParseEffects", arguments);
    }, parseEffect: function parseEffect(t, n, a, i, o) {
      var r = this,
          s = /\(([^)]+)\)/,
          l = -1,
          c = "",
          u = [],
          f = "",
          h = ["%", "px", "em", "rem", "vh", "vw", "deg"],
          d = "",
          m = -1;if (r.callActions("beforeParseEffect", arguments), "string" != typeof n) throw new TypeError(_e.messages.errorConfigInvalidAnimationEffects());if (n.indexOf(t) < 0) return void ("stagger" === t && (r.staggerDuration = 0));switch (l = n.indexOf(t + "("), l > -1 && (c = n.substring(l), u = s.exec(c), f = u[1]), t) {case "fade":
          a.opacity = f ? parseFloat(f) : 0;break;case "stagger":
          r.staggerDuration = f ? parseFloat(f) : 100;break;default:
          if (o && r.config.animation.reverseOut && "scale" !== t ? a[t].value = (f ? parseFloat(f) : _e.transformDefaults[t].value) * -1 : a[t].value = f ? parseFloat(f) : _e.transformDefaults[t].value, f) {
            for (m = 0; d = h[m]; m++) {
              if (f.indexOf(d) > -1) {
                a[t].unit = d;break;
              }
            }
          } else a[t].unit = _e.transformDefaults[t].unit;i.push(t + "(" + a[t].value + a[t].unit + ")");}r.callActions("afterParseEffect", arguments);
    }, buildState: function buildState(t) {
      var n = this,
          a = new _e.State(),
          i = null,
          o = -1;for (n.callActions("beforeBuildState", arguments), o = 0; i = n.targets[o]; o++) {
        (!t.toRemove.length || t.toRemove.indexOf(i) < 0) && a.targets.push(i.dom.el);
      }for (o = 0; i = t.matching[o]; o++) {
        a.matching.push(i.dom.el);
      }for (o = 0; i = t.show[o]; o++) {
        a.show.push(i.dom.el);
      }for (o = 0; i = t.hide[o]; o++) {
        (!t.toRemove.length || t.toRemove.indexOf(i) < 0) && a.hide.push(i.dom.el);
      }return a.id = n.id, a.container = n.dom.container, a.activeFilter = t.newFilter, a.activeSort = t.newSort, a.activeDataset = t.newDataset, a.activeContainerClassName = t.newContainerClassName, a.hasFailed = t.hasFailed, a.totalTargets = n.targets.length, a.totalShow = t.show.length, a.totalHide = t.hide.length, a.totalMatching = t.matching.length, a.triggerElement = t.triggerElement, n.callFilters("stateBuildState", a, arguments);
    }, goMix: function goMix(a, i) {
      var o = this,
          r = null;return o.callActions("beforeGoMix", arguments), o.config.animation.duration && o.config.animation.effects && n.isVisible(o.dom.container) || (a = !1), i.toShow.length || i.toHide.length || i.willSort || i.willChangeLayout || (a = !1), i.startState.show.length || i.show.length || (a = !1), _e.events.fire("mixStart", o.dom.container, { state: i.startState, futureState: i.newState, instance: o }, o.dom.document), "function" == typeof o.config.callbacks.onMixStart && o.config.callbacks.onMixStart.call(o.dom.container, i.startState, i.newState, o), n.removeClass(o.dom.container, n.getClassname(o.config.classNames, "container", o.config.classNames.modifierFailed)), r = o.userDeferred ? o.userDeferred : o.userDeferred = n.defer(_e.libraries), o.isBusy = !0, a && _e.features.has.transitions ? (t.pageYOffset !== i.docState.scrollTop && t.scrollTo(i.docState.scrollLeft, i.docState.scrollTop), o.config.animation.applyPerspective && (o.dom.parent.style[_e.features.perspectiveProp] = o.config.animation.perspectiveDistance, o.dom.parent.style[_e.features.perspectiveOriginProp] = o.config.animation.perspectiveOrigin), o.config.animation.animateResizeContainer && i.startHeight !== i.newHeight && i.viewportDeltaY !== i.startHeight - i.newHeight && (o.dom.parent.style.height = i.startHeight + "px"), o.config.animation.animateResizeContainer && i.startWidth !== i.newWidth && i.viewportDeltaX !== i.startWidth - i.newWidth && (o.dom.parent.style.width = i.startWidth + "px"), i.startHeight === i.newHeight && (o.dom.parent.style.height = i.startHeight + "px"), i.startWidth === i.newWidth && (o.dom.parent.style.width = i.startWidth + "px"), i.startHeight === i.newHeight && i.startWidth === i.newWidth && (o.dom.parent.style.overflow = "hidden"), requestAnimationFrame(function () {
        o.moveTargets(i);
      }), o.callFilters("promiseGoMix", r.promise, arguments)) : (o.config.debug.fauxAsync ? setTimeout(function () {
        o.cleanUp(i);
      }, o.config.animation.duration) : o.cleanUp(i), o.callFilters("promiseGoMix", r.promise, arguments));
    }, getStartMixData: function getStartMixData(n) {
      var a = this,
          i = t.getComputedStyle(a.dom.parent),
          o = a.dom.parent.getBoundingClientRect(),
          r = null,
          s = {},
          l = -1,
          c = i[_e.features.boxSizingProp];for (a.incPadding = "border-box" === c, a.callActions("beforeGetStartMixData", arguments), l = 0; r = n.show[l]; l++) {
        s = r.getPosData(), n.showPosData[l] = { startPosData: s };
      }for (l = 0; r = n.toHide[l]; l++) {
        s = r.getPosData(), n.toHidePosData[l] = { startPosData: s };
      }n.startX = o.left, n.startY = o.top, n.startHeight = a.incPadding ? o.height : o.height - parseFloat(i.paddingTop) - parseFloat(i.paddingBottom) - parseFloat(i.borderTop) - parseFloat(i.borderBottom), n.startWidth = a.incPadding ? o.width : o.width - parseFloat(i.paddingLeft) - parseFloat(i.paddingRight) - parseFloat(i.borderLeft) - parseFloat(i.borderRight), a.callActions("afterGetStartMixData", arguments);
    }, setInter: function setInter(t) {
      var e = this,
          a = null,
          i = -1;for (e.callActions("beforeSetInter", arguments), e.config.animation.clampHeight && (e.dom.parent.style.height = t.startHeight + "px", e.dom.parent.style.overflow = "hidden"), e.config.animation.clampWidth && (e.dom.parent.style.width = t.startWidth + "px", e.dom.parent.style.overflow = "hidden"), i = 0; a = t.toShow[i]; i++) {
        a.show();
      }t.willChangeLayout && (n.removeClass(e.dom.container, t.startContainerClassName), n.addClass(e.dom.container, t.newContainerClassName)), e.callActions("afterSetInter", arguments);
    }, getInterMixData: function getInterMixData(t) {
      var e = this,
          n = null,
          a = -1;for (e.callActions("beforeGetInterMixData", arguments), a = 0; n = t.show[a]; a++) {
        t.showPosData[a].interPosData = n.getPosData();
      }for (a = 0; n = t.toHide[a]; a++) {
        t.toHidePosData[a].interPosData = n.getPosData();
      }e.callActions("afterGetInterMixData", arguments);
    }, setFinal: function setFinal(t) {
      var e = this,
          n = null,
          a = -1;for (e.callActions("beforeSetFinal", arguments), t.willSort && e.printSort(!1, t), a = 0; n = t.toHide[a]; a++) {
        n.hide();
      }e.callActions("afterSetFinal", arguments);
    }, getFinalMixData: function getFinalMixData(e) {
      var a = this,
          i = null,
          o = null,
          r = null,
          s = -1;for (a.callActions("beforeGetFinalMixData", arguments), s = 0; r = e.show[s]; s++) {
        e.showPosData[s].finalPosData = r.getPosData();
      }for (s = 0; r = e.toHide[s]; s++) {
        e.toHidePosData[s].finalPosData = r.getPosData();
      }for ((a.config.animation.clampHeight || a.config.animation.clampWidth) && (a.dom.parent.style.height = a.dom.parent.style.width = a.dom.parent.style.overflow = ""), a.incPadding || (i = t.getComputedStyle(a.dom.parent)), o = a.dom.parent.getBoundingClientRect(), e.newX = o.left, e.newY = o.top, e.newHeight = a.incPadding ? o.height : o.height - parseFloat(i.paddingTop) - parseFloat(i.paddingBottom) - parseFloat(i.borderTop) - parseFloat(i.borderBottom), e.newWidth = a.incPadding ? o.width : o.width - parseFloat(i.paddingLeft) - parseFloat(i.paddingRight) - parseFloat(i.borderLeft) - parseFloat(i.borderRight), e.viewportDeltaX = e.docState.viewportWidth - this.dom.document.documentElement.clientWidth, e.viewportDeltaY = e.docState.viewportHeight - this.dom.document.documentElement.clientHeight, e.willSort && a.printSort(!0, e), s = 0; r = e.toShow[s]; s++) {
        r.hide();
      }for (s = 0; r = e.toHide[s]; s++) {
        r.show();
      }e.willChangeLayout && (n.removeClass(a.dom.container, e.newContainerClassName), n.addClass(a.dom.container, a.config.layout.containerClassName)), a.callActions("afterGetFinalMixData", arguments);
    }, getTweenData: function getTweenData(t) {
      var n = this,
          a = null,
          i = null,
          o = Object.getOwnPropertyNames(n.effectsIn),
          r = "",
          s = null,
          l = -1,
          c = -1,
          u = -1,
          f = -1;for (n.callActions("beforeGetTweenData", arguments), u = 0; a = t.show[u]; u++) {
        for (i = t.showPosData[u], i.posIn = new _e.StyleData(), i.posOut = new _e.StyleData(), i.tweenData = new _e.StyleData(), a.isShown ? (i.posIn.x = i.startPosData.x - i.interPosData.x, i.posIn.y = i.startPosData.y - i.interPosData.y) : i.posIn.x = i.posIn.y = 0, i.posOut.x = i.finalPosData.x - i.interPosData.x, i.posOut.y = i.finalPosData.y - i.interPosData.y, i.posIn.opacity = a.isShown ? 1 : n.effectsIn.opacity, i.posOut.opacity = 1, i.tweenData.opacity = i.posOut.opacity - i.posIn.opacity, a.isShown || n.config.animation.nudge || (i.posIn.x = i.posOut.x, i.posIn.y = i.posOut.y), i.tweenData.x = i.posOut.x - i.posIn.x, i.tweenData.y = i.posOut.y - i.posIn.y, n.config.animation.animateResizeTargets && (i.posIn.width = i.startPosData.width, i.posIn.height = i.startPosData.height, l = (i.startPosData.width || i.finalPosData.width) - i.interPosData.width, i.posIn.marginRight = i.startPosData.marginRight - l, c = (i.startPosData.height || i.finalPosData.height) - i.interPosData.height, i.posIn.marginBottom = i.startPosData.marginBottom - c, i.posOut.width = i.finalPosData.width, i.posOut.height = i.finalPosData.height, l = (i.finalPosData.width || i.startPosData.width) - i.interPosData.width, i.posOut.marginRight = i.finalPosData.marginRight - l, c = (i.finalPosData.height || i.startPosData.height) - i.interPosData.height, i.posOut.marginBottom = i.finalPosData.marginBottom - c, i.tweenData.width = i.posOut.width - i.posIn.width, i.tweenData.height = i.posOut.height - i.posIn.height, i.tweenData.marginRight = i.posOut.marginRight - i.posIn.marginRight, i.tweenData.marginBottom = i.posOut.marginBottom - i.posIn.marginBottom), f = 0; r = o[f]; f++) {
          s = n.effectsIn[r], s instanceof _e.TransformData && s.value && (i.posIn[r].value = s.value, i.posOut[r].value = 0, i.tweenData[r].value = i.posOut[r].value - i.posIn[r].value, i.posIn[r].unit = i.posOut[r].unit = i.tweenData[r].unit = s.unit);
        }
      }for (u = 0; a = t.toHide[u]; u++) {
        for (i = t.toHidePosData[u], i.posIn = new _e.StyleData(), i.posOut = new _e.StyleData(), i.tweenData = new _e.StyleData(), i.posIn.x = a.isShown ? i.startPosData.x - i.interPosData.x : 0, i.posIn.y = a.isShown ? i.startPosData.y - i.interPosData.y : 0, i.posOut.x = n.config.animation.nudge ? 0 : i.posIn.x, i.posOut.y = n.config.animation.nudge ? 0 : i.posIn.y, i.tweenData.x = i.posOut.x - i.posIn.x, i.tweenData.y = i.posOut.y - i.posIn.y, n.config.animation.animateResizeTargets && (i.posIn.width = i.startPosData.width, i.posIn.height = i.startPosData.height, l = i.startPosData.width - i.interPosData.width, i.posIn.marginRight = i.startPosData.marginRight - l, c = i.startPosData.height - i.interPosData.height, i.posIn.marginBottom = i.startPosData.marginBottom - c), i.posIn.opacity = 1, i.posOut.opacity = n.effectsOut.opacity, i.tweenData.opacity = i.posOut.opacity - i.posIn.opacity, f = 0; r = o[f]; f++) {
          s = n.effectsOut[r], s instanceof _e.TransformData && s.value && (i.posIn[r].value = 0, i.posOut[r].value = s.value, i.tweenData[r].value = i.posOut[r].value - i.posIn[r].value, i.posIn[r].unit = i.posOut[r].unit = i.tweenData[r].unit = s.unit);
        }
      }n.callActions("afterGetTweenData", arguments);
    }, moveTargets: function moveTargets(t) {
      var a = this,
          i = null,
          o = null,
          r = null,
          s = "",
          l = !1,
          c = -1,
          u = -1,
          f = a.checkProgress.bind(a);for (a.callActions("beforeMoveTargets", arguments), u = 0; i = t.show[u]; u++) {
        o = new _e.IMoveData(), r = t.showPosData[u], s = i.isShown ? "none" : "show", l = a.willTransition(s, t.hasEffect, r.posIn, r.posOut), l && c++, i.show(), o.posIn = r.posIn, o.posOut = r.posOut, o.statusChange = s, o.staggerIndex = c, o.operation = t, o.callback = l ? f : null, i.move(o);
      }for (u = 0; i = t.toHide[u]; u++) {
        r = t.toHidePosData[u], o = new _e.IMoveData(), s = "hide", l = a.willTransition(s, r.posIn, r.posOut), o.posIn = r.posIn, o.posOut = r.posOut, o.statusChange = s, o.staggerIndex = u, o.operation = t, o.callback = l ? f : null, i.move(o);
      }a.config.animation.animateResizeContainer && (a.dom.parent.style[_e.features.transitionProp] = "height " + a.config.animation.duration + "ms ease, width " + a.config.animation.duration + "ms ease ", requestAnimationFrame(function () {
        t.startHeight !== t.newHeight && t.viewportDeltaY !== t.startHeight - t.newHeight && (a.dom.parent.style.height = t.newHeight + "px"), t.startWidth !== t.newWidth && t.viewportDeltaX !== t.startWidth - t.newWidth && (a.dom.parent.style.width = t.newWidth + "px");
      })), t.willChangeLayout && (n.removeClass(a.dom.container, a.config.layout.ContainerClassName), n.addClass(a.dom.container, t.newContainerClassName)), a.callActions("afterMoveTargets", arguments);
    }, hasEffect: function hasEffect() {
      var t = this,
          e = ["scale", "translateX", "translateY", "translateZ", "rotateX", "rotateY", "rotateZ"],
          n = "",
          a = null,
          i = !1,
          o = -1,
          r = -1;if (1 !== t.effectsIn.opacity) return t.callFilters("resultHasEffect", !0, arguments);for (r = 0; n = e[r]; r++) {
        if (a = t.effectsIn[n], o = "undefined" !== a.value ? a.value : a, 0 !== o) {
          i = !0;break;
        }
      }return t.callFilters("resultHasEffect", i, arguments);
    }, willTransition: function willTransition(t, e, a, i) {
      var o = this,
          r = !1;return r = !!n.isVisible(o.dom.container) && (!!("none" !== t && e || a.x !== i.x || a.y !== i.y) || !!o.config.animation.animateResizeTargets && (a.width !== i.width || a.height !== i.height || a.marginRight !== i.marginRight || a.marginTop !== i.marginTop)), o.callFilters("resultWillTransition", r, arguments);
    }, checkProgress: function checkProgress(t) {
      var e = this;e.targetsDone++, e.targetsBound === e.targetsDone && e.cleanUp(t);
    }, cleanUp: function cleanUp(t) {
      var a = this,
          i = null,
          o = null,
          r = null,
          s = null,
          l = -1;for (a.callActions("beforeCleanUp", arguments), a.targetsMoved = a.targetsImmovable = a.targetsBound = a.targetsDone = 0, l = 0; i = t.show[l]; l++) {
        i.cleanUp(), i.show();
      }for (l = 0; i = t.toHide[l]; l++) {
        i.cleanUp(), i.hide();
      }if (t.willSort && a.printSort(!1, t), a.dom.parent.style[_e.features.transitionProp] = a.dom.parent.style.height = a.dom.parent.style.width = a.dom.parent.style.overflow = a.dom.parent.style[_e.features.perspectiveProp] = a.dom.parent.style[_e.features.perspectiveOriginProp] = "", t.willChangeLayout && (n.removeClass(a.dom.container, t.startContainerClassName), n.addClass(a.dom.container, t.newContainerClassName)), t.toRemove.length) {
        for (l = 0; i = a.targets[l]; l++) {
          t.toRemove.indexOf(i) > -1 && ((o = i.dom.el.previousSibling) && "#text" === o.nodeName && (r = i.dom.el.nextSibling) && "#text" === r.nodeName && n.removeWhitespace(o), t.willSort || a.dom.parent.removeChild(i.dom.el), a.targets.splice(l, 1), i.isInDom = !1, l--);
        }a.origOrder = a.targets;
      }t.willSort && (a.targets = t.newOrder), a.state = t.newState, a.lastOperation = t, a.dom.targets = a.state.targets, _e.events.fire("mixEnd", a.dom.container, { state: a.state, instance: a }, a.dom.document), "function" == typeof a.config.callbacks.onMixEnd && a.config.callbacks.onMixEnd.call(a.dom.container, a.state, a), t.hasFailed && (_e.events.fire("mixFail", a.dom.container, { state: a.state, instance: a }, a.dom.document), "function" == typeof a.config.callbacks.onMixFail && a.config.callbacks.onMixFail.call(a.dom.container, a.state, a), n.addClass(a.dom.container, n.getClassname(a.config.classNames, "container", a.config.classNames.modifierFailed))), "function" == typeof a.userCallback && a.userCallback.call(a.dom.container, a.state, a), "function" == typeof a.userDeferred.resolve && a.userDeferred.resolve(a.state), a.userCallback = null, a.userDeferred = null, a.lastClicked = null, a.isToggling = !1, a.isBusy = !1, a.queue.length && (a.callActions("beforeReadQueueCleanUp", arguments), s = a.queue.shift(), a.userDeferred = s.deferred, a.isToggling = s.isToggling, a.lastClicked = s.triggerElement, s.instruction.command instanceof _e.CommandMultimix ? a.multimix.apply(a, s.args) : a.dataset.apply(a, s.args)), a.callActions("afterCleanUp", arguments);
    }, parseMultimixArgs: function parseMultimixArgs(t) {
      var a = this,
          i = new _e.UserInstruction(),
          o = null,
          r = -1;for (i.animate = a.config.animation.enable, i.command = new _e.CommandMultimix(), r = 0; r < t.length; r++) {
        o = t[r], null !== o && ("object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) ? n.extend(i.command, o) : "boolean" == typeof o ? i.animate = o : "function" == typeof o && (i.callback = o));
      }return !i.command.insert || i.command.insert instanceof _e.CommandInsert || (i.command.insert = a.parseInsertArgs([i.command.insert]).command), !i.command.remove || i.command.remove instanceof _e.CommandRemove || (i.command.remove = a.parseRemoveArgs([i.command.remove]).command), !i.command.filter || i.command.filter instanceof _e.CommandFilter || (i.command.filter = a.parseFilterArgs([i.command.filter]).command), !i.command.sort || i.command.sort instanceof _e.CommandSort || (i.command.sort = a.parseSortArgs([i.command.sort]).command), !i.command.changeLayout || i.command.changeLayout instanceof _e.CommandChangeLayout || (i.command.changeLayout = a.parseChangeLayoutArgs([i.command.changeLayout]).command), i = a.callFilters("instructionParseMultimixArgs", i, arguments), n.freeze(i), i;
    }, parseFilterArgs: function parseFilterArgs(t) {
      var a = this,
          i = new _e.UserInstruction(),
          o = null,
          r = -1;for (i.animate = a.config.animation.enable, i.command = new _e.CommandFilter(), r = 0; r < t.length; r++) {
        o = t[r], "string" == typeof o ? i.command.selector = o : null === o ? i.command.collection = [] : "object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) && n.isElement(o, a.dom.document) ? i.command.collection = [o] : "object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) && "undefined" != typeof o.length ? i.command.collection = n.arrayFromList(o) : "object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) ? n.extend(i.command, o) : "boolean" == typeof o ? i.animate = o : "function" == typeof o && (i.callback = o);
      }if (i.command.selector && i.command.collection) throw new Error(_e.messages.errorFilterInvalidArguments());return i = a.callFilters("instructionParseFilterArgs", i, arguments), n.freeze(i), i;
    }, parseSortArgs: function parseSortArgs(t) {
      var a = this,
          i = new _e.UserInstruction(),
          o = null,
          r = "",
          s = -1;for (i.animate = a.config.animation.enable, i.command = new _e.CommandSort(), s = 0; s < t.length; s++) {
        if (o = t[s], null !== o) switch (typeof o === 'undefined' ? 'undefined' : _typeof(o)) {case "string":
            r = o;break;case "object":
            o.length && (i.command.collection = n.arrayFromList(o));break;case "boolean":
            i.animate = o;break;case "function":
            i.callback = o;}
      }return r && (i.command = a.parseSortString(r, i.command)), i = a.callFilters("instructionParseSortArgs", i, arguments), n.freeze(i), i;
    }, parseInsertArgs: function parseInsertArgs(t) {
      var a = this,
          i = new _e.UserInstruction(),
          o = null,
          r = -1;for (i.animate = a.config.animation.enable, i.command = new _e.CommandInsert(), r = 0; r < t.length; r++) {
        o = t[r], null !== o && ("number" == typeof o ? i.command.index = o : "string" == typeof o && ["before", "after"].indexOf(o) > -1 ? i.command.position = o : "string" == typeof o ? i.command.collection = n.arrayFromList(n.createElement(o).childNodes) : "object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) && n.isElement(o, a.dom.document) ? i.command.collection.length ? i.command.sibling = o : i.command.collection = [o] : "object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) && o.length ? i.command.collection.length ? i.command.sibling = o[0] : i.command.collection = o : "object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) && o.childNodes && o.childNodes.length ? i.command.collection.length ? i.command.sibling = o.childNodes[0] : i.command.collection = n.arrayFromList(o.childNodes) : "object" == (typeof o === 'undefined' ? 'undefined' : _typeof(o)) ? n.extend(i.command, o) : "boolean" == typeof o ? i.animate = o : "function" == typeof o && (i.callback = o));
      }if (i.command.index && i.command.sibling) throw new Error(_e.messages.errorInsertInvalidArguments());return !i.command.collection.length && a.config.debug.showWarnings && console.warn(_e.messages.warningInsertNoElements()), i = a.callFilters("instructionParseInsertArgs", i, arguments), n.freeze(i), i;
    }, parseRemoveArgs: function parseRemoveArgs(t) {
      var a = this,
          i = new _e.UserInstruction(),
          o = null,
          r = null,
          s = -1;for (i.animate = a.config.animation.enable, i.command = new _e.CommandRemove(), s = 0; s < t.length; s++) {
        if (r = t[s], null !== r) switch (typeof r === 'undefined' ? 'undefined' : _typeof(r)) {case "number":
            a.targets[r] && (i.command.targets[0] = a.targets[r]);break;case "string":
            i.command.collection = n.arrayFromList(a.dom.parent.querySelectorAll(r));break;case "object":
            r && r.length ? i.command.collection = r : n.isElement(r, a.dom.document) ? i.command.collection = [r] : n.extend(i.command, r);break;case "boolean":
            i.animate = r;break;case "function":
            i.callback = r;}
      }if (i.command.collection.length) for (s = 0; o = a.targets[s]; s++) {
        i.command.collection.indexOf(o.dom.el) > -1 && i.command.targets.push(o);
      }return !i.command.targets.length && a.config.debug.showWarnings && console.warn(_e.messages.warningRemoveNoElements()), n.freeze(i), i;
    }, parseDatasetArgs: function parseDatasetArgs(t) {
      var a = this,
          i = new _e.UserInstruction(),
          o = null,
          r = -1;for (i.animate = a.config.animation.enable, i.command = new _e.CommandDataset(), r = 0; r < t.length; r++) {
        if (o = t[r], null !== o) switch (typeof o === 'undefined' ? 'undefined' : _typeof(o)) {case "object":
            Array.isArray(o) || "number" == typeof o.length ? i.command.dataset = o : n.extend(i.command, o);break;case "boolean":
            i.animate = o;break;case "function":
            i.callback = o;}
      }return n.freeze(i), i;
    }, parseChangeLayoutArgs: function parseChangeLayoutArgs(t) {
      var a = this,
          i = new _e.UserInstruction(),
          o = null,
          r = -1;for (i.animate = a.config.animation.enable, i.command = new _e.CommandChangeLayout(), r = 0; r < t.length; r++) {
        if (o = t[r], null !== o) switch (typeof o === 'undefined' ? 'undefined' : _typeof(o)) {case "string":
            i.command.containerClassName = o;break;case "object":
            n.extend(i.command, o);break;case "boolean":
            i.animate = o;break;case "function":
            i.callback = o;}
      }return n.freeze(i), i;
    }, queueMix: function queueMix(t) {
      var a = this,
          i = null,
          o = "";return a.callActions("beforeQueueMix", arguments), i = n.defer(_e.libraries), a.config.animation.queue && a.queue.length < a.config.animation.queueLimit ? (t.deferred = i, a.queue.push(t), a.config.controls.enable && (a.isToggling ? (a.buildToggleArray(t.instruction.command), o = a.getToggleSelector(), a.updateControls({ filter: { selector: o } })) : a.updateControls(t.instruction.command))) : (a.config.debug.showWarnings && console.warn(_e.messages.warningMultimixInstanceQueueFull()), i.resolve(a.state), _e.events.fire("mixBusy", a.dom.container, { state: a.state, instance: a }, a.dom.document), "function" == typeof a.config.callbacks.onMixBusy && a.config.callbacks.onMixBusy.call(a.dom.container, a.state, a)), a.callFilters("promiseQueueMix", i.promise, arguments);
    }, getDataOperation: function getDataOperation(t) {
      var a = this,
          i = new _e.Operation(),
          o = [];if (i = a.callFilters("operationUnmappedGetDataOperation", i, arguments), a.dom.targets.length && !(o = a.state.activeDataset || []).length) throw new Error(_e.messages.errorDatasetNotSet());return i.id = n.randomHex(), i.startState = a.state, i.startDataset = o, i.newDataset = t.slice(), a.diffDatasets(i), i.startOrder = a.targets, i.newOrder = i.show, a.config.animation.enable && (a.getStartMixData(i), a.setInter(i), i.docState = n.getDocumentState(a.dom.document), a.getInterMixData(i), a.setFinal(i), a.getFinalMixData(i), a.parseEffects(), i.hasEffect = a.hasEffect(), a.getTweenData(i)), a.targets = i.show.slice(), i.newState = a.buildState(i), Array.prototype.push.apply(a.targets, i.toRemove), i = a.callFilters("operationMappedGetDataOperation", i, arguments);
    }, diffDatasets: function diffDatasets(t) {
      var a = this,
          i = [],
          o = [],
          r = [],
          s = null,
          l = null,
          c = null,
          u = null,
          f = null,
          h = {},
          d = "",
          m = -1;for (a.callActions("beforeDiffDatasets", arguments), m = 0; s = t.newDataset[m]; m++) {
        if ("undefined" == typeof (d = s[a.config.data.uidKey]) || d.toString().length < 1) throw new TypeError(_e.messages.errorDatasetInvalidUidKey({ uidKey: a.config.data.uidKey }));if (h[d]) throw new Error(_e.messages.errorDatasetDuplicateUid({ uid: d }));h[d] = !0, (l = a.cache[d]) instanceof _e.Target ? (a.config.data.dirtyCheck && !n.deepEquals(s, l.data) && (c = l.render(s), l.data = s, c !== l.dom.el && (l.isInDom && (l.unbindEvents(), a.dom.parent.replaceChild(c, l.dom.el)), l.isShown || (c.style.display = "none"), l.dom.el = c, l.isInDom && l.bindEvents())), c = l.dom.el) : (l = new _e.Target(), l.init(null, a, s), l.hide()), l.isInDom ? (f = l.dom.el.nextElementSibling, o.push(d), u && (u.lastElementChild && u.appendChild(a.dom.document.createTextNode(" ")), a.insertDatasetFrag(u, l.dom.el, r), u = null)) : (u || (u = a.dom.document.createDocumentFragment()), u.lastElementChild && u.appendChild(a.dom.document.createTextNode(" ")), u.appendChild(l.dom.el), l.isInDom = !0, l.unbindEvents(), l.bindEvents(), l.hide(), t.toShow.push(l), r.push(l)), t.show.push(l);
      }for (u && (f = f || a.config.layout.siblingAfter, f && u.appendChild(a.dom.document.createTextNode(" ")), a.insertDatasetFrag(u, f, r)), m = 0; s = t.startDataset[m]; m++) {
        d = s[a.config.data.uidKey], l = a.cache[d], t.show.indexOf(l) < 0 ? (t.hide.push(l), t.toHide.push(l), t.toRemove.push(l)) : i.push(d);
      }n.isEqualArray(i, o) || (t.willSort = !0), a.callActions("afterDiffDatasets", arguments);
    }, insertDatasetFrag: function insertDatasetFrag(t, e, a) {
      var i = this,
          o = e ? n.arrayFromList(i.dom.parent.children).indexOf(e) : i.targets.length;for (i.dom.parent.insertBefore(t, e); a.length;) {
        i.targets.splice(o, 0, a.shift()), o++;
      }
    }, willSort: function willSort(t, e) {
      var n = this,
          a = !1;return a = !!(n.config.behavior.liveSort || "random" === t.order || t.attribute !== e.attribute || t.order !== e.order || t.collection !== e.collection || null === t.next && e.next || t.next && null === e.next) || !(!t.next || !e.next) && n.willSort(t.next, e.next), n.callFilters("resultWillSort", a, arguments);
    }, show: function show() {
      var t = this;return t.filter("all");
    }, hide: function hide() {
      var t = this;return t.filter("none");
    }, isMixing: function isMixing() {
      var t = this;return t.isBusy;
    }, filter: function filter() {
      var t = this,
          e = t.parseFilterArgs(arguments);return t.multimix({ filter: e.command }, e.animate, e.callback);
    }, toggleOn: function toggleOn() {
      var t = this,
          e = t.parseFilterArgs(arguments),
          n = e.command.selector,
          a = "";return t.isToggling = !0, t.toggleArray.indexOf(n) < 0 && t.toggleArray.push(n), a = t.getToggleSelector(), t.multimix({ filter: a }, e.animate, e.callback);
    }, toggleOff: function toggleOff() {
      var t = this,
          e = t.parseFilterArgs(arguments),
          n = e.command.selector,
          a = t.toggleArray.indexOf(n),
          i = "";return t.isToggling = !0, a > -1 && t.toggleArray.splice(a, 1), i = t.getToggleSelector(), t.multimix({ filter: i }, e.animate, e.callback);
    }, sort: function sort() {
      var t = this,
          e = t.parseSortArgs(arguments);return t.multimix({ sort: e.command }, e.animate, e.callback);
    }, changeLayout: function changeLayout() {
      var t = this,
          e = t.parseChangeLayoutArgs(arguments);return t.multimix({ changeLayout: e.command }, e.animate, e.callback);
    }, dataset: function dataset() {
      var t = this,
          n = t.parseDatasetArgs(arguments),
          a = null,
          i = null,
          o = !1;return t.callActions("beforeDataset", arguments), t.isBusy ? (i = new _e.QueueItem(), i.args = arguments, i.instruction = n, t.queueMix(i)) : (n.callback && (t.userCallback = n.callback), o = n.animate ^ t.config.animation.enable ? n.animate : t.config.animation.enable, a = t.getDataOperation(n.command.dataset), t.goMix(o, a));
    }, multimix: function multimix() {
      var t = this,
          n = null,
          a = !1,
          i = null,
          o = t.parseMultimixArgs(arguments);return t.callActions("beforeMultimix", arguments), t.isBusy ? (i = new _e.QueueItem(), i.args = arguments, i.instruction = o, i.triggerElement = t.lastClicked, i.isToggling = t.isToggling, t.queueMix(i)) : (n = t.getOperation(o.command), t.config.controls.enable && (o.command.filter && !t.isToggling && (t.toggleArray.length = 0, t.buildToggleArray(n.command)), t.queue.length < 1 && t.updateControls(n.command)), o.callback && (t.userCallback = o.callback), a = o.animate ^ t.config.animation.enable ? o.animate : t.config.animation.enable, t.callFilters("operationMultimix", n, arguments), t.goMix(a, n));
    }, getOperation: function getOperation(t) {
      var a = this,
          i = t.sort,
          o = t.filter,
          r = t.changeLayout,
          s = t.remove,
          l = t.insert,
          c = new _e.Operation();return c = a.callFilters("operationUnmappedGetOperation", c, arguments), c.id = n.randomHex(), c.command = t, c.startState = a.state, c.triggerElement = a.lastClicked, a.isBusy ? (a.config.debug.showWarnings && console.warn(_e.messages.warningGetOperationInstanceBusy()), null) : (l && a.insertTargets(l, c), s && (c.toRemove = s.targets), c.startSort = c.newSort = c.startState.activeSort, c.startOrder = c.newOrder = a.targets, i && (c.startSort = c.startState.activeSort, c.newSort = i, c.willSort = a.willSort(i, c.startState.activeSort), c.willSort && a.sortOperation(c)), c.startFilter = c.startState.activeFilter, o ? c.newFilter = o : c.newFilter = n.extend(new _e.CommandFilter(), c.startFilter), "all" === c.newFilter.selector ? c.newFilter.selector = a.config.selectors.target : "none" === c.newFilter.selector && (c.newFilter.selector = ""), a.filterOperation(c), c.startContainerClassName = c.startState.activeContainerClassName, r ? (c.newContainerClassName = r.containerClassName, c.newContainerClassName !== c.startContainerClassName && (c.willChangeLayout = !0)) : c.newContainerClassName = c.startContainerClassName, a.config.animation.enable && (a.getStartMixData(c), a.setInter(c), c.docState = n.getDocumentState(a.dom.document), a.getInterMixData(c), a.setFinal(c), a.getFinalMixData(c), a.parseEffects(), c.hasEffect = a.hasEffect(), a.getTweenData(c)), c.willSort && (a.targets = c.newOrder), c.newState = a.buildState(c), a.callFilters("operationMappedGetOperation", c, arguments));
    }, tween: function tween(t, e) {
      var n = null,
          a = null,
          i = -1,
          o = -1;for (e = Math.min(e, 1), e = Math.max(e, 0), o = 0; n = t.show[o]; o++) {
        a = t.showPosData[o], n.applyTween(a, e);
      }for (o = 0; n = t.hide[o]; o++) {
        n.isShown && n.hide(), (i = t.toHide.indexOf(n)) > -1 && (a = t.toHidePosData[i], n.isShown || n.show(), n.applyTween(a, e));
      }
    }, insert: function insert() {
      var t = this,
          e = t.parseInsertArgs(arguments);return t.multimix({ insert: e.command }, e.animate, e.callback);
    }, insertBefore: function insertBefore() {
      var t = this,
          e = t.parseInsertArgs(arguments);return t.insert(e.command.collection, "before", e.command.sibling, e.animate, e.callback);
    }, insertAfter: function insertAfter() {
      var t = this,
          e = t.parseInsertArgs(arguments);return t.insert(e.command.collection, "after", e.command.sibling, e.animate, e.callback);
    }, prepend: function prepend() {
      var t = this,
          e = t.parseInsertArgs(arguments);return t.insert(0, e.command.collection, e.animate, e.callback);
    }, append: function append() {
      var t = this,
          e = t.parseInsertArgs(arguments);return t.insert(t.state.totalTargets, e.command.collection, e.animate, e.callback);
    }, remove: function remove() {
      var t = this,
          e = t.parseRemoveArgs(arguments);return t.multimix({ remove: e.command }, e.animate, e.callback);
    }, getConfig: function getConfig(t) {
      var e = this,
          a = null;return a = t ? n.getProperty(e.config, t) : e.config, e.callFilters("valueGetConfig", a, arguments);
    }, configure: function configure(t) {
      var e = this;e.callActions("beforeConfigure", arguments), n.extend(e.config, t, !0, !0), e.callActions("afterConfigure", arguments);
    }, getState: function getState() {
      var t = this,
          a = null;return a = new _e.State(), n.extend(a, t.state), n.freeze(a), t.callFilters("stateGetState", a, arguments);
    }, forceRefresh: function forceRefresh() {
      var t = this;t.indexTargets();
    }, forceRender: function forceRender() {
      var t = this,
          e = null,
          n = null,
          a = "";for (a in t.cache) {
        e = t.cache[a], n = e.render(e.data), n !== e.dom.el && (e.isInDom && (e.unbindEvents(), t.dom.parent.replaceChild(n, e.dom.el)), e.isShown || (n.style.display = "none"), e.dom.el = n, e.isInDom && e.bindEvents());
      }t.state = t.buildState(t.lastOperation);
    }, destroy: function destroy(t) {
      var n = this,
          a = null,
          i = null,
          o = 0;for (n.callActions("beforeDestroy", arguments), o = 0; a = n.controls[o]; o++) {
        a.removeBinding(n);
      }for (o = 0; i = n.targets[o]; o++) {
        t && i.show(), i.unbindEvents();
      }n.dom.container.id.match(/^MixItUp/) && n.dom.container.removeAttribute("id"), delete _e.instances[n.id], n.callActions("afterDestroy", arguments);
    } }), _e.IMoveData = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.posIn = null, this.posOut = null, this.operation = null, this.callback = null, this.statusChange = "", this.duration = -1, this.staggerIndex = -1, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.IMoveData), _e.IMoveData.prototype = Object.create(_e.Base.prototype), _e.IMoveData.prototype.constructor = _e.IMoveData, _e.TargetDom = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.el = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.TargetDom), _e.TargetDom.prototype = Object.create(_e.Base.prototype), _e.TargetDom.prototype.constructor = _e.TargetDom, _e.Target = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.id = "", this.sortString = "", this.mixer = null, this.callback = null, this.isShown = !1, this.isBound = !1, this.isExcluded = !1, this.isInDom = !1, this.handler = null, this.operation = null, this.data = null, this.dom = new _e.TargetDom(), this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.Target), _e.Target.prototype = Object.create(_e.Base.prototype), n.extend(_e.Target.prototype, { constructor: _e.Target, init: function init(t, n, a) {
      var i = this,
          o = "";if (i.callActions("beforeInit", arguments), i.mixer = n, t || (t = i.render(a)), i.cacheDom(t), i.bindEvents(), "none" !== i.dom.el.style.display && (i.isShown = !0), a && n.config.data.uidKey) {
        if ("undefined" == typeof (o = a[n.config.data.uidKey]) || o.toString().length < 1) throw new TypeError(_e.messages.errorDatasetInvalidUidKey({ uidKey: n.config.data.uidKey }));i.id = o, i.data = a, n.cache[o] = i;
      }i.callActions("afterInit", arguments);
    }, render: function render(t) {
      var a = this,
          i = null,
          o = null,
          r = null,
          s = "";if (a.callActions("beforeRender", arguments), i = a.callFilters("renderRender", a.mixer.config.render.target, arguments), "function" != typeof i) throw new TypeError(_e.messages.errorDatasetRendererNotSet());return s = i(t), s && "object" == (typeof s === 'undefined' ? 'undefined' : _typeof(s)) && n.isElement(s) ? o = s : "string" == typeof s && (r = document.createElement("div"), r.innerHTML = s, o = r.firstElementChild), a.callFilters("elRender", o, arguments);
    }, cacheDom: function cacheDom(t) {
      var e = this;e.callActions("beforeCacheDom", arguments), e.dom.el = t, e.callActions("afterCacheDom", arguments);
    }, getSortString: function getSortString(t) {
      var e = this,
          n = e.dom.el.getAttribute("data-" + t) || "";e.callActions("beforeGetSortString", arguments), n = isNaN(1 * n) ? n.toLowerCase() : 1 * n, e.sortString = n, e.callActions("afterGetSortString", arguments);
    }, show: function show() {
      var t = this;t.callActions("beforeShow", arguments), t.isShown || (t.dom.el.style.display = "", t.isShown = !0), t.callActions("afterShow", arguments);
    }, hide: function hide() {
      var t = this;t.callActions("beforeHide", arguments), t.isShown && (t.dom.el.style.display = "none", t.isShown = !1), t.callActions("afterHide", arguments);
    }, move: function move(t) {
      var e = this;e.callActions("beforeMove", arguments), e.isExcluded || e.mixer.targetsMoved++, e.applyStylesIn(t), requestAnimationFrame(function () {
        e.applyStylesOut(t);
      }), e.callActions("afterMove", arguments);
    }, applyTween: function applyTween(t, n) {
      var a = this,
          i = "",
          o = null,
          r = t.posIn,
          s = [],
          l = new _e.StyleData(),
          c = -1;for (a.callActions("beforeApplyTween", arguments), l.x = r.x, l.y = r.y, 0 === n ? a.hide() : a.isShown || a.show(), c = 0; i = _e.features.TWEENABLE[c]; c++) {
        if (o = t.tweenData[i], "x" === i) {
          if (!o) continue;l.x = r.x + o * n;
        } else if ("y" === i) {
          if (!o) continue;l.y = r.y + o * n;
        } else if (o instanceof _e.TransformData) {
          if (!o.value) continue;l[i].value = r[i].value + o.value * n, l[i].unit = o.unit, s.push(i + "(" + l[i].value + o.unit + ")");
        } else {
          if (!o) continue;l[i] = r[i] + o * n, a.dom.el.style[i] = l[i];
        }
      }(l.x || l.y) && s.unshift("translate(" + l.x + "px, " + l.y + "px)"), s.length && (a.dom.el.style[_e.features.transformProp] = s.join(" ")), a.callActions("afterApplyTween", arguments);
    }, applyStylesIn: function applyStylesIn(t) {
      var n = this,
          a = t.posIn,
          i = 1 !== n.mixer.effectsIn.opacity,
          o = [];n.callActions("beforeApplyStylesIn", arguments), o.push("translate(" + a.x + "px, " + a.y + "px)"), n.mixer.config.animation.animateResizeTargets && ("show" !== t.statusChange && (n.dom.el.style.width = a.width + "px", n.dom.el.style.height = a.height + "px"), n.dom.el.style.marginRight = a.marginRight + "px", n.dom.el.style.marginBottom = a.marginBottom + "px"), i && (n.dom.el.style.opacity = a.opacity), "show" === t.statusChange && (o = o.concat(n.mixer.transformIn)), n.dom.el.style[_e.features.transformProp] = o.join(" "), n.callActions("afterApplyStylesIn", arguments);
    }, applyStylesOut: function applyStylesOut(t) {
      var n = this,
          a = [],
          i = [],
          o = n.mixer.config.animation.animateResizeTargets,
          r = "undefined" != typeof n.mixer.effectsIn.opacity;if (n.callActions("beforeApplyStylesOut", arguments), a.push(n.writeTransitionRule(_e.features.transformRule, t.staggerIndex)), "none" !== t.statusChange && a.push(n.writeTransitionRule("opacity", t.staggerIndex, t.duration)), o && (a.push(n.writeTransitionRule("width", t.staggerIndex, t.duration)), a.push(n.writeTransitionRule("height", t.staggerIndex, t.duration)), a.push(n.writeTransitionRule("margin", t.staggerIndex, t.duration))), !t.callback) return n.mixer.targetsImmovable++, void (n.mixer.targetsMoved === n.mixer.targetsImmovable && n.mixer.cleanUp(t.operation));switch (n.operation = t.operation, n.callback = t.callback, !n.isExcluded && n.mixer.targetsBound++, n.isBound = !0, n.applyTransition(a), o && t.posOut.width > 0 && t.posOut.height > 0 && (n.dom.el.style.width = t.posOut.width + "px", n.dom.el.style.height = t.posOut.height + "px", n.dom.el.style.marginRight = t.posOut.marginRight + "px", n.dom.el.style.marginBottom = t.posOut.marginBottom + "px"), n.mixer.config.animation.nudge || "hide" !== t.statusChange || i.push("translate(" + t.posOut.x + "px, " + t.posOut.y + "px)"), t.statusChange) {case "hide":
          r && (n.dom.el.style.opacity = n.mixer.effectsOut.opacity), i = i.concat(n.mixer.transformOut);break;case "show":
          r && (n.dom.el.style.opacity = 1);}(n.mixer.config.animation.nudge || !n.mixer.config.animation.nudge && "hide" !== t.statusChange) && i.push("translate(" + t.posOut.x + "px, " + t.posOut.y + "px)"), n.dom.el.style[_e.features.transformProp] = i.join(" "), n.callActions("afterApplyStylesOut", arguments);
    }, writeTransitionRule: function writeTransitionRule(t, e, n) {
      var a = this,
          i = a.getDelay(e),
          o = "";return o = t + " " + (n > 0 ? n : a.mixer.config.animation.duration) + "ms " + i + "ms " + ("opacity" === t ? "linear" : a.mixer.config.animation.easing), a.callFilters("ruleWriteTransitionRule", o, arguments);
    }, getDelay: function getDelay(t) {
      var e = this,
          n = -1;return "function" == typeof e.mixer.config.animation.staggerSequence && (t = e.mixer.config.animation.staggerSequence.call(e, t, e.state)), n = e.mixer.staggerDuration ? t * e.mixer.staggerDuration : 0, e.callFilters("delayGetDelay", n, arguments);
    }, applyTransition: function applyTransition(t) {
      var n = this,
          a = t.join(", ");n.callActions("beforeApplyTransition", arguments), n.dom.el.style[_e.features.transitionProp] = a, n.callActions("afterApplyTransition", arguments);
    }, handleTransitionEnd: function handleTransitionEnd(t) {
      var e = this,
          n = t.propertyName,
          a = e.mixer.config.animation.animateResizeTargets;e.callActions("beforeHandleTransitionEnd", arguments), e.isBound && t.target.matches(e.mixer.config.selectors.target) && (n.indexOf("transform") > -1 || n.indexOf("opacity") > -1 || a && n.indexOf("height") > -1 || a && n.indexOf("width") > -1 || a && n.indexOf("margin") > -1) && (e.callback.call(e, e.operation), e.isBound = !1, e.callback = null, e.operation = null), e.callActions("afterHandleTransitionEnd", arguments);
    }, eventBus: function eventBus(t) {
      var e = this;switch (e.callActions("beforeEventBus", arguments), t.type) {case "webkitTransitionEnd":case "transitionend":
          e.handleTransitionEnd(t);}e.callActions("afterEventBus", arguments);
    }, unbindEvents: function unbindEvents() {
      var t = this;t.callActions("beforeUnbindEvents", arguments), n.off(t.dom.el, "webkitTransitionEnd", t.handler), n.off(t.dom.el, "transitionend", t.handler), t.callActions("afterUnbindEvents", arguments);
    }, bindEvents: function bindEvents() {
      var t = this,
          a = "";t.callActions("beforeBindEvents", arguments), a = "webkit" === _e.features.transitionPrefix ? "webkitTransitionEnd" : "transitionend", t.handler = function (e) {
        return t.eventBus(e);
      }, n.on(t.dom.el, a, t.handler), t.callActions("afterBindEvents", arguments);
    }, getPosData: function getPosData(n) {
      var a = this,
          i = {},
          o = null,
          r = new _e.StyleData();return a.callActions("beforeGetPosData", arguments), r.x = a.dom.el.offsetLeft, r.y = a.dom.el.offsetTop, (a.mixer.config.animation.animateResizeTargets || n) && (o = a.dom.el.getBoundingClientRect(), r.top = o.top, r.right = o.right, r.bottom = o.bottom, r.left = o.left, r.width = o.width, r.height = o.height), a.mixer.config.animation.animateResizeTargets && (i = t.getComputedStyle(a.dom.el), r.marginBottom = parseFloat(i.marginBottom), r.marginRight = parseFloat(i.marginRight)), a.callFilters("posDataGetPosData", r, arguments);
    }, cleanUp: function cleanUp() {
      var t = this;t.callActions("beforeCleanUp", arguments), t.dom.el.style[_e.features.transformProp] = "", t.dom.el.style[_e.features.transitionProp] = "", t.dom.el.style.opacity = "", t.mixer.config.animation.animateResizeTargets && (t.dom.el.style.width = "", t.dom.el.style.height = "", t.dom.el.style.marginRight = "", t.dom.el.style.marginBottom = ""), t.callActions("afterCleanUp", arguments);
    } }), _e.Collection = function (t) {
    var e = null,
        a = -1;for (this.callActions("beforeConstruct"), a = 0; e = t[a]; a++) {
      this[a] = e;
    }this.length = t.length, this.callActions("afterConstruct"), n.freeze(this);
  }, _e.BaseStatic.call(_e.Collection), _e.Collection.prototype = Object.create(_e.Base.prototype), n.extend(_e.Collection.prototype, { constructor: _e.Collection, mixitup: function mixitup(t) {
      var a = this,
          i = null,
          o = Array.prototype.slice.call(arguments),
          r = [],
          s = -1;for (this.callActions("beforeMixitup"), o.shift(), s = 0; i = a[s]; s++) {
        r.push(i[t].apply(i, o));
      }return a.callFilters("promiseMixitup", n.all(r, _e.libraries), arguments);
    } }), _e.Operation = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.id = "", this.args = [], this.command = null, this.showPosData = [], this.toHidePosData = [], this.startState = null, this.newState = null, this.docState = null, this.willSort = !1, this.willChangeLayout = !1, this.hasEffect = !1, this.hasFailed = !1, this.triggerElement = null, this.show = [], this.hide = [], this.matching = [], this.toShow = [], this.toHide = [], this.toMove = [], this.toRemove = [], this.startOrder = [], this.newOrder = [], this.startSort = null, this.newSort = null, this.startFilter = null, this.newFilter = null, this.startDataset = null, this.newDataset = null, this.viewportDeltaX = 0, this.viewportDeltaY = 0, this.startX = 0, this.startY = 0, this.startHeight = 0, this.startWidth = 0, this.newX = 0, this.newY = 0, this.newHeight = 0, this.newWidth = 0, this.startContainerClassName = "", this.startDisplay = "", this.newContainerClassName = "", this.newDisplay = "", this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.Operation), _e.Operation.prototype = Object.create(_e.Base.prototype), _e.Operation.prototype.constructor = _e.Operation, _e.State = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.id = "", this.activeFilter = null, this.activeSort = null, this.activeContainerClassName = "", this.container = null, this.targets = [], this.hide = [], this.show = [], this.matching = [], this.totalTargets = -1, this.totalShow = -1, this.totalHide = -1, this.totalMatching = -1, this.hasFailed = !1, this.triggerElement = null, this.activeDataset = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.State), _e.State.prototype = Object.create(_e.Base.prototype), _e.State.prototype.constructor = _e.State, _e.UserInstruction = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.command = {}, this.animate = !1, this.callback = null, this.callActions("afterConstruct"), n.seal(this);
  }, _e.BaseStatic.call(_e.UserInstruction), _e.UserInstruction.prototype = Object.create(_e.Base.prototype), _e.UserInstruction.prototype.constructor = _e.UserInstruction, _e.Messages = function () {
    _e.Base.call(this), this.callActions("beforeConstruct"), this.ERROR_FACTORY_INVALID_CONTAINER = "[MixItUp] An invalid selector or element reference was passed to the mixitup factory function", this.ERROR_FACTORY_CONTAINER_NOT_FOUND = "[MixItUp] The provided selector yielded no container element", this.ERROR_CONFIG_INVALID_ANIMATION_EFFECTS = "[MixItUp] Invalid value for `animation.effects`", this.ERROR_CONFIG_INVALID_CONTROLS_SCOPE = "[MixItUp] Invalid value for `controls.scope`", this.ERROR_CONFIG_INVALID_PROPERTY = '[MixitUp] Invalid configuration object property "${erroneous}"${suggestion}', this.ERROR_CONFIG_INVALID_PROPERTY_SUGGESTION = '. Did you mean "${probableMatch}"?', this.ERROR_CONFIG_DATA_UID_KEY_NOT_SET = "[MixItUp] To use the dataset API, a UID key must be specified using `data.uidKey`", this.ERROR_DATASET_INVALID_UID_KEY = '[MixItUp] The specified UID key "${uidKey}" is not present on one or more dataset items', this.ERROR_DATASET_DUPLICATE_UID = '[MixItUp] The UID "${uid}" was found on two or more dataset items. UIDs must be unique.', this.ERROR_INSERT_INVALID_ARGUMENTS = "[MixItUp] Please provider either an index or a sibling and position to insert, not both", this.ERROR_INSERT_PREEXISTING_ELEMENT = "[MixItUp] An element to be inserted already exists in the container", this.ERROR_FILTER_INVALID_ARGUMENTS = "[MixItUp] Please provide either a selector or collection `.filter()`, not both", this.ERROR_DATASET_NOT_SET = "[MixItUp] To use the dataset API with pre-rendered targets, a starting dataset must be set using `load.dataset`", this.ERROR_DATASET_PRERENDERED_MISMATCH = "[MixItUp] `load.dataset` does not match pre-rendered targets", this.ERROR_DATASET_RENDERER_NOT_SET = "[MixItUp] To insert an element via the dataset API, a target renderer function must be provided to `render.target`", this.ERROR_SORT_NON_EXISTENT_ELEMENT = "[MixItUp] An element to be sorted does not already exist in the container", this.WARNING_FACTORY_PREEXISTING_INSTANCE = "[MixItUp] WARNING: This element already has an active MixItUp instance. The provided configuration object will be ignored. If you wish to perform additional methods on this instance, please create a reference.", this.WARNING_INSERT_NO_ELEMENTS = "[MixItUp] WARNING: No valid elements were passed to `.insert()`", this.WARNING_REMOVE_NO_ELEMENTS = "[MixItUp] WARNING: No valid elements were passed to `.remove()`", this.WARNING_MULTIMIX_INSTANCE_QUEUE_FULL = "[MixItUp] WARNING: An operation was requested but the MixItUp instance was busy. The operation was rejected because the queue is full or queuing is disabled.", this.WARNING_GET_OPERATION_INSTANCE_BUSY = "[MixItUp] WARNING: Operations can be be created while the MixItUp instance is busy.", this.WARNING_NO_PROMISE_IMPLEMENTATION = "[MixItUp] WARNING: No Promise implementations could be found. If you wish to use promises with MixItUp please install an ES6 Promise polyfill.", this.WARNING_INCONSISTENT_SORTING_ATTRIBUTES = '[MixItUp] WARNING: The requested sorting data attribute "${attribute}" was not present on one or more target elements which may product unexpected sort output', this.callActions("afterConstruct"), this.compileTemplates(), n.seal(this);
  }, _e.BaseStatic.call(_e.Messages), _e.Messages.prototype = Object.create(_e.Base.prototype), _e.Messages.prototype.constructor = _e.Messages, _e.Messages.prototype.compileTemplates = function () {
    var t = "",
        e = "";for (t in this) {
      "string" == typeof (e = this[t]) && (this[n.camelCase(t)] = n.template(e));
    }
  }, _e.messages = new _e.Messages(), _e.Facade = function (t) {
    _e.Base.call(this), this.callActions("beforeConstruct", arguments), this.configure = t.configure.bind(t), this.show = t.show.bind(t), this.hide = t.hide.bind(t), this.filter = t.filter.bind(t), this.toggleOn = t.toggleOn.bind(t), this.toggleOff = t.toggleOff.bind(t), this.sort = t.sort.bind(t), this.changeLayout = t.changeLayout.bind(t), this.multimix = t.multimix.bind(t), this.dataset = t.dataset.bind(t), this.tween = t.tween.bind(t), this.insert = t.insert.bind(t), this.insertBefore = t.insertBefore.bind(t), this.insertAfter = t.insertAfter.bind(t), this.prepend = t.prepend.bind(t), this.append = t.append.bind(t), this.remove = t.remove.bind(t), this.destroy = t.destroy.bind(t), this.forceRefresh = t.forceRefresh.bind(t), this.forceRender = t.forceRender.bind(t), this.isMixing = t.isMixing.bind(t), this.getOperation = t.getOperation.bind(t), this.getConfig = t.getConfig.bind(t), this.getState = t.getState.bind(t), this.callActions("afterConstruct", arguments), n.freeze(this), n.seal(this);
  }, _e.BaseStatic.call(_e.Facade), _e.Facade.prototype = Object.create(_e.Base.prototype), _e.Facade.prototype.constructor = _e.Facade, "object" == (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) && "object" == (typeof module === 'undefined' ? 'undefined' : _typeof(module)) ? module.exports = _e : "function" == typeof define && define.amd ? define(function () {
    return _e;
  }) : "undefined" != typeof t.mixitup && "function" == typeof t.mixitup || (t.mixitup = _e), _e.BaseStatic.call(_e.constructor), _e.NAME = "mixitup", _e.CORE_VERSION = "3.3.1";
}(window);