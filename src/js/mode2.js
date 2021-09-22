var canvas = document.getElementById("mode2Canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1240;
canvas.height = 960; // y + scoreHeight + y + height*6 + y + resourceHeight + settingHeight + y*2
canvas.style = "border:1px solid #d3d3d3";
var radius = 30; // 모서리
// 간격
var x = 20;
var y = 20;
// 땅
var width = 100;
var height = 100;
// 터렛
var defenders = [];
var projectiles = []; // 총알
var tWidth = 80;
var tHeight = 80;
var tName = ["학문 수양", "char", "short", "int", "double"];
var tColor = ["#ebc0c0", "#cee8d4", "#A2D4B1", "#6cbb85", "#49a065"];
var tFont = "Spoqa Han Sans Neo, sans-serif";
var tNameX = [3, 20, 17, 28, 9]; // 터렛 이름 x 시작 좌표
var tNameY = 48; // 터렛 이름 y 시작 좌표
var price = [30, 60, 90, 120, 150]; // 터렛 가격
var power = [20, 10, 20, 30, 40]; // 학문수양+20학점, 터렛 공격력들
// 적
var enemies = [];
var eWidth = 60;
var eHeight = 60;
var enemyHealth = [30, 60, 90, 120, 150]; // 적 체력
var enemyImg = [
  "img/enemy1.png",
  "img/enemy2.png",
  "img/enemy3.png",
  "img/enemy4.png",
  "img/enemy5.png"
];
// 점수
var score = 0;
var scoreWidth = 300;
var scoreHeight = 50;
// 학점(자원)
var resources = 150;
// 틀
const gameGrid = [];
const settingCell = [];
// 게임 시간
var gameTime = 60; // 게임 시간 : 60초
var frame = 0; // frame 100 = 1초보다 조금 느림
var start; // 게임 시작 시간 (start = new Date();)

var tNum = 0; // 선택한 터렛의 번호 (터렛 고유 번호 : 1(학문수양), 2(char), 3(short), 4(int), 5(double))
var gameStatus = 0; // 게임 상태 : 0(게임 중), 1(패배), 2(승리)
var level = 0; // 게임 난이도 : 0(게임 시작 전), 1(easy), 2(normal), 3(hard)
var speed = [1, 1.01, 1.015]; // 적 속도

// 마우스
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
  let canvasPosition = canvas.getBoundingClientRect();
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

// 마우스 클릭 구분
var mouseIsDown = false;
canvas.onmousedown = function () {
  mouseIsDown = true;
};
canvas.onmouseup = function () {
  mouseIsDown = false;
};

// 사각형 공간 그리기
function drawSquare(x, y, width, height) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

// 땅
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = tWidth;
    this.height = tHeight;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      // 마우스와 터렛 설치 위치가 닿을 때만 stroke 가시화
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#C4C4C4";
      drawSquare(this.x, this.y, this.width, this.height);
      ctx.stroke();
      ctx.closePath();
    }
  }
}
function createGrid() {
  for (
    var Gridy = 2.5 * y + scoreHeight;
    Gridy < 2 * y + scoreHeight + 6 * height;
    Gridy += height
  ) {
    for (var Gridx = 1.5 * x; Gridx < x + 12 * width; Gridx += width) {
      gameGrid.push(new Cell(Gridx, Gridy));
    }
  }
}
createGrid();
function handleGameGrid() {
  for (var i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

// 터렛 선택 메뉴 동작
class SettingCell extends Cell {
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "black";
      drawSquare(this.x, this.y, this.width, this.height);
      ctx.stroke();
      ctx.closePath();
    }
  }
  click(e) {
    if (collision(this, mouse) && mouseIsDown) {
      tNum = e + 1; // 터렛 고유 번호 : 1(학문수양), 2(char), 3(short), 4(int), 5(double)
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "black";
      ctx.fillStyle = "white";
      drawSquare(this.x, this.y, this.width, this.height);
      ctx.fill();
      ctx.closePath();
    }
  }
}
function createSettingGrid() {
  for (var x = 80, i = 0; i < 5; x += 120, i++) {
    settingCell.push(new SettingCell(x, 800));
  }
}
createSettingGrid();
function drawSettingGrid() {
  for (var i = 0; i < 5; i++) {
    settingCell[i].draw();
    settingCell[i].click(i);
  }
}

