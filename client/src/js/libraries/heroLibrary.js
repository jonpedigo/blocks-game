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
    },
    homeEditor: {
      useGameDefault: true,
      JSON: {
        flags: {
          homeEditor: true,
          showMapHighlight: true,
          constructEditorColor: true,
          constructEditorSprite: true,
          canStartStopGame: true,
          canTakeMapSnapshots: true,
          hasManagementToolbar: true,
        },
        creator: {
          selectColor: true,
          selectSprite: true,
          drawStructure: true,
          drawBackground: true,
          drawForeground: true,
          standingNPC: true,
          wanderingNPC: true,
          spin: true,
          mario: true,
          zelda: true,
          asteroids: true,
          car: true,
          ufo: true,
          kirby: true,
          snake: true,
        },
        heroMenu: {
          move: true,
          color: true,
          respawn: true,
          properties: true,
          spriteChooser: true,
          physicsLive: true,
        },
        objectMenu: {
          move: true,
          resize: true,
          copy: true,
          color: true,
          name: true,
          dialogue: true,
          group: true,
          properties: true,
          spriteChooser: true,
          physicsLive: true,
          pathEditor: true,
          constructEditor: true,
          delete: true,
        },
        worldMenu: {
          backgroundColor: true,
        },
        spriteSheets: window.spriteSheetIds
      }
    }
  }
})
