// MAIN CODE THINGS TO UPDATE
// HOST_GAME
// CLIENT_GAME
// revise physics system structure, allow like 'center point' to be changed and have it be used by default.
// ^^ so that rotation isnt a hack
// Rotational velocity also needs to be default.
// re organize parent, relative, owner, etc. What do these really all mean and why??
// .respawn = true instead of respawn array

// event system is NOT named right. onDelete vs delete for example. I think that ones good, but like... 'startQuest'
// like whats our patterns. Is it Host Sends event through network -> Host picks up event through network?

// HONESTLY USING BOX 2D PHYSICS WOULD BE INCREDIBLE
//https://zimjs.com/bits/physics.html
//----

/*

COMPENDIUM INTERFACE FOR US
PHYSICS EDITOR
PIXEL EDITOR

DIALOGUE TREE EDITOR
PARTICLE EFFECTS

LEVEL UP SYSTEM

PATHFINDING editor / advancements
WORLD EDITOR
INVENTORY SYSTEM
GRID MANAGEMENT

MORE key actions.
  Arrow keys are ALL rotation, z and x accelerate and decelerate
MORE tags

INPUT SUMMARY/INDEX
——
DESIGN CHECKPOINT SYSTEM
Hero update editor?
— some of these satisfy the need to ‘change the hero in the middle of the game’, what we really want is

*/

// Template sub objects ( from compendium )
// PATHFINDING editor, compendium
// LEVEL UP
// PARTICLE GRAPHICS, BETTER GRAPHICS...
// World templates
// input modifiers....'on ice', 'flat'
// more space bar actions -> 'double jump', 'dash'
// combine ghost with player

// ( Force anticipated add )
//REVERSE EDITOR HIGHLIGHT
//editorZoomMultiplier
// tag idea -> attachAsRelativeOnCollide, attachAsParentOnCollide, (attachAsPermanentParentOnCollide,
// give tag on collide, give tag when attached
// remove tag on collide, remove tag when attached

// call hero updates power ups again


/*
EVENTS AN OBJECT CAN EMIT
ObjectCollide, HeroCollide, OnTimerEnd, OnHeroInteract, OnDestroy, OnHeroDestroy, OnSpawn, OnInteractable

OnQuestStart, OnQuestComplete
OnQuestFail

OnAwake ( levels ), OnStart

OnHeroLanded
OnAwareOfHero
OnAwareOfObject

OnAnyEvent


Trigger
ONEVENT
ONREMOTE EVENT

RESULT ( CAN CHOOSE MORE THAN ONE )
destroy
talk
core behavior
respawn
duplicate
questStart
questComplete
spawnToggle
spawnOne
spawnHold
spawnRelease
movementToggle
movementRelease
movementHold
timerStart
timerHold
timerRelease
timerToggle
disableTrigger
enableTrigger
toggleTrigger
addTag
removeTag

heroUpdate
skipHeroGravity
*/

////////////////////////////////////////////////////

// set game boundaries to delete objects
// TRUE zelda camera work
// death by jump
// Target/Homing awareness area

// CONTEXT MENU TOOLS
//Set Target, Set Pathfinding Target

//Set to game boundary size
//Set all objects to the middle ( FULL MIGRATION )

// hero UPDATE is OK but maybe we can have a TRIGGER function editor. Its a code editor that sends a function to the host that the host saves as that objects effect? have it saved as a string?

// can hero update have a general id? which means effects the hero that collided with it or interacted with it?
// Thats how it exists right now ^^ but can something STORE an id to effect. An object id or hero id. It stores the id so when triggered it find the given object! ohh my...

// implement lodash

// Pathfinding for something larger than one grid node
// Perhaps not PATHFINDING but… targeting.

// satisfying death animations? satisfing death states or idk.. things?

// switch tag fresh to an _fresh ( actually just go through all object state and make sure its consistent, there are others such as !!!target!!!<---( please make _ ) that could be an underscore property )
// lastHeroUpdateId, velocity? , i gridX, width, etc
//--------
// spencer wants the world to slowly build itself infront of them.... interesintg, npt sure how to do
// INVERT GAME, for example, when you get pacman powers
// planet gravity! Would be cool to have..
// Send player to... x, y ( have them like start to move really fast and possibly pathfind)
// stop player (velocity)
// controlling X or Y scroll. For example. allow X croll, but not Y scroll
// lazy scroll that is not not immediate! Smoother...
// leveling up
// optimize shadow feature, not all vertices!
// Instead of creating one big block, create a bunch of small blocks, OPTION. NO DDO NOT DDO THIS. MAybe make it a design...
// Maybe make a diagonal wall..
// path goals AKA patrol
// path 1, path 2, path 3 with conditions
// 'with patience' tag AKA pathfind less often
// 'dont backtrack' tag where they remember where they went

// (Snap to grid Toggle)
// — bring velocity to zero for hero
// — speed up hero
// — slow down hero
// — increase speed parameter
// — decrease speed parameter
// add grid to world editor
//
// editor preferences - zoom, editing object, editing hero, current menu, etc..
// I already have world MODIFIERS, those are the worlds I have just created. Make them world modifiers instead of loaded world?
// Switch tools based on actions!
// Make default clicking actions on the canvas universal regardless of tool.
// set editor to recently added object
// only if user has clicked a special action on the right tool bar will the map clicking behavior change

// confirmation on leaving back without saving or copying. HAve copy option

// have the zoom of the editor get set to the gameBoundaries
// a button for 'zoom to where most objects are' THING WOULD BE GREAT
// CENTER ALL OBJECTS ON GRID ( calculate first and last object ( x and y ) and therefore how much room you can spare
// a try catch that if theres an error, the editor asks for a version of the game from like 1 minute ago

// JUICE IDEAS
/*Trails,
	long trail
	leaving trail ( drops )

  // striped object!

have layered border, just draw another version at +2 and +4 and +6, -2 etc..

Shakes
	Object Shakes
	Camera Shakes

FLASHES

Glow

NEON vibe?

Dust particles

Particles being sucked into the player ( POWER!!! )

Splatter

Engine trail on a car u know what I mean?
*/
/*
——
!!!!!!!!!!!!!!
REGARDING PHYSICS, SOMETHING EARLIER ON THE i LIST ( objects ) loose the battle for corrections. They correct for everything else first
just make sure to set something to stationary if its not supposed to be move, or else it will be subject to spawn ( i ) order
*/

// https://opengameart.org/content/colored-16x16-fantasy-tileset
// http://timefantasy.net/
// https://www.oryxdesignlab.com/sprites
// https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-and-animations-with-pixijs5

// use d3 for a series of incredible satisfying game data charts at the end of the game for everyone to process it all

// turn all copy to clipboard functions into DOWNLOAD JSON 

import './js/utils/utils.js'
import './js/page/index.js'
import './js/game/index.js'
import './js/arcade/index.js'
import './js/playeditor/playeditor.js'
import './js/constructEditor/index.js'
import './js/scenarioeditor/index.js'
import './js/map/index.js'
import './js/physics/index.js'
import './js/mapeditor/index.js'
import './js/playerUI/index.js'
import './styles/index.scss'
import './styles/jsoneditor.css'

PAGE.load()
