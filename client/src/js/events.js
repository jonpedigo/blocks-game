import pathfinding from './pathfinding'
import gridTool from './grid'

class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(eventName, data) {
    const event = this.events[eventName];
    if( event ) {
      event.forEach(fn => {
         fn.call(null, data);
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

window.client = new EventEmitter()


window.client.on('onRespawnHero', () => {
  console.log('event ?')
  if(window.game.globalTags.noCamping) {
    window.objects.forEach((obj) => {
      if(obj.tags.zombie || obj.tags.homing || obj.tags.wander) {
        const { x, y } = gridTool.convertToGridXY(obj)
        obj.gridX = x
        obj.gridY = y

        const spawnGridPos = gridTool.convertToGridXY({x: obj.spawnPointX, y: obj.spawnPointY})

        obj.path = pathfinding.findPath({
          x: x,
          y: y,
        }, {
          x: spawnGridPos.x,
          y: spawnGridPos.y,
        }, obj.pathfindingLimit)
      }
    })
  }
})
