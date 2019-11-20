function update (hero, objects, modifier) {
  hero._y = hero._y + (window.preferences.gravity * modifier);
}

module.exports = {
  update
}
