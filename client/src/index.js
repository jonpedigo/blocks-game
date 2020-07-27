/*
// THE BEST FEATURES ARE THE ONES THAT THE PLAYER THINKS EXISTS BUT ACTUALLY DOESNT
// U CAN HAVE COOL GRAPHICS BUT IF THEY DONT MEAN ANYTHING MEANINGFUL TO THE GAMEPLAY IT DOESNT MATTER
////////////////////////////////////////////////////
////////////////////////////////////////////////////

Tooltips

Animations + Live Animation Tester
More Particles + Particle Tester/Uploader

Shadow + camera shake on pacman levels.. iffy iffy iffy

Hero removed -> respawn UI

Scenarios and Stories !! AWESOME

More live player animations!! because these are sick
allow chaining of animations and effects
Save Animations to world ( save animation button )

---
The whole sequence menu format should be made modular. I can use it for default hero editing, story editing, scenario editing, compendium editing? Why not combine with DAT GUI
COMBINED DAT GUI EDITOR WITH REACT EDITOR?
Find a good way to customize DAT GUI position and have more than one DAT GUI up?
( allow them to tweak everything from animations to powerups to the physics to the day /night )

Scenarios/BeginEnd
  TEAMS -> modify RESOURCES WITH STEALING? ADD FRIENDLY FIRE. ADD SCORE TO SCENARIOS FROM TEAMS
  VISIBLE TO
  Fade in/out to game

  BEGIN
  I think what we are going to want is a SERIES OF screens. Lets not allow then to be customizable right now
  Maybe allow a background upload or allow them to draw the start screen
  onGameStart is called after all heros reach the end
  { pressToStartHeader: false, colorBackground: false, centerText: "", bottomText: "" }
  allow playground: true ( this allows them to move around before the game starts )
  controls screen

  LOBBY ( multiplayer game )
  Hero select or hero random
  ( show all NPCS as heros )
  Team Select or team random
  new Heros allowed
  allow Bios

  SCENARIO
  firstHero to score ___
  firstTeam to score ___
  firstResourceTo X
  killCount to X
  firstHero to collide with X
  after timer
  end by admin
  Deathmatch ( heros have lives )
  ( make tags for special scenario resources, winning resource, winning item, winning area, etc )

  SCORE SCREENS
  Teams
  ResourceZones
  Hero
    Kill Counts
    Score
  LOGS ( I MEAN YEAH WE WANT A LOG SYSTEM with TIMESTAMPS )

  EPILOGUE SCENARIO?

--

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// BIG FEATURES
////////////////////////////////////////////////////
////////////////////////////////////////////////////

SUB OBJECT CREATION MENU

(ELEMENTAL SYSTEM) Lava, water, tree (?), fire, mountain, sand, ice, ROCK ( FIRST WEAPONS )-> Trees. ( ROBOT PARTS TOO)

SOUND FX

!!!!!!!! !!!! READY FOR PAPA BEAR BETA !!!! !!!!!!

PATHFINDING UPGRADE

COMPENDIUM <---- !
PUZZLE INTERFACES <---- !
SUBINTERACT MENU ( find all interact triggers involving this object and display all possible )
Finish feature list

FOG OF WAR
CUTSCENE RECORDING BY JUST RECORDING ALL EVENTS ON THE SCREEN AND STUFF HMM?
PIXEL EDITOR
LEVEL UP SYSTEM

LEVELS ( sub worlds )
PROCEDURAL

////////////////////////////////////////////////////
////////////////////////////////////////////////////
/// SMALL FEATURES
////////////////////////////////////////////////////
////////////////////////////////////////////////////
I want actual grid node by grid node movement and grid collision system. I want grid movement for OBJECTS too
HOOK UP RESPAWNS TO A SPAWN ZONE
Game feel improvement in live editor - velocityX decay, jumpVelocity, dashVelocity, ( jumpAcc, dashAcc) accXDecay, accYDecay, bounce
pickupable SUB OBJECT, cuz right now that would break right??
a max stackable???? idk
never close right click menu if shift is pressed
Objects OVER others objects ( for tunnels and stuff ), they become transparent only if you are under them
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
// ALSO ^^ if an object is a certain size allow selection of 'world' menu
// EDITOR UI OPTIONS - admin toggle, global construct, which context menu, creator/player/lobby/waiting, run local simulation, power UI toggle,
// change tag filled -> tag solid color outline
// add sprites to construct editor
// global compendium service that I can add to remove without copying and pasting JSON
// name system -> sub object system
// KING MODE ( where its like you make various yes/no choices and that changes whats happening on the world map )
// INTERACT MENU if theres > 1 type of interaction available
// ELEVATION IS POSSIBLE THROUGH A VISUAL ILLUSION ( see littlewood game )
// animation compendium
// local mods? ( client only mods for specific players/situations )

// notation for < or > for conditions and notation for '+' and '-' for edit
////////////////////////////////////////////////////




NOTES
////////////////////////////////////////////////////
////////////////////////////////////////////////////
/// ALL SORTS OF EDITOR NOTES
/////////////////////////////
BASIC - Structure, Outline, Backdrop
LIGHT - Fire, Light
// tiny light, small light, large light, gigantic light, directional light ( left, up, down, right )
ZONE - Spawn Zone, Resource Zone, Timer
ITEM - Resource, Chest
ACTOR - Standing Actor, Wanderer

ADD SUB OBJECT
Spear
Gun
Inventory Item
Area x 2
Area X 3
Area x 4
Potential Sub Object

EDITORS
world--
day night editor
camera/game editor
grid editor

object--
timer editor
zone editor
spawn zone editor
path editor
physics editor
inventory editor
light editor
chest editor
resource editor ( shop )

// TRIGGER EDITOR
   eventName
   mainObjectTag
   mainObjectId
   guestObjectTag
   guestObjectId
   eventThreshold ( event value )
   triggerPool

WORLD EDITOR
  //zoom to Set to game boundary size
  //zoom to all objects
  //Set all objects to the middle ( FULL MIGRATION )
  // CENTER ALL OBJECTS ON GRID ( calculate first and last object ( x and y ) and therefore how much room you can spare

PATHFINDING editor / advancements <---- !
TURN PATHFINDING AREAS, PATHS, ETC, into their own SPECIAL OBJECTS. Allow objects to hook into them like spawn zones
// objects have their own path?
// pathfinding editor should fit inside of the sequence editor
// path goals AKA patrol
// path 1, path 2, path 3 with conditions
// Set Target, Set Pathfinding Target
// Pathfinding for something larger than one grid node
// Perhaps not PATHFINDING but… targeting.

////////////////////////////////
////////////////////////////////
// INVENTORY NOTES
GAME
// max inventory ( number )
// drop last object when full ( boolean )
// prevent add when full ( boolean )

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
https://www.engadget.com/alt254-zelda-style-indie-game-pixels-174504609.html
https://typeitjs.com/
https://safi.me.uk/typewriterjs/
https://wwayne.github.io/react-tooltip/

RECORDING
https://codepen.io/adkanojia/pen/EZJvJL
https://github.com/spite/ccapture.js/
^this could be huge..
but honeslty I could just do a 'pick objects to be recorded moment' and we keep track of their x, y, dialogue, chat, color, etc

////////////////////////////////
// little glowy things all around ( particle effects, see hyper light drifter )

2) Object Shake/Shatter/Warp
3) Explode ( particles )
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

SHINE effect

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
import './js/editorUI/index.js'
import './js/liveeditor/index.js'
import './styles/index.scss'
import './styles/jsoneditor.css'

PAGE.load()

/*
////////////////////////////////////////////////////
////////////////////////////////////////////////////
// DEFINITIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////
IN ORDER OF COMPLEXITY THE MORE I CAN PUSH TO THE DEFAULT COMPENDIUM AND INTO THE TAGS SYSTEM THE BETTER THIS SOFTWARE IS

DEFAULT COMPENDIUM
Has objects with preset -> triggers, tags, hooks
Has preset sequences
Has preset scenarios
Has preset worlds

TAG
Tag is Event + Effect with ONE CLICK! Easy to add. Common Triggers should become Tags

HOOK
rejects or modifies effects or game functionality via events

--

TRIGGER
Event -> Condition = Effect

SEQUENCE
Sequence is ( Condition, Effect, Wait, Choice, UI ) in any order you want

SCENARIO
Scenario is the setup for the game

--

MORPH is permanent and transformative
MUTATE is permanent and transitionary
MOD is temporary with a condition
*/

