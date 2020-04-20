import pathfinding from './pathfinding'
import gridTool from './grid'
import mockServer from '../../../sockets'

class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(eventName, arg1, arg2, arg3, arg4, arg5) {
    var args = new Array(arguments.length);
    const event = this.events[eventName];
    if( event ) {
      event.forEach(fn => {
         fn.call(null, arg1, arg2, arg3, arg4, arg5);
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
  if(window.arcadeMode) {
    mockServer(null, window.local, window.local, { arcadeMode: true })
  }
}

export default {
  init
}