// 총알
class Projectile {
  constructor(x, y, power) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = power;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}
function handleProjectiles() {
  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();
    // 총알과 적 충돌 코드
    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        collision(projectiles[i], enemies[j])
      ) {
        // 발사체와 적이 충돌
        enemies[j].health -= projectiles[i].power; // 적의 체력을 발사체의 power만큼 깎음
        projectiles.splice(i, 1); // 발사체 제거
        i--;
      }
    }
    if (projectiles[i] && projectiles[i].x > canvas.width - 40) {
      // 총알이 캔버스를 넘어가면 삭제
      projectiles.splice(i, 1);
      i--;
    }
  }
}

// 터렛
class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = tWidth;
    this.height = tHeight;
    this.shooting = false;
    this.health = 100;
    this.projectiles = []; // 발사체(총알)
    this.timer = 0;
    this.second = 0;
  }
}
class Study extends Defender {
  draw() {
    ctx.beginPath();
    ctx.fillStyle = tColor[0];
    drawSquare(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 20);

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(tName[0], this.x + tNameX[0], this.y + tNameY);
  }
  update() {
    this.second++;
    if (this.second % 150 === 0) {
      resources += power[0];
    }
  }
}
class Char extends Defender {
  draw() {
    ctx.beginPath();
    ctx.fillStyle = tColor[1];
    drawSquare(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 20);

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(tName[1], this.x + tNameX[1], this.y + tNameY);
  }
  update() {
    this.timer++;
    if (this.timer % 100 === 0) {
      // 일정 간격마다 총알 생성
      projectiles.push(new Projectile(this.x + 70, this.y + 40, power[1]));
    }
  }
}
class Short extends Defender {
  draw() {
    ctx.beginPath();
    ctx.fillStyle = tColor[2];
    drawSquare(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 20);

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(tName[2], this.x + tNameX[2], this.y + tNameY);
  }
  update() {
    this.timer++;
    if (this.timer % 100 === 0) {
      // 일정 간격마다 총알 생성
      projectiles.push(new Projectile(this.x + 70, this.y + 40, power[2]));
    }
  }
}
class Int extends Defender {
  draw() {
    ctx.beginPath();
    ctx.fillStyle = tColor[3];
    drawSquare(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 20);

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(tName[3], this.x + tNameX[3], this.y + tNameY);
  }
  update() {
    this.timer++;
    if (this.timer % 100 === 0) {
      // 일정 간격마다 총알 생성
      projectiles.push(new Projectile(this.x + 70, this.y + 40, power[3]));
    }
  }
}
class Double extends Defender {
  draw() {
    ctx.beginPath();
    ctx.fillStyle = tColor[4];
    drawSquare(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 20);

    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(tName[4], this.x + tNameX[4], this.y + tNameY);
  }
  update() {
    this.timer++;
    if (this.timer % 100 === 0) {
      // 일정 간격마다 총알 생성
      projectiles.push(new Projectile(this.x + 70, this.y + 40, power[4]));
    }
  }
}

