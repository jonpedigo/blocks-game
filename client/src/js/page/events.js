import mockServer from '../../../../sockets'

class EventEmitter {
  constructor(mock) {
    if(mock) {
      this.mockSocket = true
    }
    this.events = {};
  }

  emit(eventName, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    let event = this.events[eventName];
    if(!event) event = []

    if(!this.mockSocket) {
      if(eventName !== 'onHeroLand' && eventName !== 'onSendHeroInput' && eventName !== 'onObjectInteractable' && eventName !== 'onKeyDown' && eventName !== 'onSendHeroMapEditor' && eventName !== 'onUpdateGameState' && eventName !== 'onNetworkUpdateHero' && eventName !== 'onNetworkUpdateObjects' && eventName !== 'onUpdate' && eventName !== 'onRender' && eventName !== 'onUpdateHero' && eventName !== 'onUpdateObject' && eventName !== 'onObjectCollide' && eventName !== 'onHeroCollide') console.log(eventName)

      if(PAGE[eventName]) {
        event.push(PAGE[eventName])
      }

      if(GAME[eventName]) {
        event.push(GAME[eventName])
      }

      if(PAGE.role.isHost) {
        try {
          if(ARCADE.defaultCustomGame && ARCADE.defaultCustomGame[eventName]) {
            event.push(ARCADE.defaultCustomGame[eventName])
          }

          if(!GAME.world.overrideCustomGameCode) {
            if(ARCADE.customGame && ARCADE.customGame[eventName]) {
              event.push(ARCADE.customGame[eventName])
            }
          }

          if(ARCADE.liveCustomGame && ARCADE.liveCustomGame[eventName]) {
            event.push(ARCADE.liveCustomGame[eventName])
          }
        } catch(e) {
          console.error(e)
        }
      }


      if(ARCADE[eventName]) {
        event.push(ARCADE[eventName])
      }

      if(OBJECTS[eventName]) {
        event.push(OBJECTS[eventName])
      }

      if(HERO[eventName]) {
        event.push(HERO[eventName])
      }

      if(PAGE.role.isGhost && GHOST[eventName]) {
        event.push(GHOST[eventName])
      }

      if(PHYSICS[eventName]) {
        event.push(PHYSICS[eventName])
      }

      if(!PAGE.role.isPlayEditor && MAP[eventName]) {
        event.push(MAP[eventName])
      }

      if(!PAGE.role.isPlayEditor && PLAYERUI[eventName]) {
        event.push(PLAYERUI[eventName])
      }

      if(eventName === 'onRender' && !PAGE.role.isPlayEditor){
        if(ARCADE.defaultCustomGame && ARCADE.defaultCustomGame[eventName]) {
          event.push(ARCADE.defaultCustomGame[eventName])
        }
        if(ARCADE.customGame && ARCADE.customGame[eventName]) {
          event.push(ARCADE.customGame[eventName])
        }
        if(ARCADE.liveCustomGame && ARCADE.liveCustomGame[eventName]) {
          event.push(ARCADE.liveCustomGame[eventName])
        }
      }

      if(PAGE.role.isPlayEditor && PLAYEDITOR[eventName]) {
        event.push(PLAYEDITOR[eventName])
      }

      if(MAPEDITOR[eventName]) {
        event.push(MAPEDITOR[eventName])
      }

      if(CONSTRUCTEDITOR[eventName]) {
        event.push(CONSTRUCTEDITOR[eventName])
      }
    }

    if( event ) {
      event.forEach(fn => {
         fn.call(null, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
       });
     }
  }

  on(eventName, fn) {
    if(!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(fn);

    return () => {
      this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
    }
  }
}

window.local = new EventEmitter()
window.mockSocket = new EventEmitter(true)

function init() {
  if(PAGE.role.isArcadeMode) {
    mockServer(null, window.mockSocket, window.mockSocket, { arcadeMode: true })
  }
}

export default {
  init
}
