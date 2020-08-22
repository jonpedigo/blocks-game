class NotificationsControl{
  onHeroDeposit(hero, newObject) {
    let message =  'You deposited ' + newObject.subObjectName
    if(newObject.count > 1) {
      message = 'You deposited ' + newObject.count + ' ' + newObject.subObjectName
    }
    window.socket.emit('sendNotification', { heroId: hero.id, toast: true, log: true, text: message})
  }

  onHeroWithdraw(hero, newObject) {
    let message =  'You withdrew ' + newObject.subObjectName
    if(newObject.count > 1) {
      message = 'You withdrew ' + newObject.count + ' ' + newObject.subObjectName
    }
    window.socket.emit('sendNotification', { heroId: hero.id, toast: true, log: true, text: message})
  }

  onHeroWithdrawFail(hero, subObject) {
    window.socket.emit('sendNotification', { heroId: hero.id, toast: true, log: true, text: 'You can\'t withraw. You already have a ' + subObject.subObjectName})
  }

  onHeroDrop(hero, object) {
    let message =  'You dropped ' + object.subObjectName
    if(object.count > 1) {
      message = 'You dropped ' + object.count + ' ' + object.subObjectName
    }
    window.socket.emit('sendNotification', { heroId: hero.id, toast: true, log: true, text: message})
  }
  onHeroPickup(hero, subObject) {
    let message = 'You picked up ' + subObject.subObjectName
    if(subObject.count > 1) {
      message = 'You picked up ' + subObject.count + ' ' + subObject.subObjectName
    }
    window.socket.emit('sendNotification', { heroId: hero.id, toast: true, log: true, text: message})
  }

  onHeroPickupFail(hero, subObject) {
    window.socket.emit('sendNotification', { heroId: hero.id, toast: true, log: true, text: 'You can\'t pick this up. You already have a ' + subObject.subObjectName})
  }

  onEditHero(updatedHero) {
    if(updatedHero.arrowKeysBehavior || updatedHero.spaceBarBehavior || updatedHero.zButtonBehavior || updatedHero.xButtonBehavior || updatedHero.cButtonBehavior) {
      window.socket.emit('sendNotification', { heroId: updatedHero.id, toast: true, text: 'Your controls updated have been updated. Click to see more', viewControlsOnClick: true })
    }
  }
}

window.NOTIFICATIONSCONTROL = new NotificationsControl()
