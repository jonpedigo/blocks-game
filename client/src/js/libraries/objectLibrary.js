window.local.on('onFirstPageGameLoaded', () => {
  window.objectLibrary = {
    standingNPC: {
      objectType: 'plainObject',
      heroDialogue: [
        "hello!"
      ],
      tags: { obstacle: true, talker: true, talkOnHeroInteract: true },
    },
    wanderingNPC: {
      objectType: 'plainObject',
      heroDialogue: [
        "hello!"
      ],
      tags: { obstacle: true, wander: true, moving: true, talker: true, talkOnHeroInteract: true },
    },
    light: {
      objectType: 'plainObject',
      tags: {
        light: true,
        invisible: true,
      }
    },
    fire: {
      objectType: 'plainObject',
      tags: {
        emitter: true,
        light: true,
      }
    },
    spawnZone: {
      objectType: 'plainObject',
      width: GAME.grid.nodeSize * 2,
      height: GAME.grid.nodeSize * 2,
      tags: {
        spawnZone: true,
        spawnRandomlyWithin: true,
        spawnOnInterval: true,
        invisible: true,
      },
      subObjects: {
        spawner: { tags: { potential: true } }
      },
      spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: {'spawner': {randomWeight: 1, conditionList: null}}
    },
    resourceZone: {
      objectType: 'plainObject',
      width: GAME.grid.nodeSize * 2,
      height: GAME.grid.nodeSize * 2,
      tags: { outline: true, resourceZone: true, resourceDepositOnCollide: true, resourceWithdrawOnInteract: true },
      resourceWithdrawAmount: 1, resourceLimit: -1, resourceTags: ['resource']
    },
    resource: {
      objectType: 'plainObject',
      subObjectName: 'resource',
      tags: { obstacle: true, resource: true, pickupable: true, pickupOnHeroInteract: true },
    },
    chest: {
      objectType: 'plainObject',
      tags: { obstacle: true, spawnZone: true, spawnAllInHeroInventoryOnHeroInteract: true, destroyOnSpawnPoolDepleted: true },
      spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: {'spawner': {randomWeight: 1, conditionList: null}}
    },
    homing: {
      objectType: 'plainObject',
      tags: { obstacle: true, monster: true, moving: true, homing: true, targetHeroOnAware: true },
      subObjects: {
        awarenessTriggerArea: {
          x: 0, y: 0, width: 40, height: 40,
          relativeWidth: GAME.grid.nodeSize * 12,
          relativeHeight: GAME.grid.nodeSize * 16,
          relativeX: 0,
          relativeY: -GAME.grid.nodeSize * 4,
          opacity: 0.2,
          color: 'yellow',
          tags: { obstacle: false, invisible: false, stationary: true, awarenessTriggerArea: true, relativeToDirection: true, },
        }
      }
    },
  }

})
