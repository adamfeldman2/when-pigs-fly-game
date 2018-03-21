/////////// constant variables ///////////
const canvas = document.querySelector('canvas');
const cx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 480;
const cWidth = canvas.width;
const initialsWrapper = document.querySelector('.initials-wrapper');
const initialsForm = document.querySelector('.initials-form');
const initialsInput = document.querySelector('.initials');
const replayButton = document.querySelector('.replay');
const cHeight = canvas.height;
const playerInitialX = 39;
const playerInitialY = 352;
const initialObstacleSpeed = 2.8;
const obstaclesToPassBeforeLevelUp = 5;
const levelUpSpeedIncrease = 0.165;
const coinStartPosition = 943;
const coinCollectSound = new Howl({ src: ['./sounds/coin-collect.mp3'], volume: 0.4 });
const levelUpSound = new Howl({ src: ['./sounds/level-up.mp3'], volume: 0.4 });
const crashSound = new Howl({ src: ['./sounds/crash.mp3'], volume: 0.4 });
const gameOverSound = new Howl({ src: ['./sounds/game-over.mp3'], volume: 0.4 });
const themeMusic = new Howl({ src: ['./sounds/theme.wav'], volume: 0.4, loop: true });
const midGameSounds = [
  new Howl({ src: ['./sounds/wee.wav'], volume: 0.4 }),
  new Howl({ src: ['./sounds/woohoo.wav'], volume: 0.4 })
];

/////////// updateable variables ///////////
let player;
let initials;
let userOnTouchDevice;
let gamePlaying = false;
let gameOver = false;
let score = -1;
let obstaclesPassed = -1;
let nextNumberOfObstaclesToPassBeforeLevelUp = obstaclesToPassBeforeLevelUp;
let obstacleOnScreen = false;
let coinOnScreen = false;
let highScore;
let level = 1;
let obstacleSpeed = initialObstacleSpeed;
let isLevelUpTextVisible = false;
let iscoinPlusOneTextVisible = false;
let gameOverSoundsHavePlayedOnce = false;

let protocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';

/////////// class declarations ///////////
class Player {
  constructor(startingX, startingY, color) {
    this.width;
    this.height;
    this.playerImage;
    this.color = color;
    this.x = startingX;
    this.y = startingY;
    this.speedY = 0;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.left_wings = [];
    this.wing_frame = 0;
    this.left_wing_img = null;

    var player = this;

    for (let i = 1; i <= 3; ++i) {
      var img_left = new Image();
      img_left.src = './images/wings/frame' + i + '.png';
      this.left_wings.push(img_left);
    }

    this.wing_frame = 0;
    this.left_wing_img = this.left_wings[0];

    setInterval(function() {
      player.wing_frame++;
      if (player.wing_frame >= 3) {
        player.wing_frame = 0;
      }
      player.left_wing_img = player.left_wings[player.wing_frame];
    }, 100);
  }

  getImage() {
    const image = new Image();
    image.src = './images/pig.png';
    this.playerImage = image;
  }

  updatePlayerPosition() {
    this.width = this.playerImage.naturalWidth / 2;
    this.height = this.playerImage.naturalHeight / 2;
    this.gravitySpeed += this.gravity;
    if (!gameOver) {
      this.y += this.speedY + this.gravitySpeed;
    } else {
      this.y = this.y;
    }
    cx.drawImage(this.playerImage, this.x, this.y, this.width, this.height);
    cx.drawImage(
      this.left_wing_img,
      this.x - 21,
      this.y - 7,
      this.left_wing_img.naturalWidth / 2,
      this.left_wing_img.naturalHeight / 2
    );
    this.preventPlayerLeaveScreen();
  }

  preventPlayerLeaveScreen() {
    if (this.y <= 0) {
      this.y = 0;
      this.gravitySpeed = 0;
    } else if (this.y >= cHeight - this.height) {
      this.y = cHeight - this.height;
      this.gravitySpeed = 0;
    }
  }

  fly(e, number) {
    e.preventDefault();
    if (!gameOver) {
      gamePlaying = true;
    }
    this.gravity = number;
  }
}

class Obstacle {
  constructor(height) {
    this.height = height;
    this.width = 20;
    this.color = '#f9632c';
    this.x;
    this.y;
    this.pattern = new Image();
    this.pattern.src = './images/pipe.png';
  }

