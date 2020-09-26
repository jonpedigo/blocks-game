/*
// THE BEST FEATURES ARE THE ONES THAT THE PLAYER THINKS EXISTS BUT ACTUALLY DOESNT
// U CAN HAVE COOL GRAPHICS BUT IF THEY DONT MEAN ANYTHING MEANINGFUL TO THE GAMEPLAY IT DOESNT MATTER
////////////////////////////////////////////////////
////////////////////////////////////////////////////

TODO

Story/cutscenes
  STORY SCREENSHOTS
  in Manager

  Screenshot button

  Name of story
  tabs 1, 2, 3, 4, 5, +
  Screenshot
  Text
  Effect
  Collapsed -> Preview
  DELETE
--

GROUP MUTATION UI
create a diff between two .object arrays. keep the ids and turn this into an array of mutation effects, its perfect!

SCENARIOS

PIXEL EDITOR

SEQUENCE EDITOR
Create
Animate
Editor

-----

AGGREGATION MENU
subinteractmenu ( find all interact triggers involving this object and display all possible )
// view everything this object is involved in
// view all current modifications

RESPAWN UPGRADE
Hero removed -> respawn UI
HOOK UP RESPAWNS TO A SPAWN ZONE
death by jump

EDITOR UPGRADES
Light Editor
never close right click menu if shift is pressed
Improve Add Sub Object

GAME FEEL UPGRADE
more space bar actions -> 'double jump', 'dash'
// all objects fade in, all objects fade in random
Bounce
Implement special extra physics for objects, not just heros

INVENTORY UPGRADE
Inventory Context Menu -> Drop, Equip to Hero, Add to Shortcuts
show inventory in HUD tag, like RTS resources VS team...yeahh
actually build in this whole equipping system
  quick equip menu
// max inventory ( number )
// drop last object when full ( boolean )
// prevent add when full ( boolean )

ANIMATION UPGRADE
// a system that like randomly generates how particles and things interact and we get to test it out and save it! GREAT WAY TO CUSTOMIZE WITHOUT MUCH EFFORT
// Needs to be attached to system ( AKA the combat system )
allow chaining of animations and effects

---
Scenarios/BeginEnd
  TEAMS -> modify RESOURCES WITH STEALING? ADD FRIENDLY FIRE. ADD SCORE TO SCENARIOS FROM TEAMS

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

Random Particle Designer
GENRE libraries ( creator, generatedMenu )
PUZZLE INTERFACES
(ELEMENTAL SYSTEM) Lava, water, tree (?), fire, mountain, sand, ice, ROCK ( FIRST WEAPONS )-> Trees. ( ROBOT PARTS TOO)
( COMBAT SYSTEM ) HP, DEFENSE, ATTACK, ETC, hittable, LIVES, respawn options, VICTIMS, ENEMIES, NEUTRAL, level system, ranged attacks, etc
LEVEL UP SYSTEM

!!!!!!!! !!!! READY FOR HOME MADE ARCADE !!!! !!!!!!

DETAIL VIEW
HERO CHOOSER
LOBBY
TEAMS
SOUND FX
PROCEDURAL LARGE SCALE
FOG OF WAR
LEVELS ( sub worlds )

////////////////////////////////////////////////////
////////////////////////////////////////////////////
/// SMALL FEATURES
////////////////////////////////////////////////////
////////////////////////////////////////////////////

VISIBLE TO
STORY - Fade in/out to game

every one gets their own construct editor drawing things, the problem is then that I have to deal with the layering issue...

Right click ( start game with heros here )

bouncing ball

ADMIN to reselect sprites, remove sprites, combine sprites into animations

special camera relation, 0, .5, 2, 10, etc. might wanna encapsulale the camera changing logic into a function?

add object needs to be its own thing with effect, wait, condition, etc.
Its getting really complicated. For now im going to cheat it. It should have its own service and its own sequence type, feel me?

Combine spawning with anticipatedAdd. create like spawnType variable which defaults to, hatchFromParent

editor checkpoint. Switch edited objects to new checkpoint after change.
You'd get a diff of what we just made vs what we are comparing it to. I can create an effect that switches to that checkpoint instead
LORDD ^^

WORLDLIBRARY - Turn the editor world switching into something pulled out of a library, you feel me?..

Allow circles and triangles?

Camera filters ??? Yeah? Like the pixie demo? Let them customize the LOOK and feel of it all

Randomize animations and physics?

Select emitter from right click menu list, this is not a live emitter, its a direct lookup :)

right click - follow object, follow with path object

If object is outside of its custom grid to start off, It will not be able to find the correct grid
Theres needs to be a flag, perhaps the _fresh flag that allows it to use the other pathfinding grid to make its away to the new path

ATTACK which is like initial acceleration when there is no acceleration yet, jump attack speed, etc
tag: sharpTurns ( velocity is positive and decreasing, increase this power )
event: onObjectTurn
Object 'swinging' like on a rope. I mean... awesome right?
input modifiers....'on ice', 'flat'
// planet gravity! Would be cool to have..

I want actual grid node by grid node movement and grid collision system. I want grid movement for OBJECTS too
TRUE zelda camera work

mini-map
map rotation having problems 1) object stage already pivoted for camera reason 2) admin canvas is not rotating with

// ELEVATION IS POSSIBLE THROUGH A VISUAL ILLUSION ( see littlewood game )
By view so you can see certain objects based on ur view like 'xray goggles'! teehee
Background animation tag ( perhaps background stage and everything…)
Add animations to an object, custom animations? More than one like an array of them.. lol
add custom input behavior is broken but maybe thats good
in-game checkpoints
// gun that swaps places with what it hits! so cool..
// 3d sound effects system from papa bear
// layered object select when right clicking. ( for invisible areas and parent areas ) ( object selected will be an array and then the menu will choose between those )
// run local simulation
// add sprites to construct editor
// global compendium service that I can add to remove without copying and pasting JSON
// KING MODE ( where its like you make various yes/no choices and that changes whats happening on the world map )
// local mods? ( client only mods for specific players/situations )
// pixiChild._stillUsed property as well as a PIXIMAP.objectsById system. We scrap app PIXICHILDs that arent in use every like 10s
////////////////////////////////////////////////////

NOTES

/////
PLANS FOR ULTIMATE MINECRAFT SCALE

// moving grid based on hero ( chunks ) and only run simulation on those objects in the grid\
  // the problem is te pathfinding grid, hard to update that, too

Basically the grid will be a moving grid
the x and y of each grid node will get a getter based off the startX and startY and gridX
the grid will move its startX and startY with each hero with as its CHUNK

chunk padding is only used to calculate shadows as of now
CHUNK padding is the difference between the players view and the grid

It seems that theres VIEW padding and game padding. VIEW Padding seems to be for camera shakes and for moving very fast
game padding seems to be for smash brothers style deaths and managing object updates ( like mine craft )

A game boundary would likely dissapear, same with a camera lock
and then you would just have a grid that moves with you, the server would know each heros grid size and location
and update things accordingly

UPDATE ON THIS
If we seperate custom grid props from a path object and turn custom grids into their own objects, we can give the hero its own custom grid as a sub object and have monsters hook into it when they are in the area!

////////////////////////////////////////////////////
////////////////////////////////////////////////////
/// ALL SORTS OF EDITOR NOTES
/////////////////////////////

Default detail is your hero WITH a chat tab?

TEAM DETAIL MENU

OBJECT DETAIL MENU
TABS Info, Triggers, Color, Sprite, Tags, Combat Info, HERO: ( Quests, Skills, Inventory, Equipment, Controls )

TRIGGERS
Need to make each trigger reach a sequence? and look up that sequence and display in list

INFO
Sprite Profile photo
Dialogue, Name,Description,
( Possible Effects list, Tag Descriptions? )
Path, Pathfinding Area, Parent, Relative, Groups, Respawn
--Flavor Text, Description, Quick Description

ENGINE DETAIL MENU
SpriteSheets, Sounds, Music, Games, Default Mod/Objects/Heros/Animations

GAME DETAIL MENU
Sequences, Stories, Scenarios, Sprites, Custom Mod/Objects/Heros/Animations

ADD SUB OBJECT
Spear
Gun
Inventory Item
Area x 2
Area X 3
Area x 4
Potential Sub Object

EDITORS
light editor
timer editor
quest editor ( inside of default hero editor )

////////////////////////////////
////////////////////////////////
// PIXI FILTER NOTES

TWIST filter
Glow filter
Outline filter
—
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
HELP WITH COLOR PALLETE?

RECORDING
https://codepen.io/adkanojia/pen/EZJvJL
https://github.com/spite/ccapture.js/
^this could be huge..
but honeslty I could just do a 'pick objects to be recorded moment' and we keep track of their x, y, dialogue, chat, color, etc

////////////////////////////////
// little glowy things all around ( particle effects, see hyper light drifter )

rain and snow particle overlays

FIREWORK PARTICLES, ( UNLEASH THE POWER OF THE PARTICLE SYSTEM )
Pulsing size and rotating
Smoke particles very subtle...

Object Warp

// INVERT GAME, for example, when you get pacman powers

/*Trails,
	long trail

leaving trail ( drops )

// grid object so its like outlines over the whole thing

// striped object!

have layered border, just draw another version at +2 and +4 and +6, -2 etc..

SHINE effect

Glow

NEON vibe?

Dust particles

Particles being sucked into the player ( POWER!!! )

Engine trail on a car u know what I mean?
*/
////////////////////////////////////////////////////
////////////////////////////////////////////////////
/// INFRASTRUCTURE
////////////////////////////////////////////////////
////////////////////////////////////////////////////
// SERVER MODE USING NENGI
// basically... HOST MODE and ARCADE MODE work as a great combo for home made arcade
// ^^ host mode and arcade mode would BREAK if i used a server model for running the game
// HOWEVER when trying to do accurate combat in multiplayer, we are going to want to have all the power of NENGI
// In that scenario i will try to implement server mode which will basically remove a client host and
// will make the server authoritative and solely responsible for updating, ill need to do a lot of changing...

