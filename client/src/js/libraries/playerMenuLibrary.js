window.local.on('onFirstPageGameLoaded', () => {
  window.playerMenuLibrary = {
    move: {
      action: 'drag', // set key={action} and see how keys are used ---- see key === drag in the objectContextMenu. Basically _handleMenuClick should have a million little actions you can choose from. It would be good to grab these actions from the various menus already existing
      title: 'Move' // The text that you see on the right click menu
    },
    dialogue: {
      useExistingMenu: 'Dialogue', // this looks up DialogueMenu.jsx and plugs it in as a subMenu. See how DialogueMenu.jsx is added to objectContextMenu
      title: 'Dialogue'
    },
  }

  window.heroMenuLibrary = {
    move: false
  }

  window.objectMenuLibrary = {
    move: false,
    dialogue: false
  }
})
