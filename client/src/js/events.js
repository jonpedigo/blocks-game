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
  if(window.world.globalTags.noCamping) {
    window.objects.forEach((obj) => {
      if(obj.removed) return

      if(obj.tags.zombie || obj.tags.homing || obj.tags.wander || obj.tags.pacer || obj.tags.lemmings) {
        const { gridX, gridY } = gridTool.convertToGridXY(obj)
        obj.gridX = gridX
        obj.gridY = gridY

        const spawnGridPos = gridTool.convertToGridXY({x: obj.spawnPointX, y: obj.spawnPointY})

        obj.path = pathfinding.findPath({
          x: gridX,
          y: gridY,
        }, {
          x: spawnGridPos.gridX,
          y: spawnGridPos.gridY,
        }, obj.pathfindingLimit)
      }
    })
  }
})
