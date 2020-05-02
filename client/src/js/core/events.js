import mockServer from '../../../../sockets'

class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(eventName, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    var args = new Array(arguments.length);

    let event = this.events[eventName];
    if(!event) event = []

    if(GAME[eventName]) {
      event.push(GAME[eventName])
    }
    if(GAME.defaultCustomGame && GAME.defaultCustomGame[eventName]) {
      event.push(GAME.defaultCustomGame[eventName])
    }
    if(GAME.customGame && GAME.customGame[eventName]) {
      event.push(GAME.customGame[eventName])
    }
    if(GAME.liveCustomGame && GAME.liveCustomGame[eventName]) {
      event.push(GAME.liveCustomGame[eventName])
    }

    if(ARCADE[eventName]) {
      event.push(ARCADE[eventName])
    }

    if(PAGE.role.isGhost && GHOST[eventName]) {
      event.push(GHOST[eventName])
    }

    if(PAGE[eventName]) {
      event.push(PAGE[eventName])
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

    if(MAPEDITOR[eventName]) {
      event.push(MAPEDITOR[eventName])
    }

    if(PAGE.role.isPlayEditor && PLAYEDITOR[eventName]) {
      event.push(PLAYEDITOR[eventName])
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
