window.local.on('onPlayerIdentified', () => {
  window.heroLibrary = {
    admin: {
      flags: {
        isAdmin: true,
      },
      tags: {
        hidden: true,
      }
    }
  }
})
