function update (hero, objects, modifier) {
  if(window.preferences.gravity > 0) hero._y = hero._y + (window.preferences.gravity * modifier);
}

module.exports = {
  update
}
