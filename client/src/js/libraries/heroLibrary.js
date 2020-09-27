window.local.on('onUserIdentified', () => {
  window.heroLibrary = {
    admin: {
      useGameDefault: false,
      JSON: {
        flags: {
          isAdmin: true,
        },
        tags: {
          hidden: true,
        }
      }
    },
    singlePlayer: {
      useGameDefault: true,
      JSON: {
        tags: {
          saveAsDefaultHero: true,
          centerOfAttention: true,
        }
      }
    }
  }
})