canvas.addEventListener("click", function () {
  // 격자무늬 클릭시 타워 생성하는 함수
  if (tNum !== 0) {
    // 터렛을 선택한 후에만 작동
    var gridPositionX = mouse.x - ((mouse.x - x) % width) + 0.5 * x;
    // 마우스의 x 좌표를 이용하여 터렛이 생성될 수 있는 좌표 계산
    var gridPositionY =
      mouse.y - ((mouse.y - (2 * y + scoreHeight)) % height) + 0.5 * y;
    // 마우스의 y 좌표를 이용하여 터렛이 생성될 수 있는 좌표 계산
    if (mouse.x < x || mouse.y < 2 * y + scoreHeight) return;
    // 터렛 생성구역을 벗어난 좌측 or 상단 클릭시 return하여 밑 실행 x
    if (
      gridPositionX > x + 12 * width ||
      gridPositionY > 2 * y + scoreHeight + 6 * height
    )
      return;
    // 터렛 생성구역을 벗어난 우측 or 하단 클릭시 return하여 밑 실행 x
    for (var i = 0; i < defenders.length; i++) {
      if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
        return;
      // 이미 터렛이 생성된 곳엔 터렛 생성 불가능하게 함
    }
    if (resources >= price[tNum - 1]) {
      // 가진 resource보다 터렛 비용이 크면 생성불가
      if (tNum === 1) {
        defenders.push(new Study(gridPositionX, gridPositionY));
      } else if (tNum === 2) {
        defenders.push(new Char(gridPositionX, gridPositionY));
      } else if (tNum === 3) {
        defenders.push(new Short(gridPositionX, gridPositionY));
      } else if (tNum === 4) {
        defenders.push(new Int(gridPositionX, gridPositionY));
      } else if (tNum === 5) {
        defenders.push(new Double(gridPositionX, gridPositionY));
      }
      resources -= price[tNum - 1];
    }
    tNum = 0; // 사용자 선택 초기화
  }
});
function handleDefenders() {
  for (var i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update(); // 총알 생성
    for (let j = 0; j < enemies.length; j++) {
      // 적, 타워 충돌코드
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        // 타워가 존재할 때 && 타워와 적이 부딪혔을때
        enemies[j].movement = 0; // 적 속도 0
        defenders[i].health -= 1; // 타워 체력 줄임
      }
      if (defenders[i] && defenders[i].health <= 0) {
        // 타워가 존재할때 && 타워 체력이 없을때
        defenders.splice(i, 1); // 타워 제거
        i--;
        enemies[j].movement = enemies[j].speed; // 적 속도 원래대로 돌림
      }
    }
  }
}

// 적
class Enemy {
  constructor(verticalPosition, index) {
    this.x = x + 11 * width;
    this.y = verticalPosition;
    this.width = eWidth;
    this.height = eHeight;
    this.speed = speed[level - 1]; // 속도 easy:1, normal:1.2, hard:1.4
    this.movement = this.speed;
    this.health = enemyHealth[index];
    this.maxHealth = this.health;
    this.index = index;
  }
  update() {
    this.x -= this.movement;
  }
  draw() {
    var image = new Image();
    image.src = enemyImg[this.index];
    ctx.drawImage(image, this.x, this.y);
    ctx.fillStyle = "black";
    ctx.font = "20px " + tFont;
    ctx.fillText(Math.floor(this.health), this.x + 18, this.y + 20);
  }
}

function handleEnemies() {
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].update(); // 적 이동
    enemies[i].draw(); // 적 그리기
    if (enemies[i].x < x) {
      gameStatus = 1; // 적이 왼쪽 벽에 닿으면 게임 종료
    }
    if (enemies[i].health <= 0) {
      // 적의 체력이 0보다 작거나 같을때
      var gainedResources = enemies[i].maxHealth / 10; // 적을 제거했을 때 자원 획득
      resources += gainedResources;
      score += gainedResources;
      enemies.splice(i, 1); // 적 제거
      i--;
    }
  }
  var now = new Date();
  var sec = Math.floor((now - start) / 1000); // 게임 후 지난 시간
  if (frame % 300 === 0) {
    // frame이 n의 배수가 되면 적 생성 ex) n이 150이라면 3초에 한번씩 생성
    let verticalPosition =
      Math.floor(Math.random() * 6) * height + 3 * y + scoreHeight;
    // 적 생성 y 좌표 랜덤배치
    var num; // 적 생성 인덱스 범위
    if (sec <= 10) {
      num = 2;
    } // 게임 시작 후 10초 이전
    else if (sec <= 30) {
      num = 4;
    } // 게임 시작 후 30초 이전
    else {
      num = 5;
    }
    let randomIndex = Math.floor(Math.random() * num);
    enemies.push(new Enemy(verticalPosition, randomIndex));
  }
}

// 충돌 기준
function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}

