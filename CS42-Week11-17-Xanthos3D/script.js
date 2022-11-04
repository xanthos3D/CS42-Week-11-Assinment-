
//starts tone
//Tone.Start();
//click on go live in visual studio code to run code in a window. f12 to open up element and console in popup window.

let scene1 = {
  key: 'scene1',
  active: true,
  preload: titlePreload,
  create: titleCreate,
  update: titleUpdate
};

let scene2 = {
  key: 'scene2',
  active: false,
  preload: gamePreloadFunction,
  create: GameStartFunction,
  update: myGameUpdateCode
};

let config = {
  //list of property names and there associated values.
  width: 900,
  height: 900,
  //3200 w by 1920 h for world borders
  type: Phaser.WEBGL,
  physics: {
    default: 'arcade',
    arcade: {
      //gravity:{y:300},
      debug: false
    }
  },
  scene: [scene1, scene2],//multiple scenes
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  } // scale manager used to scale game up to fit display 
};

let Game = new Phaser.Game(config);
//variable declarations
let arrowKeys,
  player,
  playerIsOnGround = false,
  jumpCoolDown = 0,
  damageCoolDown = 0,
  isStarted = false;

scoreInfo = {
  mainScore: 0,
  score1: 0,
  score2: 0,
  score3: 0
};
hpInfo = {
  hpMain: 25,
  hp1: 0,
  hp2: 0
};
gemInfo = {
  width: 90,
  height: 90,
  offset: {
    top: 150,
    left: 60
  },
  padding: 20
};
enemyInfo = {
  width: 90,
  height: 90,
  offset: {
    top: 150,
    left: 60
  },
  padding: 20
};

let Score;
let scoreNum3;
let scoreNum2;
let scoreNum1;

let health;
let hpNum2;
let hpNum1;

let myCamera;
//variable for easy start instance path finder object.
let finder;

let myMap;

function gamePreloadFunction() {
  //to load the tile map we need to first load the tileset image
  this.load.image("tiles", "assets/tilesets/TileMapGrave.png");
  //then we load the tile json file made in tiled.
  this.load.tilemapTiledJSON("map", "assets/tilesets/FirstTileMap.json");
  this.load.spritesheet('star', 'assets/StarMan.png', { frameWidth: 73, frameHeight: 78 });
  this.load.image('purple', 'assets/PurpleGem.png');
  this.load.image('enemy', 'assets/DemonEye.png');
  this.load.image('score', 'assets/displayElements/score.png');
  this.load.image('hp', 'assets/displayElements/hp.png');
  this.load.image('0', 'assets/displayElements/0.png');
  this.load.image('1', 'assets/displayElements/1.png');
  this.load.image('2', 'assets/displayElements/2.png');
  this.load.image('3', 'assets/displayElements/3.png');
  this.load.image('4', 'assets/displayElements/4.png');
  this.load.image('5', 'assets/displayElements/5.png');
  this.load.image('6', 'assets/displayElements/6.png');
  this.load.image('7', 'assets/displayElements/7.png');
  this.load.image('8', 'assets/displayElements/8.png');
  this.load.image('9', 'assets/displayElements/9.png');
  this.load.audio("bounce", ["assets/boing-6222.mp3"]);
  this.load.audio("gemCollect", ["assets/collected.mp3"]);
}

