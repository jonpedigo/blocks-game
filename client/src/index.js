/*
// THE BEST FEATURES ARE THE ONES THAT THE PLAYER THINKS EXISTS BUT ACTUALLY DOESNT
////////////////////////////////////////////////////
////////////////////////////////////////////////////
// TODO
////////////////////////////////////////////////////
////////////////////////////////////////////////////
///
// Before the compendium, there are basic graphical objects that every game will access
1) Background tiles ( put on grid nodes ?)
XXX2) Stationary Obstacle ( no other functionaliy ) ( via construct editor )
XXX3) Zones ( spawn zone, filters, idk, its just an invisible object )
XXX4) Particle Emitter
XXX5) Moving Object ( starts with dialogue and some path finding?, has an awareness area subobject and a pf object? )
6) special environment -> Lava, water, tree (?), mountain, sand, ice
XXX7) Lights
8) Droppable
9) Sounds
XXX10) game objects ( quest, sequence, timer, trigger, hook )
11) Resource Management ( stores, resource, resource pool )

MENUS
world--
day night editor
camera editor
grid editor

object--
spawn zone editor
path editor
physics editor
inventory editor
light editor

// Chest is more than just object on ground. The point of chests is something else...
// Chest that leads to random item in compendium? or leads to random subObject, what are the conditions of this randomness? ( the time.., etc )
// construct Parts copy when you create new ones

1) < --- LITERALLY OMG? <-- https://github.com/claus/react-dat-gui
https://github.com/dataarts/dat.gui
2) Object Shake/Shatter/Warp
3) Explode ( particles )

// TRIGGER MENU.
   eventName
   mainObjectTag
   mainObjectId
   guestObjectTag
   guestObjectId
   eventThreshold ( event value )
   triggerPool

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// DEFINITIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////
TRIGGER
Event + Effect
Can maybe be Event + Condition + Effect, but that might ruin the simplicity

TAG
Tag is Event + Condition + Effect with ONE CLICK! Easy to add. Common Triggers should become Tags

SEQUENCE
Sequence is ( Condition, Effect, Wait, Choice, UI ) in any order you want

MORPH is permanent and transformative
MUTATE is permanent and transitionary
MOD is temporary

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// BIG FEATURES
////////////////////////////////////////////////////
////////////////////////////////////////////////////
TIMERS

GRID MANAGEMENT <---- !
WORLD EDITOR <---- !
  //zoom to Set to game boundary size
  // zoom to all objects

***TEST GAME LIMITS FOR GRID SIZE / PATHFINDING SIZES

PHYSICS EDITOR <---- !
  // turn into live property editor essentially ( combine with spawn zone and timer editor ? )
SPAWN ZONE EDITOR <---- !

PATHFINDING editor / advancements <---- !
// objects have their own path?
// pathfinding editor should fit inside of the sequence editor
// path goals AKA patrol
// path 1, path 2, path 3 with conditions
// Set Target, Set Pathfinding Target
// Pathfinding for something larger than one grid node
// Perhaps not PATHFINDING but… targeting.

COMPENDIUM <---- !

PUZZLE INTERFACES <---- !
JUICE <---- !

Finish feature list

!!!!!!!! !!!! READY FOR BETA !!!! !!!!!!

FOG OF WAR

CUTSCENE RECORDING BY JUST RECORDING ALL EVENTS ON THE SCREEN AND STUFF HMM?
SOUND FX
HOOKS
  // hook into events and prevent them from happening with conditions
PIXEL EDITOR
PARTICLE EFFECTS EDITOR FOR PIXI
LEVEL UP SYSTEM
INVENTORY SYSTEM
  //Set all objects to the middle ( FULL MIGRATION )
  // CENTER ALL OBJECTS ON GRID ( calculate first and last object ( x and y ) and therefore how much room you can spare

LEVELS ( sub worlds )
PROCEDURAL

COMPOSABLE CONTEXT MENU POWERS
GAME RESULTS PAGE
GAME LOBBY PAGE

////////////////////////////////////////////////////
////////////////////////////////////////////////////
/// SMALL FEATURES
////////////////////////////////////////////////////
////////////////////////////////////////////////////
UI - input index
Object 'swinging' like on a rope. I mean... awesome right?
in-game checkpoints
MORE key actions.
  Arrow keys are ALL rotation, up brings rotation to front, right brings it to 90 degrees, etc, down to 180, etc
  z and x accelerate and decelerate
more space bar actions -> 'double jump', 'dash'
input modifiers....'on ice', 'flat'
combine ghost with player
ADMIN POWER HIGHLIGHT
editorZoomMultiplier
call hero updates MODs
set game boundaries to remove objects
TRUE zelda camera work
death by jump
Target/Homing awareness area
// gun that swaps places with what it hits! so cool..
// 'with patience' tag AKA pathfind less often
// 'dont backtrack' tag where they remember where they went
// planet gravity! Would be cool to have..
// 3d sound effects system from papa bear
// Construct editor in top right ( global construct object that is just a stationary obstacle )
// layered object select when right clicking. ( for invisible areas and parent areas ) ( object selected will be an array and then the menu will choose between those )
// EDITOR UI OPTIONS - admin toggle, global construct, which context menu, creator/player/lobby/waiting, run local simulation, power UI toggle,
// change tag filled -> tag solid color outline
// add sprites to construct editor
// global compendium service that I can add to remove without copying and pasting JSON
// name system -> sub object system

// notation for < or > for conditions and notation for '+' and '-' for edit
////////////////////////////////////////////////////

////////////////////////////////
////////////////////////////////
// INVENTORY NOTES
// max inventory
// destroy last object when full
// prevent add when full
// swap oldest object when full
// swap last object when full

////////////////////////////////
////////////////////////////////
// OTHER INTERFACE NOTES
// can we have a 'Game Editor' in React or a 'Hero Editor'
// One thing that is inside the context menu that maybe shouldnt be is the quests
// Quest editor would show me the default hero's quest list and I could sort through it and edit it very easily
// But why just quests? Why not design all of the heros properties they start with
// OK so.. the other things on the 'GAME' object that ill want to edit is the World, the Grid
// world editor and default hero editor

////////////////////////////////
////////////////////////////////
// PIXI FILTER NOTES

TWIST filter
Glow filter
Outline filter

—

Rain graphic ?

Displacement filter — underwater effect
+ underwater overlay graphic??

Shockwave filter / Bulge pinch?

Reflection filter

Godray filter

Many of these are really good CAMERA effects
Dot filter
Old Film filter
Pixelate filter
Color Matrix filter
Cross Hatch filter
Crt filter
Zoom blur filter — Perhaps when you are like low on health??

////////////////////////////////
////////////////////////////////
////////////////////////////////
// JUICE IDEAS
////////////////////////////////
// INVERT GAME, for example, when you get pacman powers
// spencer wants the world to slowly build itself infront of them.... interesintg, npt sure how to do
// lazy scroll that is not not immediate! Smoother...
// optimize shadow feature, not all vertices!
// satisfying death animations? satisfing death states or idk.. things?
/*Trails,
	long trail
	leaving trail ( drops )
  // grid object so its like outlines over the whole thing
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
////////////////////////////////////////////////////
////////////////////////////////////////////////////
/// INFRASTRUCTURE
////////////////////////////////////////////////////
////////////////////////////////////////////////////
// HOST_GAME
// CLIENT_GAME
// revise physics system structure, allow like 'center point' to be changed and have it be used by default.
// ^^ so that rotation isnt a hack
// Rotational velocity also needs to be default.
// re organize parent, relative, owner, etc. What do these really all mean and why??

// event system is NOT named right. onDelete vs delete for example. I think that ones good, but like... 'startQuest'
// like whats our patterns. Is it Host Sends event through network -> Host picks up event through network?

// implement lodash fully with diffs, etc
// a try catch that if theres an error, the editor asks for a version of the game from like 1 minute ago
// switch tag fresh to an _fresh ( actually just go through all object state and make sure its consistent, there are others such as !!!target!!!<---( please make _ ) that could be an underscore property )
// lastHeroUpdateId, velocity? , i gridX, width, etc
// add grid to world editor

// debug tools such as ( view all possible effects this object can have )
// view current POWERS
// VIEW DIFF from default version of this object
// auto save game state to DB, restore game state

// combine objectsById and objectsByTag with hero versions. Heros ARE objects. We can use .objectList and .heroList to diffentiate

// () => syntax in react PLEASE so no more binding

// gameState => worldState
// convert all 'guestObject', 'mainObject', 'ownerObject' things to just ID stores

// dev dependencies to try to lower build file size

// HONESTLY USING BOX 2D PHYSICS WOULD BE INCREDIBLE
// https://zimjs.com/bits/physics.html
// https://opengameart.org/content/colored-16x16-fantasy-tileset
// http://timefantasy.net/
// https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-and-animations-with-pixijs5
// THINK ABOUT ADDING A BASIC GRAPHICS LIBRARY FOR SQUARES AND ALL THE JUICE REGARDING THE SQUARES
// https://github.com/YarnSpinnerTool/YarnEditor

// MARKETING IDEA
// Make a game for their birthday

import './js/utils/utils.js'
import './js/page/index.js'
import './js/game/index.js'
import './js/arcade/index.js'
import './js/playeditor/playeditor.js'
import './js/constructEditor/index.js'
import './js/sequenceeditor/index.js'
import './js/map/index.js'
import './js/physics/index.js'
import './js/mapeditor/index.js'
import './js/playerUI/index.js'
import './styles/index.scss'
import './styles/jsoneditor.css'

PAGE.load()