// 틀
function drawScore() {
  ctx.beginPath();
  ctx.fillStyle = "#F3F3F3";
  drawSquare(x, y, scoreWidth, scoreHeight);
  ctx.fill();
  ctx.closePath();
}
function printScore() {
  // score 출력
  ctx.fillStyle = "black";
  ctx.font = "25px " + tFont;
  ctx.fillText("score : " + score, x * 5, y + 33);
}

function drawTime() {
  // 게임 시간 출력
  var xPos = 920;
  ctx.beginPath();
  ctx.fillStyle = "#F3F3F3";
  drawSquare(xPos, y, scoreWidth, scoreHeight);
  ctx.fill();
  ctx.closePath();

  var now = new Date();
  var curSec = gameTime - Math.floor((now - start) / 1000);
  ctx.fillStyle = "black";
  ctx.font = "25px " + tFont;
  ctx.fillText(curSec + "초", xPos + 115, y + 33);

  if (curSec === 0) {
    gameStatus = 2; // 승리
  }
}

function drawPattern1() {
  // 1번째 행 패턴 구현
  ctx.beginPath();
  ctx.fillStyle = "#F3F3F3";
  ctx.moveTo(x + radius, y * 2 + scoreHeight);
  ctx.lineTo(x + width, y * 2 + scoreHeight);
  ctx.lineTo(x + width, y * 2 + scoreHeight + height);
  ctx.lineTo(x, y * 2 + scoreHeight + height);
  ctx.lineTo(x, y * 2 + scoreHeight + radius);
  ctx.quadraticCurveTo(x, y * 2 + scoreHeight, x + radius, y * 2 + scoreHeight); // 모서리
  ctx.fill();
  ctx.closePath();

  for (var i = 1; i < 11; i++) {
    ctx.beginPath();
    ctx.fillStyle = "#F3F3F3";
    ctx.moveTo(x + width * i, y * 2 + scoreHeight);
    ctx.lineTo(x + width * (i + 1), y * 2 + scoreHeight);
    ctx.lineTo(x + width * (i + 1), y * 2 + scoreHeight + height);
    ctx.lineTo(x + width * i, y * 2 + scoreHeight + height);
    ctx.lineTo(x + width * i, y * 2 + scoreHeight);
    if (i % 2 === 0) {
      ctx.fill();
    } // 홀수 열만 색 적용
    ctx.closePath();
  }
  ctx.beginPath();
  ctx.fillStyle = "#F3F3F3";
  ctx.moveTo(x + width * 11, y * 2 + scoreHeight);
  ctx.lineTo(x + width * 12 - radius, y * 2 + scoreHeight);
  ctx.quadraticCurveTo(
    x + width * 12,
    y * 2 + scoreHeight,
    x + width * 12,
    y * 2 + scoreHeight + radius
  ); // 모서리
  ctx.lineTo(x + width * 12, y * 2 + scoreHeight + height);
  ctx.lineTo(x + width * 11, y * 2 + scoreHeight + height);
  ctx.lineTo(x + width * 11, y * 2 + scoreHeight);
  ctx.closePath();
}
function drawPattern2() {
  // 2 ~ 5번째 행 패턴 구현
  for (var j = 1; j < 5; j++) {
    for (var i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.fillStyle = "#F3F3F3";
      ctx.moveTo(x + width * i, y * 2 + scoreHeight + height * j);
      ctx.lineTo(x + width * (i + 1), y * 2 + scoreHeight + height * j);
      ctx.lineTo(x + width * (i + 1), y * 2 + scoreHeight + height * (j + 1));
      ctx.lineTo(x + width * i, y * 2 + scoreHeight + height * (j + 1));
      ctx.lineTo(x + width * i, y * 2 + scoreHeight + height * j);
      if (j % 2 === 1) {
        // 짝수행
        if (i % 2 === 1) {
          ctx.fill();
        } // 짝수행에서는 짝수열만 색 적용
      }
      if (j % 2 === 0) {
        // 홀수행
        if (i % 2 === 0) {
          ctx.fill();
        } // 홀수행에서는 홀수열만 색 적용
      }
      ctx.closePath();
    }
  }
}
function drawPattern3() {
  // 6번째 행 패턴 구현
  ctx.beginPath();
  ctx.fillStyle = "#F3F3F3";
  ctx.moveTo(x, y * 2 + scoreHeight + height * 5);
  ctx.lineTo(x + width, y * 2 + scoreHeight + height * 5);
  ctx.lineTo(x + width, y * 2 + scoreHeight + height * 6);
  ctx.lineTo(x + radius, y * 2 + scoreHeight + height * 6);
  ctx.quadraticCurveTo(
    x,
    y * 2 + scoreHeight + height * 6,
    x,
    y * 2 + scoreHeight + height * 6 - radius
  ); // 모서리
  ctx.lineTo(x, y * 2 + scoreHeight + height * 6);
  ctx.closePath();
  for (var i = 1; i < 11; i++) {
    ctx.beginPath();
    ctx.fillStyle = "#F3F3F3";
    ctx.moveTo(x + width * i, y * 2 + scoreHeight + height * 5);
    ctx.lineTo(x + width * (i + 1), y * 2 + scoreHeight + height * 5);
    ctx.lineTo(x + width * (i + 1), y * 2 + scoreHeight + height * 6);
    ctx.lineTo(x + width * i, y * 2 + scoreHeight + height * 6);
    ctx.lineTo(x + width * i, y * 2 + scoreHeight + height * 5);
    if (i % 2 === 1) {
      ctx.fill();
    } // 짝수 열만 색 적용
    ctx.closePath();
  }
  ctx.beginPath();
  ctx.fillStyle = "#F3F3F3";
  ctx.moveTo(x + width * 11, y * 2 + scoreHeight + height * 5);
  ctx.lineTo(x + width * 12, y * 2 + scoreHeight + height * 5);
  ctx.lineTo(x + width * 12, y * 2 + scoreHeight + height * 6 - radius);
  ctx.quadraticCurveTo(
    x + width * 12,
    y * 2 + scoreHeight + height * 6,
    x + width * 12 - radius,
    y * 2 + scoreHeight + height * 6
  );
  // 모서리
  ctx.lineTo(x + width * 11, y * 2 + scoreHeight + height * 6);
  ctx.lineTo(x + width * 11, y * 2 + scoreHeight + height * 5);
  ctx.fill();
  ctx.closePath();
}
function drawMenu() {
  // 학점(자원) + 터렛 선택 메뉴
  var resourceWidth = 400;
  var resourceHeight = 50;
  var settingWidth = 680;
  var settingHeight = 180;
  var yPos = y * 3 + scoreHeight + height * 6; // (x,710) 60+600+50

  ctx.beginPath();
  ctx.fillStyle = "#F3F3F3";
  ctx.strokeStyle = "#C4C4C4";
  ctx.moveTo(x + radius, yPos);
  ctx.lineTo(x + resourceWidth - radius, yPos);
  ctx.quadraticCurveTo(
    x + resourceWidth,
    yPos,
    x + resourceWidth,
    yPos + radius
  );
  ctx.lineTo(x + resourceWidth, yPos + resourceHeight);
  ctx.lineTo(x + settingWidth - radius, yPos + resourceHeight);
  ctx.quadraticCurveTo(
    x + settingWidth,
    yPos + resourceHeight,
    x + settingWidth,
    yPos + resourceHeight + radius
  );
  ctx.lineTo(x + settingWidth, yPos + resourceHeight + settingHeight - radius);
  ctx.quadraticCurveTo(
    x + settingWidth,
    yPos + resourceHeight + settingHeight,
    x + settingWidth - radius,
    yPos + resourceHeight + settingHeight
  );
  ctx.lineTo(x + radius, yPos + resourceHeight + settingHeight);
  ctx.quadraticCurveTo(
    x,
    yPos + resourceHeight + settingHeight,
    x,
    yPos + resourceHeight + settingHeight - radius
  );
  ctx.lineTo(x, yPos + radius);
  ctx.quadraticCurveTo(x, yPos, x + radius, yPos);
  ctx.fill();
  ctx.closePath();
}
function printResources() {
  // 학점(자원) 출력
  ctx.fillStyle = "black";
  ctx.font = "20px " + tFont;
  ctx.fillText("학점 : " + resources, x + 150, 710 + 40);
}

