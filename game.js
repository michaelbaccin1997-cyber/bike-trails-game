
// Phaser 3 simple bike trail game prototype
const LEVEL_COUNT = 10;
const LEVEL_TIME = 60; // seconds

let config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 900,
  height: 500,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let game = new Phaser.Game(config);

function preload() {
  // nessun caricamento, le immagini saranno create a runtime
}

function create() {
   // Crea texture generate dinamicamente (Safari-friendly)
  this.textures.addBase64('ground', generateRect(1600, 64, '#754c24'));
  this.textures.addBase64('bike', generateRect(64, 40, '#222222'));
  this.textures.addBase64('wheel', generateCircle(20, '#000000'));
  this.textures.addBase64('hole', generateRect(120, 64, '#1d1f20'));

  this.cameras.main.setBackgroundColor('#87CEEB');
  this.cameras.main.setBackgroundColor('#87CEEB');

  // UI
  this.level = 1;
  this.timeLeft = LEVEL_TIME;
  this.isPlaying = false;

  this.statusText = this.add.text(16, 16, '', { font: '20px Arial', fill: '#000' }).setScrollFactor(0);
  this.timerText = this.add.text(16, 40, '', { font: '18px Arial', fill: '#000' }).setScrollFactor(0);
  this.levelText = this.add.text(16, 64, '', { font: '16px Arial', fill: '#000' }).setScrollFactor(0);

  // world
  this.worldGroup = this.add.group();

  startLevel.call(this, this.level);

  // controls
  this.input.addPointer(3);
  this.input.on('pointerdown', (pointer) => {
    // single tap to jump
    if (!this.isPlaying) return;
    if (this.bike.body.touching.down) {
      this.bike.body.setVelocityY(-480);
    }
  });

  // start button in page
  document.getElementById('startBtn').onclick = () => {
    if (!this.isPlaying) {
      this.isPlaying = true;
      document.getElementById('status').innerText = 'Gioco avviato';
    }
  };

  // simple keyboard for desktop testing
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  if (!this.isPlaying) {
    this.statusText.setText('Premi "Avvia gioco" per iniziare');
    this.timerText.setText('');
    this.levelText.setText('');
    return;
  }

  // player horizontal movement (auto forward + slight control)
  const speed = 180 + (this.level-1)*10;
  if (this.cursors.left.isDown) {
    this.bike.x -= 160 * delta/1000;
  } else if (this.cursors.right.isDown) {
    this.bike.x += 160 * delta/1000;
  } else {
    this.bike.x += speed * delta/1000;
  }

  // camera follows
  this.cameras.main.startFollow(this.bike, true, 0.05, 0.05);

  // update timer
  this.timeLeft -= delta/1000;
  if (this.timeLeft <= 0) {
    // time's up -> fail level, restart level
    this.isPlaying = false;
    document.getElementById('status').innerText = 'Tempo scaduto! Riprova il livello ' + this.level;
    return;
  }

  // check if reached end of level
  if (this.bike.x > this.levelEndX - 50) {
    // level complete
    this.level++;
    if (this.level > LEVEL_COUNT) {
      this.isPlaying = false;
      document.getElementById('status').innerText = 'Hai completato tutti i livelli! 🎉';
      this.statusText.setText('Completato');
      return;
    } else {
      startLevel.call(this, this.level);
    }
  }

  // check collision with holes (falling)
  if (this.bike.y > this.cameras.main.height + 200) {
    this.isPlaying = false;
    document.getElementById('status').innerText = 'Sei caduto! Riprova il livello ' + this.level;
    return;
  }

  // UI update
  this.statusText.setText('Livello: ' + this.level);
  this.timerText.setText('Tempo rimanente: ' + Math.ceil(this.timeLeft) + 's');
  this.levelText.setText('Obiettivo: raggiungi la fine prima che finisca il tempo');
}

