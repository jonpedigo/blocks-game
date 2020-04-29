import mockServer from '../../../sockets'

class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(eventName, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    var args = new Array(arguments.length);
    const event = this.events[eventName];
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
  if(role.isArcadeMode) {
    mockServer(null, window.local, window.local, { arcadeMode: true })
  }
}

export default {
  init
}
