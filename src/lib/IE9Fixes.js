var IE9Fix = function() {
  // Generated by CoffeeScript 1.6.3 from https://gist.github.com/MrOrz/6405400
  // The above was linked from https://github.com/angular/angular.js/pull/1047
  // Note: only GET and POST requests are supported

  var OriginalXMLHttpRequest, isXDomain, _base,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  if (!(window.XDomainRequest && !(__indexOf.call(window.XMLHttpRequest, "withCredentials") >= 0))) {
    return;
  }


  OriginalXMLHttpRequest = window.XMLHttpRequest;

  if ((_base = window.location).origin == null) {
    _base.origin = window.location.protocol + '//' + window.location.host;
  }

  isXDomain = function(requestUrl) {
    // gjn: replaced the whole function.
    // original is still commented below
    var getHostName = function(url) {
      var l = window.document.createElement('a');
      l.href = url;
      return l.hostname
        .replace('http://', '')
        .replace('https://', '');
    };

    var host = window.location.origin
        .replace('http://', '')
        .replace('https://', '');

    var requestUrlHost = getHostName(requestUrl);

    //if host are identical, then not XDomain
    if (requestUrlHost === host) {
      return false;
    }
    //check for relative url
    if (!/^https?:\/\//.test(requestUrl)) {
      return false;
    }
    return true;
    /*
    if (requestUrl[0] === '/') {
      if (requestUrl.length === 1) {
        return false;
      }
      if (requestUrl[1] === '/') {
        return true;
      } else {
        return false;
      }
    }
    return requestUrl.slice(0, window.location.origin.length) !== window.location.origin;
    */
  };

  window.XMLHttpRequest = (function() {
    function XMLHttpRequest() {}

    XMLHttpRequest.prototype.open = function() {
      var func, method, others, url, _fn, _fn1, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      method = arguments[0], url = arguments[1], others = 3 <= arguments.length ? __slice.call(arguments, 2) : [];

      if (!isXDomain(url)) {
        this.implementation = new OriginalXMLHttpRequest;
        this.implementation.onreadystatechange = function() {
          var prop, _i, _len, _ref;
          if (_this.implementation.readyState === 4) {
            _ref = ['readyState', 'status', 'responseText'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              prop = _ref[_i];
              _this[prop] = _this.implementation[prop];
            }
          }
          if (_this.onreadystatechange) {
            return _this.onreadystatechange();
          }
        };
        _ref = ['abort', 'getAllResponseHeaders', 'getResponseHeader', 'send', 'setRequestHeader'];
        _fn = function(func) {
          return _this[func] = function() {
            var _ref1;
            return (_ref1 = this.implementation)[func].apply(_ref1, arguments);
          };
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          func = _ref[_i];
          _fn(func);
        }
      } else {
        this.implementation = new XDomainRequest;
        this.implementation.onload = function() {
          _this.responseText = _this.implementation.responseText;
          _this.readyState = 4;
          _this.status = 200;
          if (_this.onreadystatechange) {
            return _this.onreadystatechange();
          }
        };
        // gjn fix (needs to be done)
        this.implementation.onprogress = function () {};
        // end of fix 
        this.abort = function() {
          var _ref1;
          return (_ref1 = this.implementation).abort.apply(_ref1, arguments);
        };
        this.send = function() {
          var _ref1;
          return (_ref1 = _this.implementation).send.apply(_ref1, arguments);
        };
        _ref1 = ['getResponseHeader', 'getAllResponseHeaders', 'setRequestHeader', 'onprogress', 'onerror', 'ontimeout'];
        _fn1 = function(func) {
          return _this[func] = function() {};
        };
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          func = _ref1[_j];
          _fn1(func);
        }
      }
      return this.implementation.open(method, url);
    };

    return XMLHttpRequest;

  })();



};

