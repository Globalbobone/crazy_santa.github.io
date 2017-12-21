var game = new Phaser.Game(512, 240, Phaser.CANVAS, 'game', {
  preload: preload,
  create: create,
  update: update
}, false, false);

function preload() {
  game.load.spritesheet('tiles', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/tiles_sprite.png', 16, 16);
  game.load.spritesheet('enemy', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/enemy.png', 16, 16);
  game.load.spritesheet('santa', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/santa_sprite.png', 16, 16);
  game.load.spritesheet('star', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/stars.png', 16, 16);
  game.load.image('background', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/background.jpg');
  game.load.audio('starkill', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/key.wav');
  game.load.audio('music', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/music.mp3');
  game.load.audio('death', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/death.wav');
  game.load.audio('game_over', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/game_over.mp3');
  game.load.audio('game_win', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/assets/key.wav');
  game.load.tilemap('level', 'https://globalbobone.github.io/globalbobone.crazy_santa.github.io/js/level1.json', null, Phaser.Tilemap.TILED_JSON);
}

let score = 0;
//let stateText;

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
  
  music = game.add.audio('music');
  music.loop = true;
  music.volume = 0.8;
  music.play();

  starkill = game.add.audio('starkill');
  starkill.volume = 0.5;

  death = game.add.audio('death');
  game_over = game.add.audio('game_over');
  game_win = game.add.audio('game_win');

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

  player = game.add.sprite(16, game.world.height - 148, 'santa');
  game.physics.arcade.enable(player);
  player.body.gravity.y = 370;
  player.body.collideWorldBounds = true;
  player.animations.add('walkRight', [1, 2, 3], 10, true);
  player.animations.add('walkLeft', [8, 9, 10], 10, true);
  player.goesRight = true;
  game.camera.follow(player);
  
  scoreText = game.add.text(8, 8, 'Score: 0', { fontSize: '16px', fill: '#FFFA7A' });
  scoreText.fixedToCamera = true;
  cursors = game.input.keyboard.createCursorKeys();
    stateText = game.add.text(450, 50, ' ', {font: '16px Press Start 2P', fill: '#FFFA7A'});
    stateText.anchor.setTo(1.1, 0.2);
    stateText.fixedToCamera = true;
}

function update() {
  game.physics.arcade.collide(player, layer);
  game.physics.arcade.collide(enemys, layer);
  game.physics.arcade.overlap(player, enemys, enemyOverlap);
  game.physics.arcade.overlap(player, stars, starOverlap);
  winer();

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

function winer() {
    if (score > 1000 ) {
      player.frame = 1;
      player.body.enable = false;
      player.animations.stop();
      game_win.play();
      music.stop();
      stateText.text = " YOU WIN \n F5 to restart \n Score: " + score;
      stateText.visible = true;
      game.time.events.add(Phaser.Timer.SECOND * 3, function() {
      game.paused = true;
      //location.reload();
    });  
  }
}

function starOverlap(player, star) {
  starkill.play();
  star.kill();
  score += 10;
  scoreText.text = 'Score: ' + score;
}

/*function render() {
    game.debug.soundInfo(music, 20, 32);
}*/

function enemyOverlap(player, enemy) {
  if (player.body.touching.down) {
    enemy.animations.stop();
    death.play();
    score += 20;
    scoreText.text = 'Score: ' + score;
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
    game_over.play();
    music.stop();
    //game.world.removeAll();
      stateText.text = " GAME OVER \n YOU LOSE \n F5 to restart";
      stateText.visible = true;
      
    game.time.events.add(Phaser.Timer.SECOND * 2, function() {
      game.paused = true;
    });
  }
}