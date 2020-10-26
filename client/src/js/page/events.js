import mockServer from '../../../../sockets'

class EventEmitter {
  constructor(mock) {
    if(mock) {
      this.mockSocket = true
    }
    this.events = {};
  }

  emit(eventName, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    let event
    if(this.events[eventName]) {
      event = this.events[eventName].slice()
    } else event = []

    if(!this.mockSocket) {
      let debugEvent = (eventName == 'onObjectUnaware' || eventName == 'onObjectAware' || eventName == 'onObjectInteractable' || eventName == 'onObjectEnter' || eventName == 'onObjectLeave' || eventName == 'onHeroEnter' || eventName == 'onHeroLeave' || eventName == 'onHeroAware' || eventName == 'onHeroUnaware')
      // debugEvent = true

      // if(eventName == 'onObjectUnaware' || eventName == 'onObjectAware') console.log(eventName)

      if(!debugEvent && eventName !== 'onNetworkUpdateHerosPos' && eventName !== 'onNetworkUpdateObjectsComplete' && eventName !== 'onHeroLand' && eventName !== 'onSendHeroInput' && eventName !== 'onKeyDown' && eventName !== 'onSendHeroMapEditor' && eventName !== 'onUpdateGameState' && eventName !== 'onNetworkUpdateHero' && eventName !== 'onNetworkUpdateObjects' && eventName !== 'onUpdate' && eventName !== 'onRender' && eventName !== 'onUpdateHero' && eventName !== 'onUpdateObject' && eventName !== 'onObjectTouchStart' && eventName !== 'onObjectTouchEnd' && eventName !== 'onHeroTouchEnd' && eventName !== 'onHeroTouchStart' && eventName !== 'onObjectCollide' && eventName !== 'onHeroCollide' && eventName !== 'onSendHeroKeyUp' && eventName !== 'onKeyUp') console.log(eventName)

      if(PAGE.role.isHost && NOTIFICATIONSCONTROL[eventName]) {
        event.push(NOTIFICATIONSCONTROL[eventName])
      }

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

          if(GAME.world.tags && GAME.world.tags.overrideCustomGameCode) {
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

      if(GHOST[eventName]) {
        event.push(GHOST[eventName])
      }

      if(PHYSICS[eventName]) {
        event.push(PHYSICS[eventName])
      }

      if(!PAGE.role.isPlayEditor && MAP[eventName]) {
        event.push(MAP[eventName])
      }
      if(!PAGE.role.isPlayEditor && PIXIMAP[eventName]) {
        event.push(PIXIMAP[eventName])
      }

      if(!PAGE.role.isPlayEditor && EDITORUI[eventName]) {
        event.push(EDITORUI[eventName])
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

      if(PATHEDITOR[eventName]) {
        event.push(PATHEDITOR[eventName])
      }

      if(BELOWMANAGER[eventName]) {
        event.push(BELOWMANAGER[eventName])
      }

      if(LIVEEDITOR[eventName]) {
        event.push(LIVEEDITOR[eventName])
      }

      if(EDITOR[eventName]) {
        event.push(EDITOR[eventName])
      }

      if(CREATOR[eventName]) {
        event.push(CREATOR[eventName])
      }

      if(TRACKING[eventName]) {
        event.push(TRACKING[eventName])
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
      this.events[eventName] = this.events[eventName].filter(eventFn => {
        return fn !== eventFn
      });
    }
  }
}

window.local = new EventEmitter()
window.mockSocket = new EventEmitter(true)

function establishALocalHost() {
  mockServer(null, window.mockSocket, window.mockSocket, { arcadeMode: true })
}

export default {
  establishALocalHost
}