// ENGINE -> Events, Conditions, Effects
// UI -> Tags, Triggers, Hooks, Sequences
// GAME DATA -> Objects, Heros, World, Grid
// SCENARIOS..?

// BIG PAPA BEAR INSIGHTS
// COMMON FOLKS, UPPER CLASS, GODS

// THE ART EXPANSION
 // HUMAN ART -> MUSIC, SCULPTURE, PAINTING, CRAFTING, GREAT CITIES, GREAT WONDERS
 // GOD ART -> ALLOW GODS TO CRAFT NATURAL WONDERS -> CANYONS, MOUNTAIN RANGES, SEAS, RIVERS, LAKES, FORESTS, ANIMALS? OTHER LIFE?
 // ( MAPS )
// THE LIFE EXPANSION
  // CHARACTERS HAVE LONG HISTORIES. FAMILY TREES
  // THEY HAVE DESCRIPTIONS

// IT GOES BY AGES
// BY SCENARIOS
// SOME ARE LARGE SCALE AGES PLAYED OUT

// BASICALLY IT GOES LIKE this
/*
they play the first papa bear until someone unlocks papa bear AKA eating the apple
They unleash evil into the world
Much devestation is done, this is the first apacalypse ( there are many )
The story is told. This is like a good first game tutorial pack
We SAVE the world and the ruins and EVERYTHING for the next game
perhaps theres like an 'aging' features that adds vines and stuff and forests grow and stuff

// EPILOGUES happen after the game and the stats. Everyone reflects on what happens and then we let the survivors record this moment into history
// we get a short peacetime where meaning is basically consolidated into history or art. Graves are made perhaps?

// SO i think basically papa bear is always optional to add to the equation but papa bear is always the most powerful narrative device
// other than that there is THE SCENARIO OF THE GAME. Think about various apocalpyse games ( moon coming down, winter coming, meteor coming, zombie army coming, tournament is being held, dragons being revived, new technolog released, etc )
// also maybe think about other premises such as murder mystery, secret hidden item, new king problem
// but destroying papa bear, the ultimate original evil of man is the most epic story. Papa bear is the SAURON, the NARAKU, the VOLDEMORT

// Youll need to have a good gauge as to the narrative power that items in the game have and that papa bear has and that each of these events have
// also theres a question as to if it will be beneficial for me to be there or not? I think to start off im going to have to watch every game and make sure it ends right, but eventually ill learn the systems involved to make it work


// I was thinking and if you want to make this extremely high quality. Youll want to add a dungeon master to each game. This dungeon master also needs to be be able to deal with the software
// What reigns could I REALLY give to the users. Is there a scope that works? I would need to define the world rules completely and the scope of it essentially completely. The scope wouldnt be able to change right?
The queestion is.. can the game be REALLY meaingful if the way the user interacts with it ISNT meaningful
What makes a game item meaningful is its POWER either horizontal or vertical POWER. Most games only deal with vertical power
other way to make an item meaningful is through history and narrative..

IM GOING TO START OFF WITH HAVING A GAME MASTER PRESENT AND THEN EVENTUALLY ILL LEARN WHAT THE PARTS I CAN SACRIFICE ARE
*/