// HOST GAME VS CLIENT GAME and their physics system, etc. right now non-hosts dont add subobjects for what reaason?? Its because adding aa sub object is quite complicated logic

// event system main problem is the different between onDeleteObject and 'onDeletedObject', very important, causing many issues :(

// allow pixi child sub object to go underneath their owner instead of always above, use tags please the whole time

// event system for physics, game logic, rendering, network update, ui, seperating helps!

// this is really scary. the host CANNOT refresh the page if any mods are used. The server is saving the modded version of the game currently because thats what we send to the clients

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

// debug tools such as ( view all possible effects this object can have )
// view current POWERS
// VIEW DIFF from default version of this object

// auto save game state to DB, restore game state
// combine objectsById and objectsByTag with hero versions. Heros ARE objects. We can use .objectList and .heroList to diffentiate
// gameState => worldState
// convert all 'guestObject', 'mainObject', 'ownerObject' things to just ID stores
// dev dependencies to try to lower build file size

// DELETING object keys doesnt work, it just skips that update of that key. We need a good system for this

// another effects phase after correction, this is for things that should not be triggered unless it was legal

// we need more patterns to interact with the rendering system.
// standards for Adding Object to Game -> Add Object to Physics ->
// standards for edit object vs update object
// standards for network update/edit vs local update/edit
// many more standards for many more features
// Standards for DELETE, ADD, REMOVE, SPAWN, RESET, INITIALIZE, HIDE, (DISABLE?)

