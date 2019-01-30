(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.BuilderReact = {})));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    var isSafari = typeof window !== 'undefined' &&
        /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
    // TODO: move to shared
    function nextTick(fn) {
        // TODO: should this be setImmediate instead? Forgot if that is micro or macro task
        // TODO: detect specifically if is server
        // if (typeof process !== 'undefined' && process.nextTick) {
        //   console.log('process.nextTick?');
        //   process.nextTick(fn);
        //   return;
        // }
        // FIXME: fix the real safari issue of this randomly not working
        if (isSafari || typeof MutationObserver === 'undefined') {
            setTimeout(fn);
            return;
        }
        var called = 0;
        var observer = new MutationObserver(function () { return fn(); });
        var element = document.createTextNode('');
        observer.observe(element, {
            characterData: true,
        });
        // tslint:disable-next-line
        element.data = String((called = ++called));
    }

    // TODO: unit tests
    var QueryString = /** @class */ (function () {
        function QueryString() {
        }
        QueryString.parseDeep = function (queryString) {
            var obj = this.parse(queryString);
            return this.deepen(obj);
        };
        QueryString.stringifyDeep = function (obj) {
            var map = this.flatten(obj);
            return this.stringify(map);
        };
        QueryString.parse = function (queryString) {
            var query = {};
            var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split('=');
                // TODO: node support?
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
            return query;
        };
        QueryString.stringify = function (map) {
            var str = '';
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    var value = map[key];
                    if (str) {
                        str += '&';
                    }
                    str += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }
            }
            return str;
        };
        QueryString.deepen = function (map) {
            var output = {};
            for (var k in map) {
                var t = output;
                var parts = k.split('.');
                var key = parts.pop();
                while (parts.length) {
                    var part = parts.shift();
                    t = t[part] = t[part] || {};
                }
                t[key] = map[k];
            }
            return output;
        };
        QueryString.flatten = function (obj, _current, _res) {
            if (_res === void 0) { _res = {}; }
            for (var key in obj) {
                var value = obj[key];
                var newKey = _current ? _current + '.' + key : key;
                if (value && typeof value === 'object') {
                    this.flatten(value, newKey, _res);
                }
                else {
                    _res[newKey] = value;
                }
            }
            return _res;
        };
        return QueryString;
    }());

    var version = "0.1.55";

    var Subscription = /** @class */ (function () {
        function Subscription(listeners, listener) {
            this.listeners = listeners;
            this.listener = listener;
            this.unsubscribed = false;
            this.otherSubscriptions = [];
        }
        Subscription.prototype.add = function (subscription) {
            this.otherSubscriptions.push(subscription);
        };
        Subscription.prototype.unsubscribe = function () {
            if (this.unsubscribed) {
                return;
            }
            if (this.listener && this.listeners) {
                var index = this.listeners.indexOf(this.listener);
                if (index) {
                    this.listeners.splice(index, 1);
                }
            }
            this.otherSubscriptions.forEach(function (sub) { return sub.unsubscribe(); });
            this.unsubscribed = true;
        };
        return Subscription;
    }());
    // TODO: follow minimal basic spec: https://github.com/tc39/proposal-observable
    var BehaviorSubject = /** @class */ (function () {
        function BehaviorSubject(value) {
            this.value = value;
            this.listeners = [];
            this.errorListeners = [];
        }
        BehaviorSubject.prototype.next = function (value) {
            this.value = value;
            for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener(value);
            }
        };
        // TODO: implement this as PIPE instead
        BehaviorSubject.prototype.map = function (fn) {
            var newSubject = new BehaviorSubject(fn(this.value));
            // TODO: on destroy delete these
            this.subscribe(function (val) {
                newSubject.next(fn(val));
            });
            this.catch(function (err) {
                newSubject.error(err);
            });
            return newSubject;
        };
        BehaviorSubject.prototype.catch = function (errorListener) {
            this.errorListeners.push(errorListener);
            return new Subscription(this.errorListeners, errorListener);
        };
        BehaviorSubject.prototype.error = function (error) {
            for (var _i = 0, _a = this.errorListeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener(error);
            }
        };
        BehaviorSubject.prototype.subscribe = function (listener, errorListener) {
            this.listeners.push(listener);
            if (errorListener) {
                this.errorListeners.push(errorListener);
            }
            return new Subscription(this.listeners, listener);
        };
        return BehaviorSubject;
    }());

    var State = {
        Pending: 'Pending',
        Fulfilled: 'Fulfilled',
        Rejected: 'Rejected',
    };
    function isFunction(val) {
        return val && typeof val === 'function';
    }
    function isObject(val) {
        return val && typeof val === 'object';
    }
    var TinyPromise = /** @class */ (function () {
        function TinyPromise(executor) {
            this._state = State.Pending;
            this._handlers = [];
            this._value = null;
            executor(this._resolve.bind(this), this._reject.bind(this));
        }
        TinyPromise.prototype._resolve = function (x) {
            var _this = this;
            if (x instanceof TinyPromise) {
                x.then(this._resolve.bind(this), this._reject.bind(this));
            }
            else if (isObject(x) || isFunction(x)) {
                var called_1 = false;
                try {
                    var thenable = x.then;
                    if (isFunction(thenable)) {
                        thenable.call(x, function (result) {
                            if (!called_1)
                                _this._resolve(result);
                            called_1 = true;
                        }, function (error) {
                            if (!called_1)
                                _this._reject(error);
                            called_1 = true;
                        });
                    }
                    else {
                        this._fulfill(x);
                    }
                }
                catch (ex) {
                    if (!called_1) {
                        this._reject(ex);
                    }
                }
            }
            else {
                this._fulfill(x);
            }
        };
        TinyPromise.prototype._fulfill = function (result) {
            var _this = this;
            this._state = State.Fulfilled;
            this._value = result;
            this._handlers.forEach(function (handler) { return _this._callHandler(handler); });
        };
        TinyPromise.prototype._reject = function (error) {
            var _this = this;
            this._state = State.Rejected;
            this._value = error;
            this._handlers.forEach(function (handler) { return _this._callHandler(handler); });
        };
        TinyPromise.prototype._isPending = function () {
            return this._state === State.Pending;
        };
        TinyPromise.prototype._isFulfilled = function () {
            return this._state === State.Fulfilled;
        };
        TinyPromise.prototype._isRejected = function () {
            return this._state === State.Rejected;
        };
        TinyPromise.prototype._addHandler = function (onFulfilled, onRejected) {
            this._handlers.push({
                onFulfilled: onFulfilled,
                onRejected: onRejected,
            });
        };
        TinyPromise.prototype._callHandler = function (handler) {
            if (this._isFulfilled() && isFunction(handler.onFulfilled)) {
                handler.onFulfilled(this._value);
            }
            else if (this._isRejected() && isFunction(handler.onRejected)) {
                handler.onRejected(this._value);
            }
        };
        TinyPromise.prototype.then = function (onFulfilled, onRejected) {
            var _this = this;
            switch (this._state) {
                case State.Pending: {
                    return new TinyPromise(function (resolve, reject) {
                        _this._addHandler(function (value) {
                            nextTick(function () {
                                try {
                                    if (isFunction(onFulfilled)) {
                                        resolve(onFulfilled(value));
                                    }
                                    else {
                                        resolve(value);
                                    }
                                }
                                catch (ex) {
                                    reject(ex);
                                }
                            });
                        }, function (error) {
                            nextTick(function () {
                                try {
                                    if (isFunction(onRejected)) {
                                        resolve(onRejected(error));
                                    }
                                    else {
                                        reject(error);
                                    }
                                }
                                catch (ex) {
                                    reject(ex);
                                }
                            });
                        });
                    });
                }
                case State.Fulfilled: {
                    return new TinyPromise(function (resolve, reject) {
                        nextTick(function () {
                            try {
                                if (isFunction(onFulfilled)) {
                                    resolve(onFulfilled(_this._value));
                                }
                                else {
                                    resolve(_this._value);
                                }
                            }
                            catch (ex) {
                                reject(ex);
                            }
                        });
                    });
                }
                case State.Rejected: {
                    return new TinyPromise(function (resolve, reject) {
                        nextTick(function () {
                            try {
                                if (isFunction(onRejected)) {
                                    resolve(onRejected(_this._value));
                                }
                                else {
                                    reject(_this._value);
                                }
                            }
                            catch (ex) {
                                reject(ex);
                            }
                        });
                    });
                }
            }
        };
        return TinyPromise;
    }());
    var Promise$1 = (typeof Promise !== 'undefined' ? Promise : TinyPromise);

    function promiseResolve(value) {
        return new Promise$1(function (resolve) { return resolve(value); });
    }
    // Adapted from https://raw.githubusercontent.com/developit/unfetch/master/src/index.mjs
    function tinyFetch(url, options) {
        if (options === void 0) { options = {}; }
        return new Promise$1(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open(options.method || 'get', url, true);
            if (options.headers) {
                for (var i in options.headers) {
                    request.setRequestHeader(i, options.headers[i]);
                }
            }
            request.withCredentials = options.credentials === 'include';
            request.onload = function () {
                resolve(response());
            };
            request.onerror = reject;
            request.send(options.body);
            function response() {
                var keys = [];
                var all = [];
                var headers = {};
                var header = undefined;
                request
                    .getAllResponseHeaders()
                    .replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (_match, _key, value) {
                    var key = _key;
                    keys.push((key = key.toLowerCase()));
                    all.push([key, value]);
                    header = headers[key];
                    headers[key] = header ? header + "," + value : value;
                    return '';
                });
                return {
                    ok: ((request.status / 100) | 0) === 2,
                    status: request.status,
                    statusText: request.statusText,
                    url: request.responseURL,
                    clone: response,
                    text: function () { return promiseResolve(request.responseText); },
                    json: function () { return promiseResolve(request.responseText).then(JSON.parse); },
                    blob: function () { return promiseResolve(new Blob([request.response])); },
                    headers: {
                        keys: function () { return keys; },
                        entries: function () { return all; },
                        get: function (n) { return headers[n.toLowerCase()]; },
                        has: function (n) { return n.toLowerCase() in headers; },
                    },
                };
            }
        });
    }
    var fetch$1 = typeof window === 'undefined'
        ? require('node-fetch')
        : typeof window.fetch !== 'undefined'
            ? window.fetch
            : tinyFetch;

    function assign(target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];
            if (nextSource != null) {
                // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    }

    function throttle(func, wait, options) {
        if (options === void 0) { options = {}; }
        var context;
        var args;
        var result;
        var timeout = null;
        var previous = 0;
        var later = function () {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout)
                context = args = null;
        };
        return function () {
            var now = Date.now();
            if (!previous && options.leading === false)
                previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            }
            else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }

    var camelCaseToKebabCase = function (str) {
        return str ? str.replace(/([A-Z])/g, function (g) { return "-" + g[0].toLowerCase(); }) : '';
    };
    var Animator = /** @class */ (function () {
        function Animator() {
        }
        Animator.prototype.bindAnimations = function (animations) {
            for (var _i = 0, animations_1 = animations; _i < animations_1.length; _i++) {
                var animation = animations_1[_i];
                switch (animation.trigger) {
                    case 'pageLoad':
                        this.triggerAnimation(animation);
                        break;
                    case 'hover':
                        this.bindHoverAnimation(animation);
                        break;
                    case 'scrollInView':
                        this.bindScrollInViewAnimation(animation);
                        break;
                }
            }
        };
        Animator.prototype.warnElementNotPresent = function (id) {
            console.warn("Cannot animate element: element with ID " + id + " not found!");
        };
        Animator.prototype.augmentAnimation = function (animation, element) {
            var stylesUsed = this.getAllStylesUsed(animation);
            var computedStyle = getComputedStyle(element);
            // const computedStyle = getComputedStyle(element);
            // // FIXME: this will break if original load is in one reponsive size then resize to another hmmm
            // Need to use transform instead of left since left can change on screen sizes
            var firstStyles = animation.steps[0].styles;
            var lastStyles = animation.steps[animation.steps.length - 1].styles;
            var bothStyles = [firstStyles, lastStyles];
            // FIXME: this won't work as expected for augmented animations - may need the editor itself to manage this
            for (var _i = 0, bothStyles_1 = bothStyles; _i < bothStyles_1.length; _i++) {
                var styles = bothStyles_1[_i];
                for (var _a = 0, stylesUsed_1 = stylesUsed; _a < stylesUsed_1.length; _a++) {
                    var style = stylesUsed_1[_a];
                    if (!(style in styles)) {
                        styles[style] = computedStyle[style];
                    }
                }
            }
        };
        Animator.prototype.getAllStylesUsed = function (animation) {
            var properties = [];
            for (var _i = 0, _a = animation.steps; _i < _a.length; _i++) {
                var step = _a[_i];
                for (var key in step.styles) {
                    if (properties.indexOf(key) === -1) {
                        properties.push(key);
                    }
                }
            }
            return properties;
        };
        Animator.prototype.triggerAnimation = function (animation) {
            var _this = this;
            // TODO: do for ALL elements
            var elements = Array.prototype.slice.call(document.getElementsByClassName(animation.elementId || animation.id || ''));
            if (!elements.length) {
                this.warnElementNotPresent(animation.elementId || animation.id || '');
                return;
            }
            elements.forEach(function (element) {
                _this.augmentAnimation(animation, element);
                // TODO: do this properly, may have other animations of different properties
                // TODO: only override the properties
                // TODO: if there is an entrance and hover animation, the transition duration will get effed
                // element.setAttribute('style', '');
                var styledUsed = _this.getAllStylesUsed(animation);
                element.style.transition = 'none';
                element.style.transitionDelay = '0';
                assign(element.style, animation.steps[0].styles);
                setTimeout(function () {
                    element.style.transition = "all " + animation.duration + "s " + camelCaseToKebabCase(animation.easing);
                    if (animation.delay) {
                        element.style.transitionDelay = animation.delay + 's';
                    }
                    assign(element.style, animation.steps[1].styles);
                    // TODO: maybe remove/reset transitoin property after animation duration
                    // TODO: queue timers
                    setTimeout(function () {
                        // TODO: what if has other transition (reset back to what it was)
                        element.style.transition = '';
                        element.style.transitionDelay = '';
                    }, (animation.delay || 0) * 1000 + animation.duration * 1000);
                });
            });
        };
        Animator.prototype.bindHoverAnimation = function (animation) {
            var _this = this;
            // TODO: unbind on element remove
            // TODO: apply to ALL elements
            var elements = Array.prototype.slice.call(document.getElementsByClassName(animation.elementId || animation.id || ''));
            if (!elements.length) {
                this.warnElementNotPresent(animation.elementId || animation.id || '');
                return;
            }
            elements.forEach(function (element) {
                _this.augmentAnimation(animation, element);
                var defaultState = animation.steps[0].styles;
                var hoverState = animation.steps[1].styles;
                function attachDefaultState() {
                    assign(element.style, defaultState);
                }
                function attachHoverState() {
                    assign(element.style, hoverState);
                }
                attachDefaultState();
                element.addEventListener('mouseenter', attachHoverState);
                element.addEventListener('mouseleave', attachDefaultState);
                setTimeout(function () {
                    element.style.transition = "all " + animation.duration + "s " + camelCaseToKebabCase(animation.easing);
                    if (animation.delay) {
                        element.style.transitionDelay = animation.delay + 's';
                    }
                });
            });
        };
        // TODO: unbind on element remove
        Animator.prototype.bindScrollInViewAnimation = function (animation) {
            var _this = this;
            // TODO: apply to ALL matching elements
            var elements = Array.prototype.slice.call(document.getElementsByClassName(animation.elementId || animation.id || ''));
            if (!elements.length) {
                this.warnElementNotPresent(animation.elementId || animation.id || '');
                return;
            }
            elements.forEach(function (element) {
                _this.augmentAnimation(animation, element);
                var triggered = false;
                // TODO: roll all of these in one for more efficiency of checking all the rects
                var onScroll = throttle(function () {
                    if (!triggered && isScrolledIntoView(element)) {
                        triggered = true;
                        assign(element.style, animation.steps[1].styles);
                        document.removeEventListener('scroll', onScroll);
                        setTimeout(function () {
                            element.style.transition = '';
                            element.style.transitionDelay = '';
                        }, (animation.duration + (animation.delay || 0)) * 1000);
                    }
                }, 100, { leading: false });
                // TODO: fully in view or partially
                function isScrolledIntoView(elem) {
                    var rect = elem.getBoundingClientRect();
                    var windowHeight = window.innerHeight;
                    var thresholdPrecent = 0.2;
                    var threshold = thresholdPrecent * windowHeight;
                    // TODO: partial in view? or what if element is larger than screen itself
                    return (rect.bottom > threshold && rect.top < windowHeight - threshold // Element is peeking top or bottom
                    );
                }
                var defaultState = animation.steps[0].styles;
                function attachDefaultState() {
                    assign(element.style, defaultState);
                }
                attachDefaultState();
                setTimeout(function () {
                    element.style.transition = "all " + animation.duration + "s " + camelCaseToKebabCase(animation.easing);
                    if (animation.delay) {
                        element.style.transitionDelay = animation.delay + 's';
                    }
                });
                // TODO: one listener for everything
                document.addEventListener('scroll', onScroll, { capture: true, passive: true });
                // Do an initial check
                onScroll();
            });
        };
        return Animator;
    }());

    var urlParser = {
        parse: function (url) {
            var parser = document.createElement('a');
            parser.href = url;
            var out = {};
            var props = 'username password host hostname port protocol origin pathname search hash'.split(' ');
            for (var i = props.length; i--;)
                out[props[i]] = parser[props[i]];
            return out;
        },
    };
    var parse = typeof window === 'object' ? urlParser.parse : require('url').parse;
    function setCookie(name$$1, value, expires) {
        var expiresString = '';
        // TODO: need to know if secure server side
        if (expires) {
            expiresString = '; expires=' + expires.toUTCString();
        }
        var secure = isBrowser ? location.protocol === 'https:' : true;
        document.cookie =
            name$$1 + '=' + (value || '') + expiresString + '; path=/' + (secure ? ';secure' : '');
    }
    function getCookie(name$$1) {
        return (decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' +
            encodeURIComponent(name$$1).replace(/[\-\.\+\*]/g, '\\$&') +
            '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null);
    }
    function size(object) {
        return Object.keys(object).length;
    }
    function find(target, callback) {
        var list = target;
        // Makes sures is always has an positive integer as length.
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        for (var i = 0; i < length; i++) {
            var element = list[i];
            if (callback.call(thisArg, element, i, list)) {
                return element;
            }
        }
    }
    var sessionStorageKey = 'builderSessionId';
    var isBrowser = typeof window !== 'undefined';
    var isIframe = isBrowser && window.top !== window.self;
    var Builder = /** @class */ (function () {
        function Builder(apiKey) {
            if (apiKey === void 0) { apiKey = null; }
            var _this = this;
            this.eventsQueue = [];
            this.throttledClearEventsQueue = throttle(function () {
                _this.processEventsQueue();
            }, 100);
            this.env = 'production';
            this.isUsed = false;
            this.sessionId = this.getSessionId();
            this.targetContent = true;
            // TODO: api options object
            this.cachebust = false;
            this.noCache = false;
            this.overrideHost = '';
            this.preview = false;
            this.canTrack$ = new BehaviorSubject(!this.browserTrackingDisabled);
            this.apiKey$ = new BehaviorSubject(null);
            this.editingMode$ = new BehaviorSubject(isIframe);
            // TODO: decorator to do this stuff with the get/set (how do with typing too? compiler?)
            this.editingModel$ = new BehaviorSubject(null);
            this.userAgent = (typeof navigator === 'object' && navigator.userAgent) || '';
            this.autoTrack = !this.isDevelopmentEnv;
            this.useNewContentApi = false;
            this.blockContentLoading = '';
            this.observersByModelType = {};
            this.overrides = {};
            this.getContentQueue = null;
            this.priorContentQueue = null;
            this.testCookiePrefix = 'builder.tests';
            this.cookieQueue = [];
            if (apiKey) {
                this.apiKey = apiKey;
            }
            if (isBrowser) {
                this.bindMessageListeners();
                window.BUILDER_VERSION = Builder.VERSION;
            }
            if (isIframe) {
                this.messageFrameLoaded();
            }
            // TODO: on destroy clear subscription
            this.canTrack$.subscribe(function (value) {
                if (value) {
                    if (typeof sessionStorage !== 'undefined') {
                        if (!sessionStorage.getItem(sessionStorageKey)) {
                            sessionStorage.setItem(sessionStorageKey, _this.sessionId);
                        }
                    }
                    if (_this.eventsQueue.length) {
                        _this.throttledClearEventsQueue();
                    }
                    if (_this.cookieQueue.length) {
                        _this.cookieQueue.forEach(function (item) {
                            _this.setCookie(item[0], item[1]);
                        });
                        _this.cookieQueue.length = 0;
                    }
                }
            });
            if (isBrowser) {
                // TODO: defer so subclass constructor runs and injects location service
                this.setTestsFromUrl();
                // TODO: do this on every request send?
                this.getOverridesFromQueryString();
            }
        }
        Builder.fields = function (name$$1, fields) {
            window.parent.postMessage({
                type: 'builder.fields',
                data: { name: name$$1, fields: fields },
            }, '*');
        };
        Object.defineProperty(Builder, "editingPage", {
            // useCdnApi = false;
            get: function () {
                return this._editingPage;
            },
            set: function (editingPage) {
                this._editingPage = editingPage;
                if (isBrowser && isIframe) {
                    if (editingPage) {
                        document.body.classList.add('builder-editing-page');
                    }
                    else {
                        document.body.classList.remove('builder-editing-page');
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Builder.prepareComponentSpecToSend = function (spec) {
            return __assign({}, spec, (spec.inputs && {
                inputs: spec.inputs.map(function (input) {
                    // TODO: do for nexted too
                    if (input.onChange && typeof input.onChange === 'function') {
                        var fn = input.onChange;
                        return __assign({}, input, { onChange: "return (" + fn.toString() + ").apply(this, arguments)" });
                    }
                    return input;
                }),
            }), { class: undefined });
        };
        // TODO: style guide, etc off this system as well?
        Builder.component = function (info) {
            var _this = this;
            if (info === void 0) { info = {}; }
            return function (component) {
                var spec = __assign({}, info, { class: component });
                if (!spec.name) {
                    spec.name = component.name;
                }
                if (!find(_this.components, function (item) { return item.name === spec.name; })) {
                    _this.components.push(spec);
                    var sendSpec = _this.prepareComponentSpecToSend(spec);
                    // TODO: serialize component name and inputs
                    if (isBrowser) {
                        window.parent.postMessage({
                            type: 'builder.registerComponent',
                            data: sendSpec,
                        }, '*');
                    }
                }
            };
        };
        Object.defineProperty(Builder, "Component", {
            get: function () {
                return this.component;
            },
            enumerable: true,
            configurable: true
        });
        Builder.prototype.processEventsQueue = function () {
            if (!this.eventsQueue.length) {
                return;
            }
            var events = this.eventsQueue;
            this.eventsQueue = [];
            // TODO: centralize this
            var host = this.host;
            fetch$1(host + "/api/v1/track", {
                method: 'POST',
                body: JSON.stringify({ events: events }),
                headers: {
                    'content-type': 'application/json',
                },
                mode: 'cors',
            });
        };
        Object.defineProperty(Builder.prototype, "browserTrackingDisabled", {
            get: function () {
                return Builder.isBrowser && navigator.doNotTrack === '1';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Builder.prototype, "canTrack", {
            get: function () {
                return this.canTrack$.value && !this.browserTrackingDisabled;
            },
            set: function (canTrack) {
                if (this.canTrack !== canTrack) {
                    this.canTrack$.next(canTrack);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Builder.prototype, "editingMode", {
            get: function () {
                return this.editingMode$.value;
            },
            set: function (value) {
                if (value !== this.editingMode) {
                    this.editingMode$.next(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Builder.prototype, "editingModel", {
            get: function () {
                return this.editingModel$.value;
            },
            set: function (value) {
                if (value !== this.editingModel) {
                    this.editingModel$.next(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Builder.prototype.findParentElement = function (target, callback, checkElement) {
            if (checkElement === void 0) { checkElement = true; }
            if (!(target instanceof HTMLElement)) {
                return null;
            }
            var parent = checkElement ? target : target.parentElement;
            do {
                if (!parent) {
                    return null;
                }
                var matches = callback(parent);
                if (matches) {
                    return parent;
                }
            } while ((parent = parent.parentElement));
            return null;
        };
        Builder.prototype.findBuilderParent = function (target) {
            return this.findParentElement(target, function (el) {
                var id = el.getAttribute('builder-id') || el.id;
                return Boolean(id && id.indexOf('builder-') === 0);
            });
        };
        Builder.prototype.setUserAgent = function (userAgent) {
            this.userAgent = userAgent;
        };
        Builder.prototype.track = function (eventName, properties) {
            if (properties === void 0) { properties = {}; }
            // TODO: queue up track requests and fire them off when canTrack set to true - otherwise may get lots of clicks with no impressions
            if (isIframe || !isBrowser) {
                return;
            }
            // batch events
            this.eventsQueue.push({
                type: 'impression',
                data: __assign({ metadata: {
                        sdkVersion: Builder.VERSION,
                        url: location.href,
                    } }, properties, { userAttributes: this.getUserAttributes(), sessionId: this.sessionId }),
            });
            if (this.canTrack) {
                this.throttledClearEventsQueue();
            }
        };
        Builder.prototype.getSessionId = function () {
            var _this = this;
            // TODO: don't set this until gdpr allowed....
            var sessionId = (Builder.isBrowser &&
                (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionStorageKey))) ||
                '';
            if (!sessionId) {
                sessionId = (Date.now() + Math.random()).toString(36);
            }
            // Give the app a second to start up and set canTrack to false if needed
            if (Builder.isBrowser) {
                setTimeout(function () {
                    if (_this.canTrack && typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem(sessionStorageKey, sessionId);
                    }
                });
            }
            return sessionId;
        };
        Builder.prototype.trackImpression = function (contentId, variationId) {
            if (isIframe || !isBrowser) {
                return;
            }
            // TODO: use this.track method
            this.eventsQueue.push({
                type: 'impression',
                data: {
                    contentId: contentId,
                    variationId: variationId !== contentId ? variationId : undefined,
                    ownerId: this.apiKey,
                    userAttributes: this.getUserAttributes(),
                    sessionId: this.sessionId,
                },
            });
            this.throttledClearEventsQueue();
        };
        Object.defineProperty(Builder.prototype, "isDevelopmentEnv", {
            // TODO: set this for QA
            get: function () {
                // Automatic determining of development environment
                return (Builder.isIframe ||
                    (Builder.isBrowser && (location.hostname === 'localhost' || location.port !== '')) ||
                    this.env !== 'production');
            },
            enumerable: true,
            configurable: true
        });
        Builder.prototype.trackInteraction = function (contentId, variationId, alreadyTrackedOne, event) {
            if (alreadyTrackedOne === void 0) { alreadyTrackedOne = false; }
            if (isIframe || !isBrowser) {
                return;
            }
            var target = event && event.target;
            var targetBuilderElement = target && this.findBuilderParent(target);
            function round(num) {
                return Math.round(num * 1000) / 1000;
            }
            var metadata = {};
            if (event) {
                var clientX = event.clientX, clientY = event.clientY;
                if (target) {
                    var targetRect = target.getBoundingClientRect();
                    var xOffset = clientX - targetRect.left;
                    var yOffset = clientY - targetRect.top;
                    var xRatio = round(xOffset / targetRect.width);
                    var yRatio = round(yOffset / targetRect.height);
                    metadata.targetOffset = {
                        x: xRatio,
                        y: yRatio,
                    };
                }
                if (targetBuilderElement) {
                    var targetRect = targetBuilderElement.getBoundingClientRect();
                    var xOffset = clientX - targetRect.left;
                    var yOffset = clientY - targetRect.top;
                    var xRatio = round(xOffset / targetRect.width);
                    var yRatio = round(yOffset / targetRect.height);
                    metadata.builderTargetOffset = {
                        x: xRatio,
                        y: yRatio,
                    };
                }
            }
            // let selector: string | undefined = undefined;
            // if (target) {
            //   try {
            //     selector = finder(target);
            //   } catch (err) {
            //     // nbd
            //   }
            // }
            var builderId = targetBuilderElement &&
                (targetBuilderElement.getAttribute('builder-id') || targetBuilderElement.id);
            // TODO: use this.track method
            this.eventsQueue.push({
                type: 'click',
                data: {
                    contentId: contentId,
                    metadata: metadata,
                    variationId: variationId !== contentId ? variationId : undefined,
                    ownerId: this.apiKey,
                    unique: !alreadyTrackedOne,
                    // targetSelector: selector,
                    targetBuilderElement: builderId || undefined,
                    userAttributes: this.getUserAttributes(),
                    sessionId: this.sessionId,
                },
            });
            this.throttledClearEventsQueue();
        };
        Builder.prototype.component = function (info) {
            if (info === void 0) { info = {}; }
            return Builder.component(info);
        };
        Object.defineProperty(Builder.prototype, "apiKey", {
            get: function () {
                return this.apiKey$.value;
            },
            set: function (key) {
                this.apiKey$.next(key);
            },
            enumerable: true,
            configurable: true
        });
        Builder.prototype.modifySearch = function (search) {
            return search.replace(/(^|&|\?)(builder_.*?)=/gi, function (_match, group1, group2) { return group1 + group2.replace(/_/g, '.') + '='; });
        };
        Builder.prototype.setTestsFromUrl = function () {
            var search = this.getLocation().search;
            var params = QueryString.parseDeep(this.modifySearch(search || '').substr(1));
            var tests = params.builder && params.builder.tests;
            if (tests && typeof tests === 'object') {
                for (var key in tests) {
                    if (tests.hasOwnProperty(key)) {
                        this.setTestCookie(key, tests[key]);
                    }
                }
            }
        };
        Builder.prototype.getOverridesFromQueryString = function () {
            var location = this.getLocation();
            var params = QueryString.parseDeep(this.modifySearch(location.search || '').substr(1));
            var builder = params.builder;
            if (builder) {
                var userAttributes = builder.userAttributes, overrides = builder.overrides, env = builder.env, host = builder.host, api = builder.api, cachebust = builder.cachebust, noCache = builder.noCache, preview = builder.preview;
                if (userAttributes) {
                    this.setUserAttributes(userAttributes);
                }
                if (overrides) {
                    this.overrides = overrides;
                }
                if (env || api) {
                    this.env = env || api;
                }
                if (host) {
                    this.overrideHost = host;
                }
                if (cachebust) {
                    this.cachebust = true;
                }
                if (noCache) {
                    this.noCache = true;
                }
                if (preview) {
                    this.preview = true;
                }
            }
        };
        Builder.prototype.messageFrameLoaded = function () {
            window.parent.postMessage({
                type: 'builder.loaded',
                data: {
                    value: true,
                },
            }, '*');
        };
        Builder.prototype.bindMessageListeners = function () {
            var _this = this;
            if (isBrowser) {
                addEventListener('message', function (event) {
                    var url = parse(event.origin);
                    var allowedHosts = ['builder.io', 'localhost', 'local.builder.io', 'qa.builder.io'];
                    if (allowedHosts.indexOf(url.hostname) === -1) {
                        return;
                    }
                    var data = event.data;
                    if (data) {
                        switch (data.type) {
                            case 'builder.ping': {
                                window.parent.postMessage({
                                    type: 'builder.pong',
                                    data: {},
                                }, '*');
                                break;
                            }
                            case 'builder.triggerAnimation': {
                                Builder.animator.triggerAnimation(data.data);
                                break;
                            }
                            case 'builder.contentUpdate':
                                var model = data.data.modelName;
                                var contentData = data.data.data; // hmmm...
                                var observer = _this.observersByModelType[model];
                                if (observer) {
                                    observer.next([contentData]);
                                }
                                break;
                            case 'builder.getComponents':
                                window.parent.postMessage({
                                    type: 'builder.components',
                                    data: Builder.components.map(function (item) { return Builder.prepareComponentSpecToSend(item); }),
                                }, '*');
                                break;
                            case 'builder.editingModel':
                                _this.editingModel = data.data.model;
                                break;
                            case 'builder.registerComponent':
                                var componentData = data.data;
                                Builder.components.push(componentData);
                                break;
                            case 'builder.blockContentLoading':
                                if (typeof data.data.model === 'string') {
                                    _this.blockContentLoading = data.data.model;
                                }
                                break;
                            case 'builder.editingMode':
                                var editingMode = data.data;
                                if (editingMode) {
                                    _this.editingMode = true;
                                    document.body.classList.add('builder-editing');
                                }
                                else {
                                    _this.editingMode = false;
                                    document.body.classList.remove('builder-editing');
                                }
                                break;
                            case 'builder.editingPageMode':
                                var editingPageMode = data.data;
                                Builder.editingPage = editingPageMode;
                                break;
                            case 'builder.overrideUserAttributes':
                                var userAttributes = data.data;
                                assign(Builder.overrideUserAttributes, userAttributes);
                                _this.flushGetContentQueue(true);
                                // TODO: refetch too
                                break;
                            case 'builder.overrideTestGroup':
                                var _a = data.data, variationId = _a.variationId, contentId = _a.contentId;
                                if (variationId && contentId) {
                                    _this.setTestCookie(contentId, variationId);
                                    _this.flushGetContentQueue(true);
                                }
                                break;
                            case 'builder.evaluate': {
                                var text = data.data.text;
                                var args = data.data.arguments || [];
                                var id_1 = data.data.id;
                                // tslint:disable-next-line:no-function-constructor-with-string-args
                                var fn = new Function(text);
                                var result = void 0;
                                var error = null;
                                try {
                                    result = fn.apply(_this, args);
                                }
                                catch (err) {
                                    error = err;
                                }
                                if (error) {
                                    window.parent.postMessage({
                                        type: 'builder.evaluateError',
                                        data: { id: id_1, error: error.message },
                                    }, '*');
                                }
                                else {
                                    if (result && typeof result.then === 'function') {
                                        result
                                            .then(function (finalResult) {
                                            window.parent.postMessage({
                                                type: 'builder.evaluateResult',
                                                data: { id: id_1, result: finalResult },
                                            }, '*');
                                        })
                                            .catch(console.error);
                                    }
                                    else {
                                        window.parent.postMessage({
                                            type: 'builder.evaluateResult',
                                            data: { result: result, id: id_1 },
                                        }, '*');
                                    }
                                }
                                break;
                            }
                        }
                    }
                });
            }
        };
        Builder.prototype.init = function (apiKey, canTrack) {
            if (canTrack === void 0) { canTrack = true; }
            this.canTrack = canTrack;
            this.apiKey = apiKey;
            return this;
        };
        // TODO: allow adding location object as property and/or in constructor
        Builder.prototype.getLocation = function () {
            return (typeof location === 'object' && parse(location.href)) || {};
        };
        Builder.prototype.getUserAttributes = function (userAgent) {
            if (userAgent === void 0) { userAgent = this.userAgent; }
            this.isUsed = true;
            // TODO: detect desktop browser and OS too
            // TODO: add user agent lib back
            var isMobile = {
                Android: function () {
                    return userAgent.match(/Android/i);
                },
                BlackBerry: function () {
                    return userAgent.match(/BlackBerry/i);
                },
                iOS: function () {
                    return userAgent.match(/iPhone|iPad|iPod/i);
                },
                Opera: function () {
                    return userAgent.match(/Opera Mini/i);
                },
                Windows: function () {
                    return userAgent.match(/IEMobile/i) || userAgent.match(/WPDesktop/i);
                },
                any: function () {
                    return (isMobile.Android() ||
                        isMobile.BlackBerry() ||
                        isMobile.iOS() ||
                        isMobile.Opera() ||
                        isMobile.Windows());
                },
            };
            // FIXME
            var url = this.getLocation();
            // const device = ua.getDevice();
            // TODO: get these from exension as well
            return __assign({ queryString: url.search, urlPath: url.pathname, 
                // Removinf for now because of cache keys
                // referrer: document.referrer,
                // language: navigator.language.split('-')[0],
                device: isMobile.any() ? 'mobile' : 'desktop' }, Builder.overrideUserAttributes);
        };
        Builder.prototype.setUserAttributes = function (options) {
            assign(Builder.overrideUserAttributes, options);
        };
        Builder.prototype.get = function (modelName, options) {
            if (options === void 0) { options = {}; }
            return this.queueGetContent(modelName, options).map(
            /* map( */ function (matches) {
                var match = matches && matches[0];
                var matchData = match && match.data;
                if (!matchData) {
                    return null;
                }
                return {
                    // TODO: add ab test info here and other high level stuff
                    data: matchData,
                    id: match.id,
                    testVariationId: match.testVariationId,
                    testVariationName: match.testVariationName,
                };
            });
            // );
        };
        // TODO: entry id in options
        Builder.prototype.queueGetContent = function (modelName, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var isEditingThisModel = this.editingModel === modelName;
            // TODO: include params in this key........
            var currentObservable = this.observersByModelType[modelName];
            // if (options.query && options.query._id) {
            //   this.flushGetContentQueue([options])
            // }
            if (this.apiKey === 'DEMO' &&
                !(this.overrides[modelName] || options.query) &&
                !options.initialContent) {
                options.initialContent = [];
            }
            var initialContent = options.initialContent;
            // TODO: refresh option in options
            if (currentObservable && (!currentObservable.value || options.cache)) {
                // TODO: test if this ran, otherwise on 404 some observers may never be called...
                if (currentObservable.value) {
                    nextTick(function () {
                        // TODO: return a new observable and only that one fires subscribers, don't refire for existing ones
                        currentObservable.next(currentObservable.value);
                    });
                }
                return currentObservable;
            }
            if (isEditingThisModel) {
                if (Builder.isBrowser) {
                    parent.postMessage({ type: 'builder.updateContent' }, '*');
                }
            }
            if (!initialContent /* || isEditingThisModel */) {
                if (!this.getContentQueue) {
                    this.getContentQueue = [];
                    nextTick(function () {
                        _this.flushGetContentQueue();
                    });
                }
                this.getContentQueue.push(__assign({}, options, { model: modelName }));
            }
            var observable = new BehaviorSubject(null);
            this.observersByModelType[modelName] = observable;
            if (initialContent) {
                nextTick(function () {
                    observable.next(initialContent);
                });
            }
            return observable;
        };
        Builder.prototype.requestUrl = function (url) {
            return fetch$1(url).then(function (res) { return res.json(); });
        };
        Object.defineProperty(Builder.prototype, "host", {
            get: function () {
                if (this.overrideHost) {
                    return this.overrideHost;
                }
                switch (this.env) {
                    case 'qa':
                        return 'https://qa.builder.io';
                    case 'development':
                    case 'dev':
                        return 'http://localhost:5000';
                    default:
                        return 'https://builder.io';
                }
            },
            enumerable: true,
            configurable: true
        });
        Builder.prototype.flushGetContentQueue = function (usePastQueue, useQueue) {
            var _this = this;
            if (usePastQueue === void 0) { usePastQueue = false; }
            if (!this.apiKey) {
                throw new Error('Builder needs to be initialized with an API key!');
            }
            if (!usePastQueue && !this.getContentQueue) {
                return;
            }
            // TODO: do this on every request send?
            this.getOverridesFromQueryString();
            var queryParams = {};
            var pageQueryParams = typeof location !== 'undefined'
                ? QueryString.parseDeep(location.search.substr(1))
                : undefined || {};
            var userAttributes = this.targetContent
                ? this.getUserAttributes()
                : {
                    urlPath: this.getLocation().pathname,
                };
            // TODO: merge in the attribute from query string ones
            // TODO: make this an option per component/request
            queryParams.userAttributes = Builder.useNewApi
                ? userAttributes
                : JSON.stringify(userAttributes);
            var queue = useQueue || (usePastQueue ? this.priorContentQueue : this.getContentQueue) || [];
            if (!usePastQueue && !useQueue) {
                this.priorContentQueue = queue;
                this.getContentQueue = null;
            }
            var cachebust = this.cachebust ||
                isIframe ||
                pageQueryParams.cachebust ||
                pageQueryParams['builder.cachebust'];
            if (cachebust || this.env !== 'production') {
                queryParams.cachebust = true;
                queryParams.cachebuster = Date.now();
            }
            if (this.noCache || this.env !== 'production') {
                queryParams.noCache = true;
            }
            if (size(this.overrides)) {
                for (var key in this.overrides) {
                    if (this.overrides.hasOwnProperty(key)) {
                        queryParams["overrides." + key] = this.overrides[key];
                    }
                }
            }
            if (Builder.useNewApi && !Builder.isReact) {
                // TODO: remove me once v1 page editors converted to v2
                // queryParams.extractCss = true;
                queryParams.prerender = true;
            }
            if (Builder.useNewApi) {
                for (var _i = 0, queue_1 = queue; _i < queue_1.length; _i++) {
                    var options = queue_1[_i];
                    var model = options.model;
                    var properties = [
                        'prerender',
                        'extractCss',
                        'limit',
                        'offset',
                        'query',
                        'preview',
                    ];
                    for (var _a = 0, properties_1 = properties; _a < properties_1.length; _a++) {
                        var key = properties_1[_a];
                        var value = options[key];
                        if (value) {
                            queryParams.options = queryParams.options || {};
                            queryParams.options[model] = queryParams.options[model] || {};
                            queryParams.options[model][key] = JSON.stringify(value);
                        }
                    }
                }
            }
            if (this.preview) {
                queryParams.preview = 'true';
            }
            var hasParams = Object.keys(queryParams).length > 0;
            // TODO: option to force dev or qa api here
            var host = this.useNewContentApi ? 'https://lambda.builder.codes' : this.host;
            var modelNames = queue.map(function (item) { return item.model; }).join(',');
            var queryStr = Builder.useNewApi
                ? QueryString.stringifyDeep(queryParams)
                : QueryString.stringify(queryParams);
            var promise = this.requestUrl(host + "/api/v1/" + (Builder.useNewApi ? 'query' : 'content') + "/" + this.apiKey + "/" + modelNames +
                (queryParams && hasParams ? "?" + queryStr : '')).then(function (result) {
                for (var _i = 0, queue_2 = queue; _i < queue_2.length; _i++) {
                    var options = queue_2[_i];
                    var modelName = options.model;
                    if (modelName === _this.blockContentLoading) {
                        continue;
                    }
                    var isEditingThisModel = _this.editingModel === modelName;
                    if (isEditingThisModel) {
                        parent.postMessage({ type: 'builder.updateContent' }, '*');
                        return;
                    }
                    var observer = _this.observersByModelType[modelName];
                    if (!observer) {
                        return;
                    }
                    var data = result[modelName];
                    var sorted = data; // sortBy(data, item => item.priority);
                    var testModifiedResults = _this.processResultsForTests(sorted);
                    observer.next(testModifiedResults);
                }
            }, function (err) {
                for (var _i = 0, queue_3 = queue; _i < queue_3.length; _i++) {
                    var options = queue_3[_i];
                    var modelName = options.model;
                    var observer = _this.observersByModelType[modelName];
                    if (!observer) {
                        return;
                    }
                    observer.error(err);
                }
            });
            return promise;
        };
        Builder.prototype.processResultsForTests = function (results) {
            var _this = this;
            var mappedResults = results.map(function (item) {
                if (!item.variations) {
                    return item;
                }
                var cookieValue = _this.getTestCookie(item.id);
                var cookieVariation = cookieValue === item.id ? item : item.variations[cookieValue];
                if (cookieVariation) {
                    return __assign({}, item, { data: cookieVariation.data, variationId: cookieValue });
                }
                if (item.variations) {
                    var n = 0;
                    var random = Math.random();
                    for (var id in item.variations) {
                        var variation = item.variations[id];
                        var testRatio = variation.testRatio;
                        n += testRatio;
                        if (random < n) {
                            _this.setTestCookie(item.id, variation.id);
                            return __assign({}, item, { data: variation.data, variationId: variation.id, testVariationId: variation.id, testVariationName: variation.name });
                        }
                    }
                }
                _this.setTestCookie(item.id, item.id);
                return __assign({}, item, { variationId: item.id }, (item.variations &&
                    size(item.variations) && {
                    testVariationId: item.id,
                    testVariationName: 'default',
                }));
            });
            if (isIframe) {
                window.parent.postMessage({ type: 'builder.contentResults', data: { results: mappedResults } }, '*');
            }
            return mappedResults;
        };
        Builder.prototype.getTestCookie = function (contentId) {
            return this.getCookie(this.testCookiePrefix + "." + contentId);
        };
        Builder.prototype.setTestCookie = function (contentId, variationId) {
            if (!this.canTrack) {
                this.cookieQueue.push([contentId, variationId]);
                return;
            }
            // 30 days from now
            var future = new Date();
            future.setDate(future.getDate() + 30);
            return this.setCookie(this.testCookiePrefix + "." + contentId, variationId, future);
        };
        Builder.prototype.getCookie = function (name$$1) {
            return getCookie(name$$1);
        };
        Builder.prototype.setCookie = function (name$$1, value, expires) {
            return setCookie(name$$1, value, expires);
        };
        Builder.prototype.getContent = function (modelName, options) {
            if (options === void 0) { options = {}; }
            if (!this.apiKey) {
                throw new Error('Builder needs to be initialized with an API key!');
            }
            return this.queueGetContent(modelName);
        };
        Builder.components = [];
        Builder.nextTick = nextTick;
        Builder.VERSION = version;
        Builder.useNewApi = true;
        Builder.animator = new Animator();
        Builder._editingPage = false;
        Builder.isIframe = isIframe;
        Builder.isBrowser = isBrowser;
        Builder.isReact = false;
        Builder.overrideUserAttributes = {};
        return Builder;
    }());

    // import 'promise-polyfill/src/polyfill';
    var builder = new Builder();

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign$1 = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty$1.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols) {
    			symbols = getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */

    /**
     * Use invariant() to assert state which your program assumes to be true.
     *
     * Provide sprintf-style format (only %s is supported) and arguments
     * to provide information about what broke and what you were
     * expecting.
     *
     * The invariant message will be stripped in production, but the invariant
     * will remain to ensure logic does not differ in production.
     */

    var validateFormat = function validateFormat(format) {};

    function invariant(condition, format, a, b, c, d, e, f) {
      validateFormat(format);

      if (!condition) {
        var error;
        if (format === undefined) {
          error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error(format.replace(/%s/g, function () {
            return args[argIndex++];
          }));
          error.name = 'Invariant Violation';
        }

        error.framesToPop = 1; // we don't care about invariant's own frame
        throw error;
      }
    }

    var invariant_1 = invariant;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */

    var emptyObject = {};

    var emptyObject_1 = emptyObject;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * 
     */

    function makeEmptyFunction(arg) {
      return function () {
        return arg;
      };
    }

    /**
     * This function accepts and discards inputs; it has no side effects. This is
     * primarily useful idiomatically for overridable function endpoints which
     * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
     */
    var emptyFunction = function emptyFunction() {};

    emptyFunction.thatReturns = makeEmptyFunction;
    emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
    emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
    emptyFunction.thatReturnsNull = makeEmptyFunction(null);
    emptyFunction.thatReturnsThis = function () {
      return this;
    };
    emptyFunction.thatReturnsArgument = function (arg) {
      return arg;
    };

    var emptyFunction_1 = emptyFunction;

    var r="function"===typeof Symbol&&Symbol.for,t=r?Symbol.for("react.element"):60103,u=r?Symbol.for("react.portal"):60106,v=r?Symbol.for("react.fragment"):60107,w=r?Symbol.for("react.strict_mode"):60108,x=r?Symbol.for("react.profiler"):60114,y=r?Symbol.for("react.provider"):60109,z=r?Symbol.for("react.context"):60110,A=r?Symbol.for("react.async_mode"):60111,B=
    r?Symbol.for("react.forward_ref"):60112;var C="function"===typeof Symbol&&Symbol.iterator;function D(a){for(var b=arguments.length-1,e="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=0;c<b;c++)e+="&args[]="+encodeURIComponent(arguments[c+1]);invariant_1(!1,"Minified React error #"+a+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",e);}
    var E={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}};function F(a,b,e){this.props=a;this.context=b;this.refs=emptyObject_1;this.updater=e||E;}F.prototype.isReactComponent={};F.prototype.setState=function(a,b){"object"!==typeof a&&"function"!==typeof a&&null!=a?D("85"):void 0;this.updater.enqueueSetState(this,a,b,"setState");};F.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};function G(){}
    G.prototype=F.prototype;function H(a,b,e){this.props=a;this.context=b;this.refs=emptyObject_1;this.updater=e||E;}var I=H.prototype=new G;I.constructor=H;objectAssign(I,F.prototype);I.isPureReactComponent=!0;var J={current:null},K=Object.prototype.hasOwnProperty,L={key:!0,ref:!0,__self:!0,__source:!0};
    function M(a,b,e){var c=void 0,d={},g=null,h=null;if(null!=b)for(c in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(g=""+b.key),b)K.call(b,c)&&!L.hasOwnProperty(c)&&(d[c]=b[c]);var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){for(var l=Array(f),m=0;m<f;m++)l[m]=arguments[m+2];d.children=l;}if(a&&a.defaultProps)for(c in f=a.defaultProps,f)void 0===d[c]&&(d[c]=f[c]);return{$$typeof:t,type:a,key:g,ref:h,props:d,_owner:J.current}}
    function N(a){return"object"===typeof a&&null!==a&&a.$$typeof===t}function escape(a){var b={"=":"=0",":":"=2"};return"$"+(""+a).replace(/[=:]/g,function(a){return b[a]})}var O=/\/+/g,P=[];function Q(a,b,e,c){if(P.length){var d=P.pop();d.result=a;d.keyPrefix=b;d.func=e;d.context=c;d.count=0;return d}return{result:a,keyPrefix:b,func:e,context:c,count:0}}function R(a){a.result=null;a.keyPrefix=null;a.func=null;a.context=null;a.count=0;10>P.length&&P.push(a);}
    function S(a,b,e,c){var d=typeof a;if("undefined"===d||"boolean"===d)a=null;var g=!1;if(null===a)g=!0;else switch(d){case "string":case "number":g=!0;break;case "object":switch(a.$$typeof){case t:case u:g=!0;}}if(g)return e(c,a,""===b?"."+T(a,0):b),1;g=0;b=""===b?".":b+":";if(Array.isArray(a))for(var h=0;h<a.length;h++){d=a[h];var f=b+T(d,h);g+=S(d,f,e,c);}else if(null===a||"undefined"===typeof a?f=null:(f=C&&a[C]||a["@@iterator"],f="function"===typeof f?f:null),"function"===typeof f)for(a=f.call(a),
    h=0;!(d=a.next()).done;)d=d.value,f=b+T(d,h++),g+=S(d,f,e,c);else"object"===d&&(e=""+a,D("31","[object Object]"===e?"object with keys {"+Object.keys(a).join(", ")+"}":e,""));return g}function T(a,b){return"object"===typeof a&&null!==a&&null!=a.key?escape(a.key):b.toString(36)}function U(a,b){a.func.call(a.context,b,a.count++);}
    function V(a,b,e){var c=a.result,d=a.keyPrefix;a=a.func.call(a.context,b,a.count++);Array.isArray(a)?W(a,c,e,emptyFunction_1.thatReturnsArgument):null!=a&&(N(a)&&(b=d+(!a.key||b&&b.key===a.key?"":(""+a.key).replace(O,"$&/")+"/")+e,a={$$typeof:t,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}),c.push(a));}function W(a,b,e,c,d){var g="";null!=e&&(g=(""+e).replace(O,"$&/")+"/");b=Q(b,g,c,d);null==a||S(a,"",V,b);R(b);}
    var X={Children:{map:function(a,b,e){if(null==a)return a;var c=[];W(a,c,null,b,e);return c},forEach:function(a,b,e){if(null==a)return a;b=Q(null,null,b,e);null==a||S(a,"",U,b);R(b);},count:function(a){return null==a?0:S(a,"",emptyFunction_1.thatReturnsNull,null)},toArray:function(a){var b=[];W(a,b,null,emptyFunction_1.thatReturnsArgument);return b},only:function(a){N(a)?void 0:D("143");return a}},createRef:function(){return{current:null}},Component:F,PureComponent:H,createContext:function(a,b){void 0===b&&(b=null);a={$$typeof:z,
    _calculateChangedBits:b,_defaultValue:a,_currentValue:a,_currentValue2:a,_changedBits:0,_changedBits2:0,Provider:null,Consumer:null};a.Provider={$$typeof:y,_context:a};return a.Consumer=a},forwardRef:function(a){return{$$typeof:B,render:a}},Fragment:v,StrictMode:w,unstable_AsyncMode:A,unstable_Profiler:x,createElement:M,cloneElement:function(a,b,e){null===a||void 0===a?D("267",a):void 0;var c=void 0,d=objectAssign({},a.props),g=a.key,h=a.ref,f=a._owner;if(null!=b){void 0!==b.ref&&(h=b.ref,f=J.current);void 0!==
    b.key&&(g=""+b.key);var l=void 0;a.type&&a.type.defaultProps&&(l=a.type.defaultProps);for(c in b)K.call(b,c)&&!L.hasOwnProperty(c)&&(d[c]=void 0===b[c]&&void 0!==l?l[c]:b[c]);}c=arguments.length-2;if(1===c)d.children=e;else if(1<c){l=Array(c);for(var m=0;m<c;m++)l[m]=arguments[m+2];d.children=l;}return{$$typeof:t,type:a.type,key:g,ref:h,props:d,_owner:f}},createFactory:function(a){var b=M.bind(null,a);b.type=a;return b},isValidElement:N,version:"16.4.1",__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentOwner:J,
    assign:objectAssign}},Y={default:X},Z=Y&&X||Y;var react_production_min=Z.default?Z.default:Z;

    var react = createCommonjsModule(function (module) {

    {
      module.exports = react_production_min;
    }
    });

    function BuilderBlock(options) {
        options.type = 'react';
        return Builder.Component(options);
    }

    var BuilderCanvasComponent = /** @class */ (function (_super) {
        __extends(BuilderCanvasComponent, _super);
        function BuilderCanvasComponent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BuilderCanvasComponent.prototype.render = function () {
            return (react.createElement("div", { className: "builder-content-canvas", style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100vw',
                    marginLeft: 'calc(50% - 50vw)',
                }, dangerouslySetInnerHTML: { __html: this.props.html || '' } }));
        };
        BuilderCanvasComponent = __decorate([
            BuilderBlock({
                name: 'Canvas',
                // tslint:disable-next-line:max-line-length
                image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik03IDE0Yy0xLjY2IDAtMyAxLjM0LTMgMyAwIDEuMzEtMS4xNiAyLTIgMiAuOTIgMS4yMiAyLjQ5IDIgNCAyIDIuMjEgMCA0LTEuNzkgNC00IDAtMS42Ni0xLjM0LTMtMy0zem0xMy43MS05LjM3bC0xLjM0LTEuMzRjLS4zOS0uMzktMS4wMi0uMzktMS40MSAwTDkgMTIuMjUgMTEuNzUgMTVsOC45Ni04Ljk2Yy4zOS0uMzkuMzktMS4wMiAwLTEuNDF6Ii8+Cjwvc3ZnPgo=',
                inputs: [
                    {
                        name: 'html',
                        type: 'html',
                        hideFromUI: true,
                        /* tslint:disable:max-line-length */
                        defaultValue: "\n        <div\n          style=\"pointer-events: none;position: absolute;background-position: center;background-repeat: no-repeat;background-size: contain;width: 568px;height: 330px;background-image: url(https://builder.io/api/v1/image/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2Ffe466c3c1acf48c58d32960128825fd8);top: 43.015625px;left: 50%;margin-left: -269px;\"\n          builder-responsive-styles=\"{&quot;large&quot;:{&quot;position&quot;:&quot;absolute&quot;,&quot;backgroundPosition&quot;:&quot;center&quot;,&quot;backgroundRepeat&quot;:&quot;no-repeat&quot;,&quot;backgroundSize&quot;:&quot;contain&quot;,&quot;width&quot;:&quot;568px&quot;,&quot;height&quot;:&quot;330px&quot;,&quot;backgroundImage&quot;:&quot;url(https://builder.io/api/v1/image/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2Ffe466c3c1acf48c58d32960128825fd8)&quot;,&quot;top&quot;:&quot;43.015625px&quot;,&quot;left&quot;:&quot;50%&quot;,&quot;marginLeft&quot;:&quot;-269px&quot;},&quot;medium&quot;:{},&quot;small&quot;:{},&quot;xsmall&quot;:{}}\">\n        </div>\n        <div\n          style=\"pointer-events: none;display: flex;position: absolute;background-size: contain;background-position: center;background-repeat: no-repeat;justify-content: center;text-align: center;background-color: ;top: 167.015625px;left: 50%;margin-left: -140px;width: 318px;height: 83px;font-size: 26px;\"\n          builder-responsive-styles=\"{&quot;large&quot;:{&quot;display&quot;:&quot;flex&quot;,&quot;position&quot;:&quot;absolute&quot;,&quot;backgroundSize&quot;:&quot;contain&quot;,&quot;backgroundPosition&quot;:&quot;center&quot;,&quot;backgroundRepeat&quot;:&quot;no-repeat&quot;,&quot;justifyContent&quot;:&quot;center&quot;,&quot;textAlign&quot;:&quot;center&quot;,&quot;backgroundColor&quot;:&quot;&quot;,&quot;top&quot;:&quot;167.015625px&quot;,&quot;left&quot;:&quot;50%&quot;,&quot;marginLeft&quot;:&quot;-140px&quot;,&quot;width&quot;:&quot;318px&quot;,&quot;height&quot;:&quot;83px&quot;,&quot;fontSize&quot;:&quot;26px&quot;},&quot;medium&quot;:{},&quot;small&quot;:{},&quot;xsmall&quot;:{}}\">\n          You can draw any content you like here!\n        </div>\n        <div\n          style=\"height: 400px;z-index: 0;position: relative;pointer-events: none;\"data-builder-artboard=\"true\"\n          data-artboard-heights=\"{&quot;large&quot;:400,&quot;medium&quot;:null,&quot;small&quot;:null,&quot;xsmall&quot;:null}\">\n        </div>\n      ",
                    },
                ],
            })
        ], BuilderCanvasComponent);
        return BuilderCanvasComponent;
    }(react.Component));

    function updateQueryParam(uri, key, value) {
        var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
        }
        return uri + separator + key + '=' + encodeURIComponent(value);
    }
    // tslint:disable-next-line:max-line-length
    var icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h' +
        '0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICAgIDxwYXRoIGQ9Ik0xMCAxOGg1VjVoLTV2MTN6bS02IDBoNVY1SDR2MTN6TTE2' +
        'IDV2MTNoNVY1aC01eiIvPgogICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K';
    var defaultText = "\n  <h2>\n    Hello there\n  </h2>\n  <p>\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n    Praesent vehicula turpis ac auctor malesuada. Duis commodo tempor faucibus.\n    Fusce sed arcu id sem mattis egestas euismod vitae urna. Suspendisse eu semper leo.\n    Cras at dui leo. Suspendisse potenti.\n  </p>\n";
    var ContentColumnsComponent = /** @class */ (function (_super) {
        __extends(ContentColumnsComponent, _super);
        function ContentColumnsComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.gutterSize = 15;
            _this.isBrowser = Builder.isBrowser;
            return _this;
        }
        Object.defineProperty(ContentColumnsComponent.prototype, "columns", {
            get: function () {
                return this.props.columns;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ContentColumnsComponent.prototype, "maxImageSize", {
            // Shrink images to be no taller or wider than the maximum width of their column
            get: function () {
                if (!this.columns.length) {
                    return 0;
                }
                var maxPageWidth = 1200;
                var columnsCount = this.columns.length;
                return maxPageWidth / columnsCount;
            },
            enumerable: true,
            configurable: true
        });
        ContentColumnsComponent.prototype.getImageUrl = function (baseUrl) {
            var maxImageSize = this.maxImageSize;
            var url = baseUrl;
            url = updateQueryParam(url, 'width', String(maxImageSize));
            url = updateQueryParam(url, 'height', String(maxImageSize));
            url = updateQueryParam(url, 'quality', '75');
            return url;
        };
        Object.defineProperty(ContentColumnsComponent.prototype, "columnWidth", {
            get: function () {
                var subtractWidth = (this.gutterSize * (this.columns.length - 1)) / this.columns.length;
                return "calc(" + 100 / this.columns.length + "% - " + subtractWidth + "px)";
            },
            enumerable: true,
            configurable: true
        });
        ContentColumnsComponent.prototype.isEmptyHtml = function (html) {
            if (!(html && html.trim())) {
                return true;
            }
            if (!this.isBrowser) {
                return false;
            }
            var div = document.createElement('div');
            div.innerHTML = html;
            return !div.innerText.trim().length;
        };
        ContentColumnsComponent.prototype.getSafeHtml = function (html) {
            if (!html) {
                return '';
            }
            return html;
        };
        ContentColumnsComponent.prototype.render = function () {
            var _this = this;
            var Fragment = react.Fragment;
            return (react.createElement(Fragment, null,
                react.createElement("style", { className: "builder-style builder-style-content-columns" }, "\n          .builder-content-columns a:not([href]) {\n            cursor: default;\n          }\n          .builder-content-columns {\n            display: flex;\n            flex-direction: column;\n          }\n          @media (min-width: 500px) {\n            .builder-content-columns {\n              flex-direction: row;\n            }\n          }\n          .builder-content-columns .column {\n            margin-bottom: 15px;\n          }\n          @media (max-width: 500px) {\n            .builder-content-columns .column {\n              margin-right: 0 !important;\n              margin-left: 0 !important;\n              width: 100% !important;\n            }\n          }\n          .builder-content-columns .image-container {\n            text-align: center;\n          }\n          .builder-content-columns .image {\n            margin: 0 auto 15px auto;\n            max-width: 100%;\n            display: block;\n          }\n          .builder-content-columns .button-container {\n            margin: auto;\n          }\n          .builder-content-columns .button {\n            display: inline-block;\n            margin-top: 15px;\n            min-width: 150px;\n            max-width: 100%;\n            text-align: center;\n            padding: 10px 20px;\n            max-width: 300px;\n            border: 1px solid black;\n          }\n          .builder-content-columns .separator {\n            margin-top: 15px;\n            background: black;\n            height: 5px;\n            width: 100px;\n            max-width: 100%;\n          }\n        "),
                react.createElement("div", { className: "builder-content-columns columns-container", style: { padding: this.gutterSize + "px " + this.gutterSize + "px 0 " + this.gutterSize + "px" } }, this.columns.map(function (column, index) {
                    var first = index === 0;
                    var last = index === _this.columns.length - 1;
                    return (react.createElement("a", { key: index, className: "column", href: column.buttonUrl, style: {
                            width: _this.columnWidth,
                            marginBottom: _this.gutterSize + 'px',
                            marginRight: last ? 0 : _this.gutterSize / 2 + 'px',
                            marginLeft: first ? 0 : _this.gutterSize / 2 + 'px'
                        } },
                        react.createElement("div", { className: "image-container" }, column.image && (react.createElement("img", { role: "presentation", className: "image", src: _this.getImageUrl(column.image) }))),
                        column.text &&
                            !_this.isEmptyHtml(column.text) && (react.createElement("div", { className: "text", dangerouslySetInnerHTML: { __html: _this.getSafeHtml(column.text) } })),
                        react.createElement("div", { className: "button-container" }, column.buttonText && react.createElement("span", { className: "button" }, column.buttonText)),
                        column.showSeparator && react.createElement("div", { className: "separator" })));
                }))));
        };
        ContentColumnsComponent = __decorate([
            BuilderBlock({
                name: 'Content Columns',
                image: icon,
                inputs: [
                    {
                        name: 'columns',
                        type: 'array',
                        subFields: [
                            {
                                name: 'image',
                                type: 'file',
                                allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'gif'],
                                helperText: 'An image will only display if one is set'
                            },
                            {
                                name: 'text',
                                type: 'html',
                                defaultValue: defaultText
                            },
                            {
                                name: 'buttonText',
                                type: 'text',
                                helperText: 'A button will only display if this is set'
                            },
                            {
                                name: 'buttonUrl',
                                type: 'url'
                            },
                            {
                                name: 'showSeparator',
                                type: 'boolean',
                                helperText: 'Show a separator bar at the bottom',
                                defaultValue: false
                            }
                        ],
                        defaultValue: [{ text: defaultText }, { text: defaultText }]
                    }
                ]
            })
        ], ContentColumnsComponent);
        return ContentColumnsComponent;
    }(react.Component));

    var defaultHeroValues = {
        heading: 'Summer Essentials',
        subtext: 'Warm days and cool nights call for easy breezy dresses, playful bags, and effortless' +
            'slides. Meet the must have styles of the season ahead.',
        mainImage: 'https://builder.io/api/v1/image/assets%2FSiV2WLFdmvRvdlAcjQfpSMXMmgf1%2Fc1cf27e59be143e696e8484d5348c6a8',
        backgroundImage: 'https://builder.io/api/v1/image/assets%2FSiV2WLFdmvRvdlAcjQfpSMXMmgf1%2F9db794927ffd4438815962348648d965'
    };
    var heroInputs = [
        { name: 'heading', type: 'string', defaultValue: defaultHeroValues.heading },
        { name: 'subtext', type: 'string', defaultValue: defaultHeroValues.subtext },
        { name: 'subhead', type: 'string' },
        { name: 'imageCredit', type: 'string' },
        { name: 'buttonText', type: 'string', defaultValue: 'Shop Now' },
        { name: 'buttonLink', type: 'url' },
        { name: 'secondaryLinkText', type: 'text' },
        { name: 'secondaryLinkUrl', type: 'url' },
        {
            name: 'mainImage',
            type: 'file',
            allowedFileTypes: ['jpeg', 'jpg'],
            // Retina size is uploaded then downsized with the image cutting API for non-retina devices
            imageHeight: 1000,
            imageWidth: 1600,
            helperText: 'This image must be a 1000 x 1600 jpeg (retina desktop size)',
            defaultValue: defaultHeroValues.mainImage
        },
        {
            name: 'backgroundImage',
            type: 'file',
            allowedFileTypes: ['jpeg', 'jpg'],
            imageHeight: 1000,
            imageWidth: 1600,
            helperText: 'This image must be a 1000 x 1600 jpeg (retina desktop size)',
            defaultValue: defaultHeroValues.backgroundImage
        },
        { name: 'backgroundColor', type: 'color' },
        { name: 'whiteText', type: 'boolean' }
    ];
    var ShopStyleHeroComponent = /** @class */ (function (_super) {
        __extends(ShopStyleHeroComponent, _super);
        function ShopStyleHeroComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tabletBreakpoint = 700;
            _this.desktopBreakpoint = 1200;
            return _this;
        }
        ShopStyleHeroComponent.prototype.parseHeading = function (heading) {
            if (!heading) {
                return [];
            }
            // Split the heading by "--" to insert a bold line in place of this
            // (per the design/spec)
            var lineRegex = /[-]{2,}/g;
            return heading.split(lineRegex);
        };
        // Get an image url that adds compression and scales the image
        // down for non-retina screens
        ShopStyleHeroComponent.prototype.getImageUrl = function (baseUrl) {
            if (baseUrl.indexOf('builder.io') === -1) {
                return baseUrl;
            }
            // Uploaded image is largest possible size - desktop retina size
            var imageHeight = 1000;
            var imageWidth = 1600;
            // const { isMobile, isRetina } = this.deviceService;
            // hardcoding for now - use srcset or react context for real thing
            var isMobile = false;
            var isRetina = false;
            // For non-retina devices reduce the image size by half, and for mobile devices
            // reduce the image size by half again
            var reductionFactor = (isMobile ? 2 : 1) * (!isRetina ? 2 : 1);
            var width = imageWidth / reductionFactor;
            var height = imageHeight / reductionFactor;
            return baseUrl + "?quality=85&width=" + width + "&height=" + height;
        };
        ShopStyleHeroComponent.prototype.render = function () {
            var Fragment = react.Fragment;
            return (react.createElement(Fragment, null,
                react.createElement("style", { className: "builder-style builder-hero-style" }, "\n          .builder-content-hero.hero-content {\n            position: relative;\n            display: block;\n            overflow: hidden;\n            min-height: 300px;\n            padding: 10px;\n            background-color: white;\n            width: 100vw;\n            margin-left: calc(50% - 50vw);\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content {\n              padding: 20px 0;\n            }\n          }\n          .builder-content-hero.hero-content .cta-button {\n            display: inline-block;\n            min-width: 85px;\n            padding: 0 10px;\n            margin-top: 15px;\n            overflow: hidden;\n            font-size: 12px;\n            line-height: 35px;\n            text-align: center;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n            border: 1.5px solid black;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .light .cta-button {\n              border-color: white;\n            }\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .cta-button {\n              margin-top: 10px;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .cta-button {\n              max-width: 100%;\n              min-width: 230px;\n              margin-top: 20px;\n              font-size: 18px;\n              line-height: 50px;\n              border-width: 3px;\n            }\n          }\n          .builder-content-hero.hero-content,\n          .builder-content-hero.hero-content .content-container {\n            height: 350px;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content,\n            .builder-content-hero.hero-content .content-container {\n              height: 300px;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content,\n            .builder-content-hero.hero-content .content-container {\n              height: 500px;\n            }\n          }\n          .builder-content-hero.hero-content .content-container {\n            position: relative;\n            display: flex;\n            height: 100%;\n            max-width: 1600px;\n            margin: auto;\n            color: black;\n            border: 1px solid #e4e4e4;\n            flex-direction: column-reverse;\n          }\n          .builder-content-hero.hero-content .content-container.light {\n            color: white;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .content-container {\n              border: none;\n              flex-direction: row;\n            }\n          }\n          .builder-content-hero.hero-content .video {\n            position: absolute;\n            height: 100%;\n            min-width: 100%;\n            opacity: 0;\n            transition: opacity 0.2s;\n            object-position: center;\n            object-fit: cover;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .video {\n              width: 1600px;\n              margin-left: calc(50% - 800px);\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .video {\n              width: 1600px;\n              margin-left: calc(50% - 800px);\n            }\n          }\n          .builder-content-hero.hero-content .video.loaded {\n            opacity: 1;\n          }\n          .builder-content-hero.hero-content .inner-content {\n            display: flex;\n            width: 100%;\n            text-align: center;\n            background-position: center;\n            background-size: cover;\n          }\n          .builder-content-hero.hero-content .inner-content.text-side {\n            height: 180px;\n            color: black;\n            background-color: white;\n          }\n          .builder-content-hero.hero-content .inner-content.image-side {\n            position: relative;\n            height: 220px;\n            overflow: hidden;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .inner-content {\n              width: 50%;\n              background-position: center left;\n            }\n            .builder-content-hero.hero-content .inner-content.text-side {\n              height: auto;\n              color: inherit;\n              text-align: left;\n              background-color: transparent;\n              background-position: center right;\n            }\n            .builder-content-hero.hero-content .inner-content.image-side {\n              height: auto;\n            }\n          }\n          @media (max-width: 700px) {\n            .builder-content-hero.hero-content .inner-content.text-side {\n              background-image: none !important;\n            }\n          }\n          .builder-content-hero.hero-content .subhead {\n            display: none;\n            color: #444;\n            text-transform: uppercase;\n          }\n          .builder-content-hero.hero-content .light .subhead {\n            color: white;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .subhead {\n              display: block;\n              margin-bottom: 10px;\n              font-size: 9px;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .subhead {\n              margin-bottom: 15px;\n              font-size: 11px;\n            }\n          }\n          .builder-content-hero.hero-content .text-content {\n            position: relative;\n            width: 100%;\n            max-width: 580px;\n            max-height: 100%;\n            padding: 0 20px;\n            margin-left: auto;\n            overflow: hidden;\n            align-self: center;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .text-content {\n              padding: 0 20px;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .text-content {\n              padding: 20px 50px;\n            }\n          }\n          .builder-content-hero.hero-content .heading {\n            font-size: 18px;\n            line-height: normal;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .heading {\n              font-size: 28px;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .heading {\n              font-size: 54px;\n            }\n          }\n          .builder-content-hero.hero-content .subtext {\n            display: none;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .subtext {\n              display: block;\n              margin-top: 10px;\n              font-size: 12px;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .subtext {\n              margin-top: 20px;\n              font-size: 14px;\n            }\n          }\n          .builder-content-hero.hero-content .bar {\n            display: none;\n            vertical-align: middle;\n            background-color: black;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .bar {\n              display: inline-block;\n              width: 70px;\n              height: 3px;\n            }\n            .builder-content-hero.hero-content .light .bar {\n              background-color: white;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .bar {\n              width: 150px;\n              height: 5px;\n            }\n          }\n          .builder-content-hero.hero-content .secondary-link {\n            display: block;\n            padding: 10px;\n            text-align: center;\n            text-decoration: underline;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .secondary-link {\n              padding: 0;\n              margin-top: 10px;\n              text-align: left;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .secondary-link {\n              margin-top: 20px;\n            }\n          }\n          .builder-content-hero.hero-content .credit-text {\n            position: static;\n            display: none;\n            font-size: 10px;\n            color: #444;\n            text-align: center;\n          }\n          .builder-content-hero.hero-content .credit-text.outer {\n            display: block;\n            margin-top: 10px;\n          }\n          @media (min-width: 700px) {\n            .builder-content-hero.hero-content .credit-text {\n              position: absolute;\n              bottom: -15px;\n              left: 20px;\n              display: block;\n              text-align: left;\n            }\n            .builder-content-hero.hero-content .credit-text.outer {\n              display: none;\n            }\n          }\n          @media (min-width: 1600px) {\n            .builder-content-hero.hero-content .credit-text {\n              left: 5px;\n            }\n          }\n          "),
                react.createElement("div", { className: "builder-content-hero hero-content" },
                    react.createElement("a", { href: this.props.buttonLink },
                        react.createElement("div", { className: 'content-container' + (this.props.whiteText ? ' light' : ''), style: { backgroundColor: this.props.backgroundColor } },
                            react.createElement("video", { muted: true, autoPlay: true, loop: true, className: "video", src: this.props.mainVideo }),
                            this.props.imageCredit && (react.createElement("div", { className: "credit-text" }, this.props.imageCredit)),
                            react.createElement("div", { className: "inner-content text-side", style: {
                                    backgroundImage: this.props.backgroundImage &&
                                        'url(' + this.getImageUrl(this.props.backgroundImage) + ')'
                                } },
                                react.createElement("div", { className: "text-content" },
                                    this.props.subhead && react.createElement("div", { className: "subhead" }, this.props.subhead),
                                    react.createElement("div", { className: "heading" }, this.parseHeading(this.props.heading).map(function (part, index) { return (react.createElement("span", null,
                                        index !== 0 && react.createElement("span", { className: "bar" }),
                                        react.createElement("span", null, part))); })),
                                    this.props.subtext && react.createElement("div", { className: "subtext" }, this.props.subtext),
                                    this.props.buttonText && (react.createElement("a", { className: "cta-button", href: this.props.buttonLink }, this.props.buttonText)),
                                    this.props.secondaryLinkText && (react.createElement("a", { className: "secondary-link", href: this.props.secondaryLinkText }, this.props.secondaryLinkText)))),
                            react.createElement("div", { className: "inner-content image-side", style: {
                                    backgroundImage: this.props.mainImage && 'url(' + this.getImageUrl(this.props.mainImage) + ')'
                                } }))),
                    this.props.imageCredit && (react.createElement("div", { className: "credit-text outer" }, this.props.imageCredit)))));
        };
        ShopStyleHeroComponent = __decorate([
            BuilderBlock({
                name: 'Hero',
                inputs: heroInputs
            })
        ], ShopStyleHeroComponent);
        return ShopStyleHeroComponent;
    }(react.Component));

    var BuilderSpacerComponent = /** @class */ (function (_super) {
        __extends(BuilderSpacerComponent, _super);
        function BuilderSpacerComponent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BuilderSpacerComponent.prototype.render = function () {
            return (react.createElement("div", { className: "builder-content-spacer", style: {
                    display: 'flex',
                    height: this.props.height,
                } }));
        };
        BuilderSpacerComponent = __decorate([
            BuilderBlock({
                name: 'Spacer',
                // tslint:disable-next-line:max-line-length
                image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICAgIDxwYXRoIGQ9Ik0xOSA1djE0SDVWNWgxNG0wLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yeiIvPgogICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K',
                // tslint:enable-next-line:max-line-length
                inputs: [
                    {
                        name: 'height',
                        type: 'number',
                        defaultValue: 50,
                    },
                ],
            })
        ], BuilderSpacerComponent);
        return BuilderSpacerComponent;
    }(react.Component));

    var sizeNames = ['xsmall', 'small', 'medium', 'large'];
    // TODO: put in @builder.io/core
    var sizes = {
        xsmall: {
            min: 0,
            default: 0,
            max: 0
        },
        small: {
            min: 320,
            default: 321,
            max: 640
        },
        medium: {
            min: 641,
            default: 642,
            max: 991
        },
        large: {
            min: 990,
            default: 991,
            max: 1200
        },
        getWidthForSize: function (size) {
            return this[size].default;
        },
        getSizeForWidth: function (width) {
            for (var _i = 0, sizeNames_1 = sizeNames; _i < sizeNames_1.length; _i++) {
                var size = sizeNames_1[_i];
                var value = this[size];
                if (width <= value.max) {
                    return size;
                }
            }
            return 'large';
        }
    };

    var BuilderStoreContext = react.createContext({
        state: {},
        update: function (mutator) { }
    });

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Built-in value references. */
    var Symbol$1 = root.Symbol;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty$2.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject$1(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction$1(value) {
      if (!isObject$1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype,
        objectProto$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$2.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString$1.call(hasOwnProperty$3).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject$1(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$3.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$4.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$4.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$5.call(data, key);
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /* Built-in method references that are verified to be native. */
    var Map$1 = getNative(root, 'Map');

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map$1 || ListCache),
        'string': new Hash
      };
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = MapCache;

    /** Used as the maximum memoize cache size. */
    var MAX_MEMOIZE_SIZE = 500;

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    /** Used to match property names within property paths. */
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46 /* . */) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return arrayMap(value, baseToString) + '';
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString(value));
    }

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = castPath(path, object);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    /**
     * Gets the last element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the last element of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     */
    function last(array) {
      var length = array == null ? 0 : array.length;
      return length ? array[length - 1] : undefined;
    }

    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$5.hasOwnProperty;

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$6.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * The base implementation of `_.set`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @param {Function} [customizer] The function to customize path creation.
     * @returns {Object} Returns `object`.
     */
    function baseSet(object, path, value, customizer) {
      if (!isObject$1(object)) {
        return object;
      }
      path = castPath(path, object);

      var index = -1,
          length = path.length,
          lastIndex = length - 1,
          nested = object;

      while (nested != null && ++index < length) {
        var key = toKey(path[index]),
            newValue = value;

        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = isObject$1(objValue)
              ? objValue
              : (isIndex(path[index + 1]) ? [] : {});
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }

    /**
     * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
     * it's created. Arrays are created for missing index properties while objects
     * are created for all other missing properties. Use `_.setWith` to customize
     * `path` creation.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.set(object, 'a[0].b.c', 4);
     * console.log(object.a[0].b.c);
     * // => 4
     *
     * _.set(object, ['x', '0', 'y', 'z'], 5);
     * console.log(object.x[0].y.z);
     * // => 5
     */
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.isNaN` without support for number objects.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     */
    function baseIsNaN(value) {
      return value !== value;
    }

    /**
     * A specialized version of `_.indexOf` which performs strict equality
     * comparisons of values, i.e. `===`.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      return value === value
        ? strictIndexOf(array, value, fromIndex)
        : baseFindIndex(array, baseIsNaN, fromIndex);
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction$1(value);
    }

    /** `Object#toString` result references. */
    var stringTag = '[object String]';

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' ||
        (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
    }

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject$1(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject$1(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    /** Used as references for various `Number` constants. */
    var INFINITY$2 = 1 / 0,
        MAX_INTEGER = 1.7976931348623157e+308;

    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY$2 || value === -INFINITY$2) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger(value) {
      var result = toFinite(value),
          remainder = result % 1;

      return result === result ? (remainder ? result - remainder : result) : 0;
    }

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$6.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty$7.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    /** Detect free variable `exports`. */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag$1 = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag$1 = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag$1] =
    typedArrayTags[weakMapTag] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /** Detect free variable `exports`. */
    var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports$1 && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$7.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$8.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

      return value === proto;
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = overArg(Object.keys, Object);

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$9.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$9.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object == null ? [] : baseValues(object, keys(object));
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'a': 1, 'b': 2 }, 1);
     * // => true
     *
     * _.includes('abcd', 'bc');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
    }

    /**
     * A specialized version of `_.reduce` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initAccum] Specify using the first element of `array` as
     *  the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1,
          length = array == null ? 0 : array.length;

      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEach = createBaseEach(baseForOwn);

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED$2);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    /** Built-in value references. */
    var Uint8Array = root.Uint8Array;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$1 = 1,
        COMPARE_UNORDERED_FLAG$1 = 2;

    /** `Object#toString` result references. */
    var boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        errorTag$1 = '[object Error]',
        mapTag$1 = '[object Map]',
        numberTag$1 = '[object Number]',
        regexpTag$1 = '[object RegExp]',
        setTag$1 = '[object Set]',
        stringTag$2 = '[object String]',
        symbolTag$1 = '[object Symbol]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$1 = '[object DataView]';

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag$1:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag$1:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag$1:
        case dateTag$1:
        case numberTag$1:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag$1:
          return object.name == other.name && object.message == other.message;

        case regexpTag$1:
        case stringTag$2:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag$1:
          var convert = mapToArray;

        case setTag$1:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG$1;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag$1:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /** Used for built-in method references. */
    var objectProto$10 = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$10.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable$1.call(object, symbol);
      });
    };

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$2 = 1;

    /** Used for built-in method references. */
    var objectProto$11 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$10 = objectProto$11.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$10.call(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView');

    /* Built-in method references that are verified to be native. */
    var Promise$2 = getNative(root, 'Promise');

    /* Built-in method references that are verified to be native. */
    var Set$1 = getNative(root, 'Set');

    /* Built-in method references that are verified to be native. */
    var WeakMap = getNative(root, 'WeakMap');

    /** `Object#toString` result references. */
    var mapTag$2 = '[object Map]',
        objectTag$1 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag$2 = '[object Set]',
        weakMapTag$1 = '[object WeakMap]';

    var dataViewTag$2 = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map$1),
        promiseCtorString = toSource(Promise$2),
        setCtorString = toSource(Set$1),
        weakMapCtorString = toSource(WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
        (Map$1 && getTag(new Map$1) != mapTag$2) ||
        (Promise$2 && getTag(Promise$2.resolve()) != promiseTag) ||
        (Set$1 && getTag(new Set$1) != setTag$2) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag$1)) {
      getTag = function(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$2;
            case mapCtorString: return mapTag$2;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$2;
            case weakMapCtorString: return weakMapTag$1;
          }
        }
        return result;
      };
    }

    var getTag$1 = getTag;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$3 = 1;

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        objectTag$2 = '[object Object]';

    /** Used for built-in method references. */
    var objectProto$12 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$11 = objectProto$12.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag$1 : getTag$1(object),
          othTag = othIsArr ? arrayTag$1 : getTag$1(other);

      objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
      othTag = othTag == argsTag$2 ? objectTag$2 : othTag;

      var objIsObj = objTag == objectTag$2,
          othIsObj = othTag == objectTag$2,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
        var objIsWrapped = objIsObj && hasOwnProperty$11.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty$11.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$4 = 1,
        COMPARE_UNORDERED_FLAG$2 = 2;

    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject$1(value);
    }

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = castPath(path, object);

      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength(length) && isIndex(key, length) &&
        (isArray(object) || isArguments(object));
    }

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$5 = 1,
        COMPARE_UNORDERED_FLAG$3 = 2;

    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn(object, path)
          : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
      };
    }

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == 'object') {
        return isArray(value)
          ? baseMatchesProperty(value[0], value[1])
          : baseMatches(value);
      }
      return property(value);
    }

    /**
     * The base implementation of `_.reduce` and `_.reduceRight`, without support
     * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} accumulator The initial value.
     * @param {boolean} initAccum Specify using the first or last element of
     *  `collection` as the initial value.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @returns {*} Returns the accumulated value.
     */
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index, collection) {
        accumulator = initAccum
          ? (initAccum = false, value)
          : iteratee(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * Reduces `collection` to a value which is the accumulated result of running
     * each element in `collection` thru `iteratee`, where each successive
     * invocation is supplied the return value of the previous. If `accumulator`
     * is not given, the first element of `collection` is used as the initial
     * value. The iteratee is invoked with four arguments:
     * (accumulator, value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.reduce`, `_.reduceRight`, and `_.transform`.
     *
     * The guarded methods are:
     * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
     * and `sortBy`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @returns {*} Returns the accumulated value.
     * @see _.reduceRight
     * @example
     *
     * _.reduce([1, 2], function(sum, n) {
     *   return sum + n;
     * }, 0);
     * // => 3
     *
     * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
     *   (result[value] || (result[value] = [])).push(key);
     *   return result;
     * }, {});
     * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
     */
    function reduce(collection, iteratee, accumulator) {
      var func = isArray(collection) ? arrayReduce : baseReduce,
          initAccum = arguments.length < 3;

      return func(collection, baseIteratee(iteratee, 4), accumulator, initAccum, baseEach);
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$13 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$12 = objectProto$13.hasOwnProperty;

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject$1(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty$12.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn$1(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }

    /**
     * The base implementation of `_.assignIn` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn$1(source), object);
    }

    /** Detect free variable `exports`. */
    var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;

    /** Built-in value references. */
    var Buffer$1 = moduleExports$2 ? root.Buffer : undefined,
        allocUnsafe = Buffer$1 ? Buffer$1.allocUnsafe : undefined;

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * Copies own symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }

    /** Built-in value references. */
    var getPrototype = overArg(Object.getPrototypeOf, Object);

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own and inherited enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols$1 ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };

    /**
     * Copies own and inherited symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn$1, getSymbolsIn);
    }

    /** Used for built-in method references. */
    var objectProto$14 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$13 = objectProto$14.hasOwnProperty;

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty$13.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$2 = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
    }

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /** `Object#toString` result references. */
    var boolTag$2 = '[object Boolean]',
        dateTag$2 = '[object Date]',
        mapTag$3 = '[object Map]',
        numberTag$2 = '[object Number]',
        regexpTag$2 = '[object RegExp]',
        setTag$3 = '[object Set]',
        stringTag$3 = '[object String]',
        symbolTag$2 = '[object Symbol]';

    var arrayBufferTag$2 = '[object ArrayBuffer]',
        dataViewTag$3 = '[object DataView]',
        float32Tag$1 = '[object Float32Array]',
        float64Tag$1 = '[object Float64Array]',
        int8Tag$1 = '[object Int8Array]',
        int16Tag$1 = '[object Int16Array]',
        int32Tag$1 = '[object Int32Array]',
        uint8Tag$1 = '[object Uint8Array]',
        uint8ClampedTag$1 = '[object Uint8ClampedArray]',
        uint16Tag$1 = '[object Uint16Array]',
        uint32Tag$1 = '[object Uint32Array]';

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag$2:
          return cloneArrayBuffer(object);

        case boolTag$2:
        case dateTag$2:
          return new Ctor(+object);

        case dataViewTag$3:
          return cloneDataView(object, isDeep);

        case float32Tag$1: case float64Tag$1:
        case int8Tag$1: case int16Tag$1: case int32Tag$1:
        case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
          return cloneTypedArray(object, isDeep);

        case mapTag$3:
          return new Ctor;

        case numberTag$2:
        case stringTag$3:
          return new Ctor(object);

        case regexpTag$2:
          return cloneRegExp(object);

        case setTag$3:
          return new Ctor;

        case symbolTag$2:
          return cloneSymbol(object);
      }
    }

    /** Built-in value references. */
    var objectCreate = Object.create;

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject$1(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }

    /** `Object#toString` result references. */
    var mapTag$4 = '[object Map]';

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike(value) && getTag$1(value) == mapTag$4;
    }

    /* Node.js helper references. */
    var nodeIsMap = nodeUtil && nodeUtil.isMap;

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

    /** `Object#toString` result references. */
    var setTag$4 = '[object Set]';

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike(value) && getTag$1(value) == setTag$4;
    }

    /* Node.js helper references. */
    var nodeIsSet = nodeUtil && nodeUtil.isSet;

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG = 4;

    /** `Object#toString` result references. */
    var argsTag$3 = '[object Arguments]',
        arrayTag$2 = '[object Array]',
        boolTag$3 = '[object Boolean]',
        dateTag$3 = '[object Date]',
        errorTag$2 = '[object Error]',
        funcTag$2 = '[object Function]',
        genTag$1 = '[object GeneratorFunction]',
        mapTag$5 = '[object Map]',
        numberTag$3 = '[object Number]',
        objectTag$3 = '[object Object]',
        regexpTag$3 = '[object RegExp]',
        setTag$5 = '[object Set]',
        stringTag$4 = '[object String]',
        symbolTag$3 = '[object Symbol]',
        weakMapTag$2 = '[object WeakMap]';

    var arrayBufferTag$3 = '[object ArrayBuffer]',
        dataViewTag$4 = '[object DataView]',
        float32Tag$2 = '[object Float32Array]',
        float64Tag$2 = '[object Float64Array]',
        int8Tag$2 = '[object Int8Array]',
        int16Tag$2 = '[object Int16Array]',
        int32Tag$2 = '[object Int32Array]',
        uint8Tag$2 = '[object Uint8Array]',
        uint8ClampedTag$2 = '[object Uint8ClampedArray]',
        uint16Tag$2 = '[object Uint16Array]',
        uint32Tag$2 = '[object Uint32Array]';

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag$3] = cloneableTags[arrayTag$2] =
    cloneableTags[arrayBufferTag$3] = cloneableTags[dataViewTag$4] =
    cloneableTags[boolTag$3] = cloneableTags[dateTag$3] =
    cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
    cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
    cloneableTags[int32Tag$2] = cloneableTags[mapTag$5] =
    cloneableTags[numberTag$3] = cloneableTags[objectTag$3] =
    cloneableTags[regexpTag$3] = cloneableTags[setTag$5] =
    cloneableTags[stringTag$4] = cloneableTags[symbolTag$3] =
    cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
    cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
    cloneableTags[errorTag$2] = cloneableTags[funcTag$2] =
    cloneableTags[weakMapTag$2] = false;

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Deep clone
     *  2 - Flatten inherited properties
     *  4 - Clone symbols
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG;

      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject$1(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag$1(value),
            isFunc = tag == funcTag$2 || tag == genTag$1;

        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag$3 || tag == argsTag$3 || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? copySymbolsIn(value, baseAssignIn(result, value))
              : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });

        return result;
      }

      if (isMap(value)) {
        value.forEach(function(subValue, key) {
          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });

        return result;
      }

      var keysFunc = isFull
        ? (isFlat ? getAllKeysIn : getAllKeys)
        : (isFlat ? keysIn : keys);

      var props = isArr ? undefined : keysFunc(value);
      arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }

    /**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    /**
     * Gets the parent value at `path` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} path The path to get the parent value of.
     * @returns {*} Returns the parent value.
     */
    function parent$1(object, path) {
      return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
    }

    /**
     * The base implementation of `_.unset`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The property path to unset.
     * @returns {boolean} Returns `true` if the property is deleted, else `false`.
     */
    function baseUnset(object, path) {
      path = castPath(path, object);
      object = parent$1(object, path);
      return object == null || delete object[toKey(last(path))];
    }

    /** `Object#toString` result references. */
    var objectTag$4 = '[object Object]';

    /** Used for built-in method references. */
    var funcProto$2 = Function.prototype,
        objectProto$15 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$2 = funcProto$2.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$14 = objectProto$15.hasOwnProperty;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString$2.call(Object);

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag$4) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty$14.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString$2.call(Ctor) == objectCtorString;
    }

    /**
     * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
     * objects.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {string} key The key of the property to inspect.
     * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
     */
    function customOmitClone(value) {
      return isPlainObject(value) ? undefined : value;
    }

    /** Built-in value references. */
    var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

    /**
     * Checks if `value` is a flattenable `arguments` object or array.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
     */
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) ||
        !!(spreadableSymbol && value && value[spreadableSymbol]);
    }

    /**
     * The base implementation of `_.flatten` with support for restricting flattening.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {number} depth The maximum recursion depth.
     * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
     * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
     * @param {Array} [result=[]] The initial result value.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
          length = array.length;

      predicate || (predicate = isFlattenable);
      result || (result = []);

      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }

    /**
     * Flattens `array` a single level deep.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to flatten.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flatten([1, [2, [3, [4]], 5]]);
     * // => [1, 2, [3, [4]], 5]
     */
    function flatten(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, 1) : [];
    }

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax$1 = Math.max;

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax$1(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax$1(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };

    /** Used to detect hot functions by number of calls within a span of milliseconds. */
    var HOT_COUNT = 800,
        HOT_SPAN = 16;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeNow = Date.now;

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = shortOut(baseSetToString);

    /**
     * A specialized version of `baseRest` which flattens the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @returns {Function} Returns the new function.
     */
    function flatRest(func) {
      return setToString(overRest(func, undefined, flatten), func + '');
    }

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG$1 = 1,
        CLONE_FLAT_FLAG$1 = 2,
        CLONE_SYMBOLS_FLAG$1 = 4;

    /**
     * The opposite of `_.pick`; this method creates an object composed of the
     * own and inherited enumerable property paths of `object` that are not omitted.
     *
     * **Note:** This method is considerably slower than `_.pick`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {...(string|string[])} [paths] The property paths to omit.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.omit(object, ['a', 'c']);
     * // => { 'b': '2' }
     */
    var omit = flatRest(function(object, paths) {
      var result = {};
      if (object == null) {
        return result;
      }
      var isDeep = false;
      paths = arrayMap(paths, function(path) {
        path = castPath(path, object);
        isDeep || (isDeep = path.length > 1);
        return path;
      });
      copyObject(object, getAllKeysIn(object), result);
      if (isDeep) {
        result = baseClone(result, CLONE_DEEP_FLAG$1 | CLONE_FLAT_FLAG$1 | CLONE_SYMBOLS_FLAG$1, customOmitClone);
      }
      var length = paths.length;
      while (length--) {
        baseUnset(result, paths[length]);
      }
      return result;
    });

    /**
     * The base implementation of `_.propertyOf` without support for deep paths.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? undefined : object[key];
      };
    }

    /** Used to map Latin Unicode letters to basic Latin letters. */
    var deburredLetters = {
      // Latin-1 Supplement block.
      '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
      '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
      '\xc7': 'C',  '\xe7': 'c',
      '\xd0': 'D',  '\xf0': 'd',
      '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
      '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
      '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
      '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
      '\xd1': 'N',  '\xf1': 'n',
      '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
      '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
      '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
      '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
      '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
      '\xc6': 'Ae', '\xe6': 'ae',
      '\xde': 'Th', '\xfe': 'th',
      '\xdf': 'ss',
      // Latin Extended-A block.
      '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
      '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
      '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
      '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
      '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
      '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
      '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
      '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
      '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
      '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
      '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
      '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
      '\u0134': 'J',  '\u0135': 'j',
      '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
      '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
      '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
      '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
      '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
      '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
      '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
      '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
      '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
      '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
      '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
      '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
      '\u0163': 't',  '\u0165': 't', '\u0167': 't',
      '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
      '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
      '\u0174': 'W',  '\u0175': 'w',
      '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
      '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
      '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
      '\u0132': 'IJ', '\u0133': 'ij',
      '\u0152': 'Oe', '\u0153': 'oe',
      '\u0149': "'n", '\u017f': 's'
    };

    /**
     * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
     * letters to basic Latin letters.
     *
     * @private
     * @param {string} letter The matched letter to deburr.
     * @returns {string} Returns the deburred letter.
     */
    var deburrLetter = basePropertyOf(deburredLetters);

    /** Used to match Latin Unicode letters (excluding mathematical operators). */
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

    /** Used to compose unicode character classes. */
    var rsComboMarksRange = '\\u0300-\\u036f',
        reComboHalfMarksRange = '\\ufe20-\\ufe2f',
        rsComboSymbolsRange = '\\u20d0-\\u20ff',
        rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;

    /** Used to compose unicode capture groups. */
    var rsCombo = '[' + rsComboRange + ']';

    /**
     * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
     * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
     */
    var reComboMark = RegExp(rsCombo, 'g');

    /**
     * Deburrs `string` by converting
     * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
     * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
     * letters to basic Latin letters and removing
     * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to deburr.
     * @returns {string} Returns the deburred string.
     * @example
     *
     * _.deburr('déjà vu');
     * // => 'deja vu'
     */
    function deburr(string) {
      string = toString(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
    }

    /** Used to match words composed of alphanumeric characters. */
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

    /**
     * Splits an ASCII `string` into an array of its words.
     *
     * @private
     * @param {string} The string to inspect.
     * @returns {Array} Returns the words of `string`.
     */
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }

    /** Used to detect strings that need a more robust regexp to match words. */
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

    /**
     * Checks if `string` contains a word composed of Unicode symbols.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {boolean} Returns `true` if a word is found, else `false`.
     */
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }

    /** Used to compose unicode character classes. */
    var rsAstralRange = '\\ud800-\\udfff',
        rsComboMarksRange$1 = '\\u0300-\\u036f',
        reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
        rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
        rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
        rsDingbatRange = '\\u2700-\\u27bf',
        rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
        rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
        rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
        rsPunctuationRange = '\\u2000-\\u206f',
        rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
        rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
        rsVarRange = '\\ufe0e\\ufe0f',
        rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

    /** Used to compose unicode capture groups. */
    var rsApos = "['\u2019]",
        rsBreak = '[' + rsBreakRange + ']',
        rsCombo$1 = '[' + rsComboRange$1 + ']',
        rsDigits = '\\d+',
        rsDingbat = '[' + rsDingbatRange + ']',
        rsLower = '[' + rsLowerRange + ']',
        rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
        rsFitz = '\\ud83c[\\udffb-\\udfff]',
        rsModifier = '(?:' + rsCombo$1 + '|' + rsFitz + ')',
        rsNonAstral = '[^' + rsAstralRange + ']',
        rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
        rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
        rsUpper = '[' + rsUpperRange + ']',
        rsZWJ = '\\u200d';

    /** Used to compose unicode regexes. */
    var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
        rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
        rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
        rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
        reOptMod = rsModifier + '?',
        rsOptVar = '[' + rsVarRange + ']?',
        rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
        rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
        rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
        rsSeq = rsOptVar + reOptMod + rsOptJoin,
        rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq;

    /** Used to match complex or compound words. */
    var reUnicodeWord = RegExp([
      rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
      rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
      rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
      rsUpper + '+' + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join('|'), 'g');

    /**
     * Splits a Unicode `string` into an array of its words.
     *
     * @private
     * @param {string} The string to inspect.
     * @returns {Array} Returns the words of `string`.
     */
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }

    /**
     * Splits `string` into an array of its words.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {RegExp|string} [pattern] The pattern to match words.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the words of `string`.
     * @example
     *
     * _.words('fred, barney, & pebbles');
     * // => ['fred', 'barney', 'pebbles']
     *
     * _.words('fred, barney, & pebbles', /[^, ]+/g);
     * // => ['fred', 'barney', '&', 'pebbles']
     */
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? undefined : pattern;

      if (pattern === undefined) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }

    /** Used to compose unicode capture groups. */
    var rsApos$1 = "['\u2019]";

    /** Used to match apostrophes. */
    var reApos = RegExp(rsApos$1, 'g');

    /**
     * Creates a function like `_.camelCase`.
     *
     * @private
     * @param {Function} callback The function to combine each word.
     * @returns {Function} Returns the new compounder function.
     */
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
      };
    }

    /**
     * Converts `string` to
     * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the kebab cased string.
     * @example
     *
     * _.kebabCase('Foo Bar');
     * // => 'foo-bar'
     *
     * _.kebabCase('fooBar');
     * // => 'foo-bar'
     *
     * _.kebabCase('__FOO_BAR__');
     * // => 'foo-bar'
     */
    var kebabCase = createCompounder(function(result, word, index) {
      return result + (index ? '-' : '') + word.toLowerCase();
    });

    var isPromise = function (thing) {
        return typeof thing.then === 'function';
    };
    var isRequestInfo = function (thing) { return !isPromise(thing); };
    var BuilderAsyncRequestsContext = react.createContext({
        requests: [],
        errors: [],
        logs: []
    });

    // TODO: pull from builer internal utils
    var fastClone = function (obj) { return JSON.parse(JSON.stringify(obj)); };
    function mapToCss(map, spaces) {
        if (spaces === void 0) { spaces = 2; }
        return reduce(map, function (memo, value, key) {
            return (memo + (value && value.trim() ? "\n" + ' '.repeat(spaces) + kebabCase(key) + ": " + value + ";" : ''));
        }, '');
    }
    function capitalize(str) {
        if (!str) {
            return;
        }
        return str[0].toUpperCase() + str.slice(1);
    }
    var BuilderBlock$1 = /** @class */ (function (_super) {
        __extends(BuilderBlock, _super);
        function BuilderBlock() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.privateState = {
                state: {},
                update: function () { }
            };
            return _this;
        }
        // TODO: handle adding return if none provided
        BuilderBlock.prototype.stringToFunction = function (str) {
            // FIXME: gross hack
            var useReturn = !(str.includes(';') || str.includes(' return '));
            var fn = function () { };
            try {
                // tslint:disable-next-line:no-function-constructor-with-string-args
                if (Builder.isBrowser) {
                    fn = new Function('state', 'event', "with (state) {\n            " + (useReturn ? "return (" + str + ");" : str) + ";\n          }");
                }
            }
            catch (error) {
                if (this._errors) {
                    this._errors.push(error);
                }
                var message = error && error.message;
                if (message && typeof message === 'string') {
                    if (this._logs && this._logs.indexOf(message) === -1) {
                        this._logs.push(message);
                    }
                }
                console.warn('Function compile error', error);
            }
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    if (Builder.isBrowser) {
                        return fn.apply(void 0, args);
                    }
                }
                catch (error) {
                    console.warn('Eval error', error);
                }
            };
        };
        Object.defineProperty(BuilderBlock.prototype, "styles", {
            get: function () {
                var _a = this.props, block = _a.block, size = _a.size;
                var styles = [];
                var startIndex = sizeNames.indexOf(size || 'large');
                if (block.responsiveStyles) {
                    for (var i = startIndex; i < sizeNames.length; i = i + 1) {
                        var name_1 = sizeNames[i];
                        if (block.responsiveStyles[name_1]) {
                            styles.push(block.responsiveStyles[name_1]);
                        }
                    }
                }
                // On the server apply the initial animation state (TODO: maybe not for load time hm)
                // TODO: maybe /s/ server renders content pages hmm
                var isServer = !Builder.isBrowser;
                var initialAnimationStepStyles;
                if (isServer) {
                    var animation = block.animations && block.animations[0];
                    var firstStep = animation && animation.steps && animation.steps[0];
                    var stepStyles = firstStep && firstStep.styles;
                    if (stepStyles) {
                        initialAnimationStepStyles = stepStyles;
                    }
                }
                return Object.assign.apply(Object, [{}].concat(styles.reverse(), [initialAnimationStepStyles]));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BuilderBlock.prototype, "css", {
            get: function () {
                var self = this.props.block;
                var baseStyles = __assign$1({}, (self.responsiveStyles && self.responsiveStyles.large));
                var css = ".builder-block." + self.id + " {" + mapToCss(baseStyles) + "}";
                var reversedNames = sizeNames.slice().reverse();
                if (self.responsiveStyles) {
                    for (var _i = 0, reversedNames_1 = reversedNames; _i < reversedNames_1.length; _i++) {
                        var size = reversedNames_1[_i];
                        if (size !== 'large' &&
                            size !== 'xsmall' &&
                            self.responsiveStyles[size] &&
                            Object.keys(self.responsiveStyles[size]).length) {
                            css += "\n@media (max-width: " + sizes[size].max + "px) { \n.builder-block." + self.id + " {" + mapToCss(self.responsiveStyles[size], 4) + " } }";
                        }
                    }
                }
                return css;
            },
            enumerable: true,
            configurable: true
        });
        BuilderBlock.prototype.componentDidMount = function () {
            var _this = this;
            var block = this.props.block;
            var animations = block && block.animations;
            if (animations) {
                var options = {
                    animations: fastClone(animations)
                };
                // TODO: listen to Builder.editingMode and bind animations when editing
                // and unbind when not
                // TODO: apply bindings first
                if (block.bindings) {
                    for (var key in block.bindings) {
                        if (key.startsWith('animations.')) {
                            var value = this.stringToFunction(block.bindings[key]);
                            if (value !== undefined) {
                                set(options, key, value(this.privateState.state));
                            }
                        }
                    }
                }
                Builder.animator.bindAnimations(options.animations.map(function (animation) { return (__assign$1({}, animation, { elementId: _this.props.block.id })); }));
            }
        };
        // <!-- Builder Blocks --> in comments hmm
        BuilderBlock.prototype.getElement = function (index, state) {
            var _this = this;
            if (index === void 0) { index = 0; }
            if (state === void 0) { state = this.privateState.state; }
            var _a = this.props, block = _a.block, child = _a.child, fieldName = _a.fieldName;
            var TagName = (block.tagName || 'div').toLowerCase();
            var InnerComponent;
            var componentName = block.component && (block.component.name || block.component.component);
            var componentInfo = null;
            if (block.component && !block.component.class) {
                componentInfo = Builder.components.find(function (item) { return item.name === componentName; }) || null;
                if (componentInfo && componentInfo.class) {
                    InnerComponent = componentInfo.class;
                }
            }
            var TextTag = 'span';
            var isBlock = !includes(['absolute', 'fixed'], block.responsiveStyles &&
                block.responsiveStyles.large &&
                block.responsiveStyles.large.position /*( this.styles.position */);
            var options = __assign$1({}, block.properties, { style: {} // this.styles
             });
            options = __assign$1({}, options.properties, options);
            if (block.component) {
                options.component = fastClone(block.component);
            }
            // Binding should be properties to href or href?
            // Manual style editor show bindings
            // Show if things bound in overlays hmm
            if (block.bindings) {
                for (var key in block.bindings) {
                    var value = this.stringToFunction(block.bindings[key]);
                    set(options, key, value(state));
                }
            }
            if (block.actions) {
                var _loop_1 = function (key) {
                    var value = block.actions[key];
                    options['on' + capitalize(key)] = function (event) {
                        // TODO: pass in store
                        var fn = _this.stringToFunction(value);
                        _this.privateState.update(function (state) {
                            return fn(state, event);
                        });
                    };
                };
                for (var key in block.actions) {
                    _loop_1(key);
                }
            }
            var innerComponentProperties = options.component && __assign$1({}, options.options, (options.component.options || options.component.data));
            var voidElements = [
                'area',
                'base',
                'br',
                'col',
                'embed',
                'hr',
                'img',
                'input',
                'link',
                'meta',
                'param',
                'source',
                'track',
                'wbr'
            ];
            var isVoid = voidElements.indexOf(TagName) !== -1;
            var noWrap = componentInfo && componentInfo.fragment;
            var finalOptions = __assign$1({}, omit(options, 'class'), { class: "builder-block " + this.id + (block.class ? " " + block.class : '') + (block.component && !includes(['Image', 'Video', 'Banner'], componentName)
                    ? " builder-has-component"
                    : '') + (options.class ? ' ' + options.class : ''), key: this.id + index, 'builder-id': this.id });
            if (((finalOptions.properties && finalOptions.properties.href) ||
                finalOptions.href) &&
                TagName === 'div') {
                TagName = 'a';
            }
            // TODO: test it out
            return (react.createElement(BuilderAsyncRequestsContext.Consumer, null, function (value) {
                _this._asyncRequests = value && value.requests;
                _this._errors = value && value.errors;
                _this._logs = value && value.logs;
                return (react.createElement(react.Fragment, null,
                    isVoid ? (react.createElement(TagName, __assign$1({}, finalOptions))) : InnerComponent && noWrap ? (
                    // TODO: pass the class to be easier
                    react.createElement(InnerComponent, __assign$1({}, finalOptions, { builderBlock: block }))) : (react.createElement(TagName, __assign$1({}, finalOptions),
                        react.createElement(react.Fragment, null,
                            InnerComponent && (react.createElement(InnerComponent, __assign$1({ builderBlock: block }, innerComponentProperties))),
                            block.text || options.text ? (
                            // TODO: remove me! No longer in use (maybe with rich text will be back tho)
                            react.createElement(TextTag, { dangerouslySetInnerHTML: { __html: options.text || block.text } })) : block.children && block.children.length ? (block.children.map(function (block, index) { return (react.createElement(BuilderBlock, { key: (_this.id || '') + index, block: block, index: index, size: _this.props.size, fieldName: _this.props.fieldName, child: _this.props.child })); })) : null))),
                    react.createElement("style", { className: "builder-style" }, (InnerComponent && !isBlock
                        ? "." + _this.id + " > * { height: 100%; width: 100%; }"
                        : '') + _this.css)));
            }));
        };
        Object.defineProperty(BuilderBlock.prototype, "id", {
            get: function () {
                var block = this.props.block;
                if (!block.id.startsWith('builder')) {
                    return 'builder-' + block.id;
                }
                return block.id;
            },
            enumerable: true,
            configurable: true
        });
        BuilderBlock.prototype.contents = function (state) {
            var _this = this;
            var block = this.props.block;
            // this.setState(state);
            this.privateState = state;
            if (block.repeat && block.repeat.collection) {
                var collectionPath = block.repeat.collection;
                var collectionName = last((collectionPath || '').trim().split('.'));
                var itemName_1 = block.repeat.itemName || (collectionName ? collectionName + 'Item' : 'item');
                var array = get(state.state, collectionPath);
                if (isArray(array)) {
                    return array.map(function (data, index) {
                        var _a;
                        // TODO: Builder state produce the data
                        var childState = __assign$1({}, state.state, (_a = { $index: index, $item: data }, _a[itemName_1] = data, _a));
                        return (react.createElement(BuilderStoreContext.Provider, { value: __assign$1({}, state, { state: childState }) }, _this.getElement(index, childState)));
                    });
                }
                return null;
            }
            return this.getElement();
        };
        BuilderBlock.prototype.render = function () {
            var _this = this;
            return (react.createElement(BuilderStoreContext.Consumer, null, function (value) { return _this.contents(value); }));
        };
        return BuilderBlock;
    }(react.Component));

    // TODO: options to set direciotn
    var BuilderBlocks = /** @class */ (function (_super) {
        __extends(BuilderBlocks, _super);
        function BuilderBlocks() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.onClickEmptyBlocks = function () {
                if (Builder.isIframe && _this.noBlocks) {
                    window.parent.postMessage({
                        type: 'builder.clickEmptyBlocks',
                        data: {
                            parentElementId: _this.props.parentElementId,
                            dataPath: _this.props.dataPath
                        }
                    }, '*');
                }
            };
            return _this;
        }
        Object.defineProperty(BuilderBlocks.prototype, "isRoot", {
            get: function () {
                return !this.props.child;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BuilderBlocks.prototype, "noBlocks", {
            get: function () {
                var blocks = this.props.blocks;
                return !(blocks && blocks.length);
            },
            enumerable: true,
            configurable: true
        });
        // <!-- Builder Blocks --> in comments hmm
        BuilderBlocks.prototype.render = function () {
            var _this = this;
            var blocks = this.props.blocks;
            // TODO: how deep check this automatically for mobx... hmmm optional / peer dependency?
            return (
            // TODO: component <Stack direction="vertical">
            // TODO: react.fragment instead?
            react.createElement("div", { className: 'builder-blocks' +
                    (this.noBlocks ? ' no-blocks' : '') +
                    (this.props.child ? ' builder-blocks-child' : '') +
                    (this.props.className ? ' ' + this.props.className : ''), "builder-type": "blocks", "builder-path": Builder.isIframe ? this.props.dataPath : undefined, style: __assign$1({ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }, this.props.style), onClick: function () {
                    if (_this.noBlocks) {
                        _this.onClickEmptyBlocks();
                    }
                } }, blocks &&
                blocks.map(function (block, index) { return (react.createElement(BuilderBlock$1, { key: block.id + index, block: block, index: index, fieldName: _this.props.fieldName, child: _this.props.child })); })));
        };
        return BuilderBlocks;
    }(react.Component));

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isFunction$2(x) {
        return typeof x === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    var config = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = /*@__PURE__*/ new Error();
                /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            else if (_enable_super_gross_mode_that_will_cause_bad_things) {
                /*@__PURE__*/ console.log('RxJS: Back to a better error behavior. Thank you. <3');
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function hostReportError(err) {
        setTimeout(function () { throw err; });
    }

    /** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
    var empty = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        },
        complete: function () { }
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArray$1 = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isObject$2(x) {
        return x != null && typeof x === 'object';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var errorObject = { e: {} };

    /** PURE_IMPORTS_START _errorObject PURE_IMPORTS_END */
    var tryCatchTarget;
    function tryCatcher() {
        try {
            return tryCatchTarget.apply(this, arguments);
        }
        catch (e) {
            errorObject.e = e;
            return errorObject;
        }
    }
    function tryCatch(fn) {
        tryCatchTarget = fn;
        return tryCatcher;
    }

    /** PURE_IMPORTS_START tslib PURE_IMPORTS_END */
    var UnsubscriptionError = /*@__PURE__*/ (function (_super) {
        __extends(UnsubscriptionError, _super);
        function UnsubscriptionError(errors) {
            var _this = _super.call(this, errors ?
                errors.length + " errors occurred during unsubscription:\n  " + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '') || this;
            _this.errors = errors;
            _this.name = 'UnsubscriptionError';
            Object.setPrototypeOf(_this, UnsubscriptionError.prototype);
            return _this;
        }
        return UnsubscriptionError;
    }(Error));

    /** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_tryCatch,_util_errorObject,_util_UnsubscriptionError PURE_IMPORTS_END */
    var Subscription$1 = /*@__PURE__*/ (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parent = null;
            this._parents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var hasErrors = false;
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parent = null;
            this._parents = null;
            this._subscriptions = null;
            var index = -1;
            var len = _parents ? _parents.length : 0;
            while (_parent) {
                _parent.remove(this);
                _parent = ++index < len && _parents[index] || null;
            }
            if (isFunction$2(_unsubscribe)) {
                var trial = tryCatch(_unsubscribe).call(this);
                if (trial === errorObject) {
                    hasErrors = true;
                    errors = errors || (errorObject.e instanceof UnsubscriptionError ?
                        flattenUnsubscriptionErrors(errorObject.e.errors) : [errorObject.e]);
                }
            }
            if (isArray$1(_subscriptions)) {
                index = -1;
                len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject$2(sub)) {
                        var trial = tryCatch(sub.unsubscribe).call(sub);
                        if (trial === errorObject) {
                            hasErrors = true;
                            errors = errors || [];
                            var err = errorObject.e;
                            if (err instanceof UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
            }
            if (hasErrors) {
                throw new UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            if (!teardown || (teardown === Subscription.EMPTY)) {
                return Subscription.EMPTY;
            }
            if (teardown === this) {
                return this;
            }
            var subscription = teardown;
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (typeof subscription._addParent !== 'function') {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default:
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
            var subscriptions = this._subscriptions || (this._subscriptions = []);
            subscriptions.push(subscription);
            subscription._addParent(this);
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.prototype._addParent = function (parent) {
            var _a = this, _parent = _a._parent, _parents = _a._parents;
            if (!_parent || _parent === parent) {
                this._parent = parent;
            }
            else if (!_parents) {
                this._parents = [parent];
            }
            else if (_parents.indexOf(parent) === -1) {
                _parents.push(parent);
            }
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function')
        ? /*@__PURE__*/ Symbol.for('rxSubscriber')
        : '@@rxSubscriber';

    /** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
    var Subscriber = /*@__PURE__*/ (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (isTrustedSubscriber(destinationOrNext)) {
                            var trustedSubscriber = destinationOrNext[rxSubscriber]();
                            _this.syncErrorThrowable = trustedSubscriber.syncErrorThrowable;
                            _this.destination = trustedSubscriber;
                            trustedSubscriber.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _a = this, _parent = _a._parent, _parents = _a._parents;
            this._parent = null;
            this._parents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parent = _parent;
            this._parents = _parents;
            return this;
        };
        return Subscriber;
    }(Subscription$1));
    var SafeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction$2(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== empty) {
                    context = Object.create(observerOrNext);
                    if (isFunction$2(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));
    function isTrustedSubscriber(obj) {
        return obj instanceof Subscriber || ('syncErrorThrowable' in obj && obj[rxSubscriber]);
    }

    /** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber]) {
                return nextOrObserver[rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber(empty);
        }
        return new Subscriber(nextOrObserver, error, complete);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var observable = typeof Symbol === 'function' && Symbol.observable || '@@observable';

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function noop() { }

    /** PURE_IMPORTS_START _noop PURE_IMPORTS_END */
    function pipeFromArray(fns) {
        if (!fns) {
            return noop;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    /** PURE_IMPORTS_START _util_toSubscriber,_internal_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
    var Observable = /*@__PURE__*/ (function () {
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable$$1 = new Observable();
            observable$$1.source = this;
            observable$$1.operator = operator;
            return observable$$1;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber(observerOrNext, error, complete);
            if (operator) {
                operator.call(sink, this.source);
            }
            else {
                sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                sink.error(err);
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor = config.Promise || Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }

    /** PURE_IMPORTS_START tslib PURE_IMPORTS_END */
    var ObjectUnsubscribedError = /*@__PURE__*/ (function (_super) {
        __extends(ObjectUnsubscribedError, _super);
        function ObjectUnsubscribedError() {
            var _this = _super.call(this, 'object unsubscribed') || this;
            _this.name = 'ObjectUnsubscribedError';
            Object.setPrototypeOf(_this, ObjectUnsubscribedError.prototype);
            return _this;
        }
        return ObjectUnsubscribedError;
    }(Error));

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var SubjectSubscription = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscription, _super);
        function SubjectSubscription(subject, subscriber) {
            var _this = _super.call(this) || this;
            _this.subject = subject;
            _this.subscriber = subscriber;
            _this.closed = false;
            return _this;
        }
        SubjectSubscription.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.closed = true;
            var subject = this.subject;
            var observers = subject.observers;
            this.subject = null;
            if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
                return;
            }
            var subscriberIndex = observers.indexOf(this.subscriber);
            if (subscriberIndex !== -1) {
                observers.splice(subscriberIndex, 1);
            }
        };
        return SubjectSubscription;
    }(Subscription$1));

    /** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
    var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscriber, _super);
        function SubjectSubscriber(destination) {
            var _this = _super.call(this, destination) || this;
            _this.destination = destination;
            return _this;
        }
        return SubjectSubscriber;
    }(Subscriber));
    var Subject = /*@__PURE__*/ (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.observers = [];
            _this.closed = false;
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype[rxSubscriber] = function () {
            return new SubjectSubscriber(this);
        };
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype.next = function (value) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            if (!this.isStopped) {
                var observers = this.observers;
                var len = observers.length;
                var copy = observers.slice();
                for (var i = 0; i < len; i++) {
                    copy[i].next(value);
                }
            }
        };
        Subject.prototype.error = function (err) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.hasError = true;
            this.thrownError = err;
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].error(err);
            }
            this.observers.length = 0;
        };
        Subject.prototype.complete = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].complete();
            }
            this.observers.length = 0;
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = true;
            this.closed = true;
            this.observers = null;
        };
        Subject.prototype._trySubscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return _super.prototype._trySubscribe.call(this, subscriber);
            }
        };
        Subject.prototype._subscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else if (this.hasError) {
                subscriber.error(this.thrownError);
                return Subscription$1.EMPTY;
            }
            else if (this.isStopped) {
                subscriber.complete();
                return Subscription$1.EMPTY;
            }
            else {
                this.observers.push(subscriber);
                return new SubjectSubscription(this, subscriber);
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = /*@__PURE__*/ (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var destination = this.destination;
            if (destination && destination.next) {
                destination.next(value);
            }
        };
        AnonymousSubject.prototype.error = function (err) {
            var destination = this.destination;
            if (destination && destination.error) {
                this.destination.error(err);
            }
        };
        AnonymousSubject.prototype.complete = function () {
            var destination = this.destination;
            if (destination && destination.complete) {
                this.destination.complete();
            }
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var source = this.source;
            if (source) {
                return this.source.subscribe(subscriber);
            }
            else {
                return Subscription$1.EMPTY;
            }
        };
        return AnonymousSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function refCount() {
        return function refCountOperatorFunction(source) {
            return source.lift(new RefCountOperator(source));
        };
    }
    var RefCountOperator = /*@__PURE__*/ (function () {
        function RefCountOperator(connectable) {
            this.connectable = connectable;
        }
        RefCountOperator.prototype.call = function (subscriber, source) {
            var connectable = this.connectable;
            connectable._refCount++;
            var refCounter = new RefCountSubscriber(subscriber, connectable);
            var subscription = source.subscribe(refCounter);
            if (!refCounter.closed) {
                refCounter.connection = connectable.connect();
            }
            return subscription;
        };
        return RefCountOperator;
    }());
    var RefCountSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(RefCountSubscriber, _super);
        function RefCountSubscriber(destination, connectable) {
            var _this = _super.call(this, destination) || this;
            _this.connectable = connectable;
            return _this;
        }
        RefCountSubscriber.prototype._unsubscribe = function () {
            var connectable = this.connectable;
            if (!connectable) {
                this.connection = null;
                return;
            }
            this.connectable = null;
            var refCount = connectable._refCount;
            if (refCount <= 0) {
                this.connection = null;
                return;
            }
            connectable._refCount = refCount - 1;
            if (refCount > 1) {
                this.connection = null;
                return;
            }
            var connection = this.connection;
            var sharedConnection = connectable._connection;
            this.connection = null;
            if (sharedConnection && (!connection || sharedConnection === connection)) {
                sharedConnection.unsubscribe();
            }
        };
        return RefCountSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subject,_Observable,_Subscriber,_Subscription,_operators_refCount PURE_IMPORTS_END */
    var ConnectableObservable = /*@__PURE__*/ (function (_super) {
        __extends(ConnectableObservable, _super);
        function ConnectableObservable(source, subjectFactory) {
            var _this = _super.call(this) || this;
            _this.source = source;
            _this.subjectFactory = subjectFactory;
            _this._refCount = 0;
            _this._isComplete = false;
            return _this;
        }
        ConnectableObservable.prototype._subscribe = function (subscriber) {
            return this.getSubject().subscribe(subscriber);
        };
        ConnectableObservable.prototype.getSubject = function () {
            var subject = this._subject;
            if (!subject || subject.isStopped) {
                this._subject = this.subjectFactory();
            }
            return this._subject;
        };
        ConnectableObservable.prototype.connect = function () {
            var connection = this._connection;
            if (!connection) {
                this._isComplete = false;
                connection = this._connection = new Subscription$1();
                connection.add(this.source
                    .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
                if (connection.closed) {
                    this._connection = null;
                    connection = Subscription$1.EMPTY;
                }
                else {
                    this._connection = connection;
                }
            }
            return connection;
        };
        ConnectableObservable.prototype.refCount = function () {
            return refCount()(this);
        };
        return ConnectableObservable;
    }(Observable));
    var ConnectableSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(ConnectableSubscriber, _super);
        function ConnectableSubscriber(destination, connectable) {
            var _this = _super.call(this, destination) || this;
            _this.connectable = connectable;
            return _this;
        }
        ConnectableSubscriber.prototype._error = function (err) {
            this._unsubscribe();
            _super.prototype._error.call(this, err);
        };
        ConnectableSubscriber.prototype._complete = function () {
            this.connectable._isComplete = true;
            this._unsubscribe();
            _super.prototype._complete.call(this);
        };
        ConnectableSubscriber.prototype._unsubscribe = function () {
            var connectable = this.connectable;
            if (connectable) {
                this.connectable = null;
                var connection = connectable._connection;
                connectable._refCount = 0;
                connectable._subject = null;
                connectable._connection = null;
                if (connection) {
                    connection.unsubscribe();
                }
            }
        };
        return ConnectableSubscriber;
    }(SubjectSubscriber));
    var RefCountSubscriber$1 = /*@__PURE__*/ (function (_super) {
        __extends(RefCountSubscriber, _super);
        function RefCountSubscriber(destination, connectable) {
            var _this = _super.call(this, destination) || this;
            _this.connectable = connectable;
            return _this;
        }
        RefCountSubscriber.prototype._unsubscribe = function () {
            var connectable = this.connectable;
            if (!connectable) {
                this.connection = null;
                return;
            }
            this.connectable = null;
            var refCount$$1 = connectable._refCount;
            if (refCount$$1 <= 0) {
                this.connection = null;
                return;
            }
            connectable._refCount = refCount$$1 - 1;
            if (refCount$$1 > 1) {
                this.connection = null;
                return;
            }
            var connection = this.connection;
            var sharedConnection = connectable._connection;
            this.connection = null;
            if (sharedConnection && (!connection || sharedConnection === connection)) {
                sharedConnection.unsubscribe();
            }
        };
        return RefCountSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber,_Subscription,_Observable,_Subject PURE_IMPORTS_END */
    var GroupBySubscriber = /*@__PURE__*/ (function (_super) {
        __extends(GroupBySubscriber, _super);
        function GroupBySubscriber(destination, keySelector, elementSelector, durationSelector, subjectSelector) {
            var _this = _super.call(this, destination) || this;
            _this.keySelector = keySelector;
            _this.elementSelector = elementSelector;
            _this.durationSelector = durationSelector;
            _this.subjectSelector = subjectSelector;
            _this.groups = null;
            _this.attemptedToUnsubscribe = false;
            _this.count = 0;
            return _this;
        }
        GroupBySubscriber.prototype._next = function (value) {
            var key;
            try {
                key = this.keySelector(value);
            }
            catch (err) {
                this.error(err);
                return;
            }
            this._group(value, key);
        };
        GroupBySubscriber.prototype._group = function (value, key) {
            var groups = this.groups;
            if (!groups) {
                groups = this.groups = new Map();
            }
            var group = groups.get(key);
            var element;
            if (this.elementSelector) {
                try {
                    element = this.elementSelector(value);
                }
                catch (err) {
                    this.error(err);
                }
            }
            else {
                element = value;
            }
            if (!group) {
                group = (this.subjectSelector ? this.subjectSelector() : new Subject());
                groups.set(key, group);
                var groupedObservable = new GroupedObservable(key, group, this);
                this.destination.next(groupedObservable);
                if (this.durationSelector) {
                    var duration = void 0;
                    try {
                        duration = this.durationSelector(new GroupedObservable(key, group));
                    }
                    catch (err) {
                        this.error(err);
                        return;
                    }
                    this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
                }
            }
            if (!group.closed) {
                group.next(element);
            }
        };
        GroupBySubscriber.prototype._error = function (err) {
            var groups = this.groups;
            if (groups) {
                groups.forEach(function (group, key) {
                    group.error(err);
                });
                groups.clear();
            }
            this.destination.error(err);
        };
        GroupBySubscriber.prototype._complete = function () {
            var groups = this.groups;
            if (groups) {
                groups.forEach(function (group, key) {
                    group.complete();
                });
                groups.clear();
            }
            this.destination.complete();
        };
        GroupBySubscriber.prototype.removeGroup = function (key) {
            this.groups.delete(key);
        };
        GroupBySubscriber.prototype.unsubscribe = function () {
            if (!this.closed) {
                this.attemptedToUnsubscribe = true;
                if (this.count === 0) {
                    _super.prototype.unsubscribe.call(this);
                }
            }
        };
        return GroupBySubscriber;
    }(Subscriber));
    var GroupDurationSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(GroupDurationSubscriber, _super);
        function GroupDurationSubscriber(key, group, parent) {
            var _this = _super.call(this, group) || this;
            _this.key = key;
            _this.group = group;
            _this.parent = parent;
            return _this;
        }
        GroupDurationSubscriber.prototype._next = function (value) {
            this.complete();
        };
        GroupDurationSubscriber.prototype._unsubscribe = function () {
            var _a = this, parent = _a.parent, key = _a.key;
            this.key = this.parent = null;
            if (parent) {
                parent.removeGroup(key);
            }
        };
        return GroupDurationSubscriber;
    }(Subscriber));
    var GroupedObservable = /*@__PURE__*/ (function (_super) {
        __extends(GroupedObservable, _super);
        function GroupedObservable(key, groupSubject, refCountSubscription) {
            var _this = _super.call(this) || this;
            _this.key = key;
            _this.groupSubject = groupSubject;
            _this.refCountSubscription = refCountSubscription;
            return _this;
        }
        GroupedObservable.prototype._subscribe = function (subscriber) {
            var subscription = new Subscription$1();
            var _a = this, refCountSubscription = _a.refCountSubscription, groupSubject = _a.groupSubject;
            if (refCountSubscription && !refCountSubscription.closed) {
                subscription.add(new InnerRefCountSubscription(refCountSubscription));
            }
            subscription.add(groupSubject.subscribe(subscriber));
            return subscription;
        };
        return GroupedObservable;
    }(Observable));
    var InnerRefCountSubscription = /*@__PURE__*/ (function (_super) {
        __extends(InnerRefCountSubscription, _super);
        function InnerRefCountSubscription(parent) {
            var _this = _super.call(this) || this;
            _this.parent = parent;
            parent.count++;
            return _this;
        }
        InnerRefCountSubscription.prototype.unsubscribe = function () {
            var parent = this.parent;
            if (!parent.closed && !this.closed) {
                _super.prototype.unsubscribe.call(this);
                parent.count -= 1;
                if (parent.count === 0 && parent.attemptedToUnsubscribe) {
                    parent.unsubscribe();
                }
            }
        };
        return InnerRefCountSubscription;
    }(Subscription$1));

    /** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */
    var BehaviorSubject$1 = /*@__PURE__*/ (function (_super) {
        __extends(BehaviorSubject, _super);
        function BehaviorSubject(_value) {
            var _this = _super.call(this) || this;
            _this._value = _value;
            return _this;
        }
        Object.defineProperty(BehaviorSubject.prototype, "value", {
            get: function () {
                return this.getValue();
            },
            enumerable: true,
            configurable: true
        });
        BehaviorSubject.prototype._subscribe = function (subscriber) {
            var subscription = _super.prototype._subscribe.call(this, subscriber);
            if (subscription && !subscription.closed) {
                subscriber.next(this._value);
            }
            return subscription;
        };
        BehaviorSubject.prototype.getValue = function () {
            if (this.hasError) {
                throw this.thrownError;
            }
            else if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return this._value;
            }
        };
        BehaviorSubject.prototype.next = function (value) {
            _super.prototype.next.call(this, this._value = value);
        };
        return BehaviorSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var Action = /*@__PURE__*/ (function (_super) {
        __extends(Action, _super);
        function Action(scheduler, work) {
            return _super.call(this) || this;
        }
        Action.prototype.schedule = function (state, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            return this;
        };
        return Action;
    }(Subscription$1));

    /** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */
    var AsyncAction = /*@__PURE__*/ (function (_super) {
        __extends(AsyncAction, _super);
        function AsyncAction(scheduler, work) {
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            _this.pending = false;
            return _this;
        }
        AsyncAction.prototype.schedule = function (state, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (this.closed) {
                return this;
            }
            this.state = state;
            var id = this.id;
            var scheduler = this.scheduler;
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, delay);
            }
            this.pending = true;
            this.delay = delay;
            this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
            return this;
        };
        AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            return setInterval(scheduler.flush.bind(scheduler, this), delay);
        };
        AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (delay !== null && this.delay === delay && this.pending === false) {
                return id;
            }
            return clearInterval(id) && undefined || undefined;
        };
        AsyncAction.prototype.execute = function (state, delay) {
            if (this.closed) {
                return new Error('executing a cancelled action');
            }
            this.pending = false;
            var error = this._execute(state, delay);
            if (error) {
                return error;
            }
            else if (this.pending === false && this.id != null) {
                this.id = this.recycleAsyncId(this.scheduler, this.id, null);
            }
        };
        AsyncAction.prototype._execute = function (state, delay) {
            var errored = false;
            var errorValue = undefined;
            try {
                this.work(state);
            }
            catch (e) {
                errored = true;
                errorValue = !!e && e || new Error(e);
            }
            if (errored) {
                this.unsubscribe();
                return errorValue;
            }
        };
        AsyncAction.prototype._unsubscribe = function () {
            var id = this.id;
            var scheduler = this.scheduler;
            var actions = scheduler.actions;
            var index = actions.indexOf(this);
            this.work = null;
            this.state = null;
            this.pending = false;
            this.scheduler = null;
            if (index !== -1) {
                actions.splice(index, 1);
            }
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
        };
        return AsyncAction;
    }(Action));

    /** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
    var QueueAction = /*@__PURE__*/ (function (_super) {
        __extends(QueueAction, _super);
        function QueueAction(scheduler, work) {
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            return _this;
        }
        QueueAction.prototype.schedule = function (state, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (delay > 0) {
                return _super.prototype.schedule.call(this, state, delay);
            }
            this.delay = delay;
            this.state = state;
            this.scheduler.flush(this);
            return this;
        };
        QueueAction.prototype.execute = function (state, delay) {
            return (delay > 0 || this.closed) ?
                _super.prototype.execute.call(this, state, delay) :
                this._execute(state, delay);
        };
        QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
                return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
            }
            return scheduler.flush(this);
        };
        return QueueAction;
    }(AsyncAction));

    var Scheduler = /*@__PURE__*/ (function () {
        function Scheduler(SchedulerAction, now) {
            if (now === void 0) {
                now = Scheduler.now;
            }
            this.SchedulerAction = SchedulerAction;
            this.now = now;
        }
        Scheduler.prototype.schedule = function (work, delay, state) {
            if (delay === void 0) {
                delay = 0;
            }
            return new this.SchedulerAction(this, work).schedule(state, delay);
        };
        Scheduler.now = function () { return Date.now(); };
        return Scheduler;
    }());

    /** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */
    var AsyncScheduler = /*@__PURE__*/ (function (_super) {
        __extends(AsyncScheduler, _super);
        function AsyncScheduler(SchedulerAction, now) {
            if (now === void 0) {
                now = Scheduler.now;
            }
            var _this = _super.call(this, SchedulerAction, function () {
                if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
                    return AsyncScheduler.delegate.now();
                }
                else {
                    return now();
                }
            }) || this;
            _this.actions = [];
            _this.active = false;
            _this.scheduled = undefined;
            return _this;
        }
        AsyncScheduler.prototype.schedule = function (work, delay, state) {
            if (delay === void 0) {
                delay = 0;
            }
            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
                return AsyncScheduler.delegate.schedule(work, delay, state);
            }
            else {
                return _super.prototype.schedule.call(this, work, delay, state);
            }
        };
        AsyncScheduler.prototype.flush = function (action) {
            var actions = this.actions;
            if (this.active) {
                actions.push(action);
                return;
            }
            var error;
            this.active = true;
            do {
                if (error = action.execute(action.state, action.delay)) {
                    break;
                }
            } while (action = actions.shift());
            this.active = false;
            if (error) {
                while (action = actions.shift()) {
                    action.unsubscribe();
                }
                throw error;
            }
        };
        return AsyncScheduler;
    }(Scheduler));

    /** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
    var QueueScheduler = /*@__PURE__*/ (function (_super) {
        __extends(QueueScheduler, _super);
        function QueueScheduler() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return QueueScheduler;
    }(AsyncScheduler));

    /** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */
    var queue = /*@__PURE__*/ new QueueScheduler(QueueAction);

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
    var EMPTY = /*@__PURE__*/ new Observable(function (subscriber) { return subscriber.complete(); });
    function empty$1(scheduler) {
        return scheduler ? emptyScheduled(scheduler) : EMPTY;
    }
    function emptyScheduled(scheduler) {
        return new Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isScheduler(value) {
        return value && typeof value.schedule === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var subscribeToArray = function (array) {
        return function (subscriber) {
            for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
                subscriber.next(array[i]);
            }
            if (!subscriber.closed) {
                subscriber.complete();
            }
        };
    };

    /** PURE_IMPORTS_START _Observable,_Subscription,_util_subscribeToArray PURE_IMPORTS_END */
    function fromArray(input, scheduler) {
        if (!scheduler) {
            return new Observable(subscribeToArray(input));
        }
        else {
            return new Observable(function (subscriber) {
                var sub = new Subscription$1();
                var i = 0;
                sub.add(scheduler.schedule(function () {
                    if (i === input.length) {
                        subscriber.complete();
                        return;
                    }
                    subscriber.next(input[i++]);
                    if (!subscriber.closed) {
                        sub.add(this.schedule());
                    }
                }));
                return sub;
            });
        }
    }

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
    function scalar(value) {
        var result = new Observable(function (subscriber) {
            subscriber.next(value);
            subscriber.complete();
        });
        result._isScalar = true;
        result.value = value;
        return result;
    }

    /** PURE_IMPORTS_START _util_isScheduler,_fromArray,_empty,_scalar PURE_IMPORTS_END */
    function of() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var scheduler = args[args.length - 1];
        if (isScheduler(scheduler)) {
            args.pop();
        }
        else {
            scheduler = undefined;
        }
        switch (args.length) {
            case 0:
                return empty$1(scheduler);
            case 1:
                return scheduler ? fromArray(args, scheduler) : scalar(args[0]);
            default:
                return fromArray(args, scheduler);
        }
    }

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
    function throwError(error, scheduler) {
        if (!scheduler) {
            return new Observable(function (subscriber) { return subscriber.error(error); });
        }
        else {
            return new Observable(function (subscriber) { return scheduler.schedule(dispatch, 0, { error: error, subscriber: subscriber }); });
        }
    }
    function dispatch(_a) {
        var error = _a.error, subscriber = _a.subscriber;
        subscriber.error(error);
    }

    /** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */
    var Notification = /*@__PURE__*/ (function () {
        function Notification(kind, value, error) {
            this.kind = kind;
            this.value = value;
            this.error = error;
            this.hasValue = kind === 'N';
        }
        Notification.prototype.observe = function (observer) {
            switch (this.kind) {
                case 'N':
                    return observer.next && observer.next(this.value);
                case 'E':
                    return observer.error && observer.error(this.error);
                case 'C':
                    return observer.complete && observer.complete();
            }
        };
        Notification.prototype.do = function (next, error, complete) {
            var kind = this.kind;
            switch (kind) {
                case 'N':
                    return next && next(this.value);
                case 'E':
                    return error && error(this.error);
                case 'C':
                    return complete && complete();
            }
        };
        Notification.prototype.accept = function (nextOrObserver, error, complete) {
            if (nextOrObserver && typeof nextOrObserver.next === 'function') {
                return this.observe(nextOrObserver);
            }
            else {
                return this.do(nextOrObserver, error, complete);
            }
        };
        Notification.prototype.toObservable = function () {
            var kind = this.kind;
            switch (kind) {
                case 'N':
                    return of(this.value);
                case 'E':
                    return throwError(this.error);
                case 'C':
                    return empty$1();
            }
            throw new Error('unexpected notification kind value');
        };
        Notification.createNext = function (value) {
            if (typeof value !== 'undefined') {
                return new Notification('N', value);
            }
            return Notification.undefinedValueNotification;
        };
        Notification.createError = function (err) {
            return new Notification('E', undefined, err);
        };
        Notification.createComplete = function () {
            return Notification.completeNotification;
        };
        Notification.completeNotification = new Notification('C');
        Notification.undefinedValueNotification = new Notification('N', undefined);
        return Notification;
    }());

    /** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */
    var ObserveOnSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(ObserveOnSubscriber, _super);
        function ObserveOnSubscriber(destination, scheduler, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            var _this = _super.call(this, destination) || this;
            _this.scheduler = scheduler;
            _this.delay = delay;
            return _this;
        }
        ObserveOnSubscriber.dispatch = function (arg) {
            var notification = arg.notification, destination = arg.destination;
            notification.observe(destination);
            this.unsubscribe();
        };
        ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
            this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
        };
        ObserveOnSubscriber.prototype._next = function (value) {
            this.scheduleMessage(Notification.createNext(value));
        };
        ObserveOnSubscriber.prototype._error = function (err) {
            this.scheduleMessage(Notification.createError(err));
        };
        ObserveOnSubscriber.prototype._complete = function () {
            this.scheduleMessage(Notification.createComplete());
        };
        return ObserveOnSubscriber;
    }(Subscriber));
    var ObserveOnMessage = /*@__PURE__*/ (function () {
        function ObserveOnMessage(notification, destination) {
            this.notification = notification;
            this.destination = destination;
        }
        return ObserveOnMessage;
    }());

    /** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */
    var ReplaySubject = /*@__PURE__*/ (function (_super) {
        __extends(ReplaySubject, _super);
        function ReplaySubject(bufferSize, windowTime, scheduler) {
            if (bufferSize === void 0) {
                bufferSize = Number.POSITIVE_INFINITY;
            }
            if (windowTime === void 0) {
                windowTime = Number.POSITIVE_INFINITY;
            }
            var _this = _super.call(this) || this;
            _this.scheduler = scheduler;
            _this._events = [];
            _this._infiniteTimeWindow = false;
            _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
            _this._windowTime = windowTime < 1 ? 1 : windowTime;
            if (windowTime === Number.POSITIVE_INFINITY) {
                _this._infiniteTimeWindow = true;
                _this.next = _this.nextInfiniteTimeWindow;
            }
            else {
                _this.next = _this.nextTimeWindow;
            }
            return _this;
        }
        ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
            var _events = this._events;
            _events.push(value);
            if (_events.length > this._bufferSize) {
                _events.shift();
            }
            _super.prototype.next.call(this, value);
        };
        ReplaySubject.prototype.nextTimeWindow = function (value) {
            this._events.push(new ReplayEvent(this._getNow(), value));
            this._trimBufferThenGetEvents();
            _super.prototype.next.call(this, value);
        };
        ReplaySubject.prototype._subscribe = function (subscriber) {
            var _infiniteTimeWindow = this._infiniteTimeWindow;
            var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
            var scheduler = this.scheduler;
            var len = _events.length;
            var subscription;
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else if (this.isStopped || this.hasError) {
                subscription = Subscription$1.EMPTY;
            }
            else {
                this.observers.push(subscriber);
                subscription = new SubjectSubscription(this, subscriber);
            }
            if (scheduler) {
                subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
            }
            if (_infiniteTimeWindow) {
                for (var i = 0; i < len && !subscriber.closed; i++) {
                    subscriber.next(_events[i]);
                }
            }
            else {
                for (var i = 0; i < len && !subscriber.closed; i++) {
                    subscriber.next(_events[i].value);
                }
            }
            if (this.hasError) {
                subscriber.error(this.thrownError);
            }
            else if (this.isStopped) {
                subscriber.complete();
            }
            return subscription;
        };
        ReplaySubject.prototype._getNow = function () {
            return (this.scheduler || queue).now();
        };
        ReplaySubject.prototype._trimBufferThenGetEvents = function () {
            var now = this._getNow();
            var _bufferSize = this._bufferSize;
            var _windowTime = this._windowTime;
            var _events = this._events;
            var eventsCount = _events.length;
            var spliceCount = 0;
            while (spliceCount < eventsCount) {
                if ((now - _events[spliceCount].time) < _windowTime) {
                    break;
                }
                spliceCount++;
            }
            if (eventsCount > _bufferSize) {
                spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
            }
            if (spliceCount > 0) {
                _events.splice(0, spliceCount);
            }
            return _events;
        };
        return ReplaySubject;
    }(Subject));
    var ReplayEvent = /*@__PURE__*/ (function () {
        function ReplayEvent(time, value) {
            this.time = time;
            this.value = value;
        }
        return ReplayEvent;
    }());

    /** PURE_IMPORTS_START tslib,_Subject,_Subscription PURE_IMPORTS_END */
    var AsyncSubject = /*@__PURE__*/ (function (_super) {
        __extends(AsyncSubject, _super);
        function AsyncSubject() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.value = null;
            _this.hasNext = false;
            _this.hasCompleted = false;
            return _this;
        }
        AsyncSubject.prototype._subscribe = function (subscriber) {
            if (this.hasError) {
                subscriber.error(this.thrownError);
                return Subscription$1.EMPTY;
            }
            else if (this.hasCompleted && this.hasNext) {
                subscriber.next(this.value);
                subscriber.complete();
                return Subscription$1.EMPTY;
            }
            return _super.prototype._subscribe.call(this, subscriber);
        };
        AsyncSubject.prototype.next = function (value) {
            if (!this.hasCompleted) {
                this.value = value;
                this.hasNext = true;
            }
        };
        AsyncSubject.prototype.error = function (error) {
            if (!this.hasCompleted) {
                _super.prototype.error.call(this, error);
            }
        };
        AsyncSubject.prototype.complete = function () {
            this.hasCompleted = true;
            if (this.hasNext) {
                _super.prototype.next.call(this, this.value);
            }
            _super.prototype.complete.call(this);
        };
        return AsyncSubject;
    }(Subject));

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var nextHandle = 1;
    var tasksByHandle = {};
    function runIfPresent(handle) {
        var cb = tasksByHandle[handle];
        if (cb) {
            cb();
        }
    }
    var Immediate = {
        setImmediate: function (cb) {
            var handle = nextHandle++;
            tasksByHandle[handle] = cb;
            Promise.resolve().then(function () { return runIfPresent(handle); });
            return handle;
        },
        clearImmediate: function (handle) {
            delete tasksByHandle[handle];
        },
    };

    /** PURE_IMPORTS_START tslib,_util_Immediate,_AsyncAction PURE_IMPORTS_END */
    var AsapAction = /*@__PURE__*/ (function (_super) {
        __extends(AsapAction, _super);
        function AsapAction(scheduler, work) {
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            return _this;
        }
        AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (delay !== null && delay > 0) {
                return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
            }
            scheduler.actions.push(this);
            return scheduler.scheduled || (scheduler.scheduled = Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
        };
        AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
                return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
            }
            if (scheduler.actions.length === 0) {
                Immediate.clearImmediate(id);
                scheduler.scheduled = undefined;
            }
            return undefined;
        };
        return AsapAction;
    }(AsyncAction));

    /** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
    var AsapScheduler = /*@__PURE__*/ (function (_super) {
        __extends(AsapScheduler, _super);
        function AsapScheduler() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AsapScheduler.prototype.flush = function (action) {
            this.active = true;
            this.scheduled = undefined;
            var actions = this.actions;
            var error;
            var index = -1;
            var count = actions.length;
            action = action || actions.shift();
            do {
                if (error = action.execute(action.state, action.delay)) {
                    break;
                }
            } while (++index < count && (action = actions.shift()));
            this.active = false;
            if (error) {
                while (++index < count && (action = actions.shift())) {
                    action.unsubscribe();
                }
                throw error;
            }
        };
        return AsapScheduler;
    }(AsyncScheduler));

    /** PURE_IMPORTS_START _AsapAction,_AsapScheduler PURE_IMPORTS_END */
    var asap = /*@__PURE__*/ new AsapScheduler(AsapAction);

    /** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
    var async = /*@__PURE__*/ new AsyncScheduler(AsyncAction);

    /** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
    var AnimationFrameAction = /*@__PURE__*/ (function (_super) {
        __extends(AnimationFrameAction, _super);
        function AnimationFrameAction(scheduler, work) {
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            return _this;
        }
        AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (delay !== null && delay > 0) {
                return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
            }
            scheduler.actions.push(this);
            return scheduler.scheduled || (scheduler.scheduled = requestAnimationFrame(function () { return scheduler.flush(null); }));
        };
        AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
                return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
            }
            if (scheduler.actions.length === 0) {
                cancelAnimationFrame(id);
                scheduler.scheduled = undefined;
            }
            return undefined;
        };
        return AnimationFrameAction;
    }(AsyncAction));

    /** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
    var AnimationFrameScheduler = /*@__PURE__*/ (function (_super) {
        __extends(AnimationFrameScheduler, _super);
        function AnimationFrameScheduler() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AnimationFrameScheduler.prototype.flush = function (action) {
            this.active = true;
            this.scheduled = undefined;
            var actions = this.actions;
            var error;
            var index = -1;
            var count = actions.length;
            action = action || actions.shift();
            do {
                if (error = action.execute(action.state, action.delay)) {
                    break;
                }
            } while (++index < count && (action = actions.shift()));
            this.active = false;
            if (error) {
                while (++index < count && (action = actions.shift())) {
                    action.unsubscribe();
                }
                throw error;
            }
        };
        return AnimationFrameScheduler;
    }(AsyncScheduler));

    /** PURE_IMPORTS_START _AnimationFrameAction,_AnimationFrameScheduler PURE_IMPORTS_END */
    var animationFrame = /*@__PURE__*/ new AnimationFrameScheduler(AnimationFrameAction);

    /** PURE_IMPORTS_START tslib,_AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
    var VirtualTimeScheduler = /*@__PURE__*/ (function (_super) {
        __extends(VirtualTimeScheduler, _super);
        function VirtualTimeScheduler(SchedulerAction, maxFrames) {
            if (SchedulerAction === void 0) {
                SchedulerAction = VirtualAction;
            }
            if (maxFrames === void 0) {
                maxFrames = Number.POSITIVE_INFINITY;
            }
            var _this = _super.call(this, SchedulerAction, function () { return _this.frame; }) || this;
            _this.maxFrames = maxFrames;
            _this.frame = 0;
            _this.index = -1;
            return _this;
        }
        VirtualTimeScheduler.prototype.flush = function () {
            var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
            var error, action;
            while ((action = actions.shift()) && (this.frame = action.delay) <= maxFrames) {
                if (error = action.execute(action.state, action.delay)) {
                    break;
                }
            }
            if (error) {
                while (action = actions.shift()) {
                    action.unsubscribe();
                }
                throw error;
            }
        };
        VirtualTimeScheduler.frameTimeFactor = 10;
        return VirtualTimeScheduler;
    }(AsyncScheduler));
    var VirtualAction = /*@__PURE__*/ (function (_super) {
        __extends(VirtualAction, _super);
        function VirtualAction(scheduler, work, index) {
            if (index === void 0) {
                index = scheduler.index += 1;
            }
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            _this.index = index;
            _this.active = true;
            _this.index = scheduler.index = index;
            return _this;
        }
        VirtualAction.prototype.schedule = function (state, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (!this.id) {
                return _super.prototype.schedule.call(this, state, delay);
            }
            this.active = false;
            var action = new VirtualAction(this.scheduler, this.work);
            this.add(action);
            return action.schedule(state, delay);
        };
        VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            this.delay = scheduler.frame + delay;
            var actions = scheduler.actions;
            actions.push(this);
            actions.sort(VirtualAction.sortActions);
            return true;
        };
        VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            return undefined;
        };
        VirtualAction.prototype._execute = function (state, delay) {
            if (this.active === true) {
                return _super.prototype._execute.call(this, state, delay);
            }
        };
        VirtualAction.sortActions = function (a, b) {
            if (a.delay === b.delay) {
                if (a.index === b.index) {
                    return 0;
                }
                else if (a.index > b.index) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            else if (a.delay > b.delay) {
                return 1;
            }
            else {
                return -1;
            }
        };
        return VirtualAction;
    }(AsyncAction));

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib PURE_IMPORTS_END */
    var ArgumentOutOfRangeError = /*@__PURE__*/ (function (_super) {
        __extends(ArgumentOutOfRangeError, _super);
        function ArgumentOutOfRangeError() {
            var _this = _super.call(this, 'argument out of range') || this;
            _this.name = 'ArgumentOutOfRangeError';
            Object.setPrototypeOf(_this, ArgumentOutOfRangeError.prototype);
            return _this;
        }
        return ArgumentOutOfRangeError;
    }(Error));

    /** PURE_IMPORTS_START tslib PURE_IMPORTS_END */
    var EmptyError = /*@__PURE__*/ (function (_super) {
        __extends(EmptyError, _super);
        function EmptyError() {
            var _this = _super.call(this, 'no elements in sequence') || this;
            _this.name = 'EmptyError';
            Object.setPrototypeOf(_this, EmptyError.prototype);
            return _this;
        }
        return EmptyError;
    }(Error));

    /** PURE_IMPORTS_START tslib PURE_IMPORTS_END */
    var TimeoutError = /*@__PURE__*/ (function (_super) {
        __extends(TimeoutError, _super);
        function TimeoutError() {
            var _this = _super.call(this, 'Timeout has occurred') || this;
            _this.name = 'TimeoutError';
            Object.setPrototypeOf(_this, TimeoutError.prototype);
            return _this;
        }
        return TimeoutError;
    }(Error));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    var MapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(MapSubscriber, _super);
        function MapSubscriber(destination, project, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.count = 0;
            _this.thisArg = thisArg || _this;
            return _this;
        }
        MapSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.project.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return MapSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_isArray,_util_isScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_isScheduler,_util_isArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    var OuterSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(OuterSubscriber, _super);
        function OuterSubscriber() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
            this.destination.next(innerValue);
        };
        OuterSubscriber.prototype.notifyError = function (error, innerSub) {
            this.destination.error(error);
        };
        OuterSubscriber.prototype.notifyComplete = function (innerSub) {
            this.destination.complete();
        };
        return OuterSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    var InnerSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(InnerSubscriber, _super);
        function InnerSubscriber(parent, outerValue, outerIndex) {
            var _this = _super.call(this) || this;
            _this.parent = parent;
            _this.outerValue = outerValue;
            _this.outerIndex = outerIndex;
            _this.index = 0;
            return _this;
        }
        InnerSubscriber.prototype._next = function (value) {
            this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
        };
        InnerSubscriber.prototype._error = function (error) {
            this.parent.notifyError(error, this);
            this.unsubscribe();
        };
        InnerSubscriber.prototype._complete = function () {
            this.parent.notifyComplete(this);
            this.unsubscribe();
        };
        return InnerSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */
    var subscribeToPromise = function (promise) {
        return function (subscriber) {
            promise.then(function (value) {
                if (!subscriber.closed) {
                    subscriber.next(value);
                    subscriber.complete();
                }
            }, function (err) { return subscriber.error(err); })
                .then(null, hostReportError);
            return subscriber;
        };
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function getSymbolIterator() {
        if (typeof Symbol !== 'function' || !Symbol.iterator) {
            return '@@iterator';
        }
        return Symbol.iterator;
    }
    var iterator = /*@__PURE__*/ getSymbolIterator();

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
    var subscribeToIterable = function (iterable) {
        return function (subscriber) {
            var iterator$$1 = iterable[iterator]();
            do {
                var item = iterator$$1.next();
                if (item.done) {
                    subscriber.complete();
                    break;
                }
                subscriber.next(item.value);
                if (subscriber.closed) {
                    break;
                }
            } while (true);
            if (typeof iterator$$1.return === 'function') {
                subscriber.add(function () {
                    if (iterator$$1.return) {
                        iterator$$1.return();
                    }
                });
            }
            return subscriber;
        };
    };

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
    var subscribeToObservable = function (obj) {
        return function (subscriber) {
            var obs = obj[observable]();
            if (typeof obs.subscribe !== 'function') {
                throw new TypeError('Provided object does not correctly implement Symbol.observable');
            }
            else {
                return obs.subscribe(subscriber);
            }
        };
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArrayLike$1 = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isPromise$1(value) {
        return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
    }

    /** PURE_IMPORTS_START _Observable,_subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */
    var subscribeTo = function (result) {
        if (result instanceof Observable) {
            return function (subscriber) {
                if (result._isScalar) {
                    subscriber.next(result.value);
                    subscriber.complete();
                    return undefined;
                }
                else {
                    return result.subscribe(subscriber);
                }
            };
        }
        else if (result && typeof result[observable] === 'function') {
            return subscribeToObservable(result);
        }
        else if (isArrayLike$1(result)) {
            return subscribeToArray(result);
        }
        else if (isPromise$1(result)) {
            return subscribeToPromise(result);
        }
        else if (result && typeof result[iterator] === 'function') {
            return subscribeToIterable(result);
        }
        else {
            var value = isObject$2(result) ? 'an invalid object' : "'" + result + "'";
            var msg = "You provided " + value + " where a stream was expected."
                + ' You can provide an Observable, Promise, Array, or Iterable.';
            throw new TypeError(msg);
        }
    };

    /** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo PURE_IMPORTS_END */
    function subscribeToResult(outerSubscriber, result, outerValue, outerIndex) {
        var destination = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
        return subscribeTo(result)(destination);
    }

    /** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */
    var NONE = {};
    var CombineLatestSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(CombineLatestSubscriber, _super);
        function CombineLatestSubscriber(destination, resultSelector) {
            var _this = _super.call(this, destination) || this;
            _this.resultSelector = resultSelector;
            _this.active = 0;
            _this.values = [];
            _this.observables = [];
            return _this;
        }
        CombineLatestSubscriber.prototype._next = function (observable) {
            this.values.push(NONE);
            this.observables.push(observable);
        };
        CombineLatestSubscriber.prototype._complete = function () {
            var observables = this.observables;
            var len = observables.length;
            if (len === 0) {
                this.destination.complete();
            }
            else {
                this.active = len;
                this.toRespond = len;
                for (var i = 0; i < len; i++) {
                    var observable = observables[i];
                    this.add(subscribeToResult(this, observable, observable, i));
                }
            }
        };
        CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
            if ((this.active -= 1) === 0) {
                this.destination.complete();
            }
        };
        CombineLatestSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
            var values = this.values;
            var oldVal = values[outerIndex];
            var toRespond = !this.toRespond
                ? 0
                : oldVal === NONE ? --this.toRespond : this.toRespond;
            values[outerIndex] = innerValue;
            if (toRespond === 0) {
                if (this.resultSelector) {
                    this._tryResultSelector(values);
                }
                else {
                    this.destination.next(values.slice());
                }
            }
        };
        CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
            var result;
            try {
                result = this.resultSelector.apply(this, values);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return CombineLatestSubscriber;
    }(OuterSubscriber));

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription,_util_subscribeToPromise PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator,_util_subscribeToIterable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable,_util_subscribeToObservable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_isPromise,_util_isArrayLike,_util_isInteropObservable,_util_isIterable,_fromArray,_fromPromise,_fromIterable,_fromObservable,_util_subscribeTo PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_util_subscribeToResult,_OuterSubscriber,_map,_observable_from PURE_IMPORTS_END */
    var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(MergeMapSubscriber, _super);
        function MergeMapSubscriber(destination, project, concurrent) {
            if (concurrent === void 0) {
                concurrent = Number.POSITIVE_INFINITY;
            }
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.concurrent = concurrent;
            _this.hasCompleted = false;
            _this.buffer = [];
            _this.active = 0;
            _this.index = 0;
            return _this;
        }
        MergeMapSubscriber.prototype._next = function (value) {
            if (this.active < this.concurrent) {
                this._tryNext(value);
            }
            else {
                this.buffer.push(value);
            }
        };
        MergeMapSubscriber.prototype._tryNext = function (value) {
            var result;
            var index = this.index++;
            try {
                result = this.project(value, index);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.active++;
            this._innerSub(result, value, index);
        };
        MergeMapSubscriber.prototype._innerSub = function (ish, value, index) {
            this.add(subscribeToResult(this, ish, value, index));
        };
        MergeMapSubscriber.prototype._complete = function () {
            this.hasCompleted = true;
            if (this.active === 0 && this.buffer.length === 0) {
                this.destination.complete();
            }
        };
        MergeMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
            this.destination.next(innerValue);
        };
        MergeMapSubscriber.prototype.notifyComplete = function (innerSub) {
            var buffer = this.buffer;
            this.remove(innerSub);
            this.active--;
            if (buffer.length > 0) {
                this._next(buffer.shift());
            }
            else if (this.active === 0 && this.hasCompleted) {
                this.destination.complete();
            }
        };
        return MergeMapSubscriber;
    }(OuterSubscriber));

    /** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _util_isScheduler,_of,_from,_operators_concatAll PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Observable,_util_isArray,_empty,_util_subscribeToResult,_OuterSubscriber,_operators_map PURE_IMPORTS_END */
    var ForkJoinSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(ForkJoinSubscriber, _super);
        function ForkJoinSubscriber(destination, sources) {
            var _this = _super.call(this, destination) || this;
            _this.sources = sources;
            _this.completed = 0;
            _this.haveValues = 0;
            var len = sources.length;
            _this.values = new Array(len);
            for (var i = 0; i < len; i++) {
                var source = sources[i];
                var innerSubscription = subscribeToResult(_this, source, null, i);
                if (innerSubscription) {
                    _this.add(innerSubscription);
                }
            }
            return _this;
        }
        ForkJoinSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
            this.values[outerIndex] = innerValue;
            if (!innerSub._hasValue) {
                innerSub._hasValue = true;
                this.haveValues++;
            }
        };
        ForkJoinSubscriber.prototype.notifyComplete = function (innerSub) {
            var _a = this, destination = _a.destination, haveValues = _a.haveValues, values = _a.values;
            var len = values.length;
            if (!innerSub._hasValue) {
                destination.complete();
                return;
            }
            this.completed++;
            if (this.completed !== len) {
                return;
            }
            if (haveValues === len) {
                destination.next(values);
            }
            destination.complete();
        };
        return ForkJoinSubscriber;
    }(OuterSubscriber));

    /** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_identity,_util_isScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _defer,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_noop PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_from,_util_isArray,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_util_isArray,_fromArray,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */
    var RaceSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(RaceSubscriber, _super);
        function RaceSubscriber(destination) {
            var _this = _super.call(this, destination) || this;
            _this.hasFirst = false;
            _this.observables = [];
            _this.subscriptions = [];
            return _this;
        }
        RaceSubscriber.prototype._next = function (observable) {
            this.observables.push(observable);
        };
        RaceSubscriber.prototype._complete = function () {
            var observables = this.observables;
            var len = observables.length;
            if (len === 0) {
                this.destination.complete();
            }
            else {
                for (var i = 0; i < len && !this.hasFirst; i++) {
                    var observable = observables[i];
                    var subscription = subscribeToResult(this, observable, observable, i);
                    if (this.subscriptions) {
                        this.subscriptions.push(subscription);
                    }
                    this.add(subscription);
                }
                this.observables = null;
            }
        };
        RaceSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
            if (!this.hasFirst) {
                this.hasFirst = true;
                for (var i = 0; i < this.subscriptions.length; i++) {
                    if (i !== outerIndex) {
                        var subscription = this.subscriptions[i];
                        subscription.unsubscribe();
                        this.remove(subscription);
                    }
                }
                this.subscriptions = null;
            }
            this.destination.next(innerValue);
        };
        return RaceSubscriber;
    }(OuterSubscriber));

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_fromArray,_util_isArray,_Subscriber,_OuterSubscriber,_util_subscribeToResult,_.._internal_symbol_iterator PURE_IMPORTS_END */
    var ZipSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(ZipSubscriber, _super);
        function ZipSubscriber(destination, resultSelector, values) {
            if (values === void 0) {
                values = Object.create(null);
            }
            var _this = _super.call(this, destination) || this;
            _this.iterators = [];
            _this.active = 0;
            _this.resultSelector = (typeof resultSelector === 'function') ? resultSelector : null;
            _this.values = values;
            return _this;
        }
        ZipSubscriber.prototype._next = function (value) {
            var iterators = this.iterators;
            if (isArray$1(value)) {
                iterators.push(new StaticArrayIterator(value));
            }
            else if (typeof value[iterator] === 'function') {
                iterators.push(new StaticIterator(value[iterator]()));
            }
            else {
                iterators.push(new ZipBufferIterator(this.destination, this, value));
            }
        };
        ZipSubscriber.prototype._complete = function () {
            var iterators = this.iterators;
            var len = iterators.length;
            if (len === 0) {
                this.destination.complete();
                return;
            }
            this.active = len;
            for (var i = 0; i < len; i++) {
                var iterator$$1 = iterators[i];
                if (iterator$$1.stillUnsubscribed) {
                    this.add(iterator$$1.subscribe(iterator$$1, i));
                }
                else {
                    this.active--;
                }
            }
        };
        ZipSubscriber.prototype.notifyInactive = function () {
            this.active--;
            if (this.active === 0) {
                this.destination.complete();
            }
        };
        ZipSubscriber.prototype.checkIterators = function () {
            var iterators = this.iterators;
            var len = iterators.length;
            var destination = this.destination;
            for (var i = 0; i < len; i++) {
                var iterator$$1 = iterators[i];
                if (typeof iterator$$1.hasValue === 'function' && !iterator$$1.hasValue()) {
                    return;
                }
            }
            var shouldComplete = false;
            var args = [];
            for (var i = 0; i < len; i++) {
                var iterator$$1 = iterators[i];
                var result = iterator$$1.next();
                if (iterator$$1.hasCompleted()) {
                    shouldComplete = true;
                }
                if (result.done) {
                    destination.complete();
                    return;
                }
                args.push(result.value);
            }
            if (this.resultSelector) {
                this._tryresultSelector(args);
            }
            else {
                destination.next(args);
            }
            if (shouldComplete) {
                destination.complete();
            }
        };
        ZipSubscriber.prototype._tryresultSelector = function (args) {
            var result;
            try {
                result = this.resultSelector.apply(this, args);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return ZipSubscriber;
    }(Subscriber));
    var StaticIterator = /*@__PURE__*/ (function () {
        function StaticIterator(iterator$$1) {
            this.iterator = iterator$$1;
            this.nextResult = iterator$$1.next();
        }
        StaticIterator.prototype.hasValue = function () {
            return true;
        };
        StaticIterator.prototype.next = function () {
            var result = this.nextResult;
            this.nextResult = this.iterator.next();
            return result;
        };
        StaticIterator.prototype.hasCompleted = function () {
            var nextResult = this.nextResult;
            return nextResult && nextResult.done;
        };
        return StaticIterator;
    }());
    var StaticArrayIterator = /*@__PURE__*/ (function () {
        function StaticArrayIterator(array) {
            this.array = array;
            this.index = 0;
            this.length = 0;
            this.length = array.length;
        }
        StaticArrayIterator.prototype[iterator] = function () {
            return this;
        };
        StaticArrayIterator.prototype.next = function (value) {
            var i = this.index++;
            var array = this.array;
            return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
        };
        StaticArrayIterator.prototype.hasValue = function () {
            return this.array.length > this.index;
        };
        StaticArrayIterator.prototype.hasCompleted = function () {
            return this.array.length === this.index;
        };
        return StaticArrayIterator;
    }());
    var ZipBufferIterator = /*@__PURE__*/ (function (_super) {
        __extends(ZipBufferIterator, _super);
        function ZipBufferIterator(destination, parent, observable) {
            var _this = _super.call(this, destination) || this;
            _this.parent = parent;
            _this.observable = observable;
            _this.stillUnsubscribed = true;
            _this.buffer = [];
            _this.isComplete = false;
            return _this;
        }
        ZipBufferIterator.prototype[iterator] = function () {
            return this;
        };
        ZipBufferIterator.prototype.next = function () {
            var buffer = this.buffer;
            if (buffer.length === 0 && this.isComplete) {
                return { value: null, done: true };
            }
            else {
                return { value: buffer.shift(), done: false };
            }
        };
        ZipBufferIterator.prototype.hasValue = function () {
            return this.buffer.length > 0;
        };
        ZipBufferIterator.prototype.hasCompleted = function () {
            return this.buffer.length === 0 && this.isComplete;
        };
        ZipBufferIterator.prototype.notifyComplete = function () {
            if (this.buffer.length > 0) {
                this.isComplete = true;
                this.parent.notifyInactive();
            }
            else {
                this.destination.complete();
            }
        };
        ZipBufferIterator.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
            this.buffer.push(innerValue);
            this.parent.checkIterators();
        };
        ZipBufferIterator.prototype.subscribe = function (value, index) {
            return subscribeToResult(this, this.observable, this, index);
        };
        return ZipBufferIterator;
    }(OuterSubscriber));

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    var BuilderContent = /** @class */ (function (_super) {
        __extends(BuilderContent, _super);
        function BuilderContent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = {
                loading: true,
                data: null
            };
            _this.subscriptions = new Subscription$1();
            _this.firstLoad = true;
            _this.clicked = false;
            _this.onClick = function (reactEvent) {
                // TODO: viewport scrolling tracking for impression events
                var event = reactEvent.nativeEvent;
                var content = _this.state.data;
                if (!content) {
                    return;
                }
                if (builder.autoTrack) {
                    builder.trackInteraction(content.id, content.variationId, _this.clicked, event);
                }
                if (!_this.clicked) {
                    _this.clicked = true;
                }
            };
            return _this;
        }
        // TODO: observe model name for changes
        BuilderContent.prototype.componentDidMount = function () {
            // Temporary to test metrics diving in with bigquery and heatmaps
            // builder.autoTrack = true;
            // builder.env = 'development';
            this.subscribeToContent();
        };
        BuilderContent.prototype.subscribeToContent = function () {
            var _this = this;
            this.subscriptions.add(builder.queueGetContent(this.props.modelName, this.props.options).subscribe(function (matches) {
                var match = matches && matches[0];
                _this.setState({
                    data: match
                });
                if (match && _this.firstLoad) {
                    // TODO: autoTrack
                    if (builder.autoTrack) {
                        builder.trackImpression(match.id, match && match.variationId);
                    }
                    _this.firstLoad = false;
                }
                if (_this.props.contentLoaded) {
                    _this.props.contentLoaded(match && match.data);
                }
            }, function (error) {
                if (_this.props.contentError) {
                    _this.props.contentError(error);
                }
            }));
        };
        BuilderContent.prototype.componentWillUnmount = function () {
            this.subscriptions.unsubscribe();
        };
        BuilderContent.prototype.render = function () {
            var _a = this.state, data = _a.data, loading = _a.loading;
            return (
            // TODO: tag instead?
            react.createElement("div", { className: "builder-content", onClick: this.onClick, "builder-content-id": this.state.data && this.state.data.id, "builder-model": this.props.modelName }, this.props.children(data && data.data, loading, data)));
        };
        return BuilderContent;
    }(react.Component));

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */

    var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

    /**
     * Simple, lightweight module assisting with the detection and context of
     * Worker. Helps avoid circular dependencies and allows code to reason about
     * whether or not they are in a Worker, even if they never include the main
     * `ReactWorker` dependency.
     */
    var ExecutionEnvironment = {

      canUseDOM: canUseDOM,

      canUseWorkers: typeof Worker !== 'undefined',

      canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

      canUseViewport: canUseDOM && !!window.screen,

      isInWorker: !canUseDOM // For now, this is true - might change in the future.

    };

    var ExecutionEnvironment_1 = ExecutionEnvironment;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * @typechecks
     */

    /* eslint-disable fb-www/typeof-undefined */

    /**
     * Same as document.activeElement but wraps in a try-catch block. In IE it is
     * not safe to call document.activeElement if there is nothing focused.
     *
     * The activeElement will be null only if the document or document body is not
     * yet defined.
     *
     * @param {?DOMDocument} doc Defaults to current document.
     * @return {?DOMElement}
     */
    function getActiveElement(doc) /*?DOMElement*/{
      doc = doc || (typeof document !== 'undefined' ? document : undefined);
      if (typeof doc === 'undefined') {
        return null;
      }
      try {
        return doc.activeElement || doc.body;
      } catch (e) {
        return doc.body;
      }
    }

    var getActiveElement_1 = getActiveElement;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * @typechecks
     * 
     */

    var hasOwnProperty$15 = Object.prototype.hasOwnProperty;

    /**
     * inlined Object.is polyfill to avoid requiring consumers ship their own
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
     */
    function is(x, y) {
      // SameValue algorithm
      if (x === y) {
        // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        // Added the nonzero y check to make Flow happy, but it is redundant
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
      } else {
        // Step 6.a: NaN == NaN
        return x !== x && y !== y;
      }
    }

    /**
     * Performs equality by iterating through keys on an object and returning false
     * when any key has values which are not strictly equal between the arguments.
     * Returns true when the values of all keys are strictly equal.
     */
    function shallowEqual(objA, objB) {
      if (is(objA, objB)) {
        return true;
      }

      if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
      }

      var keysA = Object.keys(objA);
      var keysB = Object.keys(objB);

      if (keysA.length !== keysB.length) {
        return false;
      }

      // Test for A's keys different from B.
      for (var i = 0; i < keysA.length; i++) {
        if (!hasOwnProperty$15.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
          return false;
        }
      }

      return true;
    }

    var shallowEqual_1 = shallowEqual;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * @typechecks
     */

    /**
     * @param {*} object The object to check.
     * @return {boolean} Whether or not the object is a DOM node.
     */
    function isNode(object) {
      var doc = object ? object.ownerDocument || object : document;
      var defaultView = doc.defaultView || window;
      return !!(object && (typeof defaultView.Node === 'function' ? object instanceof defaultView.Node : typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string'));
    }

    var isNode_1 = isNode;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * @typechecks
     */



    /**
     * @param {*} object The object to check.
     * @return {boolean} Whether or not the object is a DOM text node.
     */
    function isTextNode(object) {
      return isNode_1(object) && object.nodeType == 3;
    }

    var isTextNode_1 = isTextNode;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * 
     */



    /*eslint-disable no-bitwise */

    /**
     * Checks if a given DOM node contains or is another DOM node.
     */
    function containsNode(outerNode, innerNode) {
      if (!outerNode || !innerNode) {
        return false;
      } else if (outerNode === innerNode) {
        return true;
      } else if (isTextNode_1(outerNode)) {
        return false;
      } else if (isTextNode_1(innerNode)) {
        return containsNode(outerNode, innerNode.parentNode);
      } else if ('contains' in outerNode) {
        return outerNode.contains(innerNode);
      } else if (outerNode.compareDocumentPosition) {
        return !!(outerNode.compareDocumentPosition(innerNode) & 16);
      } else {
        return false;
      }
    }

    var containsNode_1 = containsNode;

    function A$1(a){for(var b=arguments.length-1,c="https://reactjs.org/docs/error-decoder.html?invariant="+a,d=0;d<b;d++)c+="&args[]="+encodeURIComponent(arguments[d+1]);invariant_1(!1,"Minified React error #"+a+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",c);}react?void 0:A$1("227");
    function ia(a,b,c,d,e,f,g,h,k){this._hasCaughtError=!1;this._caughtError=null;var n=Array.prototype.slice.call(arguments,3);try{b.apply(c,n);}catch(r){this._caughtError=r,this._hasCaughtError=!0;}}
    var B$1={_caughtError:null,_hasCaughtError:!1,_rethrowError:null,_hasRethrowError:!1,invokeGuardedCallback:function(a,b,c,d,e,f,g,h,k){ia.apply(B$1,arguments);},invokeGuardedCallbackAndCatchFirstError:function(a,b,c,d,e,f,g,h,k){B$1.invokeGuardedCallback.apply(this,arguments);if(B$1.hasCaughtError()){var n=B$1.clearCaughtError();B$1._hasRethrowError||(B$1._hasRethrowError=!0,B$1._rethrowError=n);}},rethrowCaughtError:function(){return ka.apply(B$1,arguments)},hasCaughtError:function(){return B$1._hasCaughtError},clearCaughtError:function(){if(B$1._hasCaughtError){var a=
    B$1._caughtError;B$1._caughtError=null;B$1._hasCaughtError=!1;return a}A$1("198");}};function ka(){if(B$1._hasRethrowError){var a=B$1._rethrowError;B$1._rethrowError=null;B$1._hasRethrowError=!1;throw a;}}var la=null,ma={};
    function na(){if(la)for(var a in ma){var b=ma[a],c=la.indexOf(a);-1<c?void 0:A$1("96",a);if(!oa[c]){b.extractEvents?void 0:A$1("97",a);oa[c]=b;c=b.eventTypes;for(var d in c){var e=void 0;var f=c[d],g=b,h=d;pa.hasOwnProperty(h)?A$1("99",h):void 0;pa[h]=f;var k=f.phasedRegistrationNames;if(k){for(e in k)k.hasOwnProperty(e)&&qa(k[e],g,h);e=!0;}else f.registrationName?(qa(f.registrationName,g,h),e=!0):e=!1;e?void 0:A$1("98",d,a);}}}}
    function qa(a,b,c){ra[a]?A$1("100",a):void 0;ra[a]=b;sa[a]=b.eventTypes[c].dependencies;}var oa=[],pa={},ra={},sa={};function ta(a){la?A$1("101"):void 0;la=Array.prototype.slice.call(a);na();}function ua(a){var b=!1,c;for(c in a)if(a.hasOwnProperty(c)){var d=a[c];ma.hasOwnProperty(c)&&ma[c]===d||(ma[c]?A$1("102",c):void 0,ma[c]=d,b=!0);}b&&na();}
    var va={plugins:oa,eventNameDispatchConfigs:pa,registrationNameModules:ra,registrationNameDependencies:sa,possibleRegistrationNames:null,injectEventPluginOrder:ta,injectEventPluginsByName:ua},wa=null,xa=null,ya=null;function za(a,b,c,d){b=a.type||"unknown-event";a.currentTarget=ya(d);B$1.invokeGuardedCallbackAndCatchFirstError(b,c,void 0,a);a.currentTarget=null;}
    function Aa(a,b){null==b?A$1("30"):void 0;if(null==a)return b;if(Array.isArray(a)){if(Array.isArray(b))return a.push.apply(a,b),a;a.push(b);return a}return Array.isArray(b)?[a].concat(b):[a,b]}function Ba(a,b,c){Array.isArray(a)?a.forEach(b,c):a&&b.call(c,a);}var Ca=null;
    function Da(a,b){if(a){var c=a._dispatchListeners,d=a._dispatchInstances;if(Array.isArray(c))for(var e=0;e<c.length&&!a.isPropagationStopped();e++)za(a,b,c[e],d[e]);else c&&za(a,b,c,d);a._dispatchListeners=null;a._dispatchInstances=null;a.isPersistent()||a.constructor.release(a);}}function Ea(a){return Da(a,!0)}function Fa(a){return Da(a,!1)}var Ga={injectEventPluginOrder:ta,injectEventPluginsByName:ua};
    function Ha(a,b){var c=a.stateNode;if(!c)return null;var d=wa(c);if(!d)return null;c=d[b];a:switch(b){case "onClick":case "onClickCapture":case "onDoubleClick":case "onDoubleClickCapture":case "onMouseDown":case "onMouseDownCapture":case "onMouseMove":case "onMouseMoveCapture":case "onMouseUp":case "onMouseUpCapture":(d=!d.disabled)||(a=a.type,d=!("button"===a||"input"===a||"select"===a||"textarea"===a));a=!d;break a;default:a=!1;}if(a)return null;c&&"function"!==typeof c?A$1("231",b,typeof c):void 0;
    return c}function Ia(a,b){null!==a&&(Ca=Aa(Ca,a));a=Ca;Ca=null;a&&(b?Ba(a,Ea):Ba(a,Fa),Ca?A$1("95"):void 0,B$1.rethrowCaughtError());}function Ja(a,b,c,d){for(var e=null,f=0;f<oa.length;f++){var g=oa[f];g&&(g=g.extractEvents(a,b,c,d))&&(e=Aa(e,g));}Ia(e,!1);}var Ka={injection:Ga,getListener:Ha,runEventsInBatch:Ia,runExtractedEventsInBatch:Ja},La=Math.random().toString(36).slice(2),C$1="__reactInternalInstance$"+La,Ma="__reactEventHandlers$"+La;
    function Na(a){if(a[C$1])return a[C$1];for(;!a[C$1];)if(a.parentNode)a=a.parentNode;else return null;a=a[C$1];return 5===a.tag||6===a.tag?a:null}function Oa(a){if(5===a.tag||6===a.tag)return a.stateNode;A$1("33");}function Pa(a){return a[Ma]||null}var Qa={precacheFiberNode:function(a,b){b[C$1]=a;},getClosestInstanceFromNode:Na,getInstanceFromNode:function(a){a=a[C$1];return!a||5!==a.tag&&6!==a.tag?null:a},getNodeFromInstance:Oa,getFiberCurrentPropsFromNode:Pa,updateFiberProps:function(a,b){a[Ma]=b;}};
    function F$1(a){do a=a.return;while(a&&5!==a.tag);return a?a:null}function Ra(a,b,c){for(var d=[];a;)d.push(a),a=F$1(a);for(a=d.length;0<a--;)b(d[a],"captured",c);for(a=0;a<d.length;a++)b(d[a],"bubbled",c);}function Sa(a,b,c){if(b=Ha(a,c.dispatchConfig.phasedRegistrationNames[b]))c._dispatchListeners=Aa(c._dispatchListeners,b),c._dispatchInstances=Aa(c._dispatchInstances,a);}function Ta(a){a&&a.dispatchConfig.phasedRegistrationNames&&Ra(a._targetInst,Sa,a);}
    function Ua(a){if(a&&a.dispatchConfig.phasedRegistrationNames){var b=a._targetInst;b=b?F$1(b):null;Ra(b,Sa,a);}}function Va(a,b,c){a&&c&&c.dispatchConfig.registrationName&&(b=Ha(a,c.dispatchConfig.registrationName))&&(c._dispatchListeners=Aa(c._dispatchListeners,b),c._dispatchInstances=Aa(c._dispatchInstances,a));}function Xa(a){a&&a.dispatchConfig.registrationName&&Va(a._targetInst,null,a);}function Ya(a){Ba(a,Ta);}
    function Za(a,b,c,d){if(c&&d)a:{var e=c;for(var f=d,g=0,h=e;h;h=F$1(h))g++;h=0;for(var k=f;k;k=F$1(k))h++;for(;0<g-h;)e=F$1(e),g--;for(;0<h-g;)f=F$1(f),h--;for(;g--;){if(e===f||e===f.alternate)break a;e=F$1(e);f=F$1(f);}e=null;}else e=null;f=e;for(e=[];c&&c!==f;){g=c.alternate;if(null!==g&&g===f)break;e.push(c);c=F$1(c);}for(c=[];d&&d!==f;){g=d.alternate;if(null!==g&&g===f)break;c.push(d);d=F$1(d);}for(d=0;d<e.length;d++)Va(e[d],"bubbled",a);for(a=c.length;0<a--;)Va(c[a],"captured",b);}
    var $a={accumulateTwoPhaseDispatches:Ya,accumulateTwoPhaseDispatchesSkipTarget:function(a){Ba(a,Ua);},accumulateEnterLeaveDispatches:Za,accumulateDirectDispatches:function(a){Ba(a,Xa);}};function ab(a,b){var c={};c[a.toLowerCase()]=b.toLowerCase();c["Webkit"+a]="webkit"+b;c["Moz"+a]="moz"+b;c["ms"+a]="MS"+b;c["O"+a]="o"+b.toLowerCase();return c}
    var bb={animationend:ab("Animation","AnimationEnd"),animationiteration:ab("Animation","AnimationIteration"),animationstart:ab("Animation","AnimationStart"),transitionend:ab("Transition","TransitionEnd")},cb={},db={};ExecutionEnvironment_1.canUseDOM&&(db=document.createElement("div").style,"AnimationEvent"in window||(delete bb.animationend.animation,delete bb.animationiteration.animation,delete bb.animationstart.animation),"TransitionEvent"in window||delete bb.transitionend.transition);
    function eb(a){if(cb[a])return cb[a];if(!bb[a])return a;var b=bb[a],c;for(c in b)if(b.hasOwnProperty(c)&&c in db)return cb[a]=b[c];return a}var fb=eb("animationend"),gb=eb("animationiteration"),hb=eb("animationstart"),ib=eb("transitionend"),jb="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),kb=null;
    function lb(){!kb&&ExecutionEnvironment_1.canUseDOM&&(kb="textContent"in document.documentElement?"textContent":"innerText");return kb}var G$1={_root:null,_startText:null,_fallbackText:null};function mb(){if(G$1._fallbackText)return G$1._fallbackText;var a,b=G$1._startText,c=b.length,d,e=nb(),f=e.length;for(a=0;a<c&&b[a]===e[a];a++);var g=c-a;for(d=1;d<=g&&b[c-d]===e[f-d];d++);G$1._fallbackText=e.slice(a,1<d?1-d:void 0);return G$1._fallbackText}function nb(){return"value"in G$1._root?G$1._root.value:G$1._root[lb()]}
    var ob="dispatchConfig _targetInst nativeEvent isDefaultPrevented isPropagationStopped _dispatchListeners _dispatchInstances".split(" "),pb={type:null,target:null,currentTarget:emptyFunction_1.thatReturnsNull,eventPhase:null,bubbles:null,cancelable:null,timeStamp:function(a){return a.timeStamp||Date.now()},defaultPrevented:null,isTrusted:null};
    function H$1(a,b,c,d){this.dispatchConfig=a;this._targetInst=b;this.nativeEvent=c;a=this.constructor.Interface;for(var e in a)a.hasOwnProperty(e)&&((b=a[e])?this[e]=b(c):"target"===e?this.target=d:this[e]=c[e]);this.isDefaultPrevented=(null!=c.defaultPrevented?c.defaultPrevented:!1===c.returnValue)?emptyFunction_1.thatReturnsTrue:emptyFunction_1.thatReturnsFalse;this.isPropagationStopped=emptyFunction_1.thatReturnsFalse;return this}
    objectAssign(H$1.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():"unknown"!==typeof a.returnValue&&(a.returnValue=!1),this.isDefaultPrevented=emptyFunction_1.thatReturnsTrue);},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():"unknown"!==typeof a.cancelBubble&&(a.cancelBubble=!0),this.isPropagationStopped=emptyFunction_1.thatReturnsTrue);},persist:function(){this.isPersistent=emptyFunction_1.thatReturnsTrue;},isPersistent:emptyFunction_1.thatReturnsFalse,
    destructor:function(){var a=this.constructor.Interface,b;for(b in a)this[b]=null;for(a=0;a<ob.length;a++)this[ob[a]]=null;}});H$1.Interface=pb;H$1.extend=function(a){function b(){}function c(){return d.apply(this,arguments)}var d=this;b.prototype=d.prototype;var e=new b;objectAssign(e,c.prototype);c.prototype=e;c.prototype.constructor=c;c.Interface=objectAssign({},d.Interface,a);c.extend=d.extend;qb(c);return c};qb(H$1);
    function rb(a,b,c,d){if(this.eventPool.length){var e=this.eventPool.pop();this.call(e,a,b,c,d);return e}return new this(a,b,c,d)}function sb(a){a instanceof this?void 0:A$1("223");a.destructor();10>this.eventPool.length&&this.eventPool.push(a);}function qb(a){a.eventPool=[];a.getPooled=rb;a.release=sb;}var tb=H$1.extend({data:null}),ub=H$1.extend({data:null}),vb=[9,13,27,32],wb=ExecutionEnvironment_1.canUseDOM&&"CompositionEvent"in window,xb=null;ExecutionEnvironment_1.canUseDOM&&"documentMode"in document&&(xb=document.documentMode);
    var yb=ExecutionEnvironment_1.canUseDOM&&"TextEvent"in window&&!xb,zb=ExecutionEnvironment_1.canUseDOM&&(!wb||xb&&8<xb&&11>=xb),Ab=String.fromCharCode(32),Bb={beforeInput:{phasedRegistrationNames:{bubbled:"onBeforeInput",captured:"onBeforeInputCapture"},dependencies:["compositionend","keypress","textInput","paste"]},compositionEnd:{phasedRegistrationNames:{bubbled:"onCompositionEnd",captured:"onCompositionEndCapture"},dependencies:"blur compositionend keydown keypress keyup mousedown".split(" ")},compositionStart:{phasedRegistrationNames:{bubbled:"onCompositionStart",
    captured:"onCompositionStartCapture"},dependencies:"blur compositionstart keydown keypress keyup mousedown".split(" ")},compositionUpdate:{phasedRegistrationNames:{bubbled:"onCompositionUpdate",captured:"onCompositionUpdateCapture"},dependencies:"blur compositionupdate keydown keypress keyup mousedown".split(" ")}},Cb=!1;
    function Db(a,b){switch(a){case "keyup":return-1!==vb.indexOf(b.keyCode);case "keydown":return 229!==b.keyCode;case "keypress":case "mousedown":case "blur":return!0;default:return!1}}function Eb(a){a=a.detail;return"object"===typeof a&&"data"in a?a.data:null}var Fb=!1;function Gb(a,b){switch(a){case "compositionend":return Eb(b);case "keypress":if(32!==b.which)return null;Cb=!0;return Ab;case "textInput":return a=b.data,a===Ab&&Cb?null:a;default:return null}}
    function Hb(a,b){if(Fb)return"compositionend"===a||!wb&&Db(a,b)?(a=mb(),G$1._root=null,G$1._startText=null,G$1._fallbackText=null,Fb=!1,a):null;switch(a){case "paste":return null;case "keypress":if(!(b.ctrlKey||b.altKey||b.metaKey)||b.ctrlKey&&b.altKey){if(b.char&&1<b.char.length)return b.char;if(b.which)return String.fromCharCode(b.which)}return null;case "compositionend":return zb?null:b.data;default:return null}}
    var Ib={eventTypes:Bb,extractEvents:function(a,b,c,d){var e=void 0;var f=void 0;if(wb)b:{switch(a){case "compositionstart":e=Bb.compositionStart;break b;case "compositionend":e=Bb.compositionEnd;break b;case "compositionupdate":e=Bb.compositionUpdate;break b}e=void 0;}else Fb?Db(a,c)&&(e=Bb.compositionEnd):"keydown"===a&&229===c.keyCode&&(e=Bb.compositionStart);e?(zb&&(Fb||e!==Bb.compositionStart?e===Bb.compositionEnd&&Fb&&(f=mb()):(G$1._root=d,G$1._startText=nb(),Fb=!0)),e=tb.getPooled(e,b,c,d),f?e.data=
    f:(f=Eb(c),null!==f&&(e.data=f)),Ya(e),f=e):f=null;(a=yb?Gb(a,c):Hb(a,c))?(b=ub.getPooled(Bb.beforeInput,b,c,d),b.data=a,Ya(b)):b=null;return null===f?b:null===b?f:[f,b]}},Jb=null,Kb={injectFiberControlledHostComponent:function(a){Jb=a;}},Lb=null,Mb=null;function Nb(a){if(a=xa(a)){Jb&&"function"===typeof Jb.restoreControlledState?void 0:A$1("194");var b=wa(a.stateNode);Jb.restoreControlledState(a.stateNode,a.type,b);}}function Ob(a){Lb?Mb?Mb.push(a):Mb=[a]:Lb=a;}
    function Pb(){return null!==Lb||null!==Mb}function Qb(){if(Lb){var a=Lb,b=Mb;Mb=Lb=null;Nb(a);if(b)for(a=0;a<b.length;a++)Nb(b[a]);}}var Rb={injection:Kb,enqueueStateRestore:Ob,needsStateRestore:Pb,restoreStateIfNeeded:Qb};function Sb(a,b){return a(b)}function Tb(a,b,c){return a(b,c)}function Ub(){}var Vb=!1;function Wb(a,b){if(Vb)return a(b);Vb=!0;try{return Sb(a,b)}finally{Vb=!1,Pb()&&(Ub(),Qb());}}
    var Xb={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Yb(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return"input"===b?!!Xb[a.type]:"textarea"===b?!0:!1}function Zb(a){a=a.target||a.srcElement||window;a.correspondingUseElement&&(a=a.correspondingUseElement);return 3===a.nodeType?a.parentNode:a}
    function $b(a,b){if(!ExecutionEnvironment_1.canUseDOM||b&&!("addEventListener"in document))return!1;a="on"+a;b=a in document;b||(b=document.createElement("div"),b.setAttribute(a,"return;"),b="function"===typeof b[a]);return b}function ac(a){var b=a.type;return(a=a.nodeName)&&"input"===a.toLowerCase()&&("checkbox"===b||"radio"===b)}
    function bc(a){var b=ac(a)?"checked":"value",c=Object.getOwnPropertyDescriptor(a.constructor.prototype,b),d=""+a[b];if(!a.hasOwnProperty(b)&&"undefined"!==typeof c&&"function"===typeof c.get&&"function"===typeof c.set){var e=c.get,f=c.set;Object.defineProperty(a,b,{configurable:!0,get:function(){return e.call(this)},set:function(a){d=""+a;f.call(this,a);}});Object.defineProperty(a,b,{enumerable:c.enumerable});return{getValue:function(){return d},setValue:function(a){d=""+a;},stopTracking:function(){a._valueTracker=
    null;delete a[b];}}}}function cc(a){a._valueTracker||(a._valueTracker=bc(a));}function dc(a){if(!a)return!1;var b=a._valueTracker;if(!b)return!0;var c=b.getValue();var d="";a&&(d=ac(a)?a.checked?"true":"false":a.value);a=d;return a!==c?(b.setValue(a),!0):!1}
    var ec=react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,fc="function"===typeof Symbol&&Symbol.for,gc=fc?Symbol.for("react.element"):60103,hc=fc?Symbol.for("react.portal"):60106,ic=fc?Symbol.for("react.fragment"):60107,jc=fc?Symbol.for("react.strict_mode"):60108,kc=fc?Symbol.for("react.profiler"):60114,lc=fc?Symbol.for("react.provider"):60109,mc=fc?Symbol.for("react.context"):60110,pc=fc?Symbol.for("react.async_mode"):60111,qc=fc?Symbol.for("react.forward_ref"):60112,rc=fc?Symbol.for("react.timeout"):
    60113,sc="function"===typeof Symbol&&Symbol.iterator;function tc(a){if(null===a||"undefined"===typeof a)return null;a=sc&&a[sc]||a["@@iterator"];return"function"===typeof a?a:null}
    function uc(a){var b=a.type;if("function"===typeof b)return b.displayName||b.name;if("string"===typeof b)return b;switch(b){case pc:return"AsyncMode";case mc:return"Context.Consumer";case ic:return"ReactFragment";case hc:return"ReactPortal";case kc:return"Profiler("+a.pendingProps.id+")";case lc:return"Context.Provider";case jc:return"StrictMode";case rc:return"Timeout"}if("object"===typeof b&&null!==b)switch(b.$$typeof){case qc:return a=b.render.displayName||b.render.name||"",""!==a?"ForwardRef("+
    a+")":"ForwardRef"}return null}function vc(a){var b="";do{a:switch(a.tag){case 0:case 1:case 2:case 5:var c=a._debugOwner,d=a._debugSource;var e=uc(a);var f=null;c&&(f=uc(c));c=d;e="\n    in "+(e||"Unknown")+(c?" (at "+c.fileName.replace(/^.*[\\\/]/,"")+":"+c.lineNumber+")":f?" (created by "+f+")":"");break a;default:e="";}b+=e;a=a.return;}while(a);return b}
    var wc=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,xc=Object.prototype.hasOwnProperty,zc={},Ac={};
    function Bc(a){if(xc.call(Ac,a))return!0;if(xc.call(zc,a))return!1;if(wc.test(a))return Ac[a]=!0;zc[a]=!0;return!1}function Cc(a,b,c,d){if(null!==c&&0===c.type)return!1;switch(typeof b){case "function":case "symbol":return!0;case "boolean":if(d)return!1;if(null!==c)return!c.acceptsBooleans;a=a.toLowerCase().slice(0,5);return"data-"!==a&&"aria-"!==a;default:return!1}}
    function Dc(a,b,c,d){if(null===b||"undefined"===typeof b||Cc(a,b,c,d))return!0;if(d)return!1;if(null!==c)switch(c.type){case 3:return!b;case 4:return!1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return!1}function I$1(a,b,c,d,e){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b;}var J$1={};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){J$1[a]=new I$1(a,0,!1,a,null);});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];J$1[b]=new I$1(b,1,!1,a[1],null);});["contentEditable","draggable","spellCheck","value"].forEach(function(a){J$1[a]=new I$1(a,2,!1,a.toLowerCase(),null);});
    ["autoReverse","externalResourcesRequired","preserveAlpha"].forEach(function(a){J$1[a]=new I$1(a,2,!1,a,null);});"allowFullScreen async autoFocus autoPlay controls default defer disabled formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){J$1[a]=new I$1(a,3,!1,a.toLowerCase(),null);});["checked","multiple","muted","selected"].forEach(function(a){J$1[a]=new I$1(a,3,!0,a.toLowerCase(),null);});
    ["capture","download"].forEach(function(a){J$1[a]=new I$1(a,4,!1,a.toLowerCase(),null);});["cols","rows","size","span"].forEach(function(a){J$1[a]=new I$1(a,6,!1,a.toLowerCase(),null);});["rowSpan","start"].forEach(function(a){J$1[a]=new I$1(a,5,!1,a.toLowerCase(),null);});var Ec=/[\-:]([a-z])/g;function Fc(a){return a[1].toUpperCase()}
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(Ec,
    Fc);J$1[b]=new I$1(b,1,!1,a,null);});"xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(Ec,Fc);J$1[b]=new I$1(b,1,!1,a,"http://www.w3.org/1999/xlink");});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(Ec,Fc);J$1[b]=new I$1(b,1,!1,a,"http://www.w3.org/XML/1998/namespace");});J$1.tabIndex=new I$1("tabIndex",1,!1,"tabindex",null);
    function Gc(a,b,c,d){var e=J$1.hasOwnProperty(b)?J$1[b]:null;var f=null!==e?0===e.type:d?!1:!(2<b.length)||"o"!==b[0]&&"O"!==b[0]||"n"!==b[1]&&"N"!==b[1]?!1:!0;f||(Dc(b,c,e,d)&&(c=null),d||null===e?Bc(b)&&(null===c?a.removeAttribute(b):a.setAttribute(b,""+c)):e.mustUseProperty?a[e.propertyName]=null===c?3===e.type?!1:"":c:(b=e.attributeName,d=e.attributeNamespace,null===c?a.removeAttribute(b):(e=e.type,c=3===e||4===e&&!0===c?"":""+c,d?a.setAttributeNS(d,b,c):a.setAttribute(b,c))));}
    function Hc(a,b){var c=b.checked;return objectAssign({},b,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:null!=c?c:a._wrapperState.initialChecked})}function Ic(a,b){var c=null==b.defaultValue?"":b.defaultValue,d=null!=b.checked?b.checked:b.defaultChecked;c=Jc(null!=b.value?b.value:c);a._wrapperState={initialChecked:d,initialValue:c,controlled:"checkbox"===b.type||"radio"===b.type?null!=b.checked:null!=b.value};}function Kc(a,b){b=b.checked;null!=b&&Gc(a,"checked",b,!1);}
    function Lc(a,b){Kc(a,b);var c=Jc(b.value);if(null!=c)if("number"===b.type){if(0===c&&""===a.value||a.value!=c)a.value=""+c;}else a.value!==""+c&&(a.value=""+c);b.hasOwnProperty("value")?Mc(a,b.type,c):b.hasOwnProperty("defaultValue")&&Mc(a,b.type,Jc(b.defaultValue));null==b.checked&&null!=b.defaultChecked&&(a.defaultChecked=!!b.defaultChecked);}
    function Nc(a,b,c){if(b.hasOwnProperty("value")||b.hasOwnProperty("defaultValue")){b=""+a._wrapperState.initialValue;var d=a.value;c||b===d||(a.value=b);a.defaultValue=b;}c=a.name;""!==c&&(a.name="");a.defaultChecked=!a.defaultChecked;a.defaultChecked=!a.defaultChecked;""!==c&&(a.name=c);}function Mc(a,b,c){if("number"!==b||a.ownerDocument.activeElement!==a)null==c?a.defaultValue=""+a._wrapperState.initialValue:a.defaultValue!==""+c&&(a.defaultValue=""+c);}
    function Jc(a){switch(typeof a){case "boolean":case "number":case "object":case "string":case "undefined":return a;default:return""}}var Oc={change:{phasedRegistrationNames:{bubbled:"onChange",captured:"onChangeCapture"},dependencies:"blur change click focus input keydown keyup selectionchange".split(" ")}};function Pc(a,b,c){a=H$1.getPooled(Oc.change,a,b,c);a.type="change";Ob(c);Ya(a);return a}var Qc=null,Rc=null;function Sc(a){Ia(a,!1);}function Tc(a){var b=Oa(a);if(dc(b))return a}
    function Uc(a,b){if("change"===a)return b}var Vc=!1;ExecutionEnvironment_1.canUseDOM&&(Vc=$b("input")&&(!document.documentMode||9<document.documentMode));function Wc(){Qc&&(Qc.detachEvent("onpropertychange",Xc),Rc=Qc=null);}function Xc(a){"value"===a.propertyName&&Tc(Rc)&&(a=Pc(Rc,a,Zb(a)),Wb(Sc,a));}function Yc(a,b,c){"focus"===a?(Wc(),Qc=b,Rc=c,Qc.attachEvent("onpropertychange",Xc)):"blur"===a&&Wc();}function Zc(a){if("selectionchange"===a||"keyup"===a||"keydown"===a)return Tc(Rc)}
    function $c(a,b){if("click"===a)return Tc(b)}function ad(a,b){if("input"===a||"change"===a)return Tc(b)}
    var bd={eventTypes:Oc,_isInputEventSupported:Vc,extractEvents:function(a,b,c,d){var e=b?Oa(b):window,f=void 0,g=void 0,h=e.nodeName&&e.nodeName.toLowerCase();"select"===h||"input"===h&&"file"===e.type?f=Uc:Yb(e)?Vc?f=ad:(f=Zc,g=Yc):(h=e.nodeName)&&"input"===h.toLowerCase()&&("checkbox"===e.type||"radio"===e.type)&&(f=$c);if(f&&(f=f(a,b)))return Pc(f,c,d);g&&g(a,e,b);"blur"===a&&(a=e._wrapperState)&&a.controlled&&"number"===e.type&&Mc(e,"number",e.value);}},cd=H$1.extend({view:null,detail:null}),dd={Alt:"altKey",
    Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function ed(a){var b=this.nativeEvent;return b.getModifierState?b.getModifierState(a):(a=dd[a])?!!b[a]:!1}function fd(){return ed}
    var gd=cd.extend({screenX:null,screenY:null,clientX:null,clientY:null,pageX:null,pageY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:fd,button:null,buttons:null,relatedTarget:function(a){return a.relatedTarget||(a.fromElement===a.srcElement?a.toElement:a.fromElement)}}),hd=gd.extend({pointerId:null,width:null,height:null,pressure:null,tiltX:null,tiltY:null,pointerType:null,isPrimary:null}),id={mouseEnter:{registrationName:"onMouseEnter",dependencies:["mouseout","mouseover"]},
    mouseLeave:{registrationName:"onMouseLeave",dependencies:["mouseout","mouseover"]},pointerEnter:{registrationName:"onPointerEnter",dependencies:["pointerout","pointerover"]},pointerLeave:{registrationName:"onPointerLeave",dependencies:["pointerout","pointerover"]}},jd={eventTypes:id,extractEvents:function(a,b,c,d){var e="mouseover"===a||"pointerover"===a,f="mouseout"===a||"pointerout"===a;if(e&&(c.relatedTarget||c.fromElement)||!f&&!e)return null;e=d.window===d?d:(e=d.ownerDocument)?e.defaultView||
    e.parentWindow:window;f?(f=b,b=(b=c.relatedTarget||c.toElement)?Na(b):null):f=null;if(f===b)return null;var g=void 0,h=void 0,k=void 0,n=void 0;if("mouseout"===a||"mouseover"===a)g=gd,h=id.mouseLeave,k=id.mouseEnter,n="mouse";else if("pointerout"===a||"pointerover"===a)g=hd,h=id.pointerLeave,k=id.pointerEnter,n="pointer";a=null==f?e:Oa(f);e=null==b?e:Oa(b);h=g.getPooled(h,f,c,d);h.type=n+"leave";h.target=a;h.relatedTarget=e;c=g.getPooled(k,b,c,d);c.type=n+"enter";c.target=e;c.relatedTarget=a;Za(h,
    c,f,b);return[h,c]}};function kd(a){var b=a;if(a.alternate)for(;b.return;)b=b.return;else{if(0!==(b.effectTag&2))return 1;for(;b.return;)if(b=b.return,0!==(b.effectTag&2))return 1}return 3===b.tag?2:3}function ld(a){2!==kd(a)?A$1("188"):void 0;}
    function md(a){var b=a.alternate;if(!b)return b=kd(a),3===b?A$1("188"):void 0,1===b?null:a;for(var c=a,d=b;;){var e=c.return,f=e?e.alternate:null;if(!e||!f)break;if(e.child===f.child){for(var g=e.child;g;){if(g===c)return ld(e),a;if(g===d)return ld(e),b;g=g.sibling;}A$1("188");}if(c.return!==d.return)c=e,d=f;else{g=!1;for(var h=e.child;h;){if(h===c){g=!0;c=e;d=f;break}if(h===d){g=!0;d=e;c=f;break}h=h.sibling;}if(!g){for(h=f.child;h;){if(h===c){g=!0;c=f;d=e;break}if(h===d){g=!0;d=f;c=e;break}h=h.sibling;}g?
    void 0:A$1("189");}}c.alternate!==d?A$1("190"):void 0;}3!==c.tag?A$1("188"):void 0;return c.stateNode.current===c?a:b}function nd(a){a=md(a);if(!a)return null;for(var b=a;;){if(5===b.tag||6===b.tag)return b;if(b.child)b.child.return=b,b=b.child;else{if(b===a)break;for(;!b.sibling;){if(!b.return||b.return===a)return null;b=b.return;}b.sibling.return=b.return;b=b.sibling;}}return null}
    function od(a){a=md(a);if(!a)return null;for(var b=a;;){if(5===b.tag||6===b.tag)return b;if(b.child&&4!==b.tag)b.child.return=b,b=b.child;else{if(b===a)break;for(;!b.sibling;){if(!b.return||b.return===a)return null;b=b.return;}b.sibling.return=b.return;b=b.sibling;}}return null}var pd=H$1.extend({animationName:null,elapsedTime:null,pseudoElement:null}),qd=H$1.extend({clipboardData:function(a){return"clipboardData"in a?a.clipboardData:window.clipboardData}}),rd=cd.extend({relatedTarget:null});
    function sd(a){var b=a.keyCode;"charCode"in a?(a=a.charCode,0===a&&13===b&&(a=13)):a=b;10===a&&(a=13);return 32<=a||13===a?a:0}
    var td={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},ud={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",
    116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},vd=cd.extend({key:function(a){if(a.key){var b=td[a.key]||a.key;if("Unidentified"!==b)return b}return"keypress"===a.type?(a=sd(a),13===a?"Enter":String.fromCharCode(a)):"keydown"===a.type||"keyup"===a.type?ud[a.keyCode]||"Unidentified":""},location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:fd,charCode:function(a){return"keypress"===
    a.type?sd(a):0},keyCode:function(a){return"keydown"===a.type||"keyup"===a.type?a.keyCode:0},which:function(a){return"keypress"===a.type?sd(a):"keydown"===a.type||"keyup"===a.type?a.keyCode:0}}),wd=gd.extend({dataTransfer:null}),xd=cd.extend({touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:fd}),yd=H$1.extend({propertyName:null,elapsedTime:null,pseudoElement:null}),zd=gd.extend({deltaX:function(a){return"deltaX"in a?a.deltaX:"wheelDeltaX"in
    a?-a.wheelDeltaX:0},deltaY:function(a){return"deltaY"in a?a.deltaY:"wheelDeltaY"in a?-a.wheelDeltaY:"wheelDelta"in a?-a.wheelDelta:0},deltaZ:null,deltaMode:null}),Ad=[["abort","abort"],[fb,"animationEnd"],[gb,"animationIteration"],[hb,"animationStart"],["canplay","canPlay"],["canplaythrough","canPlayThrough"],["drag","drag"],["dragenter","dragEnter"],["dragexit","dragExit"],["dragleave","dragLeave"],["dragover","dragOver"],["durationchange","durationChange"],["emptied","emptied"],["encrypted","encrypted"],
    ["ended","ended"],["error","error"],["gotpointercapture","gotPointerCapture"],["load","load"],["loadeddata","loadedData"],["loadedmetadata","loadedMetadata"],["loadstart","loadStart"],["lostpointercapture","lostPointerCapture"],["mousemove","mouseMove"],["mouseout","mouseOut"],["mouseover","mouseOver"],["playing","playing"],["pointermove","pointerMove"],["pointerout","pointerOut"],["pointerover","pointerOver"],["progress","progress"],["scroll","scroll"],["seeking","seeking"],["stalled","stalled"],
    ["suspend","suspend"],["timeupdate","timeUpdate"],["toggle","toggle"],["touchmove","touchMove"],[ib,"transitionEnd"],["waiting","waiting"],["wheel","wheel"]],Bd={},Cd={};function Dd(a,b){var c=a[0];a=a[1];var d="on"+(a[0].toUpperCase()+a.slice(1));b={phasedRegistrationNames:{bubbled:d,captured:d+"Capture"},dependencies:[c],isInteractive:b};Bd[a]=b;Cd[c]=b;}
    [["blur","blur"],["cancel","cancel"],["click","click"],["close","close"],["contextmenu","contextMenu"],["copy","copy"],["cut","cut"],["dblclick","doubleClick"],["dragend","dragEnd"],["dragstart","dragStart"],["drop","drop"],["focus","focus"],["input","input"],["invalid","invalid"],["keydown","keyDown"],["keypress","keyPress"],["keyup","keyUp"],["mousedown","mouseDown"],["mouseup","mouseUp"],["paste","paste"],["pause","pause"],["play","play"],["pointercancel","pointerCancel"],["pointerdown","pointerDown"],
    ["pointerup","pointerUp"],["ratechange","rateChange"],["reset","reset"],["seeked","seeked"],["submit","submit"],["touchcancel","touchCancel"],["touchend","touchEnd"],["touchstart","touchStart"],["volumechange","volumeChange"]].forEach(function(a){Dd(a,!0);});Ad.forEach(function(a){Dd(a,!1);});
    var Ed={eventTypes:Bd,isInteractiveTopLevelEventType:function(a){a=Cd[a];return void 0!==a&&!0===a.isInteractive},extractEvents:function(a,b,c,d){var e=Cd[a];if(!e)return null;switch(a){case "keypress":if(0===sd(c))return null;case "keydown":case "keyup":a=vd;break;case "blur":case "focus":a=rd;break;case "click":if(2===c.button)return null;case "dblclick":case "mousedown":case "mousemove":case "mouseup":case "mouseout":case "mouseover":case "contextmenu":a=gd;break;case "drag":case "dragend":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "dragstart":case "drop":a=
    wd;break;case "touchcancel":case "touchend":case "touchmove":case "touchstart":a=xd;break;case fb:case gb:case hb:a=pd;break;case ib:a=yd;break;case "scroll":a=cd;break;case "wheel":a=zd;break;case "copy":case "cut":case "paste":a=qd;break;case "gotpointercapture":case "lostpointercapture":case "pointercancel":case "pointerdown":case "pointermove":case "pointerout":case "pointerover":case "pointerup":a=hd;break;default:a=H$1;}b=a.getPooled(e,b,c,d);Ya(b);return b}},Fd=Ed.isInteractiveTopLevelEventType,
    Gd=[];function Hd(a){var b=a.targetInst;do{if(!b){a.ancestors.push(b);break}var c;for(c=b;c.return;)c=c.return;c=3!==c.tag?null:c.stateNode.containerInfo;if(!c)break;a.ancestors.push(b);b=Na(c);}while(b);for(c=0;c<a.ancestors.length;c++)b=a.ancestors[c],Ja(a.topLevelType,b,a.nativeEvent,Zb(a.nativeEvent));}var Id=!0;function Kd(a){Id=!!a;}function K$1(a,b){if(!b)return null;var c=(Fd(a)?Ld:Md).bind(null,a);b.addEventListener(a,c,!1);}
    function Nd(a,b){if(!b)return null;var c=(Fd(a)?Ld:Md).bind(null,a);b.addEventListener(a,c,!0);}function Ld(a,b){Tb(Md,a,b);}function Md(a,b){if(Id){var c=Zb(b);c=Na(c);null===c||"number"!==typeof c.tag||2===kd(c)||(c=null);if(Gd.length){var d=Gd.pop();d.topLevelType=a;d.nativeEvent=b;d.targetInst=c;a=d;}else a={topLevelType:a,nativeEvent:b,targetInst:c,ancestors:[]};try{Wb(Hd,a);}finally{a.topLevelType=null,a.nativeEvent=null,a.targetInst=null,a.ancestors.length=0,10>Gd.length&&Gd.push(a);}}}
    var Od={get _enabled(){return Id},setEnabled:Kd,isEnabled:function(){return Id},trapBubbledEvent:K$1,trapCapturedEvent:Nd,dispatchEvent:Md},Pd={},Qd=0,Rd="_reactListenersID"+(""+Math.random()).slice(2);function Sd(a){Object.prototype.hasOwnProperty.call(a,Rd)||(a[Rd]=Qd++,Pd[a[Rd]]={});return Pd[a[Rd]]}function Td(a){for(;a&&a.firstChild;)a=a.firstChild;return a}
    function Ud(a,b){var c=Td(a);a=0;for(var d;c;){if(3===c.nodeType){d=a+c.textContent.length;if(a<=b&&d>=b)return{node:c,offset:b-a};a=d;}a:{for(;c;){if(c.nextSibling){c=c.nextSibling;break a}c=c.parentNode;}c=void 0;}c=Td(c);}}function Vd(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return b&&("input"===b&&("text"===a.type||"search"===a.type||"tel"===a.type||"url"===a.type||"password"===a.type)||"textarea"===b||"true"===a.contentEditable)}
    var Wd=ExecutionEnvironment_1.canUseDOM&&"documentMode"in document&&11>=document.documentMode,Xd={select:{phasedRegistrationNames:{bubbled:"onSelect",captured:"onSelectCapture"},dependencies:"blur contextmenu focus keydown keyup mousedown mouseup selectionchange".split(" ")}},Yd=null,Zd=null,$d=null,ae=!1;
    function be(a,b){if(ae||null==Yd||Yd!==getActiveElement_1())return null;var c=Yd;"selectionStart"in c&&Vd(c)?c={start:c.selectionStart,end:c.selectionEnd}:window.getSelection?(c=window.getSelection(),c={anchorNode:c.anchorNode,anchorOffset:c.anchorOffset,focusNode:c.focusNode,focusOffset:c.focusOffset}):c=void 0;return $d&&shallowEqual_1($d,c)?null:($d=c,a=H$1.getPooled(Xd.select,Zd,a,b),a.type="select",a.target=Yd,Ya(a),a)}
    var ce={eventTypes:Xd,extractEvents:function(a,b,c,d){var e=d.window===d?d.document:9===d.nodeType?d:d.ownerDocument,f;if(!(f=!e)){a:{e=Sd(e);f=sa.onSelect;for(var g=0;g<f.length;g++){var h=f[g];if(!e.hasOwnProperty(h)||!e[h]){e=!1;break a}}e=!0;}f=!e;}if(f)return null;e=b?Oa(b):window;switch(a){case "focus":if(Yb(e)||"true"===e.contentEditable)Yd=e,Zd=b,$d=null;break;case "blur":$d=Zd=Yd=null;break;case "mousedown":ae=!0;break;case "contextmenu":case "mouseup":return ae=!1,be(c,d);case "selectionchange":if(Wd)break;
    case "keydown":case "keyup":return be(c,d)}return null}};Ga.injectEventPluginOrder("ResponderEventPlugin SimpleEventPlugin TapEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin".split(" "));wa=Qa.getFiberCurrentPropsFromNode;xa=Qa.getInstanceFromNode;ya=Qa.getNodeFromInstance;Ga.injectEventPluginsByName({SimpleEventPlugin:Ed,EnterLeaveEventPlugin:jd,ChangeEventPlugin:bd,SelectEventPlugin:ce,BeforeInputEventPlugin:Ib});
    var de="function"===typeof requestAnimationFrame?requestAnimationFrame:void 0,ee=Date,fe=setTimeout,ge=clearTimeout,he=void 0;if("object"===typeof performance&&"function"===typeof performance.now){var ie=performance;he=function(){return ie.now()};}else he=function(){return ee.now()};var je=void 0,ke=void 0;
    if(ExecutionEnvironment_1.canUseDOM){var le="function"===typeof de?de:function(){A$1("276");},L$1=null,me=null,ne=-1,oe=!1,pe=!1,qe=0,re=33,se=33,te={didTimeout:!1,timeRemaining:function(){var a=qe-he();return 0<a?a:0}},ve=function(a,b){var c=a.scheduledCallback,d=!1;try{c(b),d=!0;}finally{ke(a),d||(oe=!0,window.postMessage(ue,"*"));}},ue="__reactIdleCallback$"+Math.random().toString(36).slice(2);window.addEventListener("message",function(a){if(a.source===window&&a.data===ue&&(oe=!1,null!==L$1)){if(null!==L$1){var b=he();if(!(-1===
    ne||ne>b)){a=-1;for(var c=[],d=L$1;null!==d;){var e=d.timeoutTime;-1!==e&&e<=b?c.push(d):-1!==e&&(-1===a||e<a)&&(a=e);d=d.next;}if(0<c.length)for(te.didTimeout=!0,b=0,d=c.length;b<d;b++)ve(c[b],te);ne=a;}}for(a=he();0<qe-a&&null!==L$1;)a=L$1,te.didTimeout=!1,ve(a,te),a=he();null===L$1||pe||(pe=!0,le(we));}},!1);var we=function(a){pe=!1;var b=a-qe+se;b<se&&re<se?(8>b&&(b=8),se=b<re?re:b):re=b;qe=a+se;oe||(oe=!0,window.postMessage(ue,"*"));};je=function(a,b){var c=-1;null!=b&&"number"===typeof b.timeout&&(c=he()+
    b.timeout);if(-1===ne||-1!==c&&c<ne)ne=c;a={scheduledCallback:a,timeoutTime:c,prev:null,next:null};null===L$1?L$1=a:(b=a.prev=me,null!==b&&(b.next=a));me=a;pe||(pe=!0,le(we));return a};ke=function(a){if(null!==a.prev||L$1===a){var b=a.next,c=a.prev;a.next=null;a.prev=null;null!==b?null!==c?(c.next=b,b.prev=c):(b.prev=null,L$1=b):null!==c?(c.next=null,me=c):me=L$1=null;}};}else{var xe=new Map;je=function(a){var b={scheduledCallback:a,timeoutTime:0,next:null,prev:null},c=fe(function(){a({timeRemaining:function(){return Infinity},
    didTimeout:!1});});xe.set(a,c);return b};ke=function(a){var b=xe.get(a.scheduledCallback);xe.delete(a);ge(b);};}function ye(a){var b="";react.Children.forEach(a,function(a){null==a||"string"!==typeof a&&"number"!==typeof a||(b+=a);});return b}function ze(a,b){a=objectAssign({children:void 0},b);if(b=ye(b.children))a.children=b;return a}
    function Ae(a,b,c,d){a=a.options;if(b){b={};for(var e=0;e<c.length;e++)b["$"+c[e]]=!0;for(c=0;c<a.length;c++)e=b.hasOwnProperty("$"+a[c].value),a[c].selected!==e&&(a[c].selected=e),e&&d&&(a[c].defaultSelected=!0);}else{c=""+c;b=null;for(e=0;e<a.length;e++){if(a[e].value===c){a[e].selected=!0;d&&(a[e].defaultSelected=!0);return}null!==b||a[e].disabled||(b=a[e]);}null!==b&&(b.selected=!0);}}
    function Be(a,b){var c=b.value;a._wrapperState={initialValue:null!=c?c:b.defaultValue,wasMultiple:!!b.multiple};}function Ce(a,b){null!=b.dangerouslySetInnerHTML?A$1("91"):void 0;return objectAssign({},b,{value:void 0,defaultValue:void 0,children:""+a._wrapperState.initialValue})}function De(a,b){var c=b.value;null==c&&(c=b.defaultValue,b=b.children,null!=b&&(null!=c?A$1("92"):void 0,Array.isArray(b)&&(1>=b.length?void 0:A$1("93"),b=b[0]),c=""+b),null==c&&(c=""));a._wrapperState={initialValue:""+c};}
    function Ee(a,b){var c=b.value;null!=c&&(c=""+c,c!==a.value&&(a.value=c),null==b.defaultValue&&(a.defaultValue=c));null!=b.defaultValue&&(a.defaultValue=b.defaultValue);}function Fe(a){var b=a.textContent;b===a._wrapperState.initialValue&&(a.value=b);}var Ge={html:"http://www.w3.org/1999/xhtml",mathml:"http://www.w3.org/1998/Math/MathML",svg:"http://www.w3.org/2000/svg"};
    function He(a){switch(a){case "svg":return"http://www.w3.org/2000/svg";case "math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Ie(a,b){return null==a||"http://www.w3.org/1999/xhtml"===a?He(b):"http://www.w3.org/2000/svg"===a&&"foreignObject"===b?"http://www.w3.org/1999/xhtml":a}
    var Je=void 0,Ke=function(a){return"undefined"!==typeof MSApp&&MSApp.execUnsafeLocalFunction?function(b,c,d,e){MSApp.execUnsafeLocalFunction(function(){return a(b,c,d,e)});}:a}(function(a,b){if(a.namespaceURI!==Ge.svg||"innerHTML"in a)a.innerHTML=b;else{Je=Je||document.createElement("div");Je.innerHTML="<svg>"+b+"</svg>";for(b=Je.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;b.firstChild;)a.appendChild(b.firstChild);}});
    function Le(a,b){if(b){var c=a.firstChild;if(c&&c===a.lastChild&&3===c.nodeType){c.nodeValue=b;return}}a.textContent=b;}
    var Me={animationIterationCount:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,
    stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Ne=["Webkit","ms","Moz","O"];Object.keys(Me).forEach(function(a){Ne.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);Me[b]=Me[a];});});
    function Oe(a,b){a=a.style;for(var c in b)if(b.hasOwnProperty(c)){var d=0===c.indexOf("--");var e=c;var f=b[c];e=null==f||"boolean"===typeof f||""===f?"":d||"number"!==typeof f||0===f||Me.hasOwnProperty(e)&&Me[e]?(""+f).trim():f+"px";"float"===c&&(c="cssFloat");d?a.setProperty(c,e):a[c]=e;}}var Pe=objectAssign({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});
    function Qe(a,b,c){b&&(Pe[a]&&(null!=b.children||null!=b.dangerouslySetInnerHTML?A$1("137",a,c()):void 0),null!=b.dangerouslySetInnerHTML&&(null!=b.children?A$1("60"):void 0,"object"===typeof b.dangerouslySetInnerHTML&&"__html"in b.dangerouslySetInnerHTML?void 0:A$1("61")),null!=b.style&&"object"!==typeof b.style?A$1("62",c()):void 0);}
    function Re(a,b){if(-1===a.indexOf("-"))return"string"===typeof b.is;switch(a){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return!1;default:return!0}}var Se=emptyFunction_1.thatReturns("");
    function Te(a,b){a=9===a.nodeType||11===a.nodeType?a:a.ownerDocument;var c=Sd(a);b=sa[b];for(var d=0;d<b.length;d++){var e=b[d];if(!c.hasOwnProperty(e)||!c[e]){switch(e){case "scroll":Nd("scroll",a);break;case "focus":case "blur":Nd("focus",a);Nd("blur",a);c.blur=!0;c.focus=!0;break;case "cancel":case "close":$b(e,!0)&&Nd(e,a);break;case "invalid":case "submit":case "reset":break;default:-1===jb.indexOf(e)&&K$1(e,a);}c[e]=!0;}}}
    function Ue(a,b,c,d){c=9===c.nodeType?c:c.ownerDocument;d===Ge.html&&(d=He(a));d===Ge.html?"script"===a?(a=c.createElement("div"),a.innerHTML="<script>\x3c/script>",a=a.removeChild(a.firstChild)):a="string"===typeof b.is?c.createElement(a,{is:b.is}):c.createElement(a):a=c.createElementNS(d,a);return a}function Ve(a,b){return(9===b.nodeType?b:b.ownerDocument).createTextNode(a)}
    function We(a,b,c,d){var e=Re(b,c);switch(b){case "iframe":case "object":K$1("load",a);var f=c;break;case "video":case "audio":for(f=0;f<jb.length;f++)K$1(jb[f],a);f=c;break;case "source":K$1("error",a);f=c;break;case "img":case "image":case "link":K$1("error",a);K$1("load",a);f=c;break;case "form":K$1("reset",a);K$1("submit",a);f=c;break;case "details":K$1("toggle",a);f=c;break;case "input":Ic(a,c);f=Hc(a,c);K$1("invalid",a);Te(d,"onChange");break;case "option":f=ze(a,c);break;case "select":Be(a,c);f=objectAssign({},c,{value:void 0});
    K$1("invalid",a);Te(d,"onChange");break;case "textarea":De(a,c);f=Ce(a,c);K$1("invalid",a);Te(d,"onChange");break;default:f=c;}Qe(b,f,Se);var g=f,h;for(h in g)if(g.hasOwnProperty(h)){var k=g[h];"style"===h?Oe(a,k,Se):"dangerouslySetInnerHTML"===h?(k=k?k.__html:void 0,null!=k&&Ke(a,k)):"children"===h?"string"===typeof k?("textarea"!==b||""!==k)&&Le(a,k):"number"===typeof k&&Le(a,""+k):"suppressContentEditableWarning"!==h&&"suppressHydrationWarning"!==h&&"autoFocus"!==h&&(ra.hasOwnProperty(h)?null!=k&&Te(d,
    h):null!=k&&Gc(a,h,k,e));}switch(b){case "input":cc(a);Nc(a,c,!1);break;case "textarea":cc(a);Fe(a,c);break;case "option":null!=c.value&&a.setAttribute("value",c.value);break;case "select":a.multiple=!!c.multiple;b=c.value;null!=b?Ae(a,!!c.multiple,b,!1):null!=c.defaultValue&&Ae(a,!!c.multiple,c.defaultValue,!0);break;default:"function"===typeof f.onClick&&(a.onclick=emptyFunction_1);}}
    function Xe(a,b,c,d,e){var f=null;switch(b){case "input":c=Hc(a,c);d=Hc(a,d);f=[];break;case "option":c=ze(a,c);d=ze(a,d);f=[];break;case "select":c=objectAssign({},c,{value:void 0});d=objectAssign({},d,{value:void 0});f=[];break;case "textarea":c=Ce(a,c);d=Ce(a,d);f=[];break;default:"function"!==typeof c.onClick&&"function"===typeof d.onClick&&(a.onclick=emptyFunction_1);}Qe(b,d,Se);b=a=void 0;var g=null;for(a in c)if(!d.hasOwnProperty(a)&&c.hasOwnProperty(a)&&null!=c[a])if("style"===a){var h=c[a];for(b in h)h.hasOwnProperty(b)&&(g||
    (g={}),g[b]="");}else"dangerouslySetInnerHTML"!==a&&"children"!==a&&"suppressContentEditableWarning"!==a&&"suppressHydrationWarning"!==a&&"autoFocus"!==a&&(ra.hasOwnProperty(a)?f||(f=[]):(f=f||[]).push(a,null));for(a in d){var k=d[a];h=null!=c?c[a]:void 0;if(d.hasOwnProperty(a)&&k!==h&&(null!=k||null!=h))if("style"===a)if(h){for(b in h)!h.hasOwnProperty(b)||k&&k.hasOwnProperty(b)||(g||(g={}),g[b]="");for(b in k)k.hasOwnProperty(b)&&h[b]!==k[b]&&(g||(g={}),g[b]=k[b]);}else g||(f||(f=[]),f.push(a,g)),
    g=k;else"dangerouslySetInnerHTML"===a?(k=k?k.__html:void 0,h=h?h.__html:void 0,null!=k&&h!==k&&(f=f||[]).push(a,""+k)):"children"===a?h===k||"string"!==typeof k&&"number"!==typeof k||(f=f||[]).push(a,""+k):"suppressContentEditableWarning"!==a&&"suppressHydrationWarning"!==a&&(ra.hasOwnProperty(a)?(null!=k&&Te(e,a),f||h===k||(f=[])):(f=f||[]).push(a,k));}g&&(f=f||[]).push("style",g);return f}
    function Ye(a,b,c,d,e){"input"===c&&"radio"===e.type&&null!=e.name&&Kc(a,e);Re(c,d);d=Re(c,e);for(var f=0;f<b.length;f+=2){var g=b[f],h=b[f+1];"style"===g?Oe(a,h,Se):"dangerouslySetInnerHTML"===g?Ke(a,h):"children"===g?Le(a,h):Gc(a,g,h,d);}switch(c){case "input":Lc(a,e);break;case "textarea":Ee(a,e);break;case "select":a._wrapperState.initialValue=void 0,b=a._wrapperState.wasMultiple,a._wrapperState.wasMultiple=!!e.multiple,c=e.value,null!=c?Ae(a,!!e.multiple,c,!1):b!==!!e.multiple&&(null!=e.defaultValue?
    Ae(a,!!e.multiple,e.defaultValue,!0):Ae(a,!!e.multiple,e.multiple?[]:"",!1));}}
    function Ze(a,b,c,d,e){switch(b){case "iframe":case "object":K$1("load",a);break;case "video":case "audio":for(d=0;d<jb.length;d++)K$1(jb[d],a);break;case "source":K$1("error",a);break;case "img":case "image":case "link":K$1("error",a);K$1("load",a);break;case "form":K$1("reset",a);K$1("submit",a);break;case "details":K$1("toggle",a);break;case "input":Ic(a,c);K$1("invalid",a);Te(e,"onChange");break;case "select":Be(a,c);K$1("invalid",a);Te(e,"onChange");break;case "textarea":De(a,c),K$1("invalid",a),Te(e,"onChange");}Qe(b,
    c,Se);d=null;for(var f in c)if(c.hasOwnProperty(f)){var g=c[f];"children"===f?"string"===typeof g?a.textContent!==g&&(d=["children",g]):"number"===typeof g&&a.textContent!==""+g&&(d=["children",""+g]):ra.hasOwnProperty(f)&&null!=g&&Te(e,f);}switch(b){case "input":cc(a);Nc(a,c,!0);break;case "textarea":cc(a);Fe(a,c);break;case "select":case "option":break;default:"function"===typeof c.onClick&&(a.onclick=emptyFunction_1);}return d}function $e(a,b){return a.nodeValue!==b}
    var af={createElement:Ue,createTextNode:Ve,setInitialProperties:We,diffProperties:Xe,updateProperties:Ye,diffHydratedProperties:Ze,diffHydratedText:$e,warnForUnmatchedText:function(){},warnForDeletedHydratableElement:function(){},warnForDeletedHydratableText:function(){},warnForInsertedHydratedElement:function(){},warnForInsertedHydratedText:function(){},restoreControlledState:function(a,b,c){switch(b){case "input":Lc(a,c);b=c.name;if("radio"===c.type&&null!=b){for(c=a;c.parentNode;)c=c.parentNode;
    c=c.querySelectorAll("input[name="+JSON.stringify(""+b)+'][type="radio"]');for(b=0;b<c.length;b++){var d=c[b];if(d!==a&&d.form===a.form){var e=Pa(d);e?void 0:A$1("90");dc(d);Lc(d,e);}}}break;case "textarea":Ee(a,c);break;case "select":b=c.value,null!=b&&Ae(a,!!c.multiple,b,!1);}}},bf=null,cf=null;function df(a,b){switch(a){case "button":case "input":case "select":case "textarea":return!!b.autoFocus}return!1}
    function ef(a,b){return"textarea"===a||"string"===typeof b.children||"number"===typeof b.children||"object"===typeof b.dangerouslySetInnerHTML&&null!==b.dangerouslySetInnerHTML&&"string"===typeof b.dangerouslySetInnerHTML.__html}var ff=he,gf=je,hf=ke;function jf(a){for(a=a.nextSibling;a&&1!==a.nodeType&&3!==a.nodeType;)a=a.nextSibling;return a}function kf(a){for(a=a.firstChild;a&&1!==a.nodeType&&3!==a.nodeType;)a=a.nextSibling;return a}var lf=[],mf=-1;function nf(a){return{current:a}}
    function M$1(a){0>mf||(a.current=lf[mf],lf[mf]=null,mf--);}function N$1(a,b){mf++;lf[mf]=a.current;a.current=b;}var of$1=nf(emptyObject_1),O$1=nf(!1),pf=emptyObject_1;function qf(a){return rf(a)?pf:of$1.current}
    function sf(a,b){var c=a.type.contextTypes;if(!c)return emptyObject_1;var d=a.stateNode;if(d&&d.__reactInternalMemoizedUnmaskedChildContext===b)return d.__reactInternalMemoizedMaskedChildContext;var e={},f;for(f in c)e[f]=b[f];d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=b,a.__reactInternalMemoizedMaskedChildContext=e);return e}function rf(a){return 2===a.tag&&null!=a.type.childContextTypes}function tf(a){rf(a)&&(M$1(O$1,a),M$1(of$1,a));}function uf(a){M$1(O$1,a);M$1(of$1,a);}
    function vf(a,b,c){of$1.current!==emptyObject_1?A$1("168"):void 0;N$1(of$1,b,a);N$1(O$1,c,a);}function wf(a,b){var c=a.stateNode,d=a.type.childContextTypes;if("function"!==typeof c.getChildContext)return b;c=c.getChildContext();for(var e in c)e in d?void 0:A$1("108",uc(a)||"Unknown",e);return objectAssign({},b,c)}function xf(a){if(!rf(a))return!1;var b=a.stateNode;b=b&&b.__reactInternalMemoizedMergedChildContext||emptyObject_1;pf=of$1.current;N$1(of$1,b,a);N$1(O$1,O$1.current,a);return!0}
    function yf(a,b){var c=a.stateNode;c?void 0:A$1("169");if(b){var d=wf(a,pf);c.__reactInternalMemoizedMergedChildContext=d;M$1(O$1,a);M$1(of$1,a);N$1(of$1,d,a);}else M$1(O$1,a);N$1(O$1,b,a);}
    function zf(a,b,c,d){this.tag=a;this.key=c;this.sibling=this.child=this.return=this.stateNode=this.type=null;this.index=0;this.ref=null;this.pendingProps=b;this.memoizedState=this.updateQueue=this.memoizedProps=null;this.mode=d;this.effectTag=0;this.lastEffect=this.firstEffect=this.nextEffect=null;this.expirationTime=0;this.alternate=null;}
    function Af(a,b,c){var d=a.alternate;null===d?(d=new zf(a.tag,b,a.key,a.mode),d.type=a.type,d.stateNode=a.stateNode,d.alternate=a,a.alternate=d):(d.pendingProps=b,d.effectTag=0,d.nextEffect=null,d.firstEffect=null,d.lastEffect=null);d.expirationTime=c;d.child=a.child;d.memoizedProps=a.memoizedProps;d.memoizedState=a.memoizedState;d.updateQueue=a.updateQueue;d.sibling=a.sibling;d.index=a.index;d.ref=a.ref;return d}
    function Bf(a,b,c){var d=a.type,e=a.key;a=a.props;if("function"===typeof d)var f=d.prototype&&d.prototype.isReactComponent?2:0;else if("string"===typeof d)f=5;else switch(d){case ic:return Cf(a.children,b,c,e);case pc:f=11;b|=3;break;case jc:f=11;b|=2;break;case kc:return d=new zf(15,a,e,b|4),d.type=kc,d.expirationTime=c,d;case rc:f=16;b|=2;break;default:a:{switch("object"===typeof d&&null!==d?d.$$typeof:null){case lc:f=13;break a;case mc:f=12;break a;case qc:f=14;break a;default:A$1("130",null==d?
    d:typeof d,"");}f=void 0;}}b=new zf(f,a,e,b);b.type=d;b.expirationTime=c;return b}function Cf(a,b,c,d){a=new zf(10,a,d,b);a.expirationTime=c;return a}function Df(a,b,c){a=new zf(6,a,null,b);a.expirationTime=c;return a}function Ef(a,b,c){b=new zf(4,null!==a.children?a.children:[],a.key,b);b.expirationTime=c;b.stateNode={containerInfo:a.containerInfo,pendingChildren:null,implementation:a.implementation};return b}
    function Ff(a,b,c){b=new zf(3,null,null,b?3:0);a={current:b,containerInfo:a,pendingChildren:null,earliestPendingTime:0,latestPendingTime:0,earliestSuspendedTime:0,latestSuspendedTime:0,latestPingedTime:0,pendingCommitExpirationTime:0,finishedWork:null,context:null,pendingContext:null,hydrate:c,remainingExpirationTime:0,firstBatch:null,nextScheduledRoot:null};return b.stateNode=a}var Gf=null,Hf=null;function If(a){return function(b){try{return a(b)}catch(c){}}}
    function Jf(a){if("undefined"===typeof __REACT_DEVTOOLS_GLOBAL_HOOK__)return!1;var b=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(b.isDisabled||!b.supportsFiber)return!0;try{var c=b.inject(a);Gf=If(function(a){return b.onCommitFiberRoot(c,a)});Hf=If(function(a){return b.onCommitFiberUnmount(c,a)});}catch(d){}return!0}function Kf(a){"function"===typeof Gf&&Gf(a);}function Lf(a){"function"===typeof Hf&&Hf(a);}var Mf=!1;
    function Nf(a){return{expirationTime:0,baseState:a,firstUpdate:null,lastUpdate:null,firstCapturedUpdate:null,lastCapturedUpdate:null,firstEffect:null,lastEffect:null,firstCapturedEffect:null,lastCapturedEffect:null}}function Of(a){return{expirationTime:a.expirationTime,baseState:a.baseState,firstUpdate:a.firstUpdate,lastUpdate:a.lastUpdate,firstCapturedUpdate:null,lastCapturedUpdate:null,firstEffect:null,lastEffect:null,firstCapturedEffect:null,lastCapturedEffect:null}}
    function Pf(a){return{expirationTime:a,tag:0,payload:null,callback:null,next:null,nextEffect:null}}function Qf(a,b,c){null===a.lastUpdate?a.firstUpdate=a.lastUpdate=b:(a.lastUpdate.next=b,a.lastUpdate=b);if(0===a.expirationTime||a.expirationTime>c)a.expirationTime=c;}
    function Rf(a,b,c){var d=a.alternate;if(null===d){var e=a.updateQueue;var f=null;null===e&&(e=a.updateQueue=Nf(a.memoizedState));}else e=a.updateQueue,f=d.updateQueue,null===e?null===f?(e=a.updateQueue=Nf(a.memoizedState),f=d.updateQueue=Nf(d.memoizedState)):e=a.updateQueue=Of(f):null===f&&(f=d.updateQueue=Of(e));null===f||e===f?Qf(e,b,c):null===e.lastUpdate||null===f.lastUpdate?(Qf(e,b,c),Qf(f,b,c)):(Qf(e,b,c),f.lastUpdate=b);}
    function Sf(a,b,c){var d=a.updateQueue;d=null===d?a.updateQueue=Nf(a.memoizedState):Tf(a,d);null===d.lastCapturedUpdate?d.firstCapturedUpdate=d.lastCapturedUpdate=b:(d.lastCapturedUpdate.next=b,d.lastCapturedUpdate=b);if(0===d.expirationTime||d.expirationTime>c)d.expirationTime=c;}function Tf(a,b){var c=a.alternate;null!==c&&b===c.updateQueue&&(b=a.updateQueue=Of(b));return b}
    function Uf(a,b,c,d,e,f){switch(c.tag){case 1:return a=c.payload,"function"===typeof a?a.call(f,d,e):a;case 3:a.effectTag=a.effectTag&-1025|64;case 0:a=c.payload;e="function"===typeof a?a.call(f,d,e):a;if(null===e||void 0===e)break;return objectAssign({},d,e);case 2:Mf=!0;}return d}
    function Vf(a,b,c,d,e){Mf=!1;if(!(0===b.expirationTime||b.expirationTime>e)){b=Tf(a,b);for(var f=b.baseState,g=null,h=0,k=b.firstUpdate,n=f;null!==k;){var r=k.expirationTime;if(r>e){if(null===g&&(g=k,f=n),0===h||h>r)h=r;}else n=Uf(a,b,k,n,c,d),null!==k.callback&&(a.effectTag|=32,k.nextEffect=null,null===b.lastEffect?b.firstEffect=b.lastEffect=k:(b.lastEffect.nextEffect=k,b.lastEffect=k));k=k.next;}r=null;for(k=b.firstCapturedUpdate;null!==k;){var w=k.expirationTime;if(w>e){if(null===r&&(r=k,null===
    g&&(f=n)),0===h||h>w)h=w;}else n=Uf(a,b,k,n,c,d),null!==k.callback&&(a.effectTag|=32,k.nextEffect=null,null===b.lastCapturedEffect?b.firstCapturedEffect=b.lastCapturedEffect=k:(b.lastCapturedEffect.nextEffect=k,b.lastCapturedEffect=k));k=k.next;}null===g&&(b.lastUpdate=null);null===r?b.lastCapturedUpdate=null:a.effectTag|=32;null===g&&null===r&&(f=n);b.baseState=f;b.firstUpdate=g;b.firstCapturedUpdate=r;b.expirationTime=h;a.memoizedState=n;}}
    function Wf(a,b){"function"!==typeof a?A$1("191",a):void 0;a.call(b);}
    function Xf(a,b,c){null!==b.firstCapturedUpdate&&(null!==b.lastUpdate&&(b.lastUpdate.next=b.firstCapturedUpdate,b.lastUpdate=b.lastCapturedUpdate),b.firstCapturedUpdate=b.lastCapturedUpdate=null);a=b.firstEffect;for(b.firstEffect=b.lastEffect=null;null!==a;){var d=a.callback;null!==d&&(a.callback=null,Wf(d,c));a=a.nextEffect;}a=b.firstCapturedEffect;for(b.firstCapturedEffect=b.lastCapturedEffect=null;null!==a;)b=a.callback,null!==b&&(a.callback=null,Wf(b,c)),a=a.nextEffect;}
    function Yf(a,b){return{value:a,source:b,stack:vc(b)}}var Zf=nf(null),$f=nf(null),ag=nf(0);function bg(a){var b=a.type._context;N$1(ag,b._changedBits,a);N$1($f,b._currentValue,a);N$1(Zf,a,a);b._currentValue=a.pendingProps.value;b._changedBits=a.stateNode;}function cg(a){var b=ag.current,c=$f.current;M$1(Zf,a);M$1($f,a);M$1(ag,a);a=a.type._context;a._currentValue=c;a._changedBits=b;}var dg={},eg=nf(dg),fg=nf(dg),gg=nf(dg);function hg(a){a===dg?A$1("174"):void 0;return a}
    function jg(a,b){N$1(gg,b,a);N$1(fg,a,a);N$1(eg,dg,a);var c=b.nodeType;switch(c){case 9:case 11:b=(b=b.documentElement)?b.namespaceURI:Ie(null,"");break;default:c=8===c?b.parentNode:b,b=c.namespaceURI||null,c=c.tagName,b=Ie(b,c);}M$1(eg,a);N$1(eg,b,a);}function kg(a){M$1(eg,a);M$1(fg,a);M$1(gg,a);}function lg(a){fg.current===a&&(M$1(eg,a),M$1(fg,a));}function mg(a,b,c){var d=a.memoizedState;b=b(c,d);d=null===b||void 0===b?d:objectAssign({},d,b);a.memoizedState=d;a=a.updateQueue;null!==a&&0===a.expirationTime&&(a.baseState=d);}
    var qg={isMounted:function(a){return(a=a._reactInternalFiber)?2===kd(a):!1},enqueueSetState:function(a,b,c){a=a._reactInternalFiber;var d=ng();d=og(d,a);var e=Pf(d);e.payload=b;void 0!==c&&null!==c&&(e.callback=c);Rf(a,e,d);pg(a,d);},enqueueReplaceState:function(a,b,c){a=a._reactInternalFiber;var d=ng();d=og(d,a);var e=Pf(d);e.tag=1;e.payload=b;void 0!==c&&null!==c&&(e.callback=c);Rf(a,e,d);pg(a,d);},enqueueForceUpdate:function(a,b){a=a._reactInternalFiber;var c=ng();c=og(c,a);var d=Pf(c);d.tag=2;void 0!==
    b&&null!==b&&(d.callback=b);Rf(a,d,c);pg(a,c);}};function rg(a,b,c,d,e,f){var g=a.stateNode;a=a.type;return"function"===typeof g.shouldComponentUpdate?g.shouldComponentUpdate(c,e,f):a.prototype&&a.prototype.isPureReactComponent?!shallowEqual_1(b,c)||!shallowEqual_1(d,e):!0}
    function sg(a,b,c,d){a=b.state;"function"===typeof b.componentWillReceiveProps&&b.componentWillReceiveProps(c,d);"function"===typeof b.UNSAFE_componentWillReceiveProps&&b.UNSAFE_componentWillReceiveProps(c,d);b.state!==a&&qg.enqueueReplaceState(b,b.state,null);}
    function tg(a,b){var c=a.type,d=a.stateNode,e=a.pendingProps,f=qf(a);d.props=e;d.state=a.memoizedState;d.refs=emptyObject_1;d.context=sf(a,f);f=a.updateQueue;null!==f&&(Vf(a,f,e,d,b),d.state=a.memoizedState);f=a.type.getDerivedStateFromProps;"function"===typeof f&&(mg(a,f,e),d.state=a.memoizedState);"function"===typeof c.getDerivedStateFromProps||"function"===typeof d.getSnapshotBeforeUpdate||"function"!==typeof d.UNSAFE_componentWillMount&&"function"!==typeof d.componentWillMount||(c=d.state,"function"===typeof d.componentWillMount&&
    d.componentWillMount(),"function"===typeof d.UNSAFE_componentWillMount&&d.UNSAFE_componentWillMount(),c!==d.state&&qg.enqueueReplaceState(d,d.state,null),f=a.updateQueue,null!==f&&(Vf(a,f,e,d,b),d.state=a.memoizedState));"function"===typeof d.componentDidMount&&(a.effectTag|=4);}var ug=Array.isArray;
    function vg(a,b,c){a=c.ref;if(null!==a&&"function"!==typeof a&&"object"!==typeof a){if(c._owner){c=c._owner;var d=void 0;c&&(2!==c.tag?A$1("110"):void 0,d=c.stateNode);d?void 0:A$1("147",a);var e=""+a;if(null!==b&&null!==b.ref&&"function"===typeof b.ref&&b.ref._stringRef===e)return b.ref;b=function(a){var b=d.refs===emptyObject_1?d.refs={}:d.refs;null===a?delete b[e]:b[e]=a;};b._stringRef=e;return b}"string"!==typeof a?A$1("148"):void 0;c._owner?void 0:A$1("254",a);}return a}
    function wg(a,b){"textarea"!==a.type&&A$1("31","[object Object]"===Object.prototype.toString.call(b)?"object with keys {"+Object.keys(b).join(", ")+"}":b,"");}
    function xg(a){function b(b,c){if(a){var d=b.lastEffect;null!==d?(d.nextEffect=c,b.lastEffect=c):b.firstEffect=b.lastEffect=c;c.nextEffect=null;c.effectTag=8;}}function c(c,d){if(!a)return null;for(;null!==d;)b(c,d),d=d.sibling;return null}function d(a,b){for(a=new Map;null!==b;)null!==b.key?a.set(b.key,b):a.set(b.index,b),b=b.sibling;return a}function e(a,b,c){a=Af(a,b,c);a.index=0;a.sibling=null;return a}function f(b,c,d){b.index=d;if(!a)return c;d=b.alternate;if(null!==d)return d=d.index,d<c?(b.effectTag=
    2,c):d;b.effectTag=2;return c}function g(b){a&&null===b.alternate&&(b.effectTag=2);return b}function h(a,b,c,d){if(null===b||6!==b.tag)return b=Df(c,a.mode,d),b.return=a,b;b=e(b,c,d);b.return=a;return b}function k(a,b,c,d){if(null!==b&&b.type===c.type)return d=e(b,c.props,d),d.ref=vg(a,b,c),d.return=a,d;d=Bf(c,a.mode,d);d.ref=vg(a,b,c);d.return=a;return d}function n(a,b,c,d){if(null===b||4!==b.tag||b.stateNode.containerInfo!==c.containerInfo||b.stateNode.implementation!==c.implementation)return b=
    Ef(c,a.mode,d),b.return=a,b;b=e(b,c.children||[],d);b.return=a;return b}function r(a,b,c,d,f){if(null===b||10!==b.tag)return b=Cf(c,a.mode,d,f),b.return=a,b;b=e(b,c,d);b.return=a;return b}function w(a,b,c){if("string"===typeof b||"number"===typeof b)return b=Df(""+b,a.mode,c),b.return=a,b;if("object"===typeof b&&null!==b){switch(b.$$typeof){case gc:return c=Bf(b,a.mode,c),c.ref=vg(a,null,b),c.return=a,c;case hc:return b=Ef(b,a.mode,c),b.return=a,b}if(ug(b)||tc(b))return b=Cf(b,a.mode,c,null),b.return=
    a,b;wg(a,b);}return null}function P(a,b,c,d){var e=null!==b?b.key:null;if("string"===typeof c||"number"===typeof c)return null!==e?null:h(a,b,""+c,d);if("object"===typeof c&&null!==c){switch(c.$$typeof){case gc:return c.key===e?c.type===ic?r(a,b,c.props.children,d,e):k(a,b,c,d):null;case hc:return c.key===e?n(a,b,c,d):null}if(ug(c)||tc(c))return null!==e?null:r(a,b,c,d,null);wg(a,c);}return null}function nc(a,b,c,d,e){if("string"===typeof d||"number"===typeof d)return a=a.get(c)||null,h(b,a,""+d,e);
    if("object"===typeof d&&null!==d){switch(d.$$typeof){case gc:return a=a.get(null===d.key?c:d.key)||null,d.type===ic?r(b,a,d.props.children,e,d.key):k(b,a,d,e);case hc:return a=a.get(null===d.key?c:d.key)||null,n(b,a,d,e)}if(ug(d)||tc(d))return a=a.get(c)||null,r(b,a,d,e,null);wg(b,d);}return null}function Jd(e,g,h,k){for(var u=null,x=null,t=g,q=g=0,n=null;null!==t&&q<h.length;q++){t.index>q?(n=t,t=null):n=t.sibling;var l=P(e,t,h[q],k);if(null===l){null===t&&(t=n);break}a&&t&&null===l.alternate&&b(e,
    t);g=f(l,g,q);null===x?u=l:x.sibling=l;x=l;t=n;}if(q===h.length)return c(e,t),u;if(null===t){for(;q<h.length;q++)if(t=w(e,h[q],k))g=f(t,g,q),null===x?u=t:x.sibling=t,x=t;return u}for(t=d(e,t);q<h.length;q++)if(n=nc(t,e,q,h[q],k))a&&null!==n.alternate&&t.delete(null===n.key?q:n.key),g=f(n,g,q),null===x?u=n:x.sibling=n,x=n;a&&t.forEach(function(a){return b(e,a)});return u}function E(e,g,h,k){var u=tc(h);"function"!==typeof u?A$1("150"):void 0;h=u.call(h);null==h?A$1("151"):void 0;for(var t=u=null,n=g,x=
    g=0,y=null,l=h.next();null!==n&&!l.done;x++,l=h.next()){n.index>x?(y=n,n=null):y=n.sibling;var r=P(e,n,l.value,k);if(null===r){n||(n=y);break}a&&n&&null===r.alternate&&b(e,n);g=f(r,g,x);null===t?u=r:t.sibling=r;t=r;n=y;}if(l.done)return c(e,n),u;if(null===n){for(;!l.done;x++,l=h.next())l=w(e,l.value,k),null!==l&&(g=f(l,g,x),null===t?u=l:t.sibling=l,t=l);return u}for(n=d(e,n);!l.done;x++,l=h.next())l=nc(n,e,x,l.value,k),null!==l&&(a&&null!==l.alternate&&n.delete(null===l.key?x:l.key),g=f(l,g,x),null===
    t?u=l:t.sibling=l,t=l);a&&n.forEach(function(a){return b(e,a)});return u}return function(a,d,f,h){var k="object"===typeof f&&null!==f&&f.type===ic&&null===f.key;k&&(f=f.props.children);var n="object"===typeof f&&null!==f;if(n)switch(f.$$typeof){case gc:a:{n=f.key;for(k=d;null!==k;){if(k.key===n)if(10===k.tag?f.type===ic:k.type===f.type){c(a,k.sibling);d=e(k,f.type===ic?f.props.children:f.props,h);d.ref=vg(a,k,f);d.return=a;a=d;break a}else{c(a,k);break}else b(a,k);k=k.sibling;}f.type===ic?(d=Cf(f.props.children,
    a.mode,h,f.key),d.return=a,a=d):(h=Bf(f,a.mode,h),h.ref=vg(a,d,f),h.return=a,a=h);}return g(a);case hc:a:{for(k=f.key;null!==d;){if(d.key===k)if(4===d.tag&&d.stateNode.containerInfo===f.containerInfo&&d.stateNode.implementation===f.implementation){c(a,d.sibling);d=e(d,f.children||[],h);d.return=a;a=d;break a}else{c(a,d);break}else b(a,d);d=d.sibling;}d=Ef(f,a.mode,h);d.return=a;a=d;}return g(a)}if("string"===typeof f||"number"===typeof f)return f=""+f,null!==d&&6===d.tag?(c(a,d.sibling),d=e(d,f,h),d.return=
    a,a=d):(c(a,d),d=Df(f,a.mode,h),d.return=a,a=d),g(a);if(ug(f))return Jd(a,d,f,h);if(tc(f))return E(a,d,f,h);n&&wg(a,f);if("undefined"===typeof f&&!k)switch(a.tag){case 2:case 1:h=a.type,A$1("152",h.displayName||h.name||"Component");}return c(a,d)}}var yg=xg(!0),zg=xg(!1),Ag=null,Bg=null,Cg=!1;function Dg(a,b){var c=new zf(5,null,null,0);c.type="DELETED";c.stateNode=b;c.return=a;c.effectTag=8;null!==a.lastEffect?(a.lastEffect.nextEffect=c,a.lastEffect=c):a.firstEffect=a.lastEffect=c;}
    function Eg(a,b){switch(a.tag){case 5:var c=a.type;b=1!==b.nodeType||c.toLowerCase()!==b.nodeName.toLowerCase()?null:b;return null!==b?(a.stateNode=b,!0):!1;case 6:return b=""===a.pendingProps||3!==b.nodeType?null:b,null!==b?(a.stateNode=b,!0):!1;default:return!1}}function Fg(a){if(Cg){var b=Bg;if(b){var c=b;if(!Eg(a,b)){b=jf(c);if(!b||!Eg(a,b)){a.effectTag|=2;Cg=!1;Ag=a;return}Dg(Ag,c);}Ag=a;Bg=kf(b);}else a.effectTag|=2,Cg=!1,Ag=a;}}
    function Gg(a){for(a=a.return;null!==a&&5!==a.tag&&3!==a.tag;)a=a.return;Ag=a;}function Hg(a){if(a!==Ag)return!1;if(!Cg)return Gg(a),Cg=!0,!1;var b=a.type;if(5!==a.tag||"head"!==b&&"body"!==b&&!ef(b,a.memoizedProps))for(b=Bg;b;)Dg(a,b),b=jf(b);Gg(a);Bg=Ag?jf(a.stateNode):null;return!0}function Ig(){Bg=Ag=null;Cg=!1;}function Q$1(a,b,c){Jg(a,b,c,b.expirationTime);}function Jg(a,b,c,d){b.child=null===a?zg(b,null,c,d):yg(b,a.child,c,d);}
    function Kg(a,b){var c=b.ref;if(null===a&&null!==c||null!==a&&a.ref!==c)b.effectTag|=128;}function Lg(a,b,c,d,e){Kg(a,b);var f=0!==(b.effectTag&64);if(!c&&!f)return d&&yf(b,!1),R$1(a,b);c=b.stateNode;ec.current=b;var g=f?null:c.render();b.effectTag|=1;f&&(Jg(a,b,null,e),b.child=null);Jg(a,b,g,e);b.memoizedState=c.state;b.memoizedProps=c.props;d&&yf(b,!0);return b.child}
    function Mg(a){var b=a.stateNode;b.pendingContext?vf(a,b.pendingContext,b.pendingContext!==b.context):b.context&&vf(a,b.context,!1);jg(a,b.containerInfo);}
    function Ng(a,b,c,d){var e=a.child;null!==e&&(e.return=a);for(;null!==e;){switch(e.tag){case 12:var f=e.stateNode|0;if(e.type===b&&0!==(f&c)){for(f=e;null!==f;){var g=f.alternate;if(0===f.expirationTime||f.expirationTime>d)f.expirationTime=d,null!==g&&(0===g.expirationTime||g.expirationTime>d)&&(g.expirationTime=d);else if(null!==g&&(0===g.expirationTime||g.expirationTime>d))g.expirationTime=d;else break;f=f.return;}f=null;}else f=e.child;break;case 13:f=e.type===a.type?null:e.child;break;default:f=
    e.child;}if(null!==f)f.return=e;else for(f=e;null!==f;){if(f===a){f=null;break}e=f.sibling;if(null!==e){e.return=f.return;f=e;break}f=f.return;}e=f;}}
    function Rg(a,b,c){var d=b.type._context,e=b.pendingProps,f=b.memoizedProps,g=!0;if(O$1.current)g=!1;else if(f===e)return b.stateNode=0,bg(b),R$1(a,b);var h=e.value;b.memoizedProps=e;if(null===f)h=1073741823;else if(f.value===e.value){if(f.children===e.children&&g)return b.stateNode=0,bg(b),R$1(a,b);h=0;}else{var k=f.value;if(k===h&&(0!==k||1/k===1/h)||k!==k&&h!==h){if(f.children===e.children&&g)return b.stateNode=0,bg(b),R$1(a,b);h=0;}else if(h="function"===typeof d._calculateChangedBits?d._calculateChangedBits(k,
    h):1073741823,h|=0,0===h){if(f.children===e.children&&g)return b.stateNode=0,bg(b),R$1(a,b)}else Ng(b,d,h,c);}b.stateNode=h;bg(b);Q$1(a,b,e.children);return b.child}function R$1(a,b){null!==a&&b.child!==a.child?A$1("153"):void 0;if(null!==b.child){a=b.child;var c=Af(a,a.pendingProps,a.expirationTime);b.child=c;for(c.return=b;null!==a.sibling;)a=a.sibling,c=c.sibling=Af(a,a.pendingProps,a.expirationTime),c.return=b;c.sibling=null;}return b.child}
    function Sg(a,b,c){if(0===b.expirationTime||b.expirationTime>c){switch(b.tag){case 3:Mg(b);break;case 2:xf(b);break;case 4:jg(b,b.stateNode.containerInfo);break;case 13:bg(b);}return null}switch(b.tag){case 0:null!==a?A$1("155"):void 0;var d=b.type,e=b.pendingProps,f=qf(b);f=sf(b,f);d=d(e,f);b.effectTag|=1;"object"===typeof d&&null!==d&&"function"===typeof d.render&&void 0===d.$$typeof?(f=b.type,b.tag=2,b.memoizedState=null!==d.state&&void 0!==d.state?d.state:null,f=f.getDerivedStateFromProps,"function"===
    typeof f&&mg(b,f,e),e=xf(b),d.updater=qg,b.stateNode=d,d._reactInternalFiber=b,tg(b,c),a=Lg(a,b,!0,e,c)):(b.tag=1,Q$1(a,b,d),b.memoizedProps=e,a=b.child);return a;case 1:return e=b.type,c=b.pendingProps,O$1.current||b.memoizedProps!==c?(d=qf(b),d=sf(b,d),e=e(c,d),b.effectTag|=1,Q$1(a,b,e),b.memoizedProps=c,a=b.child):a=R$1(a,b),a;case 2:e=xf(b);if(null===a)if(null===b.stateNode){var g=b.pendingProps,h=b.type;d=qf(b);var k=2===b.tag&&null!=b.type.contextTypes;f=k?sf(b,d):emptyObject_1;g=new h(g,f);b.memoizedState=null!==
    g.state&&void 0!==g.state?g.state:null;g.updater=qg;b.stateNode=g;g._reactInternalFiber=b;k&&(k=b.stateNode,k.__reactInternalMemoizedUnmaskedChildContext=d,k.__reactInternalMemoizedMaskedChildContext=f);tg(b,c);d=!0;}else{h=b.type;d=b.stateNode;k=b.memoizedProps;f=b.pendingProps;d.props=k;var n=d.context;g=qf(b);g=sf(b,g);var r=h.getDerivedStateFromProps;(h="function"===typeof r||"function"===typeof d.getSnapshotBeforeUpdate)||"function"!==typeof d.UNSAFE_componentWillReceiveProps&&"function"!==typeof d.componentWillReceiveProps||
    (k!==f||n!==g)&&sg(b,d,f,g);Mf=!1;var w=b.memoizedState;n=d.state=w;var P=b.updateQueue;null!==P&&(Vf(b,P,f,d,c),n=b.memoizedState);k!==f||w!==n||O$1.current||Mf?("function"===typeof r&&(mg(b,r,f),n=b.memoizedState),(k=Mf||rg(b,k,f,w,n,g))?(h||"function"!==typeof d.UNSAFE_componentWillMount&&"function"!==typeof d.componentWillMount||("function"===typeof d.componentWillMount&&d.componentWillMount(),"function"===typeof d.UNSAFE_componentWillMount&&d.UNSAFE_componentWillMount()),"function"===typeof d.componentDidMount&&
    (b.effectTag|=4)):("function"===typeof d.componentDidMount&&(b.effectTag|=4),b.memoizedProps=f,b.memoizedState=n),d.props=f,d.state=n,d.context=g,d=k):("function"===typeof d.componentDidMount&&(b.effectTag|=4),d=!1);}else h=b.type,d=b.stateNode,f=b.memoizedProps,k=b.pendingProps,d.props=f,n=d.context,g=qf(b),g=sf(b,g),r=h.getDerivedStateFromProps,(h="function"===typeof r||"function"===typeof d.getSnapshotBeforeUpdate)||"function"!==typeof d.UNSAFE_componentWillReceiveProps&&"function"!==typeof d.componentWillReceiveProps||
    (f!==k||n!==g)&&sg(b,d,k,g),Mf=!1,n=b.memoizedState,w=d.state=n,P=b.updateQueue,null!==P&&(Vf(b,P,k,d,c),w=b.memoizedState),f!==k||n!==w||O$1.current||Mf?("function"===typeof r&&(mg(b,r,k),w=b.memoizedState),(r=Mf||rg(b,f,k,n,w,g))?(h||"function"!==typeof d.UNSAFE_componentWillUpdate&&"function"!==typeof d.componentWillUpdate||("function"===typeof d.componentWillUpdate&&d.componentWillUpdate(k,w,g),"function"===typeof d.UNSAFE_componentWillUpdate&&d.UNSAFE_componentWillUpdate(k,w,g)),"function"===typeof d.componentDidUpdate&&
    (b.effectTag|=4),"function"===typeof d.getSnapshotBeforeUpdate&&(b.effectTag|=256)):("function"!==typeof d.componentDidUpdate||f===a.memoizedProps&&n===a.memoizedState||(b.effectTag|=4),"function"!==typeof d.getSnapshotBeforeUpdate||f===a.memoizedProps&&n===a.memoizedState||(b.effectTag|=256),b.memoizedProps=k,b.memoizedState=w),d.props=k,d.state=w,d.context=g,d=r):("function"!==typeof d.componentDidUpdate||f===a.memoizedProps&&n===a.memoizedState||(b.effectTag|=4),"function"!==typeof d.getSnapshotBeforeUpdate||
    f===a.memoizedProps&&n===a.memoizedState||(b.effectTag|=256),d=!1);return Lg(a,b,d,e,c);case 3:Mg(b);e=b.updateQueue;if(null!==e)if(d=b.memoizedState,d=null!==d?d.element:null,Vf(b,e,b.pendingProps,null,c),e=b.memoizedState.element,e===d)Ig(),a=R$1(a,b);else{d=b.stateNode;if(d=(null===a||null===a.child)&&d.hydrate)Bg=kf(b.stateNode.containerInfo),Ag=b,d=Cg=!0;d?(b.effectTag|=2,b.child=zg(b,null,e,c)):(Ig(),Q$1(a,b,e));a=b.child;}else Ig(),a=R$1(a,b);return a;case 5:a:{hg(gg.current);e=hg(eg.current);d=Ie(e,
    b.type);e!==d&&(N$1(fg,b,b),N$1(eg,d,b));null===a&&Fg(b);e=b.type;k=b.memoizedProps;d=b.pendingProps;f=null!==a?a.memoizedProps:null;if(!O$1.current&&k===d){if(k=b.mode&1&&!!d.hidden)b.expirationTime=1073741823;if(!k||1073741823!==c){a=R$1(a,b);break a}}k=d.children;ef(e,d)?k=null:f&&ef(e,f)&&(b.effectTag|=16);Kg(a,b);1073741823!==c&&b.mode&1&&d.hidden?(b.expirationTime=1073741823,b.memoizedProps=d,a=null):(Q$1(a,b,k),b.memoizedProps=d,a=b.child);}return a;case 6:return null===a&&Fg(b),b.memoizedProps=b.pendingProps,
    null;case 16:return null;case 4:return jg(b,b.stateNode.containerInfo),e=b.pendingProps,O$1.current||b.memoizedProps!==e?(null===a?b.child=yg(b,null,e,c):Q$1(a,b,e),b.memoizedProps=e,a=b.child):a=R$1(a,b),a;case 14:return e=b.type.render,c=b.pendingProps,d=b.ref,O$1.current||b.memoizedProps!==c||d!==(null!==a?a.ref:null)?(e=e(c,d),Q$1(a,b,e),b.memoizedProps=c,a=b.child):a=R$1(a,b),a;case 10:return c=b.pendingProps,O$1.current||b.memoizedProps!==c?(Q$1(a,b,c),b.memoizedProps=c,a=b.child):a=R$1(a,b),a;case 11:return c=
    b.pendingProps.children,O$1.current||null!==c&&b.memoizedProps!==c?(Q$1(a,b,c),b.memoizedProps=c,a=b.child):a=R$1(a,b),a;case 15:return c=b.pendingProps,b.memoizedProps===c?a=R$1(a,b):(Q$1(a,b,c.children),b.memoizedProps=c,a=b.child),a;case 13:return Rg(a,b,c);case 12:a:if(d=b.type,f=b.pendingProps,k=b.memoizedProps,e=d._currentValue,g=d._changedBits,O$1.current||0!==g||k!==f){b.memoizedProps=f;h=f.unstable_observedBits;if(void 0===h||null===h)h=1073741823;b.stateNode=h;if(0!==(g&h))Ng(b,d,g,c);else if(k===f){a=
    R$1(a,b);break a}c=f.children;c=c(e);b.effectTag|=1;Q$1(a,b,c);a=b.child;}else a=R$1(a,b);return a;default:A$1("156");}}function Tg(a){a.effectTag|=4;}var Ug=void 0,Vg=void 0,Wg=void 0;Ug=function(){};Vg=function(a,b,c){(b.updateQueue=c)&&Tg(b);};Wg=function(a,b,c,d){c!==d&&Tg(b);};
    function Xg(a,b){var c=b.pendingProps;switch(b.tag){case 1:return null;case 2:return tf(b),null;case 3:kg(b);uf(b);var d=b.stateNode;d.pendingContext&&(d.context=d.pendingContext,d.pendingContext=null);if(null===a||null===a.child)Hg(b),b.effectTag&=-3;Ug(b);return null;case 5:lg(b);d=hg(gg.current);var e=b.type;if(null!==a&&null!=b.stateNode){var f=a.memoizedProps,g=b.stateNode,h=hg(eg.current);g=Xe(g,e,f,c,d);Vg(a,b,g,e,f,c,d,h);a.ref!==b.ref&&(b.effectTag|=128);}else{if(!c)return null===b.stateNode?
    A$1("166"):void 0,null;a=hg(eg.current);if(Hg(b))c=b.stateNode,e=b.type,f=b.memoizedProps,c[C$1]=b,c[Ma]=f,d=Ze(c,e,f,a,d),b.updateQueue=d,null!==d&&Tg(b);else{a=Ue(e,c,d,a);a[C$1]=b;a[Ma]=c;a:for(f=b.child;null!==f;){if(5===f.tag||6===f.tag)a.appendChild(f.stateNode);else if(4!==f.tag&&null!==f.child){f.child.return=f;f=f.child;continue}if(f===b)break;for(;null===f.sibling;){if(null===f.return||f.return===b)break a;f=f.return;}f.sibling.return=f.return;f=f.sibling;}We(a,e,c,d);df(e,c)&&Tg(b);b.stateNode=
    a;}null!==b.ref&&(b.effectTag|=128);}return null;case 6:if(a&&null!=b.stateNode)Wg(a,b,a.memoizedProps,c);else{if("string"!==typeof c)return null===b.stateNode?A$1("166"):void 0,null;d=hg(gg.current);hg(eg.current);Hg(b)?(d=b.stateNode,c=b.memoizedProps,d[C$1]=b,$e(d,c)&&Tg(b)):(d=Ve(c,d),d[C$1]=b,b.stateNode=d);}return null;case 14:return null;case 16:return null;case 10:return null;case 11:return null;case 15:return null;case 4:return kg(b),Ug(b),null;case 13:return cg(b),null;case 12:return null;case 0:A$1("167");
    default:A$1("156");}}function Yg(a,b){var c=b.source;null===b.stack&&null!==c&&vc(c);null!==c&&uc(c);b=b.value;null!==a&&2===a.tag&&uc(a);try{b&&b.suppressReactErrorLogging||console.error(b);}catch(d){d&&d.suppressReactErrorLogging||console.error(d);}}function Zg(a){var b=a.ref;if(null!==b)if("function"===typeof b)try{b(null);}catch(c){$g(a,c);}else b.current=null;}
    function ah(a){"function"===typeof Lf&&Lf(a);switch(a.tag){case 2:Zg(a);var b=a.stateNode;if("function"===typeof b.componentWillUnmount)try{b.props=a.memoizedProps,b.state=a.memoizedState,b.componentWillUnmount();}catch(c){$g(a,c);}break;case 5:Zg(a);break;case 4:bh(a);}}function ch(a){return 5===a.tag||3===a.tag||4===a.tag}
    function dh(a){a:{for(var b=a.return;null!==b;){if(ch(b)){var c=b;break a}b=b.return;}A$1("160");c=void 0;}var d=b=void 0;switch(c.tag){case 5:b=c.stateNode;d=!1;break;case 3:b=c.stateNode.containerInfo;d=!0;break;case 4:b=c.stateNode.containerInfo;d=!0;break;default:A$1("161");}c.effectTag&16&&(Le(b,""),c.effectTag&=-17);a:b:for(c=a;;){for(;null===c.sibling;){if(null===c.return||ch(c.return)){c=null;break a}c=c.return;}c.sibling.return=c.return;for(c=c.sibling;5!==c.tag&&6!==c.tag;){if(c.effectTag&2)continue b;
    if(null===c.child||4===c.tag)continue b;else c.child.return=c,c=c.child;}if(!(c.effectTag&2)){c=c.stateNode;break a}}for(var e=a;;){if(5===e.tag||6===e.tag)if(c)if(d){var f=b,g=e.stateNode,h=c;8===f.nodeType?f.parentNode.insertBefore(g,h):f.insertBefore(g,h);}else b.insertBefore(e.stateNode,c);else d?(f=b,g=e.stateNode,8===f.nodeType?f.parentNode.insertBefore(g,f):f.appendChild(g)):b.appendChild(e.stateNode);else if(4!==e.tag&&null!==e.child){e.child.return=e;e=e.child;continue}if(e===a)break;for(;null===
    e.sibling;){if(null===e.return||e.return===a)return;e=e.return;}e.sibling.return=e.return;e=e.sibling;}}
    function bh(a){for(var b=a,c=!1,d=void 0,e=void 0;;){if(!c){c=b.return;a:for(;;){null===c?A$1("160"):void 0;switch(c.tag){case 5:d=c.stateNode;e=!1;break a;case 3:d=c.stateNode.containerInfo;e=!0;break a;case 4:d=c.stateNode.containerInfo;e=!0;break a}c=c.return;}c=!0;}if(5===b.tag||6===b.tag){a:for(var f=b,g=f;;)if(ah(g),null!==g.child&&4!==g.tag)g.child.return=g,g=g.child;else{if(g===f)break;for(;null===g.sibling;){if(null===g.return||g.return===f)break a;g=g.return;}g.sibling.return=g.return;g=g.sibling;}e?
    (f=d,g=b.stateNode,8===f.nodeType?f.parentNode.removeChild(g):f.removeChild(g)):d.removeChild(b.stateNode);}else if(4===b.tag?d=b.stateNode.containerInfo:ah(b),null!==b.child){b.child.return=b;b=b.child;continue}if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return;b=b.return;4===b.tag&&(c=!1);}b.sibling.return=b.return;b=b.sibling;}}
    function eh(a,b){switch(b.tag){case 2:break;case 5:var c=b.stateNode;if(null!=c){var d=b.memoizedProps;a=null!==a?a.memoizedProps:d;var e=b.type,f=b.updateQueue;b.updateQueue=null;null!==f&&(c[Ma]=d,Ye(c,f,e,a,d));}break;case 6:null===b.stateNode?A$1("162"):void 0;b.stateNode.nodeValue=b.memoizedProps;break;case 3:break;case 15:break;case 16:break;default:A$1("163");}}function fh(a,b,c){c=Pf(c);c.tag=3;c.payload={element:null};var d=b.value;c.callback=function(){gh(d);Yg(a,b);};return c}
    function hh(a,b,c){c=Pf(c);c.tag=3;var d=a.stateNode;null!==d&&"function"===typeof d.componentDidCatch&&(c.callback=function(){null===ih?ih=new Set([this]):ih.add(this);var c=b.value,d=b.stack;Yg(a,b);this.componentDidCatch(c,{componentStack:null!==d?d:""});});return c}
    function jh(a,b,c,d,e,f){c.effectTag|=512;c.firstEffect=c.lastEffect=null;d=Yf(d,c);a=b;do{switch(a.tag){case 3:a.effectTag|=1024;d=fh(a,d,f);Sf(a,d,f);return;case 2:if(b=d,c=a.stateNode,0===(a.effectTag&64)&&null!==c&&"function"===typeof c.componentDidCatch&&(null===ih||!ih.has(c))){a.effectTag|=1024;d=hh(a,b,f);Sf(a,d,f);return}}a=a.return;}while(null!==a)}
    function kh(a){switch(a.tag){case 2:tf(a);var b=a.effectTag;return b&1024?(a.effectTag=b&-1025|64,a):null;case 3:return kg(a),uf(a),b=a.effectTag,b&1024?(a.effectTag=b&-1025|64,a):null;case 5:return lg(a),null;case 16:return b=a.effectTag,b&1024?(a.effectTag=b&-1025|64,a):null;case 4:return kg(a),null;case 13:return cg(a),null;default:return null}}var lh=ff(),mh=2,nh=lh,oh=0,ph=0,qh=!1,S$1=null,rh=null,T$1=0,sh=-1,th=!1,U$1=null,uh=!1,vh=!1,ih=null;
    function wh(){if(null!==S$1)for(var a=S$1.return;null!==a;){var b=a;switch(b.tag){case 2:tf(b);break;case 3:kg(b);uf(b);break;case 5:lg(b);break;case 4:kg(b);break;case 13:cg(b);}a=a.return;}rh=null;T$1=0;sh=-1;th=!1;S$1=null;vh=!1;}
    function xh(a){for(;;){var b=a.alternate,c=a.return,d=a.sibling;if(0===(a.effectTag&512)){b=Xg(b,a,T$1);var e=a;if(1073741823===T$1||1073741823!==e.expirationTime){var f=0;switch(e.tag){case 3:case 2:var g=e.updateQueue;null!==g&&(f=g.expirationTime);}for(g=e.child;null!==g;)0!==g.expirationTime&&(0===f||f>g.expirationTime)&&(f=g.expirationTime),g=g.sibling;e.expirationTime=f;}if(null!==b)return b;null!==c&&0===(c.effectTag&512)&&(null===c.firstEffect&&(c.firstEffect=a.firstEffect),null!==a.lastEffect&&
    (null!==c.lastEffect&&(c.lastEffect.nextEffect=a.firstEffect),c.lastEffect=a.lastEffect),1<a.effectTag&&(null!==c.lastEffect?c.lastEffect.nextEffect=a:c.firstEffect=a,c.lastEffect=a));if(null!==d)return d;if(null!==c)a=c;else{vh=!0;break}}else{a=kh(a,th,T$1);if(null!==a)return a.effectTag&=511,a;null!==c&&(c.firstEffect=c.lastEffect=null,c.effectTag|=512);if(null!==d)return d;if(null!==c)a=c;else break}}return null}
    function yh(a){var b=Sg(a.alternate,a,T$1);null===b&&(b=xh(a));ec.current=null;return b}
    function zh(a,b,c){qh?A$1("243"):void 0;qh=!0;if(b!==T$1||a!==rh||null===S$1)wh(),rh=a,T$1=b,sh=-1,S$1=Af(rh.current,null,T$1),a.pendingCommitExpirationTime=0;var d=!1;th=!c||T$1<=mh;do{try{if(c)for(;null!==S$1&&!Ah();)S$1=yh(S$1);else for(;null!==S$1;)S$1=yh(S$1);}catch(f){if(null===S$1)d=!0,gh(f);else{null===S$1?A$1("271"):void 0;c=S$1;var e=c.return;if(null===e){d=!0;gh(f);break}jh(a,e,c,f,th,T$1,nh);S$1=xh(c);}}break}while(1);qh=!1;if(d)return null;if(null===S$1){if(vh)return a.pendingCommitExpirationTime=b,a.current.alternate;th?A$1("262"):
    void 0;0<=sh&&setTimeout(function(){var b=a.current.expirationTime;0!==b&&(0===a.remainingExpirationTime||a.remainingExpirationTime<b)&&Bh(a,b);},sh);Ch(a.current.expirationTime);}return null}
    function $g(a,b){var c;a:{qh&&!uh?A$1("263"):void 0;for(c=a.return;null!==c;){switch(c.tag){case 2:var d=c.stateNode;if("function"===typeof c.type.getDerivedStateFromCatch||"function"===typeof d.componentDidCatch&&(null===ih||!ih.has(d))){a=Yf(b,a);a=hh(c,a,1);Rf(c,a,1);pg(c,1);c=void 0;break a}break;case 3:a=Yf(b,a);a=fh(c,a,1);Rf(c,a,1);pg(c,1);c=void 0;break a}c=c.return;}3===a.tag&&(c=Yf(b,a),c=fh(a,c,1),Rf(a,c,1),pg(a,1));c=void 0;}return c}
    function Dh(){var a=2+25*(((ng()-2+500)/25|0)+1);a<=oh&&(a=oh+1);return oh=a}function og(a,b){a=0!==ph?ph:qh?uh?1:T$1:b.mode&1?Eh?2+10*(((a-2+15)/10|0)+1):2+25*(((a-2+500)/25|0)+1):1;Eh&&(0===Fh||a>Fh)&&(Fh=a);return a}
    function pg(a,b){for(;null!==a;){if(0===a.expirationTime||a.expirationTime>b)a.expirationTime=b;null!==a.alternate&&(0===a.alternate.expirationTime||a.alternate.expirationTime>b)&&(a.alternate.expirationTime=b);if(null===a.return)if(3===a.tag){var c=a.stateNode;!qh&&0!==T$1&&b<T$1&&wh();var d=c.current.expirationTime;qh&&!uh&&rh===c||Bh(c,d);Gh>Hh&&A$1("185");}else break;a=a.return;}}function ng(){nh=ff()-lh;return mh=(nh/10|0)+2}
    function Ih(a){var b=ph;ph=2+25*(((ng()-2+500)/25|0)+1);try{return a()}finally{ph=b;}}function Jh(a,b,c,d,e){var f=ph;ph=1;try{return a(b,c,d,e)}finally{ph=f;}}var Kh=null,V$1=null,Lh=0,Mh=void 0,W$1=!1,X$1=null,Y$1=0,Fh=0,Nh=!1,Oh=!1,Ph=null,Qh=null,Z$1=!1,Rh=!1,Eh=!1,Sh=null,Hh=1E3,Gh=0,Th=1;function Uh(a){if(0!==Lh){if(a>Lh)return;null!==Mh&&hf(Mh);}var b=ff()-lh;Lh=a;Mh=gf(Vh,{timeout:10*(a-2)-b});}
    function Bh(a,b){if(null===a.nextScheduledRoot)a.remainingExpirationTime=b,null===V$1?(Kh=V$1=a,a.nextScheduledRoot=a):(V$1=V$1.nextScheduledRoot=a,V$1.nextScheduledRoot=Kh);else{var c=a.remainingExpirationTime;if(0===c||b<c)a.remainingExpirationTime=b;}W$1||(Z$1?Rh&&(X$1=a,Y$1=1,Wh(a,1,!1)):1===b?Xh():Uh(b));}
    function Yh(){var a=0,b=null;if(null!==V$1)for(var c=V$1,d=Kh;null!==d;){var e=d.remainingExpirationTime;if(0===e){null===c||null===V$1?A$1("244"):void 0;if(d===d.nextScheduledRoot){Kh=V$1=d.nextScheduledRoot=null;break}else if(d===Kh)Kh=e=d.nextScheduledRoot,V$1.nextScheduledRoot=e,d.nextScheduledRoot=null;else if(d===V$1){V$1=c;V$1.nextScheduledRoot=Kh;d.nextScheduledRoot=null;break}else c.nextScheduledRoot=d.nextScheduledRoot,d.nextScheduledRoot=null;d=c.nextScheduledRoot;}else{if(0===a||e<a)a=e,b=d;if(d===V$1)break;
    c=d;d=d.nextScheduledRoot;}}c=X$1;null!==c&&c===b&&1===a?Gh++:Gh=0;X$1=b;Y$1=a;}function Vh(a){Zh(0,!0,a);}function Xh(){Zh(1,!1,null);}function Zh(a,b,c){Qh=c;Yh();if(b)for(;null!==X$1&&0!==Y$1&&(0===a||a>=Y$1)&&(!Nh||ng()>=Y$1);)ng(),Wh(X$1,Y$1,!Nh),Yh();else for(;null!==X$1&&0!==Y$1&&(0===a||a>=Y$1);)Wh(X$1,Y$1,!1),Yh();null!==Qh&&(Lh=0,Mh=null);0!==Y$1&&Uh(Y$1);Qh=null;Nh=!1;$h();}function ai(a,b){W$1?A$1("253"):void 0;X$1=a;Y$1=b;Wh(a,b,!1);Xh();$h();}
    function $h(){Gh=0;if(null!==Sh){var a=Sh;Sh=null;for(var b=0;b<a.length;b++){var c=a[b];try{c._onComplete();}catch(d){Oh||(Oh=!0,Ph=d);}}}if(Oh)throw a=Ph,Ph=null,Oh=!1,a;}function Wh(a,b,c){W$1?A$1("245"):void 0;W$1=!0;c?(c=a.finishedWork,null!==c?bi(a,c,b):(c=zh(a,b,!0),null!==c&&(Ah()?a.finishedWork=c:bi(a,c,b)))):(c=a.finishedWork,null!==c?bi(a,c,b):(c=zh(a,b,!1),null!==c&&bi(a,c,b)));W$1=!1;}
    function bi(a,b,c){var d=a.firstBatch;if(null!==d&&d._expirationTime<=c&&(null===Sh?Sh=[d]:Sh.push(d),d._defer)){a.finishedWork=b;a.remainingExpirationTime=0;return}a.finishedWork=null;uh=qh=!0;c=b.stateNode;c.current===b?A$1("177"):void 0;d=c.pendingCommitExpirationTime;0===d?A$1("261"):void 0;c.pendingCommitExpirationTime=0;ng();ec.current=null;if(1<b.effectTag)if(null!==b.lastEffect){b.lastEffect.nextEffect=b;var e=b.firstEffect;}else e=b;else e=b.firstEffect;bf=Id;var f=getActiveElement_1();if(Vd(f)){if("selectionStart"in
    f)var g={start:f.selectionStart,end:f.selectionEnd};else a:{var h=window.getSelection&&window.getSelection();if(h&&0!==h.rangeCount){g=h.anchorNode;var k=h.anchorOffset,n=h.focusNode;h=h.focusOffset;try{g.nodeType,n.nodeType;}catch(Wa){g=null;break a}var r=0,w=-1,P=-1,nc=0,Jd=0,E=f,t=null;b:for(;;){for(var x;;){E!==g||0!==k&&3!==E.nodeType||(w=r+k);E!==n||0!==h&&3!==E.nodeType||(P=r+h);3===E.nodeType&&(r+=E.nodeValue.length);if(null===(x=E.firstChild))break;t=E;E=x;}for(;;){if(E===f)break b;t===g&&
    ++nc===k&&(w=r);t===n&&++Jd===h&&(P=r);if(null!==(x=E.nextSibling))break;E=t;t=E.parentNode;}E=x;}g=-1===w||-1===P?null:{start:w,end:P};}else g=null;}g=g||{start:0,end:0};}else g=null;cf={focusedElem:f,selectionRange:g};Kd(!1);for(U$1=e;null!==U$1;){f=!1;g=void 0;try{for(;null!==U$1;){if(U$1.effectTag&256){var u=U$1.alternate;k=U$1;switch(k.tag){case 2:if(k.effectTag&256&&null!==u){var y=u.memoizedProps,D=u.memoizedState,ja=k.stateNode;ja.props=k.memoizedProps;ja.state=k.memoizedState;var ni=ja.getSnapshotBeforeUpdate(y,
    D);ja.__reactInternalSnapshotBeforeUpdate=ni;}break;case 3:case 5:case 6:case 4:break;default:A$1("163");}}U$1=U$1.nextEffect;}}catch(Wa){f=!0,g=Wa;}f&&(null===U$1?A$1("178"):void 0,$g(U$1,g),null!==U$1&&(U$1=U$1.nextEffect));}for(U$1=e;null!==U$1;){u=!1;y=void 0;try{for(;null!==U$1;){var q=U$1.effectTag;q&16&&Le(U$1.stateNode,"");if(q&128){var z=U$1.alternate;if(null!==z){var l=z.ref;null!==l&&("function"===typeof l?l(null):l.current=null);}}switch(q&14){case 2:dh(U$1);U$1.effectTag&=-3;break;case 6:dh(U$1);U$1.effectTag&=-3;eh(U$1.alternate,
    U$1);break;case 4:eh(U$1.alternate,U$1);break;case 8:D=U$1,bh(D),D.return=null,D.child=null,D.alternate&&(D.alternate.child=null,D.alternate.return=null);}U$1=U$1.nextEffect;}}catch(Wa){u=!0,y=Wa;}u&&(null===U$1?A$1("178"):void 0,$g(U$1,y),null!==U$1&&(U$1=U$1.nextEffect));}l=cf;z=getActiveElement_1();q=l.focusedElem;u=l.selectionRange;if(z!==q&&containsNode_1(document.documentElement,q)){null!==u&&Vd(q)&&(z=u.start,l=u.end,void 0===l&&(l=z),"selectionStart"in q?(q.selectionStart=z,q.selectionEnd=Math.min(l,q.value.length)):window.getSelection&&(z=window.getSelection(),
    y=q[lb()].length,l=Math.min(u.start,y),u=void 0===u.end?l:Math.min(u.end,y),!z.extend&&l>u&&(y=u,u=l,l=y),y=Ud(q,l),D=Ud(q,u),y&&D&&(1!==z.rangeCount||z.anchorNode!==y.node||z.anchorOffset!==y.offset||z.focusNode!==D.node||z.focusOffset!==D.offset)&&(ja=document.createRange(),ja.setStart(y.node,y.offset),z.removeAllRanges(),l>u?(z.addRange(ja),z.extend(D.node,D.offset)):(ja.setEnd(D.node,D.offset),z.addRange(ja)))));z=[];for(l=q;l=l.parentNode;)1===l.nodeType&&z.push({element:l,left:l.scrollLeft,
    top:l.scrollTop});"function"===typeof q.focus&&q.focus();for(q=0;q<z.length;q++)l=z[q],l.element.scrollLeft=l.left,l.element.scrollTop=l.top;}cf=null;Kd(bf);bf=null;c.current=b;for(U$1=e;null!==U$1;){e=!1;q=void 0;try{for(z=d;null!==U$1;){var ig=U$1.effectTag;if(ig&36){var oc=U$1.alternate;l=U$1;u=z;switch(l.tag){case 2:var ca=l.stateNode;if(l.effectTag&4)if(null===oc)ca.props=l.memoizedProps,ca.state=l.memoizedState,ca.componentDidMount();else{var xi=oc.memoizedProps,yi=oc.memoizedState;ca.props=l.memoizedProps;
    ca.state=l.memoizedState;ca.componentDidUpdate(xi,yi,ca.__reactInternalSnapshotBeforeUpdate);}var Og=l.updateQueue;null!==Og&&(ca.props=l.memoizedProps,ca.state=l.memoizedState,Xf(l,Og,ca,u));break;case 3:var Pg=l.updateQueue;if(null!==Pg){y=null;if(null!==l.child)switch(l.child.tag){case 5:y=l.child.stateNode;break;case 2:y=l.child.stateNode;}Xf(l,Pg,y,u);}break;case 5:var zi=l.stateNode;null===oc&&l.effectTag&4&&df(l.type,l.memoizedProps)&&zi.focus();break;case 6:break;case 4:break;case 15:break;case 16:break;
    default:A$1("163");}}if(ig&128){l=void 0;var yc=U$1.ref;if(null!==yc){var Qg=U$1.stateNode;switch(U$1.tag){case 5:l=Qg;break;default:l=Qg;}"function"===typeof yc?yc(l):yc.current=l;}}var Ai=U$1.nextEffect;U$1.nextEffect=null;U$1=Ai;}}catch(Wa){e=!0,q=Wa;}e&&(null===U$1?A$1("178"):void 0,$g(U$1,q),null!==U$1&&(U$1=U$1.nextEffect));}qh=uh=!1;"function"===typeof Kf&&Kf(b.stateNode);b=c.current.expirationTime;0===b&&(ih=null);a.remainingExpirationTime=b;}function Ah(){return null===Qh||Qh.timeRemaining()>Th?!1:Nh=!0}
    function gh(a){null===X$1?A$1("246"):void 0;X$1.remainingExpirationTime=0;Oh||(Oh=!0,Ph=a);}function Ch(a){null===X$1?A$1("246"):void 0;X$1.remainingExpirationTime=a;}function ci(a,b){var c=Z$1;Z$1=!0;try{return a(b)}finally{(Z$1=c)||W$1||Xh();}}function di(a,b){if(Z$1&&!Rh){Rh=!0;try{return a(b)}finally{Rh=!1;}}return a(b)}function ei(a,b){W$1?A$1("187"):void 0;var c=Z$1;Z$1=!0;try{return Jh(a,b)}finally{Z$1=c,Xh();}}
    function fi(a,b,c){if(Eh)return a(b,c);Z$1||W$1||0===Fh||(Zh(Fh,!1,null),Fh=0);var d=Eh,e=Z$1;Z$1=Eh=!0;try{return a(b,c)}finally{Eh=d,(Z$1=e)||W$1||Xh();}}function gi(a){var b=Z$1;Z$1=!0;try{Jh(a);}finally{(Z$1=b)||W$1||Zh(1,!1,null);}}
    function hi(a,b,c,d,e){var f=b.current;if(c){c=c._reactInternalFiber;var g;b:{2===kd(c)&&2===c.tag?void 0:A$1("170");for(g=c;3!==g.tag;){if(rf(g)){g=g.stateNode.__reactInternalMemoizedMergedChildContext;break b}(g=g.return)?void 0:A$1("171");}g=g.stateNode.context;}c=rf(c)?wf(c,g):g;}else c=emptyObject_1;null===b.context?b.context=c:b.pendingContext=c;b=e;e=Pf(d);e.payload={element:a};b=void 0===b?null:b;null!==b&&(e.callback=b);Rf(f,e,d);pg(f,d);return d}
    function ii(a){var b=a._reactInternalFiber;void 0===b&&("function"===typeof a.render?A$1("188"):A$1("268",Object.keys(a)));a=nd(b);return null===a?null:a.stateNode}function ji(a,b,c,d){var e=b.current,f=ng();e=og(f,e);return hi(a,b,c,e,d)}function ki(a){a=a.current;if(!a.child)return null;switch(a.child.tag){case 5:return a.child.stateNode;default:return a.child.stateNode}}
    function li(a){var b=a.findFiberByHostInstance;return Jf(objectAssign({},a,{findHostInstanceByFiber:function(a){a=nd(a);return null===a?null:a.stateNode},findFiberByHostInstance:function(a){return b?b(a):null}}))}
    var mi={updateContainerAtExpirationTime:hi,createContainer:function(a,b,c){return Ff(a,b,c)},updateContainer:ji,flushRoot:ai,requestWork:Bh,computeUniqueAsyncExpiration:Dh,batchedUpdates:ci,unbatchedUpdates:di,deferredUpdates:Ih,syncUpdates:Jh,interactiveUpdates:fi,flushInteractiveUpdates:function(){W$1||0===Fh||(Zh(Fh,!1,null),Fh=0);},flushControlled:gi,flushSync:ei,getPublicRootInstance:ki,findHostInstance:ii,findHostInstanceWithNoPortals:function(a){a=od(a);return null===a?null:a.stateNode},injectIntoDevTools:li};
    function oi(a,b,c){var d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return{$$typeof:hc,key:null==d?null:""+d,children:a,containerInfo:b,implementation:c}}Kb.injectFiberControlledHostComponent(af);function pi(a){this._expirationTime=Dh();this._root=a;this._callbacks=this._next=null;this._hasChildren=this._didComplete=!1;this._children=null;this._defer=!0;}
    pi.prototype.render=function(a){this._defer?void 0:A$1("250");this._hasChildren=!0;this._children=a;var b=this._root._internalRoot,c=this._expirationTime,d=new qi;hi(a,b,null,c,d._onCommit);return d};pi.prototype.then=function(a){if(this._didComplete)a();else{var b=this._callbacks;null===b&&(b=this._callbacks=[]);b.push(a);}};
    pi.prototype.commit=function(){var a=this._root._internalRoot,b=a.firstBatch;this._defer&&null!==b?void 0:A$1("251");if(this._hasChildren){var c=this._expirationTime;if(b!==this){this._hasChildren&&(c=this._expirationTime=b._expirationTime,this.render(this._children));for(var d=null,e=b;e!==this;)d=e,e=e._next;null===d?A$1("251"):void 0;d._next=e._next;this._next=b;a.firstBatch=this;}this._defer=!1;ai(a,c);b=this._next;this._next=null;b=a.firstBatch=b;null!==b&&b._hasChildren&&b.render(b._children);}else this._next=
    null,this._defer=!1;};pi.prototype._onComplete=function(){if(!this._didComplete){this._didComplete=!0;var a=this._callbacks;if(null!==a)for(var b=0;b<a.length;b++)(0, a[b])();}};function qi(){this._callbacks=null;this._didCommit=!1;this._onCommit=this._onCommit.bind(this);}qi.prototype.then=function(a){if(this._didCommit)a();else{var b=this._callbacks;null===b&&(b=this._callbacks=[]);b.push(a);}};
    qi.prototype._onCommit=function(){if(!this._didCommit){this._didCommit=!0;var a=this._callbacks;if(null!==a)for(var b=0;b<a.length;b++){var c=a[b];"function"!==typeof c?A$1("191",c):void 0;c();}}};function ri(a,b,c){this._internalRoot=Ff(a,b,c);}ri.prototype.render=function(a,b){var c=this._internalRoot,d=new qi;b=void 0===b?null:b;null!==b&&d.then(b);ji(a,c,null,d._onCommit);return d};
    ri.prototype.unmount=function(a){var b=this._internalRoot,c=new qi;a=void 0===a?null:a;null!==a&&c.then(a);ji(null,b,null,c._onCommit);return c};ri.prototype.legacy_renderSubtreeIntoContainer=function(a,b,c){var d=this._internalRoot,e=new qi;c=void 0===c?null:c;null!==c&&e.then(c);ji(b,d,a,e._onCommit);return e};
    ri.prototype.createBatch=function(){var a=new pi(this),b=a._expirationTime,c=this._internalRoot,d=c.firstBatch;if(null===d)c.firstBatch=a,a._next=null;else{for(c=null;null!==d&&d._expirationTime<=b;)c=d,d=d._next;a._next=d;null!==c&&(c._next=a);}return a};function si(a){return!(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType&&(8!==a.nodeType||" react-mount-point-unstable "!==a.nodeValue))}Sb=mi.batchedUpdates;Tb=mi.interactiveUpdates;Ub=mi.flushInteractiveUpdates;
    function ti(a,b){b||(b=a?9===a.nodeType?a.documentElement:a.firstChild:null,b=!(!b||1!==b.nodeType||!b.hasAttribute("data-reactroot")));if(!b)for(var c;c=a.lastChild;)a.removeChild(c);return new ri(a,!1,b)}
    function ui(a,b,c,d,e){si(c)?void 0:A$1("200");var f=c._reactRootContainer;if(f){if("function"===typeof e){var g=e;e=function(){var a=ki(f._internalRoot);g.call(a);};}null!=a?f.legacy_renderSubtreeIntoContainer(a,b,e):f.render(b,e);}else{f=c._reactRootContainer=ti(c,d);if("function"===typeof e){var h=e;e=function(){var a=ki(f._internalRoot);h.call(a);};}di(function(){null!=a?f.legacy_renderSubtreeIntoContainer(a,b,e):f.render(b,e);});}return ki(f._internalRoot)}
    function vi(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;si(b)?void 0:A$1("200");return oi(a,b,null,c)}
    var wi={createPortal:vi,findDOMNode:function(a){return null==a?null:1===a.nodeType?a:ii(a)},hydrate:function(a,b,c){return ui(null,a,b,!0,c)},render:function(a,b,c){return ui(null,a,b,!1,c)},unstable_renderSubtreeIntoContainer:function(a,b,c,d){null==a||void 0===a._reactInternalFiber?A$1("38"):void 0;return ui(a,b,c,!1,d)},unmountComponentAtNode:function(a){si(a)?void 0:A$1("40");return a._reactRootContainer?(di(function(){ui(null,null,a,!1,function(){a._reactRootContainer=null;});}),!0):!1},unstable_createPortal:function(){return vi.apply(void 0,
    arguments)},unstable_batchedUpdates:ci,unstable_deferredUpdates:Ih,unstable_interactiveUpdates:fi,flushSync:ei,unstable_flushControlled:gi,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{EventPluginHub:Ka,EventPluginRegistry:va,EventPropagators:$a,ReactControlledComponent:Rb,ReactDOMComponentTree:Qa,ReactDOMEventListener:Od},unstable_createRoot:function(a,b){return new ri(a,!0,null!=b&&!0===b.hydrate)}};li({findFiberByHostInstance:Na,bundleType:0,version:"16.4.2",rendererPackageName:"react-dom"});
    var Bi={default:wi},Ci=Bi&&wi||Bi;var reactDom_production_min=Ci.default?Ci.default:Ci;

    var reactDom = createCommonjsModule(function (module) {

    function checkDCE() {
      /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
      if (
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
      ) {
        return;
      }
      try {
        // Verify that the code above has been dead code eliminated (DCE'd).
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
      } catch (err) {
        // DevTools shouldn't crash React, no matter what.
        // We should still report in case we break this code.
        console.error(err);
      }
    }

    {
      // DCE check should happen before ReactDOM bundle executes so that
      // DevTools can report bad minification during injection.
      checkDCE();
      module.exports = reactDom_production_min;
    }
    });

    function generatePatches(state, basepath, patches, inversePatches, baseValue, resultValue) {
        if (patches) if (Array.isArray(baseValue)) generateArrayPatches(state, basepath, patches, inversePatches, baseValue, resultValue);else generateObjectPatches(state, basepath, patches, inversePatches, baseValue, resultValue);
    }

    function generateArrayPatches(state, basepath, patches, inversePatches, baseValue, resultValue) {
        var shared = Math.min(baseValue.length, resultValue.length);
        for (var i = 0; i < shared; i++) {
            if (state.assigned[i] && baseValue[i] !== resultValue[i]) {
                var path = basepath.concat(i);
                patches.push({ op: "replace", path: path, value: resultValue[i] });
                inversePatches.push({ op: "replace", path: path, value: baseValue[i] });
            }
        }
        if (shared < resultValue.length) {
            // stuff was added
            for (var _i = shared; _i < resultValue.length; _i++) {
                var _path = basepath.concat(_i);
                patches.push({ op: "add", path: _path, value: resultValue[_i] });
            }
            inversePatches.push({
                op: "replace",
                path: basepath.concat("length"),
                value: baseValue.length
            });
        } else if (shared < baseValue.length) {
            // stuff was removed
            patches.push({
                op: "replace",
                path: basepath.concat("length"),
                value: resultValue.length
            });
            for (var _i2 = shared; _i2 < baseValue.length; _i2++) {
                var _path2 = basepath.concat(_i2);
                inversePatches.push({ op: "add", path: _path2, value: baseValue[_i2] });
            }
        }
    }

    function generateObjectPatches(state, basepath, patches, inversePatches, baseValue, resultValue) {
        each(state.assigned, function (key, assignedValue) {
            var origValue = baseValue[key];
            var value = resultValue[key];
            var op = !assignedValue ? "remove" : key in baseValue ? "replace" : "add";
            if (origValue === baseValue && op === "replace") return;
            var path = basepath.concat(key);
            patches.push(op === "remove" ? { op: op, path: path } : { op: op, path: path, value: value });
            inversePatches.push(op === "add" ? { op: "remove", path: path } : op === "remove" ? { op: "add", path: path, value: origValue } : { op: "replace", path: path, value: origValue });
        });
    }

    function applyPatches(draft, patches) {
        var _loop = function _loop(i) {
            var patch = patches[i];
            if (patch.path.length === 0 && patch.op === "replace") {
                draft = patch.value;
            } else {
                var path = patch.path.slice();
                var key = path.pop();
                var base = path.reduce(function (current, part) {
                    if (!current) throw new Error("Cannot apply patch, path doesn't resolve: " + patch.path.join("/"));
                    return current[part];
                }, draft);
                if (!base) throw new Error("Cannot apply patch, path doesn't resolve: " + patch.path.join("/"));
                switch (patch.op) {
                    case "replace":
                    case "add":
                        // TODO: add support is not extensive, it does not support insertion or `-` atm!
                        base[key] = patch.value;
                        break;
                    case "remove":
                        if (Array.isArray(base)) {
                            if (key === base.length - 1) base.length -= 1;else throw new Error("Remove can only remove the last key of an array, index: " + key + ", length: " + base.length);
                        } else delete base[key];
                        break;
                    default:
                        throw new Error("Unsupported patch operation: " + patch.op);
                }
            }
        };

        for (var i = 0; i < patches.length; i++) {
            _loop(i);
        }
        return draft;
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };



















    var defineProperty$1 = function (obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    };

    var NOTHING = typeof Symbol !== "undefined" ? Symbol("immer-nothing") : defineProperty$1({}, "immer-nothing", true);

    var PROXY_STATE = typeof Symbol !== "undefined" ? Symbol("immer-proxy-state") : "__$immer_state";

    var RETURNED_AND_MODIFIED_ERROR = "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.";

    function verifyMinified() {}

    var inProduction = typeof process !== "undefined" && "production" === "production" || verifyMinified.name !== "verifyMinified";

    var autoFreeze = !inProduction;
    var useProxies = typeof Proxy !== "undefined";

    function getUseProxies() {
        return useProxies;
    }

    function isProxy(value) {
        return !!value && !!value[PROXY_STATE];
    }

    function isProxyable(value) {
        if (!value) return false;
        if ((typeof value === "undefined" ? "undefined" : _typeof(value)) !== "object") return false;
        if (Array.isArray(value)) return true;
        var proto = Object.getPrototypeOf(value);
        return proto === null || proto === Object.prototype;
    }

    function freeze(value) {
        if (autoFreeze) {
            Object.freeze(value);
        }
        return value;
    }

    var assign$1 = Object.assign || function assign(target, value) {
        for (var key in value) {
            if (has(value, key)) {
                target[key] = value[key];
            }
        }
        return target;
    };

    function shallowCopy(value) {
        if (Array.isArray(value)) return value.slice();
        var target = value.__proto__ === undefined ? Object.create(null) : {};
        return assign$1(target, value);
    }

    function each(value, cb) {
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                cb(i, value[i]);
            }
        } else {
            for (var key in value) {
                cb(key, value[key]);
            }
        }
    }

    function has(thing, prop) {
        return Object.prototype.hasOwnProperty.call(thing, prop);
    }

    // given a base object, returns it if unmodified, or return the changed cloned if modified
    function finalize(base, path, patches, inversePatches) {
        if (isProxy(base)) {
            var state = base[PROXY_STATE];
            if (state.modified === true) {
                if (state.finalized === true) return state.copy;
                state.finalized = true;
                var result = finalizeObject(useProxies ? state.copy : state.copy = shallowCopy(base), state, path, patches, inversePatches);
                generatePatches(state, path, patches, inversePatches, state.base, result);
                return result;
            } else {
                return state.base;
            }
        }
        finalizeNonProxiedObject(base);
        return base;
    }

    function finalizeObject(copy, state, path, patches, inversePatches) {
        var base = state.base;
        each(copy, function (prop, value) {
            if (value !== base[prop]) {
                // if there was an assignment on this property, we don't need to generate
                // patches for the subtree
                var _generatePatches = patches && !has(state.assigned, prop);
                copy[prop] = finalize(value, _generatePatches && path.concat(prop), _generatePatches && patches, inversePatches);
            }
        });
        return freeze(copy);
    }

    function finalizeNonProxiedObject(parent) {
        // If finalize is called on an object that was not a proxy, it means that it is an object that was not there in the original
        // tree and it could contain proxies at arbitrarily places. Let's find and finalize them as well
        if (!isProxyable(parent)) return;
        if (Object.isFrozen(parent)) return;
        each(parent, function (i, child) {
            if (isProxy(child)) {
                parent[i] = finalize(child);
            } else finalizeNonProxiedObject(child);
        });
        // always freeze completely new data
        freeze(parent);
    }



    function is$1(x, y) {
        // From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
        if (x === y) {
            return x !== 0 || 1 / x === 1 / y;
        } else {
            return x !== x && y !== y;
        }
    }

    // @ts-check

    var proxies = null;

    var objectTraps = {
        get: get$1,
        has: function has$$1(target, prop) {
            return prop in source(target);
        },
        ownKeys: function ownKeys(target) {
            return Reflect.ownKeys(source(target));
        },

        set: set$1,
        deleteProperty: deleteProperty,
        getOwnPropertyDescriptor: getOwnPropertyDescriptor,
        defineProperty: defineProperty$1$1,
        setPrototypeOf: function setPrototypeOf() {
            throw new Error("Immer does not support `setPrototypeOf()`.");
        }
    };

    var arrayTraps = {};
    each(objectTraps, function (key, fn) {
        arrayTraps[key] = function () {
            arguments[0] = arguments[0][0];
            return fn.apply(this, arguments);
        };
    });
    arrayTraps.deleteProperty = function (state, prop) {
        if (isNaN(parseInt(prop))) throw new Error("Immer does not support deleting properties from arrays: " + prop);
        return objectTraps.deleteProperty.call(this, state[0], prop);
    };
    arrayTraps.set = function (state, prop, value) {
        if (prop !== "length" && isNaN(parseInt(prop))) throw new Error("Immer does not support setting non-numeric properties on arrays: " + prop);
        return objectTraps.set.call(this, state[0], prop, value);
    };

    function createState(parent, base) {
        return {
            modified: false, // this tree is modified (either this object or one of it's children)
            assigned: {}, // true: value was assigned to these props, false: was removed
            finalized: false,
            parent: parent,
            base: base,
            copy: undefined,
            proxies: {}
        };
    }

    function source(state) {
        return state.modified === true ? state.copy : state.base;
    }

    function get$1(state, prop) {
        if (prop === PROXY_STATE) return state;
        if (state.modified) {
            var value = state.copy[prop];
            if (value === state.base[prop] && isProxyable(value))
                // only create proxy if it is not yet a proxy, and not a new object
                // (new objects don't need proxying, they will be processed in finalize anyway)
                return state.copy[prop] = createProxy(state, value);
            return value;
        } else {
            if (has(state.proxies, prop)) return state.proxies[prop];
            var _value = state.base[prop];
            if (!isProxy(_value) && isProxyable(_value)) return state.proxies[prop] = createProxy(state, _value);
            return _value;
        }
    }

    function set$1(state, prop, value) {
        // TODO: optimize
        state.assigned[prop] = true;
        if (!state.modified) {
            if (prop in state.base && is$1(state.base[prop], value) || has(state.proxies, prop) && state.proxies[prop] === value) return true;
            markChanged(state);
        }
        state.copy[prop] = value;
        return true;
    }

    function deleteProperty(state, prop) {
        state.assigned[prop] = false;
        markChanged(state);
        delete state.copy[prop];
        return true;
    }

    function getOwnPropertyDescriptor(state, prop) {
        var owner = state.modified ? state.copy : has(state.proxies, prop) ? state.proxies : state.base;
        var descriptor = Reflect.getOwnPropertyDescriptor(owner, prop);
        if (descriptor && !(Array.isArray(owner) && prop === "length")) descriptor.configurable = true;
        return descriptor;
    }

    function defineProperty$1$1() {
        throw new Error("Immer does not support defining properties on draft objects.");
    }

    function markChanged(state) {
        if (!state.modified) {
            state.modified = true;
            state.copy = shallowCopy(state.base);
            // copy the proxies over the base-copy
            Object.assign(state.copy, state.proxies); // yup that works for arrays as well
            if (state.parent) markChanged(state.parent);
        }
    }

    // creates a proxy for plain objects / arrays
    function createProxy(parentState, base, key) {
        if (isProxy(base)) throw new Error("Immer bug. Plz report.");
        var state = createState(parentState, base, key);
        var proxy = Array.isArray(base) ? Proxy.revocable([state], arrayTraps) : Proxy.revocable(state, objectTraps);
        proxies.push(proxy);
        return proxy.proxy;
    }

    function produceProxy(baseState, producer, patchListener) {
        if (isProxy(baseState)) {
            // See #100, don't nest producers
            var returnValue = producer.call(baseState, baseState);
            return returnValue === undefined ? baseState : returnValue;
        }
        var previousProxies = proxies;
        proxies = [];
        var patches = patchListener && [];
        var inversePatches = patchListener && [];
        try {
            // create proxy for root
            var rootProxy = createProxy(undefined, baseState);
            // execute the thunk
            var _returnValue = producer.call(rootProxy, rootProxy);
            // and finalize the modified proxy
            var result = void 0;
            // check whether the draft was modified and/or a value was returned
            if (_returnValue !== undefined && _returnValue !== rootProxy) {
                // something was returned, and it wasn't the proxy itself
                if (rootProxy[PROXY_STATE].modified) throw new Error(RETURNED_AND_MODIFIED_ERROR);

                // See #117
                // Should we just throw when returning a proxy which is not the root, but a subset of the original state?
                // Looks like a wrongly modeled reducer
                result = finalize(_returnValue);
                if (patches) {
                    patches.push({ op: "replace", path: [], value: result });
                    inversePatches.push({ op: "replace", path: [], value: baseState });
                }
            } else {
                result = finalize(rootProxy, [], patches, inversePatches);
            }
            // revoke all proxies
            each(proxies, function (_, p) {
                return p.revoke();
            });
            patchListener && patchListener(patches, inversePatches);
            return result;
        } finally {
            proxies = previousProxies;
        }
    }

    // @ts-check

    var descriptors = {};
    var states = null;

    function createState$1(parent, proxy, base) {
        return {
            modified: false,
            assigned: {}, // true: value was assigned to these props, false: was removed
            hasCopy: false,
            parent: parent,
            base: base,
            proxy: proxy,
            copy: undefined,
            finished: false,
            finalizing: false,
            finalized: false
        };
    }

    function source$1(state) {
        return state.hasCopy ? state.copy : state.base;
    }

    function _get(state, prop) {
        assertUnfinished(state);
        var value = source$1(state)[prop];
        if (!state.finalizing && value === state.base[prop] && isProxyable(value)) {
            // only create a proxy if the value is proxyable, and the value was in the base state
            // if it wasn't in the base state, the object is already modified and we will process it in finalize
            prepareCopy(state);
            return state.copy[prop] = createProxy$1(state, value);
        }
        return value;
    }

    function _set(state, prop, value) {
        assertUnfinished(state);
        state.assigned[prop] = true; // optimization; skip this if there is no listener
        if (!state.modified) {
            if (is$1(source$1(state)[prop], value)) return;
            markChanged$1(state);
            prepareCopy(state);
        }
        state.copy[prop] = value;
    }

    function markChanged$1(state) {
        if (!state.modified) {
            state.modified = true;
            if (state.parent) markChanged$1(state.parent);
        }
    }

    function prepareCopy(state) {
        if (state.hasCopy) return;
        state.hasCopy = true;
        state.copy = shallowCopy(state.base);
    }

    // creates a proxy for plain objects / arrays
    function createProxy$1(parent, base) {
        var proxy = shallowCopy(base);
        each(base, function (i) {
            Object.defineProperty(proxy, "" + i, createPropertyProxy("" + i));
        });
        var state = createState$1(parent, proxy, base);
        createHiddenProperty(proxy, PROXY_STATE, state);
        states.push(state);
        return proxy;
    }

    function createPropertyProxy(prop) {
        return descriptors[prop] || (descriptors[prop] = {
            configurable: true,
            enumerable: true,
            get: function get$$1() {
                return _get(this[PROXY_STATE], prop);
            },
            set: function set$$1(value) {
                _set(this[PROXY_STATE], prop, value);
            }
        });
    }

    function assertUnfinished(state) {
        if (state.finished === true) throw new Error("Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + JSON.stringify(state.copy || state.base));
    }

    // this sounds very expensive, but actually it is not that expensive in practice
    // as it will only visit proxies, and only do key-based change detection for objects for
    // which it is not already know that they are changed (that is, only object for which no known key was changed)
    function markChangesSweep() {
        // intentionally we process the proxies in reverse order;
        // ideally we start by processing leafs in the tree, because if a child has changed, we don't have to check the parent anymore
        // reverse order of proxy creation approximates this
        for (var i = states.length - 1; i >= 0; i--) {
            var state = states[i];
            if (state.modified === false) {
                if (Array.isArray(state.base)) {
                    if (hasArrayChanges(state)) markChanged$1(state);
                } else if (hasObjectChanges(state)) markChanged$1(state);
            }
        }
    }

    function markChangesRecursively(object) {
        if (!object || (typeof object === "undefined" ? "undefined" : _typeof(object)) !== "object") return;
        var state = object[PROXY_STATE];
        if (!state) return;
        var proxy = state.proxy,
            base = state.base;

        if (Array.isArray(object)) {
            if (hasArrayChanges(state)) {
                markChanged$1(state);
                state.assigned.length = true;
                if (proxy.length < base.length) for (var i = proxy.length; i < base.length; i++) {
                    state.assigned[i] = false;
                } else for (var _i = base.length; _i < proxy.length; _i++) {
                    state.assigned[_i] = true;
                }each(proxy, function (index, child) {
                    if (!state.assigned[index]) markChangesRecursively(child);
                });
            }
        } else {
            var _diffKeys = diffKeys(base, proxy),
                added = _diffKeys.added,
                removed = _diffKeys.removed;

            if (added.length > 0 || removed.length > 0) markChanged$1(state);
            each(added, function (_, key) {
                state.assigned[key] = true;
            });
            each(removed, function (_, key) {
                state.assigned[key] = false;
            });
            each(proxy, function (key, child) {
                if (!state.assigned[key]) markChangesRecursively(child);
            });
        }
    }

    function diffKeys(from, to) {
        // TODO: optimize
        var a = Object.keys(from);
        var b = Object.keys(to);
        return {
            added: b.filter(function (key) {
                return a.indexOf(key) === -1;
            }),
            removed: a.filter(function (key) {
                return b.indexOf(key) === -1;
            })
        };
    }

    function hasObjectChanges(state) {
        var baseKeys = Object.keys(state.base);
        var keys = Object.keys(state.proxy);
        return !shallowEqual$1(baseKeys, keys);
    }

    function hasArrayChanges(state) {
        var proxy = state.proxy;

        if (proxy.length !== state.base.length) return true;
        // See #116
        // If we first shorten the length, our array interceptors will be removed.
        // If after that new items are added, result in the same original length,
        // those last items will have no intercepting property.
        // So if there is no own descriptor on the last position, we know that items were removed and added
        // N.B.: splice, unshift, etc only shift values around, but not prop descriptors, so we only have to check
        // the last one
        var descriptor = Object.getOwnPropertyDescriptor(proxy, proxy.length - 1);
        // descriptor can be null, but only for newly created sparse arrays, eg. new Array(10)
        if (descriptor && !descriptor.get) return true;
        // For all other cases, we don't have to compare, as they would have been picked up by the index setters
        return false;
    }

    function produceEs5(baseState, producer, patchListener) {
        if (isProxy(baseState)) {
            // See #100, don't nest producers
            var returnValue = producer.call(baseState, baseState);
            return returnValue === undefined ? baseState : returnValue;
        }
        var prevStates = states;
        states = [];
        var patches = patchListener && [];
        var inversePatches = patchListener && [];
        try {
            // create proxy for root
            var rootProxy = createProxy$1(undefined, baseState);
            // execute the thunk
            var _returnValue = producer.call(rootProxy, rootProxy);
            // and finalize the modified proxy
            each(states, function (_, state) {
                state.finalizing = true;
            });
            var result = void 0;
            // check whether the draft was modified and/or a value was returned
            if (_returnValue !== undefined && _returnValue !== rootProxy) {
                // something was returned, and it wasn't the proxy itself
                if (rootProxy[PROXY_STATE].modified) throw new Error(RETURNED_AND_MODIFIED_ERROR);
                result = finalize(_returnValue);
                if (patches) {
                    patches.push({ op: "replace", path: [], value: result });
                    inversePatches.push({ op: "replace", path: [], value: baseState });
                }
            } else {
                if (patchListener) markChangesRecursively(rootProxy);
                markChangesSweep(); // this one is more efficient if we don't need to know which attributes have changed
                result = finalize(rootProxy, [], patches, inversePatches);
            }
            // make sure all proxies become unusable
            each(states, function (_, state) {
                state.finished = true;
            });
            patchListener && patchListener(patches, inversePatches);
            return result;
        } finally {
            states = prevStates;
        }
    }

    function shallowEqual$1(objA, objB) {
        //From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
        if (is$1(objA, objB)) return true;
        if ((typeof objA === "undefined" ? "undefined" : _typeof(objA)) !== "object" || objA === null || (typeof objB === "undefined" ? "undefined" : _typeof(objB)) !== "object" || objB === null) {
            return false;
        }
        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);
        if (keysA.length !== keysB.length) return false;
        for (var i = 0; i < keysA.length; i++) {
            if (!hasOwnProperty.call(objB, keysA[i]) || !is$1(objA[keysA[i]], objB[keysA[i]])) {
                return false;
            }
        }
        return true;
    }

    function createHiddenProperty(target, prop, value) {
        Object.defineProperty(target, prop, {
            value: value,
            enumerable: false,
            writable: true
        });
    }

    /**
     * produce takes a state, and runs a function against it.
     * That function can freely mutate the state, as it will create copies-on-write.
     * This means that the original state will stay unchanged, and once the function finishes, the modified state is returned
     *
     * @export
     * @param {any} baseState - the state to start with
     * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
     * @param {Function} patchListener - optional function that will be called with all the patches produced here
     * @returns {any} a new state, or the base state if nothing was modified
     */
    function produce(baseState, producer, patchListener) {
        // prettier-ignore
        if (arguments.length < 1 || arguments.length > 3) throw new Error("produce expects 1 to 3 arguments, got " + arguments.length);

        // curried invocation
        if (typeof baseState === "function") {
            // prettier-ignore
            if (typeof producer === "function") throw new Error("if first argument is a function (curried invocation), the second argument to produce cannot be a function");

            var initialState = producer;
            var recipe = baseState;

            return function () {
                var args = arguments;

                var currentState = args[0] === undefined && initialState !== undefined ? initialState : args[0];

                return produce(currentState, function (draft) {
                    args[0] = draft; // blegh!
                    return recipe.apply(draft, args);
                });
            };
        }

        // prettier-ignore
        {
            if (typeof producer !== "function") throw new Error("if first argument is not a function, the second argument to produce should be a function");
            if (patchListener !== undefined && typeof patchListener !== "function") throw new Error("the third argument of a producer should not be set or a function");
        }

        // if state is a primitive, don't bother proxying at all
        if ((typeof baseState === "undefined" ? "undefined" : _typeof(baseState)) !== "object" || baseState === null) {
            var returnValue = producer(baseState);
            return returnValue === undefined ? baseState : normalizeResult(returnValue);
        }

        if (!isProxyable(baseState)) throw new Error("the first argument to an immer producer should be a primitive, plain object or array, got " + (typeof baseState === "undefined" ? "undefined" : _typeof(baseState)) + ": \"" + baseState + "\"");
        return normalizeResult(getUseProxies() ? produceProxy(baseState, producer, patchListener) : produceEs5(baseState, producer, patchListener));
    }

    function normalizeResult(result) {
        return result === NOTHING ? undefined : result;
    }

    var applyPatches$1 = produce(applyPatches);

    /**
     * Creates an object with the same keys as `object` and values generated
     * by running each own enumerable string keyed property of `object` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns the new mapped object.
     * @see _.mapKeys
     * @example
     *
     * var users = {
     *   'fred':    { 'user': 'fred',    'age': 40 },
     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
     * };
     *
     * _.mapValues(users, function(o) { return o.age; });
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     *
     * // The `_.property` iteratee shorthand.
     * _.mapValues(users, 'age');
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     */
    function mapValues(object, iteratee) {
      var result = {};
      iteratee = baseIteratee(iteratee, 3);

      baseForOwn(object, function(value, key, object) {
        baseAssignValue(result, key, iteratee(value, key, object));
      });
      return result;
    }

    /**
     * The base implementation of  `_.pickBy` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} paths The property paths to pick.
     * @param {Function} predicate The function invoked per property.
     * @returns {Object} Returns the new object.
     */
    function basePickBy(object, paths, predicate) {
      var index = -1,
          length = paths.length,
          result = {};

      while (++index < length) {
        var path = paths[index],
            value = baseGet(object, path);

        if (predicate(value, path)) {
          baseSet(result, castPath(path, object), value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.pick` without support for individual
     * property identifiers.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} paths The property paths to pick.
     * @returns {Object} Returns the new object.
     */
    function basePick(object, paths) {
      return basePickBy(object, paths, function(value, path) {
        return hasIn(object, path);
      });
    }

    /**
     * Creates an object composed of the picked `object` properties.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {...(string|string[])} [paths] The property paths to pick.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.pick(object, ['a', 'c']);
     * // => { 'a': 1, 'c': 3 }
     */
    var pick = flatRest(function(object, paths) {
      return object == null ? {} : basePick(object, paths);
    });

    /**
     * Gets the timestamp of the number of milliseconds that have elapsed since
     * the Unix epoch (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Date
     * @returns {number} Returns the timestamp.
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => Logs the number of milliseconds it took for the deferred invocation.
     */
    var now = function() {
      return root.Date.now();
    };

    /** Error message constants. */
    var FUNC_ERROR_TEXT$1 = 'Expected a function';

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax$2 = Math.max,
        nativeMin = Math.min;

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed `func` invocations and a `flush` method to immediately invoke them.
     * Provide `options` to indicate whether `func` should be invoked on the
     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
     * with the last arguments provided to the debounced function. Subsequent
     * calls to the debounced function return the result of the last `func`
     * invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the debounced function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=false]
     *  Specify invoking on the leading edge of the timeout.
     * @param {number} [options.maxWait]
     *  The maximum time `func` is allowed to be delayed before it's invoked.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // Avoid costly calculations while the window size is in flux.
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
     * jQuery(element).on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', debounced);
     *
     * // Cancel the trailing debounced invocation.
     * jQuery(window).on('popstate', debounced.cancel);
     */
    function debounce(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT$1);
      }
      wait = toNumber(wait) || 0;
      if (isObject$1(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax$2(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }

      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            timeWaiting = wait - timeSinceLastCall;

        return maxing
          ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
          : timeWaiting;
      }

      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }

      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
      }

      function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }

      function cancel() {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(now());
      }

      function debounced() {
        var time = now(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }

    /** Error message constants. */
    var FUNC_ERROR_TEXT$2 = 'Expected a function';

    /**
     * Creates a throttled function that only invokes `func` at most once per
     * every `wait` milliseconds. The throttled function comes with a `cancel`
     * method to cancel delayed `func` invocations and a `flush` method to
     * immediately invoke them. Provide `options` to indicate whether `func`
     * should be invoked on the leading and/or trailing edge of the `wait`
     * timeout. The `func` is invoked with the last arguments provided to the
     * throttled function. Subsequent calls to the throttled function return the
     * result of the last `func` invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the throttled function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.throttle` and `_.debounce`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to throttle.
     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=true]
     *  Specify invoking on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // Avoid excessively updating the position while scrolling.
     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
     *
     * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
     * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
     * jQuery(element).on('click', throttled);
     *
     * // Cancel the trailing throttled invocation.
     * jQuery(window).on('popstate', throttled.cancel);
     */
    function throttle$1(func, wait, options) {
      var leading = true,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT$2);
      }
      if (isObject$1(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        'leading': leading,
        'maxWait': wait,
        'trailing': trailing
      });
    }

    // TODO: get fetch from core JS....
    var fetch$2 = Builder.isBrowser ? window.fetch : require('node-fetch');
    function decorator(fn) {
        return function argReceiver() {
            var fnArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fnArgs[_i] = arguments[_i];
            }
            // Check if the decorator is being called without arguments (ex `@foo methodName() {}`)
            if (fnArgs.length === 3) {
                var target = fnArgs[0], key = fnArgs[1], descriptor = fnArgs[2];
                if (descriptor && (descriptor.value || descriptor.get)) {
                    fnArgs = [];
                    return descriptorChecker(target, key, descriptor);
                }
            }
            return descriptorChecker;
            // descriptorChecker determines whether a method or getter is being decorated
            // and replaces the appropriate key with the decorated function.
            function descriptorChecker(target, key, descriptor) {
                var _a;
                var descriptorKey = descriptor.value ? 'value' : 'get';
                return __assign$1({}, descriptor, (_a = {}, _a[descriptorKey] = fn.apply(void 0, [descriptor[descriptorKey]].concat(fnArgs)), _a));
            }
        };
    }
    var Throttle = decorator(throttle$1);
    var fetchCache = {};
    var tryEval = function (str, data, errors) {
        if (data === void 0) { data = {}; }
        var value = str;
        if (!(value && value.trim())) {
            return;
        }
        var useReturn = !(value.includes(';') || value.includes(' return '));
        var fn = function () {
            /* Intentionally empty */
        };
        try {
            if (Builder.isBrowser) {
                // tslint:disable-next-line:no-function-constructor-with-string-args
                // TODO: VM in node......
                fn = new Function('state', "with (state) {\n          " + (useReturn ? "return (" + value + ");" : value) + ";\n         }");
            }
        }
        catch (error) {
            console.warn('Could not compile function', error);
        }
        try {
            if (Builder.isBrowser) {
                return fn(data || {});
            }
        }
        catch (error) {
            if (errors) {
                errors.push(error);
            }
            console.warn('Eval error', error);
        }
        return;
    };
    function searchToObject(location) {
        var pairs = (location.search || '').substring(1).split('&');
        var obj = {};
        for (var i in pairs) {
            if (pairs[i] === '')
                continue;
            var pair = pairs[i].split('=');
            obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return obj;
    }
    var BuilderPage = /** @class */ (function (_super) {
        __extends(BuilderPage, _super);
        function BuilderPage(props) {
            var _this = _super.call(this, props) || this;
            _this.subscriptions = new Subscription();
            _this.onStateChange = new BehaviorSubject(null);
            _this.updateState = function (fn) {
                var nextState = produce(_this.state.state, function (draftState) {
                    fn(draftState);
                });
                _this.setState({
                    update: _this.updateState,
                    state: nextState
                });
                if (_this.props.onStateChange) {
                    _this.props.onStateChange(nextState);
                }
                _this.onStateChange.next(nextState);
            };
            _this.onContentLoaded = function (data) {
                // Unsubscribe all?
                if (_this.props.contentLoaded) {
                    _this.props.contentLoaded(data);
                }
                if (data && data.inputs && Array.isArray(data.inputs) && data.inputs.length) {
                    if (!data.state) {
                        data.state = {};
                    }
                    data.inputs.forEach(function (input) {
                        if (input) {
                            if (input.name && input.defaultValue !== undefined) {
                                data.state[input.name] = input.defaultValue;
                            }
                        }
                    });
                }
                if (data && data.state) {
                    var processed = _this.processStateFromApi(data.state);
                    _this.setState(__assign$1({}, _this.state, { state: __assign$1({ location: _this.locationState, deviceSize: _this.deviceSizeState }, processed, _this.props.data) }));
                }
                // TODO: diff it against prior code
                // TODO: throttle execution (or --> don't run in preview <--)
                if (data && data.jsCode && !Builder.isIframe) {
                    // TODO: real editing method
                    try {
                        new Function(data.jsCode)(data);
                    }
                    catch (error) {
                        console.warn('Eval error', error);
                    }
                }
                if (data && (data.httpRequests || data.builderData) && !_this.props.noAsync) {
                    var _loop_1 = function (key) {
                        var url = data.httpRequests[key];
                        if (url && !_this.data[key]) {
                            if (Builder.isBrowser) {
                                var lastUrl_1 = _this.evalExpression(url);
                                _this.throttledHandleRequest(key, lastUrl_1);
                                _this.subscriptions.add(_this.onStateChange.subscribe(function () {
                                    var newUrl = _this.evalExpression(url);
                                    if (newUrl !== lastUrl_1) {
                                        _this.throttledHandleRequest(key, newUrl);
                                        lastUrl_1 = newUrl;
                                    }
                                }));
                            }
                            else {
                                _this.handleRequest(key, _this.evalExpression(url));
                            }
                        }
                    };
                    // TODO: another structure for this
                    for (var key in data.httpRequests) {
                        _loop_1(key);
                    }
                    for (var key in data.builderData) {
                        var url = data.builderData[key];
                        if (url && !_this.data[key]) {
                            _this.handleBuilderRequest(key, _this.evalExpression(url));
                        }
                    }
                }
            };
            _this.state = {
                state: __assign$1({ location: _this.locationState, deviceSize: _this.deviceSizeState }, _this.props.data),
                update: _this.updateState
            };
            return _this;
        }
        Object.defineProperty(BuilderPage.prototype, "locationState", {
            get: function () {
                return __assign$1({}, pick(this.location, 'pathname', 'hostname', 'search', 'host'), { path: this.location.pathname.split('/').slice(1), query: searchToObject(this.location) });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BuilderPage.prototype, "deviceSizeState", {
            // TODO: trigger state change on screen size change
            get: function () {
                // TODO: use context to pass this down on server
                return Builder.isBrowser ? sizes.getSizeForWidth(window.innerWidth) : 'large';
            },
            enumerable: true,
            configurable: true
        });
        // TODO: different options per device size...........................
        BuilderPage.renderInto = function (elementOrSelector, props) {
            if (props === void 0) { props = {}; }
            var element = elementOrSelector instanceof HTMLElement
                ? elementOrSelector
                : document.querySelector(elementOrSelector);
            if (!element) {
                return;
            }
            return reactDom.render(react.createElement(BuilderPage, __assign$1({}, props)), element);
        };
        BuilderPage.prototype.componentWillMount = function () {
            if (this.props.content) {
                // TODO: possibly observe for change or throw error if changes
                this.onContentLoaded(this.props.content.data /*, this.props.content*/);
            }
        };
        BuilderPage.prototype.componentDidMount = function () {
            if (Builder.isIframe) {
                parent.postMessage({ type: 'builder.sdkInjected', data: { modelName: this.props.modelName } }, '*');
            }
        };
        BuilderPage.prototype.processStateFromApi = function (state) {
            var _this = this;
            return mapValues(state, function (value) { return tryEval(value, _this.data, _this._errors); });
        };
        Object.defineProperty(BuilderPage.prototype, "location", {
            get: function () {
                return this.props.location || (Builder.isBrowser ? location : {});
            },
            enumerable: true,
            configurable: true
        });
        BuilderPage.prototype.getCssFromFont = function (font) {
            var family = font.family + (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
            var name = family.split(',')[0];
            var formatString = font.isUserFont ? ' format("woff")' : '';
            var url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
            if (url && family && name) {
                return "\n        @font-face {\n          font-family: " + family + ";\n          src: local(\"" + name + "\"), url('" + url + "');\n          font-display: fallback;\n        }\n        ";
            }
            return '';
        };
        BuilderPage.prototype.componentWillUnmount = function () {
            this.unsubscribe();
        };
        BuilderPage.prototype.getFontCss = function (data) {
            var _this = this;
            // TODO: separate internal data from external
            return (data.customFonts &&
                data.customFonts.length &&
                data.customFonts.map(function (font) { return _this.getCssFromFont(font); }).join(' '));
        };
        BuilderPage.prototype.getCss = function (data) {
            return (data.cssCode || '') + (this.getFontCss(data) || '');
        };
        Object.defineProperty(BuilderPage.prototype, "data", {
            get: function () {
                return __assign$1({}, this.props.data, this.state.state);
            },
            enumerable: true,
            configurable: true
        });
        BuilderPage.prototype.render = function () {
            var _this = this;
            var content = this.props.content;
            return (react.createElement(BuilderAsyncRequestsContext.Consumer, null, function (value) {
                _this._asyncRequests = value && value.requests;
                _this._errors = value && value.errors;
                _this._logs = value && value.logs;
                return (react.createElement(BuilderStoreContext.Provider, { value: __assign$1({}, _this.state, { state: _this.data }) }, content ? (react.createElement(react.Fragment, null,
                    _this.getCss(content.data) && (react.createElement("style", { dangerouslySetInnerHTML: { __html: _this.getCss(content.data) } })),
                    react.createElement(BuilderBlocks, { fieldName: "blocks", blocks: content.data.blocks }))) : (react.createElement(BuilderContent
                // TODO: pass entry in
                , { 
                    // TODO: pass entry in
                    contentLoaded: _this.onContentLoaded, options: _this.props.options, contentError: _this.props.contentError, modelName: _this.props.modelName || 'page' }, function (data, loading, fullData) {
                    // TODO: loading option - maybe that is what the children is or component prop
                    return data ? (react.createElement("div", { "data-builder-component": _this.props.modelName, "data-builder-content-id": fullData.id, "data-builder-variation-id": fullData.variationId },
                        _this.getCss(data) && (react.createElement("style", { dangerouslySetInnerHTML: { __html: _this.getCss(data) } })),
                        react.createElement(BuilderBlocks, { fieldName: "blocks", blocks: data.blocks }))) : loading ? (react.createElement("div", { "data-builder-component": _this.props.modelName, className: "builder-loading" })) : (react.createElement("div", { "data-builder-component": _this.props.modelName, className: "builder-no-content" }));
                }))));
            }));
        };
        BuilderPage.prototype.evalExpression = function (expression) {
            var _this = this;
            var data = this.data;
            return expression.replace(/{{([^}]+)}}/g, function (match, group) { return tryEval(group, data, _this._errors); });
        };
        // TODO: customizable hm
        BuilderPage.prototype.throttledHandleRequest = function (propertyName, url) {
            return this.handleRequest(propertyName, url);
        };
        BuilderPage.prototype.handleRequest = function (propertyName, url) {
            return __awaiter(this, void 0, void 0, function () {
                var request, existing, promise_1, promise;
                var _this = this;
                return __generator(this, function (_a) {
                    // TODO: Builder.isEditing = just checks if iframe and parent page is builder.io or localhost:1234
                    if (Builder.isIframe && fetchCache[url]) {
                        this.updateState(function (ctx) {
                            ctx[propertyName] = fetchCache[url];
                        });
                        return [2 /*return*/, fetchCache[url]];
                    }
                    request = function () { return __awaiter(_this, void 0, void 0, function () {
                        var requestStart, json, result, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    requestStart = Date.now();
                                    if (!Builder.isBrowser) {
                                        console.time('Fetch ' + url);
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, 5, 6]);
                                    return [4 /*yield*/, fetch$2(url)];
                                case 2:
                                    result = _a.sent();
                                    return [4 /*yield*/, result.json()];
                                case 3:
                                    json = _a.sent();
                                    return [3 /*break*/, 6];
                                case 4:
                                    err_1 = _a.sent();
                                    if (this._errors) {
                                        this._errors.push(err_1);
                                    }
                                    if (this._logs) {
                                        this._logs.push("Fetch to " + url + " errored in " + (Date.now() - requestStart) + "ms");
                                    }
                                    return [2 /*return*/];
                                case 5:
                                    if (!Builder.isBrowser) {
                                        console.timeEnd('Fetch ' + url);
                                        if (this._logs) {
                                            this._logs.push("Fetched " + url + " in " + (Date.now() - requestStart) + "ms");
                                        }
                                    }
                                    return [7 /*endfinally*/];
                                case 6:
                                    if (json) {
                                        if (Builder.isIframe) {
                                            fetchCache[url] = json;
                                        }
                                        // TODO: debounce next tick all of these when there are a bunch
                                        this.updateState(function (ctx) {
                                            ctx[propertyName] = json;
                                        });
                                    }
                                    return [2 /*return*/, json];
                            }
                        });
                    }); };
                    existing = this._asyncRequests &&
                        this._asyncRequests.find(function (req) { return isRequestInfo(req) && req.url === url; });
                    if (existing) {
                        promise_1 = existing.promise;
                        promise_1.then(function (json) {
                            if (json) {
                                _this.updateState(function (ctx) {
                                    ctx[propertyName] = json;
                                });
                            }
                        });
                        return [2 /*return*/, promise_1];
                    }
                    promise = request();
                    Builder.nextTick(function () {
                        if (_this._asyncRequests) {
                            _this._asyncRequests.push(promise);
                        }
                    });
                    return [2 /*return*/, promise];
                });
            });
        };
        BuilderPage.prototype.unsubscribe = function () {
            if (this.subscriptions) {
                this.subscriptions.unsubscribe();
                this.subscriptions = new Subscription();
            }
        };
        BuilderPage.prototype.handleBuilderRequest = function (propertyName, optionsString) {
            var _this = this;
            var options = tryEval(optionsString, this.data, this._errors);
            // TODO: this will screw up for multiple bits of data
            if (this.subscriptions) {
                this.unsubscribe();
            }
            // TODO: don't unsubscribe and resubscribe every time data changes, will make a TON of requests if that's the case when editing...
            // I guess will be cached then
            if (options) {
                // TODO: unsubscribe on destroy
                this.subscriptions.add(builder.queueGetContent(options.model, options).subscribe(function (matches) {
                    if (matches) {
                        _this.updateState(function (ctx) {
                            ctx[propertyName] = matches;
                        });
                    }
                }));
            }
        };
        __decorate([
            Throttle(100, { leading: true, trailing: true }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, String]),
            __metadata("design:returntype", void 0)
        ], BuilderPage.prototype, "throttledHandleRequest", null);
        return BuilderPage;
    }(react.Component));

    // TODO: docs
    var BuilderSimpleComponent = /** @class */ (function (_super) {
        __extends(BuilderSimpleComponent, _super);
        function BuilderSimpleComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = {
                data: null,
                classes: []
            };
            _this.ref = null;
            _this.previousName = '';
            _this.subscriptions = [];
            // TODO: do this in core SDK
            _this.trackedClick = false;
            _this.onClick = function (event) {
                if (builder.canTrack) {
                    var data = _this.state.data;
                    if (data) {
                        builder.trackInteraction(data.id, data.testVariationId || data.id, _this.trackedClick, event.nativeEvent);
                        if (!_this.trackedClick) {
                            _this.trackedClick = true;
                        }
                    }
                }
            };
            return _this;
        }
        BuilderSimpleComponent.prototype.addClass = function (className) {
            if (this.state.classes.indexOf(className) === -1) {
                this.setState(__assign$1({}, this.state, { classes: this.state.classes.concat([className]) }));
            }
        };
        BuilderSimpleComponent.prototype.removeClass = function (className) {
            var index = this.state.classes.indexOf(className);
            if (index !== -1) {
                var newClasses = this.state.classes.slice();
                newClasses.splice(index, 1);
                this.setState(__assign$1({}, this.state, { classes: newClasses }));
            }
        };
        BuilderSimpleComponent.prototype.componentWillUnmount = function () {
            this.unsubscribe();
        };
        BuilderSimpleComponent.prototype.componentDidMount = function () {
            this.getContent();
        };
        BuilderSimpleComponent.prototype.disconnectedCallback = function () {
            this.unsubscribe();
        };
        BuilderSimpleComponent.prototype.componentWillUpdate = function (props) {
            if (props.name !== this.props.name || props.entry !== this.props.entry) {
                // TODO: more options too
                this.getContent();
            }
        };
        BuilderSimpleComponent.prototype.loaded = function () {
            this.addClass('builder-loaded');
        };
        BuilderSimpleComponent.prototype.getContent = function () {
            var _this = this;
            var key = this.props.apiKey;
            if (key && key !== builder.apiKey) {
                builder.apiKey = key;
            }
            if (!builder.apiKey) {
                var subscription_1 = builder['apiKey$'].subscribe(function (key) {
                    if (key) {
                        _this.getContent();
                    }
                });
                this.subscriptions.push(function () { return subscription_1.unsubscribe(); });
            }
            if (this.props.html) {
                return;
            }
            var name = this.props.name;
            if (name === this.previousName) {
                return false;
            }
            var entry = this.props.entry;
            this.unsubscribe();
            if (!name) {
                return false;
            }
            this.previousName = name;
            this.addClass('builder-loading');
            // TODO: allow options as property or json
            var subscription = builder
                .get(name, __assign$1({ prerender: true }, (entry
                ? {
                    query: {
                        _id: entry
                    }
                }
                : {})))
                .subscribe(function (data) {
                _this.removeClass('builder-loading');
                _this.loaded();
                _this.addClass('builder-no-content-found');
                if (!data) {
                    if (_this.props.onLoad) {
                        _this.props.onLoad(data);
                    }
                    return;
                }
                if (_this.ref && _this.ref.classList.contains('builder-editor-injected')) {
                    _this.unsubscribe();
                }
                else {
                    _this.setState(__assign$1({}, _this.state, { data: data }));
                    if (builder.canTrack) {
                        // TODO: track unique vs not as well
                        builder.trackImpression(data.id, data.testVariationId || data.id);
                    }
                    if (data.data && data.data.html) {
                        if (_this.props.onLoad) {
                            _this.props.onLoad(data);
                        }
                        if (data.data.animations && data.data.animations.length) {
                            Builder.nextTick(function () {
                                Builder.animator.bindAnimations(data.data.animations);
                            });
                        }
                    }
                }
            }, function (error) {
                _this.addClass('builder-errored');
                _this.addClass('builder-loaded');
                _this.removeClass('builder-loading');
                if (_this.props.onError) {
                    _this.props.onError(error);
                }
            });
            this.subscriptions.push(function () { return subscription.unsubscribe(); });
        };
        BuilderSimpleComponent.prototype.unsubscribe = function () {
            if (this.subscriptions) {
                this.subscriptions.forEach(function (fn) { return fn(); });
                this.subscriptions = [];
            }
        };
        BuilderSimpleComponent.prototype.render = function () {
            var _this = this;
            var html = this.props.html ||
                (this.state && this.state.data && this.state.data.data && this.state.data.data.html);
            return (react.createElement("div", { "builder-model": this.props.name, ref: function (ref) { return (_this.ref = ref); }, className: this.state.classes.join(' '), dangerouslySetInnerHTML: html && { __html: html } }));
        };
        return BuilderSimpleComponent;
    }(react.Component));

    var iconUrl = 'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929';
    var Text = /** @class */ (function (_super) {
        __extends(Text, _super);
        function Text() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Text.prototype.render = function () {
            return (react.createElement(react.Fragment, null,
                react.createElement("style", null, ".builder-text p:first-child, .builder-paragraph:first-child { margin: 0 } .builder-text > p, .builder-paragraph { color: inherit; line-height: inherit; letter-spacing: inherit; font-weight: inherit; font-size: inherit; text-align: inherit; font-family: inherit; }"),
                react.createElement("div", { "builder-text": "true", className: "builder-text", dangerouslySetInnerHTML: { __html: this.props.text || this.props.content || '' } })));
        };
        Text = __decorate([
            BuilderBlock({
                name: 'Text',
                image: iconUrl,
                inputs: [
                    {
                        name: 'text',
                        type: 'html',
                        required: true,
                        defaultValue: 'Enter some text...'
                    }
                ],
                // Maybe optionally a function that takes in some params like block vs absolute, etc
                defaultStyles: {
                    lineHeight: 'normal',
                    height: 'auto',
                    textAlign: 'center'
                }
            })
        ], Text);
        return Text;
    }(react.Component));

    var DEFAULT_ASPECT_RATIO = 0.7004048582995948;
    var defaultBlocks = [
        {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
                large: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    flexShrink: '0',
                    position: 'relative',
                    marginTop: '30px',
                    textAlign: 'center',
                    lineHeight: 'normal',
                    height: 'auto'
                }
            },
            component: {
                name: 'Image',
                options: {
                    image: 'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    aspectRatio: DEFAULT_ASPECT_RATIO
                }
            }
        },
        {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
                large: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    flexShrink: '0',
                    position: 'relative',
                    marginTop: '30px',
                    textAlign: 'center',
                    lineHeight: 'normal',
                    height: 'auto'
                }
            },
            component: {
                name: 'Text',
                options: {
                    text: '<p>Enter some text...</p>'
                }
            }
        }
    ];
    var Columns = /** @class */ (function (_super) {
        __extends(Columns, _super);
        function Columns() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Columns.prototype, "columns", {
            // TODO: Column interface
            get: function () {
                return this.props.columns || [];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Columns.prototype, "gutterSize", {
            get: function () {
                return typeof this.props.space === 'number' ? this.props.space || 0 : 20;
            },
            enumerable: true,
            configurable: true
        });
        Columns.prototype.getWidth = function (index) {
            return (this.columns[index] && this.columns[index].width) || 100 / this.columns.length;
        };
        Columns.prototype.getColumnWidth = function (index) {
            var _a = this, columns = _a.columns, gutterSize = _a.gutterSize;
            var subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
            return "calc(" + this.getWidth(index) + "% - " + subtractWidth + "px)";
        };
        Columns.prototype.render = function () {
            var _this = this;
            var _a = this, columns = _a.columns, gutterSize = _a.gutterSize;
            return (
            // FIXME: make more elegant
            react.createElement(react.Fragment, null,
                react.createElement("style", null, "\n            .builder-columns {\n              display: flex;\n            }\n\n            .builder-column {\n              line-height: normal;\n            }\n\n            .builder-column > .builder-blocks {\n              flex-grow: 1;\n            }\n          "),
                react.createElement("style", null, "\n          @media (max-width: " + (this.props.stackColumnsAt !== 'tablet' ? 639 : 999) + "px) {\n            ." + this.props.builderBlock.id + " > .builder-columns {\n              flex-direction: " + (this.props.reverseColumnsWhenStacked ? 'column-reverse' : 'column') + ";\n              align-items: stretch;\n            }\n\n            ." + this.props.builderBlock.id + " > .builder-columns > .builder-column {\n              width: 100% !important;\n              margin-left: 0 !important;\n            }\n          }\n        "),
                react.createElement("div", { className: "builder-columns", style: { display: 'flex' } }, columns.map(function (col, index) {
                    var TagName = col.link ? 'a' : 'div';
                    return (react.createElement(TagName, __assign$1({ key: index, className: "builder-column" }, (col.link ? { href: col.link } : null), { style: {
                            width: _this.getColumnWidth(index),
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            marginLeft: index === 0 ? 0 : gutterSize
                        } }),
                        react.createElement(BuilderBlocks, { key: index, 
                            // TODO: childOf [parentBlocks]?
                            child: true, parentElementId: _this.props.builderBlock && _this.props.builderBlock.id, blocks: col.blocks, dataPath: "component.options.columns." + index + ".blocks" })));
                }))));
        };
        Columns = __decorate([
            BuilderBlock({
                name: 'Columns',
                inputs: [
                    {
                        name: 'columns',
                        type: 'array',
                        subFields: [
                            {
                                name: 'blocks',
                                type: 'array',
                                hideFromUI: true,
                                defaultValue: defaultBlocks
                            },
                            {
                                name: 'width',
                                type: 'number',
                                hideFromUI: true,
                                helperText: 'Width %, e.g. set to 50 to fill half of the space'
                            },
                            {
                                name: 'link',
                                type: 'string',
                                helperText: 'Optionally set a url that clicking this column will link to'
                            }
                        ],
                        defaultValue: [{ blocks: defaultBlocks }, { blocks: defaultBlocks }],
                        onChange: function (options) {
                            function clearWidths() {
                                columns.forEach(function (col) {
                                    col.delete('width');
                                });
                            }
                            var columns = options.get('columns');
                            if (Array.isArray(columns)) {
                                var containsColumnWithWidth = !!columns.find(function (col) { return col.get('width'); });
                                if (containsColumnWithWidth) {
                                    var containsColumnWithoutWidth = !!columns.find(function (col) { return !col.get('width'); });
                                    if (containsColumnWithoutWidth) {
                                        clearWidths();
                                    }
                                    else {
                                        var sumWidths = columns.reduce(function (memo, col) {
                                            return memo + col.get('width');
                                        }, 0);
                                        var widthsDontAddUp = sumWidths !== 100;
                                        if (widthsDontAddUp) {
                                            clearWidths();
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        name: 'space',
                        type: 'number',
                        defaultValue: 20,
                        helperText: 'Size of gap between columns',
                        advanced: true
                    },
                    {
                        name: 'stackColumnsAt',
                        type: 'string',
                        defaultValue: 'mobile',
                        helperText: 'Convert horizontal columns to vertical at what device size',
                        enum: ['tablet', 'mobile'],
                        advanced: true
                    },
                    {
                        name: 'reverseColumnsWhenStacked',
                        type: 'boolean',
                        defaultValue: false,
                        helperText: 'When stacking columns for mobile devices, reverse the ordering',
                        advanced: true
                    }
                ]
            })
        ], Columns);
        return Columns;
    }(react.Component));

    var Embed = /** @class */ (function (_super) {
        __extends(Embed, _super);
        function Embed() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Embed.prototype.render = function () {
            return (react.createElement("div", { className: "builder-embed", dangerouslySetInnerHTML: { __html: this.props.content } }));
        };
        Embed = __decorate([
            BuilderBlock({
                name: 'Embed',
                inputs: [
                    {
                        name: 'url',
                        type: 'url',
                        required: true,
                        defaultValue: '',
                        helperText: 'e.g. enter a youtube url, google map, etc',
                        onChange: function (options) {
                            var url = options.get('url');
                            if (url) {
                                // TODO: get this out of here!
                                var apiKey = 'ae0e60e78201a3f2b0de4b';
                                return fetch("https://iframe.ly/api/iframely?url=" + url + "&api_key=" + apiKey)
                                    .then(function (res) { return res.json(); })
                                    .then(function (data) {
                                    if (data.html && options.get('url') === url) {
                                        options.set('content', data.html);
                                    }
                                });
                            }
                            else {
                                options.delete('content');
                            }
                        }
                    },
                    {
                        name: 'content',
                        type: 'html',
                        defaultValue: "<div style=\"padding: 20px; text-align: center\">(Choose an embed URL)<div>",
                        hideFromUI: true
                    }
                ]
            })
        ], Embed);
        return Embed;
    }(react.Component));

    var CustomCode = /** @class */ (function (_super) {
        __extends(CustomCode, _super);
        function CustomCode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CustomCode.prototype.render = function () {
            return (react.createElement("div", { className: "builder-custom-code", dangerouslySetInnerHTML: { __html: this.props.code } }));
        };
        CustomCode = __decorate([
            BuilderBlock({
                name: 'Custom Code',
                inputs: [
                    {
                        name: 'code',
                        type: 'longText',
                        required: true,
                        defaultValue: '<p>Hello there, I am custom HTML code!</p>'
                    }
                ]
            })
        ], CustomCode);
        return CustomCode;
    }(react.Component));

    var DEFAULT_ASPECT_RATIO$1 = 0.7041;
    var Image = /** @class */ (function (_super) {
        __extends(Image, _super);
        function Image() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Image.prototype.render = function () {
            var _a = this.props, aspectRatio = _a.aspectRatio, builderBlock = _a.builderBlock;
            // TODO: add height and width params to image
            return (
            // These styles may be bad... may need to remove this wrapper entirely hmm
            // <div style={{ position: 'relative', fontSize: 0 }}>
            react.createElement(react.Fragment, null,
                react.createElement("img", { alt: this.props.altText, height: this.props.height, width: this.props.width, role: !this.props.altText ? 'presentation' : undefined, style: __assign$1({ objectFit: this.props.backgroundSize, 
                        // height: 'auto',
                        // width: 'auto',
                        // maxHeight: '100%',
                        // maxWidth: '100%',
                        height: '100%', width: '100%', objectPosition: this.props.backgroundPosition }, (aspectRatio && {
                        // height: '100%',
                        // width: '100%',
                        position: 'absolute',
                        left: 0,
                        top: 0
                    })), className: "builder-image", src: this.props.image }),
                aspectRatio ? (react.createElement("div", { style: {
                        width: '100%',
                        paddingTop: aspectRatio * 100 + '%',
                        pointerEvents: 'none'
                    } })) : null)
            // <div
            //   style={{
            //     position: 'absolute',
            //     top: 0,
            //     left: 0,
            //     right: 0,
            //     bottom: 0,
            //     backgroundImage: `url("${this.props.image}")`,
            //     backgroundSize: this.props.backgroundSize,
            //     backgroundRepeat: this.props.backgroundRepeat,
            //     backgroundPosition: this.props.backgroundPosition,
            //   }}
            //   className="builder-image"
            // />
            );
        };
        Image = __decorate([
            BuilderBlock({
                name: 'Image',
                image: 'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
                defaultStyles: {
                    minHeight: '20px',
                    minWidth: '20px',
                    overflow: 'hidden'
                },
                inputs: [
                    {
                        name: 'image',
                        type: 'file',
                        // TODO: auto convert png to jpg when there is no transparency
                        allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
                        required: true,
                        // TODO: something better
                        defaultValue: 'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
                        onChange: function (options) {
                            var DEFAULT_ASPECT_RATIO = 0.7041;
                            function loadImage(url, timeout) {
                                if (timeout === void 0) { timeout = 60000; }
                                return new Promise(function (resolve, reject) {
                                    var img = document.createElement('img');
                                    var loaded = false;
                                    img.onload = function () {
                                        loaded = true;
                                        resolve(img);
                                    };
                                    img.addEventListener('error', function (event) {
                                        console.warn('Image load failed', event.error);
                                        reject(event.error);
                                    });
                                    img.src = url;
                                    setTimeout(function () {
                                        if (!loaded) {
                                            reject(new Error('Image load timed out'));
                                        }
                                    }, timeout);
                                });
                            }
                            function round(num) {
                                return Math.round(num * 1000) / 1000;
                            }
                            // // TODO
                            var value = options.get('image');
                            var aspectRatio = options.get('aspectRatio');
                            if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
                                return loadImage(value).then(function (img) {
                                    var possiblyUpdatedAspectRatio = options.get('aspectRatio');
                                    if (options.get('image') === value &&
                                        (!possiblyUpdatedAspectRatio || possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)) {
                                        if (img.width && img.height) {
                                            options.set('aspectRatio', round(img.height / img.width));
                                            options.set('height', img.height);
                                            options.set('width', img.width);
                                        }
                                    }
                                });
                            }
                        }
                    },
                    {
                        name: 'backgroundSize',
                        type: 'text',
                        defaultValue: 'cover',
                        enum: ['contain', 'cover', 'fill', 'auto']
                    },
                    {
                        name: 'backgroundPosition',
                        type: 'text',
                        defaultValue: 'center',
                        enum: [
                            'center',
                            'top',
                            'left',
                            'right',
                            'bottom',
                            'top left',
                            'top right',
                            'bottom left',
                            'bottom right'
                        ]
                    },
                    {
                        name: 'height',
                        type: 'number',
                        hideFromUI: true
                    },
                    {
                        name: 'width',
                        type: 'number',
                        hideFromUI: true
                    },
                    {
                        name: 'aspectRatio',
                        type: 'number',
                        helperText: "This is the ratio of height/width, e.g. set to 1.5 for a 300px wide and 200px tall photo. Set to 0 to not force the image to maintain it's aspect ratio",
                        advanced: true,
                        defaultValue: DEFAULT_ASPECT_RATIO$1
                    },
                    {
                        name: 'altText',
                        type: 'string',
                        hideFromUI: true,
                        advanced: true
                    }
                    // {
                    //   name: 'backgroundRepeat',
                    //   type: 'text',
                    //   defaultValue: 'no-repeat',
                    //   enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
                    // },
                ]
            })
        ], Image);
        return Image;
    }(react.Component));

    var DEFAULT_ASPECT_RATIO$2 = 0.7004048582995948;
    var Video = /** @class */ (function (_super) {
        __extends(Video, _super);
        function Video() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.video = null;
            return _this;
        }
        Video.prototype.updateVideo = function () {
            if (this.video) {
                this.video.setAttribute('muted', String(this.props.muted));
                this.video.setAttribute('playsinline', String(this.props.playsInline));
                this.video.setAttribute('autoplay', String(this.props.autoPlay));
            }
        };
        Video.prototype.componentDidUpdate = function () {
            this.updateVideo();
        };
        Video.prototype.componentDidMount = function () {
            this.updateVideo();
        };
        Video.prototype.render = function () {
            var _this = this;
            var aspectRatio = this.props.aspectRatio;
            return (react.createElement("div", { style: { position: 'relative', fontSize: 0 } },
                react.createElement("video", { poster: this.props.posterImage, height: this.props.height || '100%', width: this.props.width || '100%', ref: function (ref) { return (_this.video = ref); }, autoPlay: this.props.autoPlay, 
                    // src={this.props.video}
                    muted: this.props.muted, controls: this.props.controls, loop: this.props.loop, className: "builder-video", 
                    // type="video/mp4"
                    style: __assign$1({ width: '100%', height: '100%', objectFit: this.props.fit, objectPosition: this.props.position, 
                        // Hack to get object fit to work as expected and not have the video
                        // overflow
                        borderRadius: 1 }, (aspectRatio
                        ? {
                            position: 'absolute'
                        }
                        : null)) },
                    react.createElement("source", { type: "video/mp4", src: this.props.video })),
                aspectRatio ? (react.createElement("div", { style: {
                        width: '100%',
                        paddingTop: aspectRatio * 100 + '%',
                        pointerEvents: 'none'
                    } })) : null));
        };
        Video = __decorate([
            BuilderBlock({
                name: 'Video',
                image: 'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-videocam-24px%20(1).svg?alt=media&token=49a84e4a-b20e-4977-a650-047f986874bb',
                inputs: [
                    {
                        name: 'video',
                        type: 'file',
                        allowedFileTypes: ['mp4'],
                        defaultValue: 'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2F28cb070609f546cdbe5efa20e931aa4b?alt=media&token=912e9551-7a7c-4dfb-86b6-3da1537d1a7f',
                        required: true,
                        onChange: function (options) {
                            var DEFAULT_ASPECT_RATIO = 0.7004048582995948;
                            function loadImage(url, timeout) {
                                if (timeout === void 0) { timeout = 60000; }
                                return new Promise(function (resolve, reject) {
                                    var img = document.createElement('img');
                                    var loaded = false;
                                    img.onload = function () {
                                        loaded = true;
                                        resolve(img);
                                    };
                                    img.addEventListener('error', function (event) {
                                        console.warn('Image load failed', event.error);
                                        reject(event.error);
                                    });
                                    img.src = url;
                                    setTimeout(function () {
                                        if (!loaded) {
                                            reject(new Error('Image load timed out'));
                                        }
                                    }, timeout);
                                });
                            }
                            function round(num) {
                                return Math.round(num * 1000) / 1000;
                            }
                            // // TODO
                            var value = options.get('image');
                            var aspectRatio = options.get('aspectRatio');
                            if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
                                return loadImage(value).then(function (img) {
                                    var possiblyUpdatedAspectRatio = options.get('aspectRatio');
                                    if (options.get('image') === value &&
                                        (!possiblyUpdatedAspectRatio || possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)) {
                                        if (img.width && img.height) {
                                            options.set('aspectRatio', round(img.height / img.width));
                                        }
                                    }
                                });
                            }
                        }
                    },
                    {
                        name: 'posterImage',
                        type: 'file',
                        allowedFileTypes: ['jpeg', 'png'],
                        helperText: 'Image to show before the video plays'
                    },
                    {
                        name: 'autoPlay',
                        type: 'boolean',
                        defaultValue: true
                    },
                    {
                        name: 'controls',
                        type: 'boolean',
                        defaultValue: false
                    },
                    {
                        name: 'muted',
                        type: 'boolean',
                        defaultValue: true
                    },
                    {
                        name: 'loop',
                        type: 'boolean',
                        defaultValue: true
                    },
                    {
                        name: 'playsInline',
                        type: 'boolean',
                        defaultValue: true
                    },
                    {
                        name: 'fit',
                        type: 'text',
                        defaultValue: 'cover',
                        enum: ['contain', 'cover', 'fill', 'auto']
                    },
                    {
                        name: 'position',
                        type: 'text',
                        defaultValue: 'center',
                        enum: [
                            'center',
                            'top',
                            'left',
                            'right',
                            'bottom',
                            'top left',
                            'top right',
                            'bottom left',
                            'bottom right'
                        ]
                    },
                    {
                        name: 'height',
                        type: 'number',
                        hideFromUI: true
                    },
                    {
                        name: 'width',
                        type: 'number',
                        hideFromUI: true
                    },
                    {
                        name: 'aspectRatio',
                        type: 'number',
                        hideFromUI: true,
                        defaultValue: DEFAULT_ASPECT_RATIO$2
                    }
                ]
            })
        ], Video);
        return Video;
    }(react.Component));

    Builder.isReact = true;

    exports.BuilderPage = BuilderPage;
    exports.BuilderComponent = BuilderPage;
    exports.builder = builder;
    exports.Builder = Builder;
    exports.default = builder;
    exports.BuilderBlocks = BuilderBlocks;
    exports.BuilderContent = BuilderContent;
    exports.BuilderSimpleComponent = BuilderSimpleComponent;
    exports.BuilderStoreContext = BuilderStoreContext;
    exports.BuilderAsyncRequestsContext = BuilderAsyncRequestsContext;
    exports.BuilderBlock = BuilderBlock;
    exports.Text = Text;
    exports.Columns = Columns;
    exports.Embed = Embed;
    exports.CustomCode = CustomCode;
    exports.Image = Image;
    exports.Video = Video;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=builder-react.umd.js.map
