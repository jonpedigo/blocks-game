import mockServer from '../../../../sockets'

class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(eventName, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    if(eventName !== 'onUpdate' && eventName !== 'onRender' && eventName !== 'onUpdateHero' && eventName !== 'onUpdateObject' && eventName !== 'onObjectCollide' && eventName !== 'onHeroCollide') console.log(eventName)

    var args = new Array(arguments.length);

    let event = this.events[eventName];
    if(!event) event = []

    if(PAGE[eventName]) {
      event.push(PAGE[eventName])
    }

    if(GAME[eventName]) {
      event.push(GAME[eventName])
    }
    if(ARCADE.defaultCustomGame && ARCADE.defaultCustomGame[eventName]) {
      event.push(ARCADE.defaultCustomGame[eventName])
    }
    if(ARCADE.customGame && ARCADE.customGame[eventName]) {
      event.push(ARCADE.customGame[eventName])
    }
    if(ARCADE.liveCustomGame && ARCADE.liveCustomGame[eventName]) {
      event.push(ARCADE.liveCustomGame[eventName])
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

    if(PAGE.role.isPlayEditor && PLAYEDITOR[eventName]) {
      event.push(PLAYEDITOR[eventName])
    }

    if(MAPEDITOR[eventName]) {
      event.push(MAPEDITOR[eventName])
    }

    event.push()
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

function init() {
  if(PAGE.role.isArcadeMode) {
    mockServer(null, window.local, window.local, { arcadeMode: true })
  }
}

export default {
  init
}
