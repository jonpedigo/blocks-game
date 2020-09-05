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
    resize: {
      action: 'resize',
      title: 'Resize',
    },
    copy: {
      action: 'copy',
      title: 'Copy',
    },
    delete: {
      action: 'delete',
      title: 'Delete',
    },
    respawn: {
      action: 'respawn',
      title: 'Respawn',
    },
    color: {
      useExistingMenu: 'Color', // this looks up DialogueMenu.jsx and plugs it in as a subMenu. See how DialogueMenu.jsx is added to objectContextMenu
      title: 'Color'
    },
  }

  window.heroFlags = {
    paused: false,
    showScore: false,
    // showDialogue: false,
    showLives: false,
    highlightMap: false,
    showOtherUsersMapHighlight: false,
    constructEditorColor: false,
    constructEditorSprite: false,
  }

  window.heroMenuLibrary = {
    move: false,
    color: false,
    respawn: false,
  }

  window.objectMenuLibrary = {
    move: false,
    dialogue: false,
    color: false,
    resize: false,
    copy: false,
    delete: false,
  }
})