function GameStartFunction() {

  scene = this;

  //all tile maps have layers. even simple ones have atleast one.
  //so now we make the tilemap object
  myMap = this.make.tilemap({ key: "map" });// the key value must match the key given to the json file. 
  // then we add the tilese bitmap image asset to the phaser tilemap object.
  // takes the file name of the tileset png and the asset name defined in phaser. connects between the two.
  let myTileSet = myMap.addTilesetImage("TileMapGraveNamedInTiled", "tiles");
  //ask phaser to draw at least one layer from the tile map using the tileset image asset.
  // forground is a layer defined in our json file as it is shown in the tiled editor. then use x and y for positioning.
  let backLayer = myMap.createStaticLayer("backround", myTileSet, 0, 0);
  let frontLayer = myMap.createStaticLayer("forground", myTileSet, 0, 0);
  let pillars = myMap.createStaticLayer("objectHidesPlayer", myTileSet, 0, 0);

  //create a instance of the easy start pathfinder
  finder = new EasyStar.js();
  //now we need to create a data moddle that represents collidable tiles in our tile map.
  let grid = [];

  let tile;
  //a nester array of the tile set tile for the tile map.
  for (let outer = 0; outer < myMap.height; outer++) {
    let col = [];
    for (let inner = 0; inner < myMap.width; inner++) {
      tile = frontLayer.getTileAt(outer, inner);
      //when pushing data to col you need to specify a layer if there are multiple. otherwise the .index call will result in a error null.
      col.push((tile ? tile.index : 0));

    }
    grid.push(col);
  }
  //pass to easystart the tile layout for the tile map saved in grid
  finder.setGrid(grid);
  //now we need to ask easystart the custome collides and score properties so it knows what tiles are traversable. and which are prefered.

  let tileset = myMap.tilesets[0];
  let tileprops = tileset.tileProperties;
  let acceptabletiles = [];
  //loop through all tiles to see if tiles are collidable or not.
  for (let index = tileset.firstgid - 1; index < myTileSet.total; index++) {
    //checking for collides property
    if (tileprops[index].collision) {
      acceptabletiles.push(index + 1);
      //if tile can be traverse  also pass that to easy star

    }

  }
  acceptabletiles.push(0);
  finder.setAcceptableTiles(acceptabletiles);

  //sets stacking order of pillars to be below. there are four layers
  // there placement is dinined by when there called. since player is 
  //defined after our other layers it is the highest. to fix this we 
  //set the pillars to the highest layer but any number larger than the
  // total layers will set it to the for front.
  pillars.setDepth(5);

  Score = this.add.sprite(130, 65, "score");
  scoreNum3 = this.add.sprite(340, 55, "0");
  scoreNum2 = this.add.sprite(400, 55, "0");
  scoreNum1 = this.add.sprite(460, 55, "0");
  Score.setDepth(6);
  scoreNum3.setDepth(6);
  scoreNum2.setDepth(6);
  scoreNum1.setDepth(6);

  health = this.add.sprite(800, 40, "hp");
  hpNum2 = this.add.sprite(890, 48, "2");
  hpNum1 = this.add.sprite(945, 48, "5");
  health.setDepth(6);
  hpNum2.setDepth(6);
  hpNum1.setDepth(6);

  //not sure why fixedToCamera does not function but used setScrollFactor(0);  works
  //Score.fixedToCamera = true;

  //this ties the score sprites to the camera
  Score.setScrollFactor(0);
  scoreNum3.setScrollFactor(0);
  scoreNum2.setScrollFactor(0);
  scoreNum1.setScrollFactor(0);

  health.setScrollFactor(0);
  hpNum2.setScrollFactor(0);
  hpNum1.setScrollFactor(0);

  //adds text for play screen
  startText = scene.add.text(450, 500, "Click to Start", { fontSize: '18px', fill: '#FFF' }).setOrigin(0.5)
  infoText = scene.add.text(450, 520, "Controls: spacebar =Jump, arrowkeys = movement ", { fontSize: '18px', fill: '#FFF' }).setOrigin(0.5)
  descriptText = scene.add.text(450, 540, "Collect All the gems to win.", { fontSize: '18px', fill: '#FFF' }).setOrigin(0.5)
  startText.setScrollFactor(0);
  infoText.setScrollFactor(0);
  descriptText.setScrollFactor(0);

  // now we give the tiles collision. using the boolean variable defined in tiled.
  //we call it like so. collision in brackets difined in tiled
  frontLayer.setCollisionByProperty({ collision: true });

  // allows input from arrow keys.
  arrowKeys = this.input.keyboard.createCursorKeys();
  //treasure = this.physics.add.sprite(3000,400,"purple");
  // adds player to the game world
  player = this.physics.add.sprite(500, 900, "star");//proper location 500 900

  player.custom_id = 'player';// creates a custome property to make it easy to track the identity of the player sprite.

  player.setBounce(.2);
  //player.setCollideWorldBounds(true);
  player.body.setGravityY(600);
  //allows player to collide with tiles

  gems = this.physics.add.staticGroup();

  enemy = this.physics.add.group();

  initEnemy(800, 1400, 1);
  initEnemy(2300, 1400, 1);

  en = enemy.get(enemy.x,enemy.y);
  if (en) {
    en.custom_id = 'enemyState';
    // set initial state randomly
    switch (scoreInfo.mainScore) {
      case 0:
        en.custom_state = 'still';
        console.log("enemy given property Still on launch");
        break;
      /*case 100:
        en.custom_state = 'stalking';
        console.log("enemy given property Staking on launch");
        break;
      case 140:
        en.custom_state = 'attacking';
        console.log("enemy given property Attacking on launch");
        break;*/
    }
  }

  this.physics.add.collider(player, frontLayer, isOnGround);
  this.physics.add.collider(enemy, frontLayer, null);
  this.physics.add.collider(player, enemy, calcDamage);
  this.physics.add.overlap(player, gems, collect, null, this);
  //this.physics.add.overlap(player,enemy,calcDamage, null,this);


  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNames('star', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'star', frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNames('star', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  player.anims.play('turn'); // makes turn frame be active during pause screen at the beginning of the game.



  // to keep the camera on the player we first make a camera object
  myCamera = this.cameras.main;
  //then we keep the camera tied to the player.
  myCamera.startFollow(player);
  // to keep the camera in the tile set we use. grabing the bounds of the tiles
  myCamera.setBounds(0, 0, myMap.widthInPixels, myMap.heightInPixels);

  //adds sounde effects via mp3 files
  boing = this.sound.add("bounce", { loop: false });
  collected = this.sound.add("gemCollect", { loop: false });




  //adds space as a usable key.
  this.input.keyboard.addCapture('SPACE');

  this.input.on('pointerdown', function() {
    if (isStarted == false) {
      isStarted = true;
      startText.destroy()
      infoText.destroy()
      descriptText.destroy()
      midiStart()
      //pathEnemy()
    }
  });
  initGems(2300, 400, 7)
  initGems(2300, 1550, 7)
  initGems(2480, 1230, 2)
  initGems(2790, 1350, 2)
  initGems(2170, 1170, 2)
  initGems(2400, 980, 2)
  initGems(2728, 850, 2)


}


function myGameUpdateCode() {

  //allows the score sprites to follow the player throught the level
  //midiStart();
  if (isStarted === true) {
    if (arrowKeys.left.isDown) {
      player.setVelocityX(-200);
      player.anims.play('left', true);
    } else if (arrowKeys.right.isDown) {
      player.setVelocityX(200);
      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');
    }
    if (arrowKeys.up.isDown && playerIsOnGround === true && jumpCoolDown === 0) {
      playerIsOnGround = false;
      player.setVelocityY(-600);
      jumpCoolDown = 130;
      //plays sound effect
      boing.play();

    }

    if (jumpCoolDown > 0) {
      jumpCoolDown--;
      //console.log("jump cool down: "+ jumpCoolDown);
    }
    if (damageCoolDown > 0) {
      damageCoolDown--;
      //console.log("damage cool down: "+ damageCoolDown);
    }
    //console.log("is the player on the ground:"+ playerIsOnGround);  
    //console.log("player x: "+ player.x);
    //console.log("player y: "+ player.y);

    let that = this;
    enemy.children.iterate(function (en) {
      // use switch for each different state's code block
      switch ( en.custom_state ) {
        case 'still':
          console.log("enemy has property Still on update");
          if(scoreInfo.mainScore > 20){
            en.custom_state = 'attacking';
          }
          break;
        case 'stalking':
          console.log("enemy has property Stalking on update");
          break;
        case 'pursuit':
          console.log("enemy has property pursuit on update");
         break;
        case 'attacking':
          console.log("enemy has property attacking on update");
          pathEnemy();
          break;
      }
    });
  }
  if (scoreInfo.mainScore === 480) {
    end("you Win!");
  }
}


function isOnGround() {
  playerIsOnGround = true;
}

function increaseScore() {
  scoreInfo.score3 = Math.floor(scoreInfo.mainScore / 100);
  scoreInfo.score2 = Math.floor(((scoreInfo.mainScore) - (scoreInfo.score3 * 100)) / 10);
  scoreInfo.score1 = Math.floor(((scoreInfo.mainScore) - (scoreInfo.score3 * 100) - (scoreInfo.score2 * 10)));

  //console.log("MainScore: "+ scoreInfo.mainScore );
  if (scoreInfo.mainScore < 1000) {
    scoreNum1.setTexture('' + scoreInfo.score1);
    scoreNum2.setTexture('' + scoreInfo.score2);
    scoreNum3.setTexture('' + scoreInfo.score3);
    //console.log("MainScore: "+ scoreInfo.mainScore );
    //console.log("Score3: "+ scoreInfo.score3+" Score2: "+ scoreInfo.score2+" Score1: "+ scoreInfo.score1 );

  }
}

function currentDamage() {
  if (hpInfo.hpMain < 0) {
    hpInfo.hpMain = 0;
  }
  hpInfo.hp2 = Math.floor((hpInfo.hpMain) / 10);
  hpInfo.hp1 = Math.floor((hpInfo.hpMain) - (hpInfo.hp2 * 10));
  //console.log("total HP: "+hpInfo.hpMain+" hp2: "+hpInfo.hp2+" hp1: "+hpInfo.hp1);

  if (hpInfo.hp1 > 0) {
    hpNum1.setTexture('' + hpInfo.hp1);
    hpNum2.setTexture('' + hpInfo.hp2);

  } else if (hpInfo.hpMain <= 0) {
    //if hp 0 call ending function
    end("you Died!");
  }
}
// same deal as currentDamage except with a increasing score
function initGems(startX, startY, amount) {
  for (row = 0; row < amount; row++) {
    var gemX = (row * (gemInfo.width + gemInfo.padding)) + gemInfo.offset.left + startX;
    gems.create(gemX, startY, 'purple').setOrigin(0.5);
  }
}

function initEnemy(startX, startY, amount) {
  for (row = 0; row < amount; row++) {
    var enemyX = (row * (enemyInfo.width + enemyInfo.padding)) + enemyInfo.offset.left + startX;
    enemy.create(enemyX, startY, 'enemy').setOrigin(0.5);
  }
}

//setInterval(pathEnemy, 1500)

function pathEnemy() {
  console.log("path Enemy Called");
  if (player) {
    var toX = Math.floor(player.x / 64);
    var toY = Math.floor(player.y / 64);
    //console.log("player x: "+ player.x+" player y: "+ player.y);

    if (isStarted === true) {

      enemy.children.each(function(currentEnemy) {
        var fromX = Math.floor(currentEnemy.x / 64);
        var fromY = Math.floor(currentEnemy.y / 64);
        console.log("enemy x: "+ currentEnemy.x+" enemy y: "+ currentEnemy.y);
        console.log("player x: "+ player.x+" enemy y: "+ player.y);

        currentEnemy.pathCounter = 0;

        //from easy star runs async to calc the path and then calls the function we provide as the last argument.
        finder.findPath(
          fromX,
          fromY,
          toX,
          toY,
          function(path) {
            //so did easy start find a path?
            if (path === null) {
              console.log("path not found by easystar");
            } else {
              //console.log("enemy path:"+ path)
              //moves the enemy base on the path using tweens
              moveEnemy(currentEnemy,path);
            }
          }
        );
        //after we define a + b points for easystar to traverse in findpath()
        //then we can use the eaststart method to do the pathing
        finder.calculate();
        currentEnemy.body.reset(currentEnemy.x, currentEnemy.y);

      }, this);


    }
  }
}
function moveEnemy(currentEnemy, path) {
  console.log("moveEnemyCalled");
  let eX, eY;

    //currentEnemy.pathCounter;
      //gives us a point in tile map quardinates from easystar
      eX = path[currentEnemy.pathCounter + 1].x;
      eY = path[currentEnemy.pathCounter + 1].y;
      if(player.y != eY ||player.x != eX){

      if (player.x > currentEnemy.x && player.y > currentEnemy.y) {
        currentEnemy.body.setVelocityX(10 * eX);
        currentEnemy.body.setVelocityY(10 * eY);
        //currentEnemy.body.reset(currentEnemy.x, currentEnemy.y);
        //console.log("Moving Enemy first call -x"+10*eX+" and -y"+10*eY);
      } else if (player.x <= currentEnemy.x && player.y > currentEnemy.y) {
        currentEnemy.body.setVelocityX(10 * -eX);
        currentEnemy.body.setVelocityY(10 * eY);
        //currentEnemy.body.reset(currentEnemy.x, currentEnemy.y);
        //console.log("Moving Enemy -x"+10*eX+" and -y"+10*-eY);
      } else if (player.x > currentEnemy.x && player.y <= currentEnemy.y) {
        currentEnemy.body.setVelocityX(10 * eX);
        currentEnemy.body.setVelocityY(10 * -eY);
        
        //currentEnemy.body.reset(currentEnemy.x, currentEnemy.y);
        //console.log("Moving Enemy -x"+10*-eX+" and -y"+10*eY);
      } else if (player.x <= currentEnemy.x && player.y <= currentEnemy.y) {
        currentEnemy.body.setVelocityX(10 * -eX);
        currentEnemy.body.setVelocityY(10 * -eY);
        
        //currentEnemy.body.reset(currentEnemy.x, currentEnemy.y);
       // console.log("Moving Enemy -x"+10*-eX+" and -y"+10*-eY);
      } else if (player.x <= currentEnemy.x) {
        currentEnemy.body.setVelocityX(10 * -eX);
        currentEnemy.body.setVelocityY(10 * eY);
        
        //currentEnemy.body.reset(currentEnemy.x, currentEnemy.y);
        //console.log("Moving Enemy -x"+10*-eX+" and -y"+10*eY);
      }
      currentEnemy.pathCounter++;
    }
    currentEnemy.pathCounter = 0;
}

function collect(player, gems) {

  gems.disableBody(true, true);
  scoreInfo.mainScore += 20;
  increaseScore();
  collected.play();
}

function calcDamage(player, enemy) {
  if (damageCoolDown <= 0)
    hpInfo.hpMain -= 7;
  currentDamage();
  damageCoolDown = 5
}

function end(info) {

  alert(info);
  location.reload()

}

function titlePreload() {
  this.load.image('background', 'assets/background.png');
}

function titleCreate() {
  starSky = this.add.sprite(0, 450, "background");
  this.title = this.add.text(450, 150, "Star Man", {
    fontSize: '5rem',
    fill: '#FFEEAA',
    boundsAlignH: 'center',
    boundsAlignV: "middle"
  });
  this.title.setOrigin(0.5);

  this.info = this.add.text(450, 300, "Click to Enter Game", {
    fontSize: '2rem',
    fill: '#FFEEAA',
    boundsAlignH: 'center',
    boundsAlignV: "middle"
  });
  this.info.setOrigin(0.5);

  this.help = this.add.text(450, 550, "", {
    fontSize: '2rem',
    fill: '#FFEEAA',
    boundsAlignH: 'center',
    boundsAlignV: "middle"
  });
  this.help.setOrigin(0.5);

  this.input.on('pointerdown', scene1Trans, this);
}

function titleUpdate() {

}

function scene1Trans() {
  this.scene.start('scene2');
}



