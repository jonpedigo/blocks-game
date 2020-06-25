/*
////////////////////////////////////////////////////
////////////////////////////////////////////////////
// TODO
////////////////////////////////////////////////////
////////////////////////////////////////////////////

// ADDING A MOD is kind of intense
// 1. apply the mod to the code base ( rendering, physics, event system, condition system, etc )
// 2. test reverting with conditions and events/timers
//
// create compendium with objects, heros, sequences, mods/mutates


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
Sequence is ( Condition, Effect, Choice, UI ) in any order you want

MORPH is permanent and transformative
MUTATE is permanent and transitionary
MOD is temporary

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// BIG FEATURES
////////////////////////////////////////////////////
////////////////////////////////////////////////////
MODS <---- !

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
// pathfinding editor should fit inside of the sequence editor
// path goals AKA patrol
// path 1, path 2, path 3 with conditions
// Set Target, Set Pathfinding Target
// Pathfinding for something larger than one grid node
// Perhaps not PATHFINDING but… targeting.

COMPENDIUM <---- !

PUZZLE INTERFACES <---- !
JUICE ( may require new graphics engine ) <---- !

Finish feature list

!!!!!!!! !!!! READY FOR BETA !!!! !!!!!!

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

// notation for < or > for conditions and notation for '+' and '-' for edit
////////////////////////////////////////////////////

// INVENTORY NOTES
// max inventory
// destroy last object when full
// prevent add when full
// swap oldest object when full
// swap last object when full

// OTHER INTERFACE NOTES
// can we have a 'Game Editor' in React or a 'Hero Editor'
// One thing that is inside the context menu that maybe shouldnt be is the quests
// Quest editor would show me the default hero's quest list and I could sort through it and edit it very easily
// But why just quests? Why not design all of the heros properties they start with
// OK so.. the other things on the 'GAME' object that ill want to edit is the World, the Grid
// world editor and default hero editor

// JUICE IDEAS
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

// () => syntax in react PLEASE so no more binding

// gameState => worldState

// dev dependencies to try to lower packet size

// HONESTLY USING BOX 2D PHYSICS WOULD BE INCREDIBLE
// https://zimjs.com/bits/physics.html
// https://opengameart.org/content/colored-16x16-fantasy-tileset
// http://timefantasy.net/
// https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-and-animations-with-pixijs5
// THINK ABOUT ADDING A BASIC GRAPHICS LIBRARY FOR SQUARES AND ALL THE JUICE REGARDING THE SQUARES

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