function drawSetting() {
  var xPos = 80; // x + x*3
  var yPos = 800; // y + scoreHeight + y + height*6 + y + resourceHeight + 40
  for (var i = 0; i < tName.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = tColor[i];
    drawSquare(xPos, yPos, tWidth, tHeight);
    ctx.fill();
    ctx.closePath();
    // 터렛 이름 출력
    ctx.fillStyle = "black";
    if (i === 0) {
      ctx.font = "19px " + tFont;
      ctx.fillText(tName[i], xPos + tNameX[i], yPos + tNameY);
    } else {
      ctx.font = "20px " + tFont;
      ctx.fillText(tName[i], xPos + tNameX[i], yPos + tNameY);
    }
    // 터렛 가격 출력
    ctx.font = "16px " + tFont;
    ctx.fillText(price[i] + " 학점", xPos + 12, yPos + 80 + 20);

    xPos += 120;
  }
}

// 게임 승리 / 패배 시 동작
function handleGameStatus() {
  if (gameStatus === 1) {
    // 패배
    saveRank("mode2", score);
    level = 0;
    restart();
    alert("GAME OVER");
    score = 0;
    menuContainer.style.display = "flex";
    mode2.style.display = "none";
  }
  if (gameStatus === 2) {
    // 승리
    if (level === 1) {
      level++;
      restart();
      alert("LEVEL 1 CLEAR\n(확인을 누르면 LEVEL 2 시작)");
      startGame();
    } else if (level === 2) {
      level++;
      restart();
      alert("LEVEL 2 CLEAR\n(확인을 누르면 LEVEL 3 시작)");
      startGame();
    } else if (level === 3) {
      level = 0;
      saveRank("mode2", score);
      restart();
      alert("GAME COMPLETE\n획득 점수 : " + score + "점");
      score = 0;
      menuContainer.style.display = "flex";
      mode2.style.display = "none";
    }
  }
}