(function() {
  if (!btoa) {
    btoa = function(str) {
      return base64EncArr(strToUTF8Arr(str));
    };
  }

  /*\
  |*|
  |*|  Base64 / binary data / UTF-8 strings utilities
  |*|
  |*|  https://developer.mozilla.org/
  |*|        en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
  |*|
  \*/

  /* Array of bytes to base64 string decoding */

  function b64ToUint6(nChr) {

    return nChr > 64 && nChr < 91 ?
        nChr - 65 :
        nChr > 96 && nChr < 123 ?
        nChr - 71 :
        nChr > 47 && nChr < 58 ?
        nChr + 4 :
        nChr === 43 ?
        62 :
        nChr === 47 ?
        63 :
        0;
  }

  function base64DecToArr(sBase64, nBlocksSize) {

    var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ''),
        nInLen = sB64Enc.length,
        nOutLen = nBlocksSize ?
            Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize :
            nInLen * 3 + 1 >> 2,
        taBytes = new Uint8Array(nOutLen);

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0;
         nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3;
      nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen;
             nMod3++, nOutIdx++) {
          taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
        }
        nUint24 = 0;

      }
    }

    return taBytes;
  }

  /* Base64 string to array encoding */

  function uint6ToB64(nUint6) {

    return nUint6 < 26 ?
        nUint6 + 65 :
        nUint6 < 52 ?
        nUint6 + 71 :
        nUint6 < 62 ?
        nUint6 - 4 :
        nUint6 === 62 ?
        43 :
        nUint6 === 63 ?
        47 :
        65;

  }

  function base64EncArr(aBytes) {

    var nMod3 = 2, sB64Enc = '';

    for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen;
         nIdx++) {
      nMod3 = nIdx % 3;
      if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += '\r\n'; }
      nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
      if (nMod3 === 2 || aBytes.length - nIdx === 1) {
        sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63),
            uint6ToB64(nUint24 >>> 12 & 63),
            uint6ToB64(nUint24 >>> 6 & 63),
            uint6ToB64(nUint24 & 63));
        nUint24 = 0;
      }
    }

    return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) +
        (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');

  }

  /* UTF-8 array to DOMString and vice versa */

  function UTF8ArrToStr(aBytes) {

    var sView = '';

    for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
      nPart = aBytes[nIdx];
      sView += String.fromCharCode(
        nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
          /* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
          (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) +
              (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) +
              (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 :
          nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
              (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) +
              (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) +
              aBytes[++nIdx] - 128 :
          nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
          (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) +
              (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 :
          nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
          (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) +
              aBytes[++nIdx] - 128 :
          nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
          (nPart - 192 << 6) + aBytes[++nIdx] - 128 :
          /* nPart < 127 ? */ /* one byte */
          nPart
      );
    }

    return sView;

  }

  function strToUTF8Arr(sDOMStr) {

    var aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0;

    /* mapping... */

    for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
      nChr = sDOMStr.charCodeAt(nMapIdx);
      nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ?
          3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
    }

    aBytes = new Uint8Array(nArrLen);

    /* transcription... */

    for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
      nChr = sDOMStr.charCodeAt(nChrIdx);
      if (nChr < 128) {
        /* one byte */
        aBytes[nIdx++] = nChr;
      } else if (nChr < 0x800) {
        /* two bytes */
        aBytes[nIdx++] = 192 + (nChr >>> 6);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x10000) {
        /* three bytes */
        aBytes[nIdx++] = 224 + (nChr >>> 12);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x200000) {
        /* four bytes */
        aBytes[nIdx++] = 240 + (nChr >>> 18);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x4000000) {
        /* five bytes */
        aBytes[nIdx++] = 248 + (nChr >>> 24);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else /* if (nChr <= 0x7fffffff) */ {
        /* six bytes */
        /* (nChr >>> 32) is not possible in ECMAScript! So...: */
        aBytes[nIdx++] = 252 + (nChr / 1073741824);
        aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      }
    }

    return aBytes;

  }

}());