// CLIENT_GAME vs HOST_GAME

// local vs global positions, it makes total sense when you realize OH I need a global X for the entire game and local one thats more for the immediate surrounds and whats being rendere. Thers TWO axis

// ok so inssteadd of aappendding all these children to the dom, we should have a specified order so that we dont have to be gnarly with z ordering

// separate hero and PLAYER. the hero is just a game object then...

// queuing world and other updates so we can 'flush' them like feedly does

// admin vs player code much better seperated

// HONESTLY USING BOX 2D PHYSICS WOULD BE INCREDIBLE
// https://zimjs.com/bits/physics.html
// https://opengameart.org/content/colored-16x16-fantasy-tileset
// http://timefantasy.net/
// https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-and-animations-with-pixijs5
// https://github.com/YarnSpinnerTool/YarnEditor

/*
ACTUALLY THE ENGINE IVE BEEN WANTING...
https://github.com/timetocode/nengi-2d-csp

BETTER LOCAL STORAGE
https://github.com/brianleroux/lawnchair

MOUSE WHEEL
http://monospaced.github.io/hamster.js/

IDK
https://namuol.github.io/cheet.js/

GETTING SERIOUS ABOUT OPTIMIZATION
https://github.com/spite/rstats
https://github.com/geckosio/snapshot-interpolation
https://github.com/rgcl/jsonpack

SOUND
https://github.com/kittykatattack/sound.js

IMAGE MANIPULATION
http://camanjs.com/examples/
// aparently also FABRIC.js is good for that, I MEAN IDK MAN

Tooltips
https://github.com/atomiks/tippyjs-react
https://wwayne.github.io/react-tooltip/

P COOL IDK
https://game-icons.net/

TWEENS
http://gizma.com/easing/#quad1

GAVE ME GREAT IDEA FOR LIKE EDGES OF THE GRID NODES
https://www.mipui.net/
IdK ANOTHER ONLINE https://hextml.playest.net/

THIS IS FOR GENERATING SPRITESHEET JSON
https://www.leshylabs.com/apps/sstool/

SpriteSheet
https://pixanna.nl/products/ancient-dungeons-base-pack/
https://craftpix.net/

IMPROVE AESTHETIC AND GAME AESHTIC CUSTOMIZATION
https://www.transparenttextures.com/

THINGS COULD GET FUCKIN NUTS WITH THIS HERE
https://www.iwm-tuebingen.de/iwmbrowser/lib/pixi/flippable.html

PROCEDURAL
https://github.com/sequitur/improv
https://github.com/redblobgames/mapgen2
https://github.com/BrianMacIntosh/icon-machine
https://github.com/redblobgames/mapgen4
https://github.com/kchapelier/procedural-generation
https://github.com/Dannark/BWO
*/