  updateObstaclePosition(x, y) {
    this.x = x;
    this.y = y;

    cx.save();
    cx.drawImage(this.pattern, x, y);

    cx.restore();
  }

  isObstacleOnScreen() {
    if (this.x >= 0 - this.width && this.x <= cWidth) {
      obstacleOnScreen = true;
    } else {
      obstacleOnScreen = false;
    }
  }
}

class Coin {
  constructor() {
    this.radius = 11;
    this.x;
    this.y;
    this.image = new Image();
    this.image.src = './images/coin.png';
  }

  updateCoinPosition(x, y) {
    this.x = x;
    this.y = y;

    cx.save();

    cx.drawImage(this.image, x, y, 30, 30);

    cx.restore();
  }

  isCoinOnScreen() {
    if (this.x >= 0 - this.radius && this.x <= cWidth) {
      coinOnScreen = true;
    } else {
      coinOnScreen = false;
    }
  }
}

/////////// game functions ///////////
function incrementScore(amount) {
  score += amount;

  let data = {
    message: 'updateScore',
    score: score
  };
}

function getUserInitials() {
  if (localStorage.getItem('initials')) {
    initials = localStorage.getItem('initials');
  } else {
    initialsWrapper.style.display = 'flex';

    initialsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      initials = initialsInput.value.toUpperCase();
      localStorage.setItem('initials', initials);
      initialsWrapper.style.display = 'none';
    });
  }
}

function gameStartText() {
  if (!gamePlaying && !gameOver) {
    displayLogoOnStartScreen();
    displayPlayButtonOnStartScreen();
    displayTextOnStartScreen();
  }
}

function textDisplayedWhileGameIsPlaying() {
  if (gamePlaying) {
    textBackgroundDuringGame();
    displayGameRunningScore();
    displayInitialsDuringGame();
    displayLevel();
  }
}

function playMidGameSound() {
  var clip = midGameSounds[Math.floor(Math.random() * midGameSounds.length)];
  clip.play();
}

function handleLevelUp() {
  if (gamePlaying && obstaclesPassed >= nextNumberOfObstaclesToPassBeforeLevelUp) {
    level++;
    obstacleSpeed += +levelUpSpeedIncrease;
    nextNumberOfObstaclesToPassBeforeLevelUp += obstaclesToPassBeforeLevelUp;

    levelUpVisible();

    setTimeout(() => {
      playMidGameSound();
    }, 1700);

    levelUpSound.play();
  }
}

function levelUpVisible() {
  isLevelUpTextVisible = true;

  setTimeout(function() {
    isLevelUpTextVisible = false;
  }, 750);
}

function handleObstacleMovement() {
  if (gamePlaying) {
    if (obstacleOnScreen) {
      // move obstacle left based on obstacleSpeed
      obstacle.x -= obstacleSpeed;
      obstacle.updateObstaclePosition(obstacle.x, obstacle.y);
    } else {
      // once the obstacle leaves the screen score++ and reset obstacle to cycle again with random y coord
      incrementScore(1);
      obstaclesPassed++;
      obstacle.x = 320;
      obstacle.updateObstaclePosition(obstacle.x, randomNum(-50, cHeight - (obstacle.height - 50)));
    }
  } else {
    // stop moving obstacle when game ends
    obstacle.x = obstacle.x;
    obstacle.updateObstaclePosition(obstacle.x, obstacle.y);
  }
}

function handleCoinMovement() {
  if (gamePlaying) {
    if (coinOnScreen || (coin.x <= coinStartPosition && coin.x >= 50)) {
      coin.x -= obstacleSpeed;
      coin.updateCoinPosition(coin.x, coin.y);
    } else {
      coin.x = coinStartPosition;
      coin.updateCoinPosition(coin.x, randomNum(coin.radius, cHeight - coin.radius * 2));
    }
  } else {
    // stop moving obstacle when game ends
    coin.x = coin.x;
    coin.updateCoinPosition(coin.x, coin.y);
  }
}

