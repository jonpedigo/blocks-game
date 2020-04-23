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

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.getParameterByName = getParameterByName

window.copyToClipBoard = function(copyText) {
  console.log('trying to copy', copyText)
  navigator.permissions.query({name: "clipboard-write"}).then(result => {
    if (result.state == "granted" || result.state == "prompt") {
      /* write to the clipboard now */
      navigator.clipboard.writeText(copyText).then(function() {
        console.log('copied', window.game.id, 'to clipboard')
      }, function() {
        console.log('copy failed')
        /* clipboard write failed */
      });
    }
  });
}

window.uniqueID = function uniqueID() {
  return Math.floor(Math.random() * Date.now())
}

window.resetStorage = function() {
  localStorage.removeItem('hero')
  localStorage.removeItem('ghostData')
  window.location.reload()
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
