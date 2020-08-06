window.defaultPlayerContextMenu = [
  // NATE:: try to make these work. I put them in order of difficulty
  {
    objectType: 'object', // if the object is just a normal object ( see _renderAdminMenus for conditions ) then this will render in that menu
    action: 'drag', // set key={action} and see how keys are used ---- see key === drag in the objectContextMenu. Basically make a universal util function called like 'action library' that just has all the possible keys we can use for actions
    title: 'Move' // The text that you see on the right click menu
  },
  {
    objectType: 'hero',
    action: 'drag',
    title: 'Move'
  },

  /// MAKE PR
  {
    objectType: 'object',
    useExistingMenu: 'Dialogue', // this looks up DialogueMenu.jsx and plugs it in as a subMenu. See how DialogueMenu.jsx is added to objectContextMenu
                                // This doesnt need to be generalized u can just write out a condition for each existing menu no problem
    title: 'Dialogue'
  },
  {
    objectType: 'object',
    subMenu: 'Special Actions', // so this should make a subMenu that ( as of now ) only has one action with title Toggle Invisibility
    action: 'toggle-invisibility',
    title: 'Toggle Invisibility'
  },

  /// MAKE PR
  {
    objectType: 'object',
    actionFx: (objectSelected) => { // this will be a little tricky to hookup. youll need to give this menuItem like ( 'actionFx-'+index ) or ( 'actionFx-'+window.uniqueID() ) and use that info to look up this actionFx function by that id or index
      window.socket.emit('deleteObject', objectSelected)
    },
    title: 'Destroy'
  },
]
