var game = new Phaser.Game(512, 240, Phaser.CANVAS, '', {
  preload: preload,
  create: create,
  update: update
}, false, false);

function preload() {
  game.load.spritesheet('tiles', '/assets/tiles_sprite.png', 16, 16);
  game.load.spritesheet('enemy', '/assets/enemy.png', 16, 16);
  game.load.spritesheet('santa', '/assets/santa_sprite.png', 16, 16);
  game.load.spritesheet('star', '/assets/stars.png', 16, 16);
  game.load.image('background', '/assets/background.jpg');
  //game.load.audio('starkill', './star.mp3');
  game.load.tilemap('level', '/js/level1.json', null, Phaser.Tilemap.TILED_JSON);
  // game.load.tilemap('level', 'https://api.myjson.com/bins/3kk2g', null, Phaser.Tilemap.TILED_JSON);
}


function create() {
  Phaser.Canvas.setImageRenderingCrisp(game.canvas)
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.tileSprite(0, 0, 512, 480, 'background');
  game.add.tileSprite(512, 0, 512, 480, 'background');
  game.add.tileSprite(1024, 0, 512, 480, 'background');
  game.add.tileSprite(1536, 0, 512, 480, 'background');
  //starkill = game.add.audio('starkill');
  /*game.stage.backgroundColor = '#5c94fc';*/
  map = game.add.tilemap('level');
  map.addTilesetImage('tiles', 'tiles');
  map.setCollisionBetween(3, 12, true, 'solid');

  map.createLayer('background');

  layer = map.createLayer('solid');
  layer.resizeWorld();

  stars = game.add.group();
  stars.enableBody = true;
  map.createFromTiles(2, null, 'star', 'stuff', stars);
  stars.callAll('animations.add', 'animations', 'spin', [0, 0, 1, 2], 3, true);
  stars.callAll('animations.play', 'animations', 'spin');

  enemys = game.add.group();
  enemys.enableBody = true;
  map.createFromTiles(1, null, 'enemy', 'stuff', enemys);
  enemys.callAll('animations.add', 'animations', 'walk', [0, 1], 2, true);
  enemys.callAll('animations.play', 'animations', 'walk');
  enemys.setAll('body.bounce.x', 1);
  enemys.setAll('body.velocity.x', -20);
  enemys.setAll('body.gravity.y', 500);

  player = game.add.sprite(16, game.world.height - 48, 'santa');
  game.physics.arcade.enable(player);
  player.body.gravity.y = 370;
  player.body.collideWorldBounds = true;
  player.animations.add('walkRight', [1, 2, 3], 10, true);
  player.animations.add('walkLeft', [8, 9, 10], 10, true);
  player.goesRight = true;

  game.camera.follow(player);

  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  game.physics.arcade.collide(player, layer);
  game.physics.arcade.collide(enemys, layer);
  game.physics.arcade.overlap(player, enemys, enemyOverlap);
  game.physics.arcade.overlap(player, stars, starOverlap);

  if (player.body.enable) {
    player.body.velocity.x = 0;
    if (cursors.left.isDown) {
      player.body.velocity.x = -90;
      player.animations.play('walkLeft');
      player.goesRight = false;
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 90;
      player.animations.play('walkRight');
      player.goesRight = true;
    } else {
      player.animations.stop();
      if (player.goesRight) player.frame = 0;
      else player.frame = 7;
      /*game.stateText.text = " GAME OVER \n Click to restart";
      game.stateText.visible = true;*/
    }

    if (cursors.up.isDown && player.body.onFloor()) {
      player.body.velocity.y = -190;
      player.animations.stop();
    }

    if (player.body.velocity.y != 0) {
      if (player.goesRight) player.frame = 5;
      else player.frame = 12;
    }
  }
}

function starOverlap(player, star) {
  star.kill();
  //starkill.play();
}

function enemyOverlap(player, enemy) {
  if (player.body.touching.down) {
    enemy.animations.stop();
    enemy.frame = 2;
    enemy.body.enable = false;
    player.body.velocity.y = -80;
    game.time.events.add(Phaser.Timer.SECOND, function() {
      enemy.kill();
    });
  } else {
    player.frame = 6;
    player.body.enable = false;
    player.animations.stop();
    game.time.events.add(Phaser.Timer.SECOND * 3, function() {
      game.paused = true;
    });
  }
}