// 게임 중 동작
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
  drawScore();
  printScore();
  drawTime();
  drawPattern1();
  drawPattern2();
  drawPattern3();
  drawMenu();
  printResources();
  drawSetting();
  drawSettingGrid();
  handleGameGrid();
  handleDefenders();
  handleProjectiles();
  handleEnemies();
  handleGameStatus();
  frame++;

  if (gameStatus === 0) {
    // 게임 중일 경우 draw 반복 실행
    requestAnimationFrame(draw);
  }
}

// 초기화 함수
function restart() {
  resources = 150;
  frame = 0;
  defenders = [];
  enemies = [];
  projectiles = [];
}

// 게임 시작
function startGame() {
  gameStatus = 0;
  frame = 0;
  start = new Date();
  if (level === 0) {
    level = 1;
  }
  draw();
}
// startGame();

var menuContainer = document.querySelector(".menu-container");
var mode2Btn = document.getElementById("mode2");
var mode2 = document.querySelector(".mode2");

mode2Btn.addEventListener("click", () => {
  menuContainer.style.display = "none";
  mode2.style.display = "flex";
  alert(
    "< 대학원생 모드 >\n다가오는 과제들로부터 코드를 통해 자신을 지키세요!\n\n기본 150학점이 주어지며, 학점으로 터렛들을 구매하실 수 있습니다.\n\n* 터렛 (체력 : 100)\n[학문 수양] 3초당 +20학점 / 가격 : 30학점\n[char] 공격력 : 10 / 가격 : 60학점\n[short] 공격력 : 20 / 가격 : 90학점\n[int] 공격력 : 30 / 가격 : 120학점\n[double] 공격력 : 40 / 가격 : 150학점\n\n* 과제\n[PYTHON] 체력 : 30\n[SWIFT] 체력 : 60\n[JAVA] 체력 : 90\n[R] 체력 : 120\n[MYSQL] 체력 : 150\n\n(무찌른 적의 체력/10)만큼 점수와 학점을 획득하실 수 있습니다.\n한 게임은 60초동안 진행되며, LEVEL 1, 2, 3 순차적으로 진행됩니다.\n\n확인을 누르면 게임을 시작합니다!"
  );
  startGame();
});
