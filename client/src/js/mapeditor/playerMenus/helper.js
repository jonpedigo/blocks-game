import modals from '../modals.js'

export default handleExtraMenuClicks = ({ key, objectSelected, openColorPicker, selectSubObject, subObjectName }) => {
    const { startResize, startRelativeDrag, onStartDrag, deleteObject, onCopy, removeObject, onStartSetPathfindingLimit, openConstructEditor, networkEditObject } = MAPEDITOR

    if (key === 'select-color') {
        openColorPicker(objectSelected)
    }

    if (key === 'toggle-outline') {
        networkEditObject(objectSelected, { tags: { outline: !objectSelected.tags.outline } })
    }

    if (key === 'toggle-invisible') {
        if (objectSelected.tags.invisible) {
            networkEditObject(objectSelected, { tags: { invisible: false, obstacle: true } })
        } else {
            networkEditObject(objectSelected, { tags: { invisible: true, obstacle: false } })
        }
    }
    if (key === "add-dialogue") {
        if (!objectSelected.heroDialogue) {
            objectSelected.heroDialogue = []
        }
        objectSelected.heroDialogue.push('')
        modals.writeDialogue(objectSelected, objectSelected.heroDialogue.length - 1)
    }

    if (key.indexOf("remove-dialogue") === 0) {
        let dialogueIndex = key[key.length - 1]
        objectSelected.heroDialogue.splice(dialogueIndex, 1)
        networkEditObject(objectSelected, { heroDialogue: objectSelected.heroDialogue })
    }

    if (key.indexOf("edit-dialogue") === 0) {
        let dialogueIndex = key[key.length - 1]
        modals.writeDialogue(objectSelected, dialogueIndex)
    }
    if (key === 'create-game-tag') {
        modals.addGameTag()
        return
    }
    const data = JSON.parse(key)

    if (data.action === 'add') {
        modals.addHook(objectSelected, data.eventName)
    }

    if (data.action === 'edit-conditions') {
        modals.editHookConditions(objectSelected, data.hook)
    }

    if (data.action === 'delete') {
        window.socket.emit('deleteHook', objectSelected.id, data.hook.id)
    }
    if (key === "open-physics-live-menu") {
        LIVEEDITOR.open(objectSelected, 'physics')
    }
    if (key === "open-daynight-live-menu") {
        LIVEEDITOR.open({}, 'daynightcycle')
    }
    if (key === "name-object") {
        modals.nameObject(objectSelected)
    }
    if (key === 'name-position-center') {
        networkEditObject(objectSelected, { namePosition: 'center' })
    }
    if (key === 'name-position-above') {
        networkEditObject(objectSelected, { namePosition: 'above' })
    }
    if (key === 'name-position-none') {
        networkEditObject(objectSelected, { namePosition: null })
    }
    if (key === 'set-pathfinding-limit') {
        onStartSetPathfindingLimit(objectSelected)
    }

    if (key === 'copy-id') {
        PAGE.copyToClipBoard(objectSelected.id)
    }

    if (key === 'edit-properties-json') {
        modals.editObjectCode(objectSelected, 'Editing Object Properties', OBJECTS.getProperties(objectSelected));
    }

    if (key === 'edit-state-json') {
        modals.editObjectCode(objectSelected, 'Editing Object State', OBJECTS.getState(objectSelected));
    }

    if (key === 'edit-all-json') {
        modals.editObjectCode(objectSelected, 'Editing Object', objectSelected);
    }

    if (key === 'add-new-subobject') {
        modals.addNewSubObjectTemplate(objectSelected)
    }

    if (key === 'set-world-respawn-point') {
        window.socket.emit('updateWorld', { worldSpawnPointX: objectSelected.x, worldSpawnPointY: objectSelected.y })
    }

    if (key === 'set-object-respawn-point') {
        networkEditObject(objectSelected, { spawnPointX: objectSelected.x, spawnPointY: objectSelected.y })
    }

    if (key === 'turn-into-spawn-zone') {
        window.socket.emit('addSubObject', objectSelected, { tags: { potential: true } }, 'spawner')
        networkEditObject(objectSelected, { tags: { spawnZone: true }, spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: { 'spawner': { randomWeight: 1, conditionList: null } } })
    }

    if (key === 'turn-into-resource-zone') {
        networkEditObject(objectSelected, { tags: { resourceZone: true }, resourceWithdrawAmount: 1, resourceLimit: -1, resourceTags: ['resource'] })
    }

    if (key === 'open-construct-editor') {
        openConstructEditor(objectSelected)
    }

    if (key === "open-physics-live-editor") {
        LIVEEDITOR.open(objectSelected, 'physics')
    }
    if (key === 'enter-quest-giving-id') {
        modals.editProperty(objectSelected, 'questGivingId', objectSelected.questGivingId || '')
    }

    if (key === 'enter-quest-completer-id') {
        modals.editProperty(objectSelected, 'questCompleterId', objectSelected.questCompleterId || '')
    }

    if (key.indexOf(questGivingIdSelectPrefix) === 0) {
        const questId = key.substr(questGivingIdSelectPrefix.length)
        networkEditObject(objectSelected, { questGivingId: questId })
    }

    if (key.indexOf(questCompleterIdSelectPrefix) === 0) {
        const questId = key.substr(questCompleterIdSelectPrefix.length)
        networkEditObject(objectSelected, { questCompleterId: questId })
    }
    if (key === 'position') {
        startRelativeDrag(objectSelected)
    }
    if (key === 'position-grid') {
        startRelativeDrag(objectSelected, { snapToGrid: true })
    }

    const { resourceLimit, resourceWithdrawAmount } = objectSelected

    if (key === 'edit-withdraw-amount') {
        modals.editPropertyNumber(objectSelected, 'resourceWithdrawAmount', resourceWithdrawAmount)
    }

    if (key === 'edit-resource-limit') {
        modals.editPropertyNumber(objectSelected, 'resourceLimit', resourceLimit)
    }

    if (key === 'add-resource-tag') {
        modals.openSelectTag((result) => {
            if (result && result.value) {
                const resourceTags = objectSelected.resourceTags
                resourceTags.push(Object.keys(window.allTags)[result.value])
                networkEditObject(objectSelected, { resourceTags })
            }
        })
    }

    if (key.indexOf(removeResourceTagPrefix) === 0) {
        let tagToRemove = key.substr(removeResourceTagPrefix.length)

        const resourceTags = objectSelected.resourceTags.filter((tag) => tag !== tagToRemove)
        networkEditObject(objectSelected, { resourceTags })
    }
    if (key === 'add-new-subobject') {
        modals.addNewSubObjectTemplate(objectSelected)
    }

    if (key.indexOf(selectSubObjectPrefix) === 0) {
        const subObjectName = key.substr(selectSubObjectPrefix.length)
        selectSubObject(objectSelected.subObjects[subObjectName], subObjectName)
    }

    if (key.indexOf(deleteSubObjectPrefix) === 0) {
        const subObjectName = key.substr(deleteSubObjectPrefix.length)
        window.socket.emit('deleteSubObject', objectSelected, subObjectName)
    }
    const { spawnLimit, spawnPoolInitial, spawnWaitTimer } = objectSelected

    if (key === 'edit-spawn-limit') {
        modals.editPropertyNumber(objectSelected, 'spawnLimit', spawnLimit)
    }

    if (key === 'edit-spawn-pool-initial') {
        modals.editPropertyNumber(objectSelected, 'spawnPoolInitial', spawnPoolInitial)
    }

    if (key === 'edit-spawn-wait-timer') {
        modals.editPropertyNumber(objectSelected, 'spawnWaitTimer', spawnWaitTimer)
    }

    if (key === 'add-spawn-object') {
        modals.openNameSubObjectModal((result) => {
            if (result && result.value) {
                const subObjectChances = objectSelected.subObjectChances
                window.socket.emit('editObjects', [{ id: objectSelected.id, subObjectChances: { ...subObjectChances, [result.value]: { randomWeight: 1, conditionList: null } } }])
            }
        })
        if (key === 'edit-random-weight') {
            PAGE.typingMode = true
            const subObjectChance = objectSelected.subObjectChances[subObjectName]
            modals.openEditNumberModal('random weight', subObjectChance.randomWeight, {}, (result) => {
                if (result && result.value) {
                    subObjectChance.randomWeight = Number(result.value)
                    window.socket.emit('editObjects', [{ id: objectSelected.id, subObjectChances: objectSelected.subObjectChances }])
                }
                PAGE.typingMode = false
            })
        }
    }

    if (key === 'spawn-all-now') {
        window.socket.emit('spawnAllNow', objectSelected.id)
    }

    if (key === 'destroy-spawned') {
        window.socket.emit('destroySpawnIds', objectSelected.id)
    }
    if (data.action === 'chooseSprite') {
        SpriteChooser.open(objectSelected, data.spriteName)
    }
    if (data.action === 'add') {
        modals.addTrigger(objectSelected, data.eventName)
    }

    if (data.action === 'edit-event') {
        modals.editTriggerEvent(objectSelected, data.trigger)
    }

    if (data.action === 'edit-effect') {
        modals.editTriggerEffect(objectSelected, data.trigger)
    }

    if (data.action === 'delete') {
        window.socket.emit('deleteTrigger', objectSelected.id, data.trigger.id)
    }
}