function startLevel(levelNum) {
  // clear previous world
  if (this.worldChildren) {
    this.worldChildren.forEach(c => c.destroy());
  }
  this.worldChildren = [];

  // reset physics world bounds wide enough
  const levelWidth = 2200; // fixed width to average ~60s at speed
  this.physics.world.setBounds(0, 0, levelWidth, config.height);
  this.cameras.main.setBounds(0, 0, levelWidth, config.height);

  // ground - create repeating ground tiles
  for (let x=0;x<levelWidth;x+=160) {
    let g = this.add.image(x+80, config.height-32, 'ground');
    this.physics.add.existing(g, true);
    this.worldChildren.push(g);
  }

  // create procedurally placed holes (more holes with level)
  const holeCount = Phaser.Math.Clamp(3 + Math.floor(levelNum*0.6), 3, 12);
  this.holes = this.physics.add.group({ allowGravity: false, immovable: true });

  for (let i=0;i<holeCount;i++) {
    let w = Phaser.Math.Between(80, 160);
    let gapX = Phaser.Math.Between(200 + i*140, levelWidth - 200 - (holeCount-i)*80);
    let hole = this.add.image(gapX, config.height-32, 'hole').setOrigin(0.5, 0.5);
    hole.displayWidth = w;
    hole.displayHeight = 64;
    this.holes.add(hole);
    this.worldChildren.push(hole);
  }

  // place some rocks/bumps as small obstacles (just decorative, physics static)
  for (let i=0;i<Phaser.Math.Clamp(6 + levelNum, 6, 30); i++) {
    let rx = Phaser.Math.Between(120, levelWidth-120);
    let rock = this.add.rectangle(rx, config.height-60 - Phaser.Math.Between(0,10), Phaser.Math.Between(16,40), Phaser.Math.Between(8,20), 0x333333);
    this.physics.add.existing(rock, true);
    this.worldChildren.push(rock);
  }

  // end marker
  this.levelEndX = levelWidth - 80;
  let flag = this.add.rectangle(this.levelEndX, config.height-128, 20, 80, 0xff0000);
  this.worldChildren.push(flag);

  // create bike
  if (this.bike) {
    this.bike.destroy();
  }
  this.bike = this.physics.add.sprite(120, config.height-120, 'bike');
  this.bike.setCollideWorldBounds(true);
  this.bike.setBodySize(48, 30);
  this.bike.setBounce(0.05);

  // wheels visuals (not physical)
  if (this.w1) { this.w1.destroy(); this.w2.destroy(); }
  this.w1 = this.add.image(this.bike.x-16, this.bike.y+18, 'wheel');
  this.w2 = this.add.image(this.bike.x+16, this.bike.y+18, 'wheel');
  this.worldChildren.push(this.bike, this.w1, this.w2);

  // collisions
  // ground collisions: we simulate ground using a tall invisible static body
  let groundBody = this.add.rectangle(levelWidth/2, config.height-32, levelWidth, 64).setVisible(false);
  this.physics.add.existing(groundBody, true);
  this.worldChildren.push(groundBody);
  this.physics.add.collider(this.bike, groundBody);

  // overlap with holes: if bike x is within hole region and bike touching ground, let it fall by disabling ground under it
  // We'll check overlaps in update loop by testing positions

  // reset camera and timer
  this.cameras.main.startFollow(this.bike);
  this.bike.x = 120;
  this.bike.y = config.height-120;
  this.timeLeft = LEVEL_TIME;
  document.getElementById('status').innerText = 'Livello ' + levelNum + ' — vai!';
  this.isPlaying = true;
}

// helper to generate small images
function generateRect(w, h, color) {
  // create a data URI using canvas
  let canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0,0,w,h);
  return canvas.toDataURL();
}
function generateCircle(r, color) {
  let canvas = document.createElement('canvas');
  let d = r*2;
  canvas.width = d; canvas.height = d;
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(r,r,r,0,Math.PI*2);
  ctx.fill();
  return canvas.toDataURL();
}
