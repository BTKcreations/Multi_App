/**
 * DOM Module - DOM manipulation helpers
 * Provides utility functions for DOM operations
 */

/**
 * Query selector helper
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null} Found element or null
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query selector all helper
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Array} Array of found elements
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes object
 * @param {string|Element|Array} content - Content (text, element, or array of elements)
 * @returns {Element} Created element
 */
export function createElement(tag, attrs = {}, content = null) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.substring(2).toLowerCase();
      element.addEventListener(event, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Set content
  if (content !== null) {
    if (Array.isArray(content)) {
      content.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    } else if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof Element) {
      element.appendChild(content);
    }
  }
  
  return element;
}

/**
 * Add class(es) to element
 * @param {Element} element - Target element
 * @param {...string} classes - Classes to add
 */
export function addClass(element, ...classes) {
  if (element) {
    element.classList.add(...classes);
  }
}

/**
 * Remove class(es) from element
 * @param {Element} element - Target element
 * @param {...string} classes - Classes to remove
 */
export function removeClass(element, ...classes) {
  if (element) {
    element.classList.remove(...classes);
  }
}

/**
 * Toggle class on element
 * @param {Element} element - Target element
 * @param {string} className - Class to toggle
 * @returns {boolean} True if class is now present
 */
export function toggleClass(element, className) {
  if (element) {
    return element.classList.toggle(className);
  }
  return false;
}

/**
 * Check if element has class
 * @param {Element} element - Target element
 * @param {string} className - Class to check
 * @returns {boolean} True if element has class
 */
export function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}

/**
 * Set element attributes
 * @param {Element} element - Target element
 * @param {Object} attrs - Attributes to set
 */
export function setAttrs(element, attrs) {
  if (element) {
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
}

/**
 * Remove element from DOM
 * @param {Element} element - Element to remove
 */
export function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Empty element (remove all children)
 * @param {Element} element - Element to empty
 */
export function empty(element) {
  if (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}

/**
 * Insert element after another element
 * @param {Element} newElement - Element to insert
 * @param {Element} referenceElement - Reference element
 */
export function insertAfter(newElement, referenceElement) {
  if (referenceElement && referenceElement.parentNode) {
    referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
  }
}

/**
 * Get element's offset position
 * @param {Element} element - Target element
 * @returns {Object} Object with top and left properties
 */
export function getOffset(element) {
  if (!element) return { top: 0, left: 0 };
  
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset
  };
}

/**
 * Add event listener with optional delegation
 * @param {Element} element - Target element
 * @param {string} event - Event name
 * @param {string|Function} selectorOrHandler - Selector for delegation or handler function
 * @param {Function} handler - Handler function (if using delegation)
 */
export function on(element, event, selectorOrHandler, handler) {
  if (typeof selectorOrHandler === 'function') {
    element.addEventListener(event, selectorOrHandler);
  } else {
    element.addEventListener(event, (e) => {
      const target = e.target.closest(selectorOrHandler);
      if (target) {
        handler.call(target, e);
      }
    });
  }
}

/**
 * Wait for DOM content loaded
 * @param {Function} callback - Callback function
 */
export function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}
