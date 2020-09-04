import modals from '../modals.js'

const selectSubObjectPrefix = 'select-subobject-'
const deleteSubObjectPrefix = 'delete-subobject-'

const questCompleterIdSelectPrefix = 'complete-id-'
const questGivingIdSelectPrefix = 'quest-id-'

const removeResourceTagPrefix = 'remove-resource-tag-'

export function handleExtraMenuClicks({ key, objectSelected, openColorPicker }) {
    const { startResize, startRelativeDrag, onStartDrag, selectSubObject, deleteObject, onCopy, removeObject, onStartSetPathfindingLimit, openConstructEditor, networkEditObject } = MAPEDITOR
    const { resourceLimit, resourceWithdrawAmount } = objectSelected
    const { spawnLimit, spawnPoolInitial, spawnWaitTimer } = objectSelected

    if (key === 'select-color') {
        openColorPicker(objectSelected)
        return
    }

    if (key === 'toggle-outline') {
        networkEditObject(objectSelected, { tags: { outline: !objectSelected.tags.outline } })
        return
    }

    if (key === 'toggle-invisible') {
        if (objectSelected.tags.invisible) {
            networkEditObject(objectSelected, { tags: { invisible: false, obstacle: true } })
        } else {
            networkEditObject(objectSelected, { tags: { invisible: true, obstacle: false } })
        }
        return
    }
    if (key === "add-dialogue") {
        if (!objectSelected.heroDialogue) {
            objectSelected.heroDialogue = []
        }
        objectSelected.heroDialogue.push('')
        modals.writeDialogue(objectSelected, objectSelected.heroDialogue.length - 1)
        return
    }

    if (key.indexOf("remove-dialogue") === 0) {
        let dialogueIndex = key[key.length - 1]
        objectSelected.heroDialogue.splice(dialogueIndex, 1)
        networkEditObject(objectSelected, { heroDialogue: objectSelected.heroDialogue })
    }

    if (key.indexOf("edit-dialogue") === 0) {
        let dialogueIndex = key[key.length - 1]
        modals.writeDialogue(objectSelected, dialogueIndex)
        return
    }
    if (key === 'create-game-tag') {
        modals.addGameTag()
        return
    }

    if (key === "open-physics-live-menu") {
        LIVEEDITOR.open(objectSelected, 'physics')
        return
    }
    if (key === "open-daynight-live-menu") {
        LIVEEDITOR.open({}, 'daynightcycle')
        return
    }
    if (key === "name-object") {
        modals.nameObject(objectSelected)
        return
    }
    if (key === 'name-position-center') {
        networkEditObject(objectSelected, { namePosition: 'center' })
        return
    }
    if (key === 'name-position-above') {
        networkEditObject(objectSelected, { namePosition: 'above' })
        return
    }
    if (key === 'name-position-none') {
        networkEditObject(objectSelected, { namePosition: null })
        return
    }
    if (key === 'set-pathfinding-limit') {
        onStartSetPathfindingLimit(objectSelected)
        return
    }

    if (key === 'copy-id') {
        PAGE.copyToClipBoard(objectSelected.id)
        return
    }

    if (key === 'edit-properties-json') {
        modals.editObjectCode(objectSelected, 'Editing Object Properties', OBJECTS.getProperties(objectSelected));
        return
    }

    if (key === 'edit-state-json') {
        modals.editObjectCode(objectSelected, 'Editing Object State', OBJECTS.getState(objectSelected));
        return
    }

    if (key === 'edit-all-json') {
        modals.editObjectCode(objectSelected, 'Editing Object', objectSelected);
        return
    }

    if (key === 'add-new-subobject') {
        modals.addNewSubObjectTemplate(objectSelected)
        return
    }

    if (key === 'set-world-respawn-point') {
        window.socket.emit('updateWorld', { worldSpawnPointX: objectSelected.x, worldSpawnPointY: objectSelected.y })
        return
    }

    if (key === 'set-object-respawn-point') {
        networkEditObject(objectSelected, { spawnPointX: objectSelected.x, spawnPointY: objectSelected.y })
        return
    }

    if (key === 'turn-into-spawn-zone') {
        window.socket.emit('addSubObject', objectSelected, { tags: { potential: true } }, 'spawner')
        networkEditObject(objectSelected, { tags: { spawnZone: true }, spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: { 'spawner': { randomWeight: 1, conditionList: null } } })
        return
    }

    if (key === 'turn-into-resource-zone') {
        networkEditObject(objectSelected, { tags: { resourceZone: true }, resourceWithdrawAmount: 1, resourceLimit: -1, resourceTags: ['resource'] })
        return
    }

    if (key === 'open-construct-editor') {
        openConstructEditor(objectSelected)
        return
    }

    if (key === "open-physics-live-editor") {
        LIVEEDITOR.open(objectSelected, 'physics')
        return
    }
    if (key === 'enter-quest-giving-id') {
        modals.editProperty(objectSelected, 'questGivingId', objectSelected.questGivingId || '')
        return
    }

    if (key === 'enter-quest-completer-id') {
        modals.editProperty(objectSelected, 'questCompleterId', objectSelected.questCompleterId || '')
        return
    }

    if (key.indexOf(questGivingIdSelectPrefix) === 0) {
        const questId = key.substr(questGivingIdSelectPrefix.length)
        networkEditObject(objectSelected, { questGivingId: questId })
        return
    }

    if (key.indexOf(questCompleterIdSelectPrefix) === 0) {
        const questId = key.substr(questCompleterIdSelectPrefix.length)
        networkEditObject(objectSelected, { questCompleterId: questId })
        return
    }
    if (key === 'position') {
        startRelativeDrag(objectSelected)
        return
    }
    if (key === 'position-grid') {
        startRelativeDrag(objectSelected, { snapToGrid: true })
        return
    }


    if (key === 'edit-withdraw-amount') {
        modals.editPropertyNumber(objectSelected, 'resourceWithdrawAmount', resourceWithdrawAmount)
        return
    }

    if (key === 'edit-resource-limit') {
        modals.editPropertyNumber(objectSelected, 'resourceLimit', resourceLimit)
        return
    }

    if (key === 'add-resource-tag') {
        modals.openSelectTag((result) => {
            if (result && result.value) {
                const resourceTags = objectSelected.resourceTags
                resourceTags.push(Object.keys(window.allTags)[result.value])
                networkEditObject(objectSelected, { resourceTags })
            }
        })
        return
    }

    if (key.indexOf(removeResourceTagPrefix) === 0) {
        let tagToRemove = key.substr(removeResourceTagPrefix.length)

        const resourceTags = objectSelected.resourceTags.filter((tag) => tag !== tagToRemove)
        networkEditObject(objectSelected, { resourceTags })
        return
    }
    if (key === 'add-new-subobject') {
        modals.addNewSubObjectTemplate(objectSelected)
        return
    }

    if (key.indexOf(selectSubObjectPrefix) === 0) {
        const subObjectName = key.substr(selectSubObjectPrefix.length)
        selectSubObject(objectSelected.subObjects[subObjectName], subObjectName)
        return
    }

    if (key.indexOf(deleteSubObjectPrefix) === 0) {
        const subObjectName = key.substr(deleteSubObjectPrefix.length)
        window.socket.emit('deleteSubObject', objectSelected, subObjectName)
        return
    }

    if (key === 'edit-spawn-limit') {
        modals.editPropertyNumber(objectSelected, 'spawnLimit', spawnLimit)
        return
    }

    if (key === 'edit-spawn-pool-initial') {
        modals.editPropertyNumber(objectSelected, 'spawnPoolInitial', spawnPoolInitial)
        return
    }

    if (key === 'edit-spawn-wait-timer') {
        modals.editPropertyNumber(objectSelected, 'spawnWaitTimer', spawnWaitTimer)
        return
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
        return

    }

    if (key === 'spawn-all-now') {
        window.socket.emit('spawnAllNow', objectSelected.id)
        return
    }

    if (key === 'destroy-spawned') {
        window.socket.emit('destroySpawnIds', objectSelected.id)
        return
    }

    const data = JSON.parse(key)
    if (data.action === 'chooseSprite') {
        SpriteChooser.open(objectSelected, data.spriteName)
        return
    }
    if (data.action === 'add-trigger') {
        modals.addTrigger(objectSelected, data.eventName)
        return
    }

    // if (data.action === 'edit-trigger-event') {
    //     modals.editTriggerEvent(objectSelected, data.trigger)
    //     return
    // }

    if (data.action === 'edit-trigger') {
        modals.editTrigger(objectSelected, data.trigger)
        return
    }

    if (data.action === 'delete-trigger') {
        window.socket.emit('deleteTrigger', objectSelected.id, data.trigger.id)
        return
    }

    if (data.action === 'add-hook') {
        modals.addHook(objectSelected, data.eventName)
        return
    }

    if (data.action === 'edit-hook-conditions') {
        modals.editHookConditions(objectSelected, data.hook)
        return
    }

    if (data.action === 'delete-hook') {
        window.socket.emit('deleteHook', objectSelected.id, data.hook.id)
        return
    }
}
