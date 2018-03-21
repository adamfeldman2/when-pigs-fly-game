function isTouchDevice() {
  return 'ontouchstart' in document.documentElement ? (userOnTouchDevice = true) : (userOnTouchDevice = false);
}

function randomNum(min, max) {
  return Math.random() * (max - min) + min;
}

function displayLogoOnStartScreen() {
  var logo = new Image();
  logo.src = './images/title.png';
  cx.drawImage(logo, 40, 38, logo.naturalWidth / 1.8, logo.naturalHeight / 1.8);
}

function displayPlayButtonOnStartScreen() {
  var image = new Image();
  image.src = './images/play-btn-v1@2x.png';
  cx.drawImage(image, 83, 376, image.naturalWidth / 2.3, image.naturalHeight / 2.3);
}

function displayTextOnStartScreen() {
  // displays start screen text
  cx.save();
  cx.textAlign = 'center';
  cx.font = '14.5px flappyPaul';
  cx.fillStyle = '#666666';
  cx.fillText('Tap/Hold Screen To Fly', cWidth / 2, 320);
  cx.restore();

  // displays high score
  cx.save();
  cx.textAlign = 'center';
  cx.font = '18px flappyPaul';
  cx.fillStyle = '#0b4b66';
  cx.fillText(`High Score: $${highScore}M`, cWidth / 2, 352);
  cx.restore();

  // displays tagline - line 1
  cx.save();
  cx.textAlign = 'center';
  cx.font = '16.5px flappyPaul';
  cx.fillStyle = '#f59120';
  cx.fillText(`Collect Coins To Fill`, cWidth / 2, 266);
  cx.restore();

  // displays tagline - line 2
  cx.save();
  cx.textAlign = 'center';
  cx.font = '16.5px flappyPaul';
  cx.fillStyle = '#f59120';
  cx.fillText(`Up The Piggy Bank`, cWidth / 2, 288);
  cx.restore();
}

function textBackgroundDuringGame() {
  var image = new Image();
  image.src = './images/game-header-v1@2x.png';
  cx.drawImage(image, 0, 0, image.naturalWidth / 2, image.naturalHeight / 2);
}

function displayInitialsDuringGame() {
  cx.save();
  cx.font = '12px flappyPaul';
  cx.textAlign = 'end';
  cx.fillStyle = '#666666';
  cx.fillText(initials, 313, 22);
  cx.restore();
}

function displayGameRunningScore() {
  if (gamePlaying) {
    cx.textAlign = 'center';
    cx.font = '12px flappyPaul';
    cx.fillStyle = '#666';
    cx.fillText('Money: $' + score + 'M', cWidth / 2 + 15, 22);
  }
}

function displayLevel() {
  if (gamePlaying) {
    cx.textAlign = 'left';
    cx.font = '12px flappyPaul';
    cx.fillText('Level: ' + level, 7, 22);
  }
}

function displayLevelUp() {
  cx.fillStyle = '#747474';
  cx.textAlign = 'center';
  cx.font = '29px flappyPaul';
  cx.fillText('LEVEL UP!', cWidth / 2, 170);
}

function displayCoinOnePlus() {
  cx.fillStyle = '#747474';
  cx.textAlign = 'center';
  cx.font = '30px flappyPaul';
  cx.fillText('+$3', cWidth / 2, cHeight / 2);
}

function displayGameOverOverlay() {
  cx.save();
  cx.fillStyle = 'rgba(0,0,0,0.82)';
  cx.fillRect(0, 0, cWidth, cHeight);
  cx.restore();
}

function displayGameOverText(newHighScore) {
  cx.save();
  cx.fillStyle = '#FFF';
  cx.textAlign = 'center';
  cx.font = '23px flappyPaul';
  cx.fillText(newHighScore ? 'NEW HIGH SCORE' : 'GAME OVER', cWidth / 2 + 3, 185);
}

function displayGameOverScore() {
  cx.font = '15px flappyPaul';
  cx.fillText('Money Saved: $' + score + 'M', cWidth / 2, 218);
  cx.restore();
}

function androidLimitInitialsToThreeChars() {
  var initials = document.querySelector('.initials');

  if (initials.value.length >= 3) {
    initials.value = initials.value.substr(0, 3);
  }
}
