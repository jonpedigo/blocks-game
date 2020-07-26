import lodash from 'lodash'

window._ = lodash

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

window.mergeDeep = mergeDeep

window.uniqueID = function uniqueID() {
  return Math.floor(Math.random() * Date.now())
}

window.measureWrapText = function(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  let maxMetricsWidth = 0
  let lines = 1
  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = ctx.measureText(testLine);
    if(metrics.width > maxMetricsWidth) maxMetricsWidth = metrics.width
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      // ctx.fillText(line, x, y);
      lines++
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  return { height: lineHeight * lines, width: maxMetricsWidth }
}

window.wrapText = function(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = ctx.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

window.removeFalsey = function(object, removeFalse) {
  Object.keys(object).forEach((key) => {
    if((object[key] === false && removeFalse) || object[key] === null || object[key] === undefined) delete object[key]
  })
}

window.removeProps = function(object, options) {
  Object.keys(object).forEach((key) => {
    if((object[key] === false && options.false) || (object[key] === null && options.null) || (object[key] === undefined && options.undefined) || (object[key] === '' && options.empty) || (object[key] === [] && options.empty)) {
      console.log('delete', key)
      delete object[key]
    }
  })
}

window.degreesToRadians = function(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

window.setFontAwesomeCursor = function(unicode, color) {
    var canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 24;
    //document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color || '#000';
    ctx.font = "24px FontAwesome";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(unicode, 12, 12);
    var dataURL = canvas.toDataURL('image/png')
    document.body.style.cursor = 'url('+dataURL+'), auto';
  }

// cool that I pulled this off put please remove someday
Object.defineProperty(Object.prototype, 'mod', { value: function() {
  return GAME.mod(this)
}})

window.isClickingMap = function(className) {
  if(typeof className !== 'string') return false

  if(className == "EditorUI") return true
  else return false

  if(className == 'title' || className == 'label-text') return false

  if(className.indexOf('Creator__category') >= 0 && className.indexOf('Creator__category-container') === -1) return false

  if(className.indexOf('Toolbar') >= 0) return false

  if(className.indexOf('ConstructEditor') >= 0) return false

  return true
}