// MARKETING IDEA
// Make a game for their birthday

window.awsURL = 'https://homemadearcade.s3-us-west-1.amazonaws.com/'
window.HomemadeArcadeImageAssetURL = 'assets/images/'

import "core-js/stable";
import "regenerator-runtime/runtime";

import 'ace-builds'
import 'ace-builds/webpack-resolver';
// // then the mode, theme & extension
import 'ace-builds/src-noconflict/mode-json';

import './js/utils/utils.js'
import './js/page/index.js'
import './js/game/index.js'
import './js/arcade/index.js'
import './js/constructEditor/index.js'
import './js/pathEditor/index.js'
import './js/belowmanager/index.js'
import './js/map/index.js'
import './js/physics/index.js'
import './js/mapeditor/index.js'
import './js/playerUI/index.js'
import './js/editorUI/index.js'
import './js/game/notificationscontrol.js'
import './js/liveeditor/index.js'
import './js/creator/index.js'
import './styles/index.scss'
import './styles/jsoneditor.css'

import './js/libraries/modLibrary.js'
import './js/libraries/subObjectLibrary.js'
import './js/libraries/objectLibrary.js'
import './js/libraries/heroLibrary.js'

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


--------
********
--------

HOMEMADE ARCADE TOOL MAP

CLASS 1 - Basic
----------
Creator
- Time: lowest, Specificity: highest

Tags
- Time: low, Specificity: high


CLASS 2 - Intermediate
----------
RightClickMenu Modals
- Time: medium, Specificity: medium ( Name, Dialogue, Color, CRUD operations )

Detail View
- Same possibilities as RightClickMenu Modals except bigger and at the bottom of the screen, has an added layer of convenience


CLASS 3 - Advanced
----------
SimpleSequence
( Stories, Branching Dialogue )
- Time: high, Specificity: medium

Sequence
( Animations, Stories, All Effects, Branching Dialogue, Conditions, Notifications, Adding Objects )
- Time: highest, Specificity: lowest


SPECIALIZED
----------
Sprite Selector
Path Editor
Construct Editor
Live Menu ( Physics, Day/Night, Particles )


TODO
----------
Pixel Editor
Branching Game
*/