function obstacleCollisionDetection() {
  const playerXFront = player.x + player.width;
  const playerYTop = player.y;
  const playerYBottom = player.y + player.height;
  const obstacleTop = obstacle.y;
  const obstacleBottom = obstacle.y + obstacle.height;

  if (
    playerXFront >= obstacle.x &&
    player.x <= obstacle.x &&
    playerYTop <= obstacleBottom &&
    playerYBottom >= obstacleTop
  ) {
    handleEndGame();

    if (!gameOverSoundsHavePlayedOnce) {
      crashSound.play();
      setTimeout(() => {
        gameOverSound.play();
      }, 150);
      gameOverSoundsHavePlayedOnce = true;
    }
  }
}

function coinCollisionDetection() {
  const playerXFront = player.x + player.width;
  const playerYTop = player.y;
  const playerYBottom = player.y + player.height;
  const coinTop = coin.y - coin.radius;
  const coinBottom = coin.y + coin.radius;
  const coinLeft = coin.x - coin.radius;
  const coinRight = coin.x + coin.radius;

  if (playerXFront >= coinLeft && player.x <= coinRight && playerYTop <= coinBottom && playerYBottom >= coinTop) {
    handleCoinCollect();
    coinOnePlusVisible();
    coinCollectSound.play();
  }
}

function handleCoinCollect() {
  incrementScore(3);
  coin.x = coinStartPosition;
}

function coinOnePlusVisible() {
  iscoinPlusOneTextVisible = true;

  setTimeout(function() {
    iscoinPlusOneTextVisible = false;
  }, 900);
}

function handleEndGame() {
  gameOver = true;
  gamePlaying = false;

  replayButton.style.display = 'block';
}

function gameOverText() {
  if (gameOver) {
    // check if new high score, save to variable
    const newHighScore = score > localStorage.getItem('userHighScore');

    displayGameOverOverlay();
    displayGameOverText(newHighScore);
    displayGameOverScore();
  }
}

function handleHighScore() {
  if (!localStorage.getItem('userHighScore')) {
    localStorage.setItem('userHighScore', 0);
  }

  highScore = localStorage.getItem('userHighScore');
}

function resetGame() {
  if (score > localStorage.getItem('userHighScore')) {
    highScore = score;
    localStorage.setItem('userHighScore', highScore);

    handleHighScore();
  }

  score = 0;
  obstaclesPassed = 0;
  nextNumberOfObstaclesToPassBeforeLevelUp = obstaclesToPassBeforeLevelUp;
  gameOver = false;
  gamePlaying = false;
  gameOverSoundsHavePlayedOnce = false;
  level = 1;
  obstacleSpeed = initialObstacleSpeed;
  player.x = playerInitialX;
  player.y = playerInitialY;
  player.gravity = 0;
  player.gravitySpeed = 0;
  player.updatePlayerPosition();
  replayButton.style.display = 'none';
  obstacle.updateObstaclePosition(320, randomNum(-50, cHeight - (obstacle.height - 50)));
  coin.updateCoinPosition(600, randomNum(coin.radius, cHeight - coin.radius));
}

function gameLoop() {
  cx.clearRect(0, 0, cWidth, cHeight);

  gameStartText();
  textDisplayedWhileGameIsPlaying();
  handleObstacleMovement();
  handleCoinMovement();
  handleLevelUp();
  obstacleCollisionDetection();
  coinCollisionDetection();

  if (isLevelUpTextVisible) {
    displayLevelUp();
  }

  if (iscoinPlusOneTextVisible) {
    displayCoinOnePlus();
  }

  player.updatePlayerPosition();
  obstacle.isObstacleOnScreen();
  coin.isCoinOnScreen();

  androidLimitInitialsToThreeChars();

  gameOverText();

  requestAnimationFrame(gameLoop);
}

/////////// init function ///////////
function init() {
  isTouchDevice();
  getUserInitials();
  handleHighScore();

  themeMusic.play();

  player = new Player(playerInitialX, playerInitialY, '#ea561f');
  player.getImage();
  obstacle = new Obstacle(310);
  coin = new Coin();

  canvas.addEventListener(`${userOnTouchDevice ? 'touchstart' : 'mousedown'}`, function(event) {
    // 2nd param is value of fly strength (lower number = more flying strength) //
    player.fly(event, -0.45);
  });
  canvas.addEventListener(`${userOnTouchDevice ? 'touchend' : 'mouseup'}`, function(event) {
    // 2nd param is value of gravity strength //
    player.fly(event, 0.13);
  });
  replayButton.addEventListener('click', resetGame);

  gameLoop();
}

/////////// call init function ///////////
init();
