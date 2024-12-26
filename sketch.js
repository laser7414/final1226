let sprites = {
  background: { img: null },
  bullet: { img: null },  // 加入子彈圖片
  p1: {
    idle: {
      img: null,
      width: 176/3,
      height: 90,
      frames: 3
    },
    walk: {
      img: null,
      width: 176/3,
      height: 90,
      frames: 4
    },
    jump: {
      img: null,
      width: 55,
      height: 90,
      frames: 3
    }
  },
  p2: {
    idle: {
      img: null,
      width: 71,
      height: 99,
      frames: 3
    },
    walk: {
      img: null,
      width: 71,
      height: 99,
      frames: 3
    },
    jump: {
      img: null,
      width: 65,
      height: 99,
      frames: 3
    }
  }
};

// 物理常數
const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const GROUND_Y = 300;
const MOVE_SPEED = 5;

let p1, p2;

// 子彈類別
class Bullet {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.direction = direction;
    this.width = 30;
    this.height = 30;
  }

  update() {
    this.x += this.speed * this.direction;
  }

  draw() {
    push();
    translate(this.x, this.y);
    if (this.direction < 0) {
      scale(-1, 1);
      image(sprites.bullet.img, -this.width, 0, this.width, this.height);
    } else {
      image(sprites.bullet.img, 0, 0, this.width, this.height);
    }
    pop();
  }

  hits(player) {
    return (
      this.x < player.x + 50 &&
      this.x + this.width > player.x &&
      this.y < player.y + 90 &&
      this.y + this.height > player.y
    );
  }
}

function preload() {
  // 載入背景圖片
  sprites.background.img = loadImage('31.JPG');
  
  // 載入子彈圖片
  sprites.bullet.img = loadImage('FIRE.PNG');
  
  // P1 圖片
  sprites.p1.idle.img = loadImage('11.png');
  sprites.p1.walk.img = loadImage('11.png');
  sprites.p1.jump.img = loadImage('12.png');
  
  // P2 圖片
  sprites.p2.idle.img = loadImage('21.png');
  sprites.p2.walk.img = loadImage('21.png');
  sprites.p2.jump.img = loadImage('22.png');
}

function setup() {
  createCanvas(800, 400);
  
  p1 = {
    x: 200,
    y: GROUND_Y,
    vy: 0,
    isJumping: false,
    currentAction: 'idle',
    currentFrame: 0,
    frameDelay: 5,
    frameCounter: 0,
    facingLeft: false,
    bullets: [],
    health: 100
  };
  
  p2 = {
    x: 600,
    y: GROUND_Y,
    vy: 0,
    isJumping: false,
    currentAction: 'idle',
    currentFrame: 0,
    frameDelay: 5,
    frameCounter: 0,
    facingLeft: true,
    bullets: [],
    health: 100
  };
}

function updatePhysics(player) {
  // 應用重力
  player.vy += GRAVITY;
  player.y += player.vy;
  
  // 檢查地面碰撞
  if (player.y >= GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    player.isJumping = false;
    if (player.currentAction === 'jump') {
      player.currentAction = 'idle';
    }
  }
}

function updateBullets(shooter, target) {
  for (let i = shooter.bullets.length - 1; i >= 0; i--) {
    let bullet = shooter.bullets[i];
    bullet.update();
    bullet.draw();
    
    if (bullet.hits(target)) {
      target.health -= 10;
      shooter.bullets.splice(i, 1);
    }
    else if (bullet.x < 0 || bullet.x > width) {
      shooter.bullets.splice(i, 1);
    }
  }
}

function drawHealth() {
  // P1 生命值
  fill(255);
  text(`P1 Health: ${p1.health}`, 20, 30);
  fill(255, 0, 0);
  rect(20, 40, p1.health, 10);
  
  // P2 生命值
  fill(255);
  text(`P2 Health: ${p2.health}`, width - 120, 30);
  fill(255, 0, 0);
  rect(width - 120, 40, p2.health, 10);
}

function draw() {
  // 繪製背景
  image(sprites.background.img, 0, 0, width, height);
  
  // 更新物理
  updatePhysics(p1);
  updatePhysics(p2);
  
  // 更新和繪製子彈
  updateBullets(p1, p2);
  updateBullets(p2, p1);
  
  // 更新和繪製玩家
  updateAndDrawPlayer(p1, sprites.p1);
  updateAndDrawPlayer(p2, sprites.p2);
  
  // 繪製生命值
  drawHealth();
  
  checkKeys();
}

function updateAndDrawPlayer(player, playerSprites) {
  // 更新動畫
  player.frameCounter++;
  if (player.frameCounter >= player.frameDelay) {
    player.frameCounter = 0;
    player.currentFrame = (player.currentFrame + 1) % playerSprites[player.currentAction].frames;
  }
  
  // 繪製角色
  push();
  translate(player.x, player.y);
  
  if (player.facingLeft) {
    scale(-1, 1);
    translate(-playerSprites[player.currentAction].width, 0);
  }
  
  let currentSprite = playerSprites[player.currentAction];
  image(
    currentSprite.img,
    0, 0,
    currentSprite.width, currentSprite.height,
    currentSprite.width * player.currentFrame, 0,
    currentSprite.width, currentSprite.height
  );
  
  pop();
}

function checkKeys() {
  // P1 控制
  if (keyIsDown(81)) { // Q鍵 - 後退
    p1.currentAction = 'walk';
    p1.x -= MOVE_SPEED;
    p1.facingLeft = true;
  } else if (keyIsDown(87)) { // W鍵 - 前進
    p1.currentAction = 'walk';
    p1.x += MOVE_SPEED;
    p1.facingLeft = false;
  }
  
  if (keyIsDown(69) && !p1.isJumping) { // E鍵 - 跳躍
    p1.vy = JUMP_FORCE;
    p1.isJumping = true;
    p1.currentAction = 'jump';
  }
  
  // P2 控制
  if (keyIsDown(73)) { // I鍵 - 後退
    p2.currentAction = 'walk';
    p2.x -= MOVE_SPEED;
    p2.facingLeft = true;
  } else if (keyIsDown(79)) { // O鍵 - 前進
    p2.currentAction = 'walk';
    p2.x += MOVE_SPEED;
    p2.facingLeft = false;
  }
  
  if (keyIsDown(80) && !p2.isJumping) { // P鍵 - 跳躍
    p2.vy = JUMP_FORCE;
    p2.isJumping = true;
    p2.currentAction = 'jump';
  }
  
  // P1 射擊 (空白鍵)
  if (keyIsDown(32) && frameCount % 10 === 0) {
    let bulletX = p1.facingLeft ? p1.x - 20 : p1.x + 40;
    p1.bullets.push(new Bullet(bulletX, p1.y + 30, p1.facingLeft ? -1 : 1));
  }
  
  // P2 射擊 (Enter 鍵)
  if (keyIsDown(ENTER) && frameCount % 10 === 0) {
    let bulletX = p2.facingLeft ? p2.x - 20 : p2.x + 40;
    p2.bullets.push(new Bullet(bulletX, p2.y + 30, p2.facingLeft ? -1 : 1));
  }
  
  // 待機狀態檢查
  if (!keyIsDown(81) && !keyIsDown(87) && !p1.isJumping) {
    p1.currentAction = 'idle';
  }
  if (!keyIsDown(73) && !keyIsDown(79) && !p2.isJumping) {
    p2.currentAction = 'idle';
  }
}