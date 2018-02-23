module.exports = (function() {
  // Browser environment sniffing
  var inBrowser =
    typeof window !== 'undefined' &&
    Object.prototype.toString.call(window) !== '[object Object]';

  // UA sniffing for working around browser-specific quirks
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;

  /**
   * Check if a node is in the document.
   * Note: document.documentElement.contains should work here
   * but always returns false for comment nodes in phantomjs,
   * making unit tests difficult. This is fixed by doing the
   * contains() check on the node's parentNode instead of
   * the node itself.
   *
   * @param {Node} node
   * @return {Boolean}
   */
  function inDoc(node) {
    if (!node) return false;
    var doc = node.ownerDocument.documentElement;
    var parent = node.parentNode;
    return (
      doc === node ||
      doc === parent ||
      Boolean(parent && parent.nodeType === 1 && doc.contains(parent))
    );
  }

  /**
   * Get and remove an attribute from a node.
   *
   * @param {Node} node
   * @param {String} _attr
   */
  function getAttr(node, _attr) {
    var val = node.getAttribute(_attr);
    if (val !== null) {
      node.removeAttribute(_attr);
    }
    return val;
  }

  /**
   * Insert el before target
   *
   * @param {Element} el
   * @param {Element} target
   */
  function before(el, target) {
    target.parentNode.insertBefore(el, target);
  }

  /**
   * Insert el after target
   *
   * @param {Element} el
   * @param {Element} target
   */
  function after(el, target) {
    if (target.nextSibling) {
      before(el, target.nextSibling);
    } else {
      target.parentNode.appendChild(el);
    }
  }

  /**
   * Remove el from DOM
   *
   * @param {Element} el
   */
  function remove(el) {
    el.parentNode.removeChild(el);
  }

  /**
   * Prepend el to target
   *
   * @param {Element} el
   * @param {Element} target
   */
  function prepend(el, target) {
    if (target.firstChild) {
      before(el, target.firstChild);
    } else {
      target.appendChild(el);
    }
  }

  /**
   * Replace target with el
   *
   * @param {Element} target
   * @param {Element} el
   */
  function replace(target, el) {
    var parent = target.parentNode;
    if (parent) {
      parent.replaceChild(el, target);
    }
  }

  /**
   * Add event listener shorthand.
   *
   * @param {Element} el
   * @param {String} event
   * @param {Function} cb
   * @param {Boolean} [useCapture]
   */
  function on(el, event, cb, useCapture) {
    el.addEventListener(event, cb, useCapture);
  }

  /**
   * Remove event listener shorthand.
   *
   * @param {Element} el
   * @param {String} event
   * @param {Function} cb
   */
  function off(el, event, cb) {
    el.removeEventListener(event, cb);
  }

  /**
   * For IE9 compat: when both class and :class are present
   * getAttribute('class') returns wrong value...
   *
   * @param {Element} el
   * @return {String}
   */
  function getClass(el) {
    var classname = el.className;
    if (typeof classname === 'object') {
      classname = classname.baseVal || '';
    }
    return classname;
  }

  /**
   * In IE9, setAttribute('class') will result in empty class
   * if the element also has the :class attribute; However in
   * PhantomJS, setting `className` does not work on SVG elements...
   * So we have to do a conditional check here.
   *
   * @param {Element} el
   * @param {String} cls
   */
  function setClass(el, cls) {
    /* istanbul ignore if */
    if (isIE9 && !/svg$/.test(el.namespaceURI)) {
      el.className = cls;
    } else {
      el.setAttribute('class', cls);
    }
  }

  /**
   * Add class with compatibility for IE & SVG
   *
   * @param {Element} el
   * @param {String} cls
   */
  function addClass(el, cls) {
    if (el.classList) {
      el.classList.add(cls);
    } else {
      var cur = ' ' + getClass(el) + ' ';
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        setClass(el, (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for IE & SVG
   *
   * @param {Element} el
   * @param {String} cls
   */
  function removeClass(el, cls) {
    if (el.classList) {
      el.classList.remove(cls);
    } else {
      var cur = ' ' + getClass(el) + ' ';
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      setClass(el, cur.trim());
    }
    if (!el.className) {
      el.removeAttribute('class');
    }
  }

  function apply(el, value) {
    el.style.display = value ? '' : 'none';
  }

  /**
   * 查找Dom
   * @param {*} el
   * @param {*} tagNames
   */
  function findDom(el, tagNames) {
    let _el = el;
    if (
      _el.tagName !== 'INPUT' &&
      _el.tagName !== 'SELECT' &&
      _el.tagName !== 'TEXTAREA'
    ) {
      tagNames = Array.isArray(tagNames) ? tagNames : [tagNames];
      for (let i = 0; i < tagNames.length; i++) {
        let item = tagNames[i];
        _el =
          el.querySelector(`${item}[data-primary]`) || el.querySelector(item);
        if (_el) {
          break;
        }
      }
      if (!_el) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('hidefocus', 'true');
        el.setAttribute('style', 'outline-color:white');
      }
    }
    return _el || el;
  }

  return {
    inDoc: inDoc,
    removeClass: removeClass,
    addClass: addClass,
    apply: apply,
    findDom: findDom,
    getAttr: getAttr,
    after: after,
    remove: remove,
    prepend: prepend,
    replace: replace,
    on: on,
    off: off
  };
})();
