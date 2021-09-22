// 타이머 // 블럭 생성o // 마우스 위치에 따른 패드 움직임o
// 공의 움직임 : 벽o, 블럭o, 패드o, 블럭 부술 시 카운트o, 아이템 획득 시 크기 변경o
// 스코어링(블럭 카운트o + 시간o) // 목숨o // 게임 종료 조건 : 모두 클리어o, 벽돌이 패드에 닿거나o, 목숨을 모두 잃거나o
// 아이템o : 시간마다 나오는 아이템을 패드를 움직여 획득, 효과 : 패드의 길이 증가, 공의 크기 증가
// 난이도o : 블럭 부순 개수를 기준으로 난이도 증가, 블럭 생성 속도 증가 + 2단계 블럭 증가
// 수강과목명 블럭에 표시o
function mode1_() {
  var canvas = document.getElementById("mode1Canvas");
  var ctx = canvas.getContext("2d");
  canvas.style.border = "1px";
  var paddleHeight = 19;
  var paddleWidth = 300;

  var LIFE; // PLAYER HAS 3 LIVES
  var SCORE;
  var seconds;
  var LEVEL;
  const MAX_LEVEL = 3;
  var GAME_OVER;
  var BrickInterval;

  //create paddle
  var paddle = {
    x: (canvas.width - paddleWidth) / 2,
    y: canvas.height - (47 + paddleHeight),
    width: paddleWidth,
    height: paddleHeight,
    dx: 5
  };
  var ballRadius = 18;
  var ballOffSetY = paddle.y - ballRadius;
  var ballOffSetX = canvas.width / 2;

  var velocity = 8;

  function reset() {
    clearInterval(interval1);
    clearInterval(interval5);
    items = [];
    brick.row = 4;
    createBricks();
    LIFE = 3;
    SCORE = 0;
    seconds = 0;
    LEVEL = 1;
    GAME_OVER = false;
    BrickInterval = 35;
    velocity = 8;
    resetBall();
    ball.speed = velocity * Math.sqrt(2);
    ball.radius = ballRadius;
    paddle.width = paddleWidth;
  }

  function drawPaddle() {
    ctx.fillStyle = padColor;
    roundRect(
      ctx,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height,
      10,
      true,
      false
    );
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
    ctx.closePath();
  }

  document.addEventListener("mousemove", mouseMoveHandler, false);
  function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (
      relativeX > paddle.width / 2 &&
      relativeX < canvas.width - paddle.width / 2
    ) {
      paddle.x = relativeX - paddle.width / 2;
    }
  }
  const ball = {
    x: ballOffSetX,
    y: ballOffSetY,
    radius: ballRadius,
    speed: velocity * Math.sqrt(2),
    dx: velocity,
    dy: -velocity
  };
  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
  }
  function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
  }

  // BALL AND WALL COLLISION DETECTION
  function ballWallCollision() {
    if (
      ball.x + ball.radius + ball.dx > canvas.width ||
      ball.x - ball.radius + ball.dx < 0
    ) {
      ball.dx = -ball.dx;
      playSound("wallSound", 0.2);
    }

    if (ball.y - ball.radius + ball.dy < 0) {
      ball.dy = -ball.dy;
      playSound("wallSound", 0.2);
    }

    if (ball.y + ball.radius + ball.dy > canvas.height) {
      LIFE--; // LOSE LIFE
      playSound("bottomSound", 1.0);
      resetBall();
    }
  }

  // RESET THE BALL
  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - ballRadius;
    ball.dx = velocity;
    ball.dy = -velocity;
  }

  // BALL AND PADDLE COLLISION
  function ballPaddleCollision() {
    if (
      ball.x - ball.radius + ball.dx < paddle.x + paddle.width &&
      ball.x + ball.radius + ball.dx > paddle.x &&
      ball.y + ball.radius + ball.dy < paddle.y + paddle.height &&
      ball.y + ball.radius + ball.dy > paddle.y
    ) {
      // CHECK WHERE THE BALL HIT THE PADDLE
      var collidePoint = ball.x - (paddle.x + paddle.width / 2);

      // NORMALIZE THE VALUES
      collidePoint = collidePoint / (paddle.width / 2);

      // CALCULATE THE ANGLE OF THE BALL
      var angle = (collidePoint * Math.PI) / 3;

      ball.dx = ball.speed * Math.sin(angle);
      ball.dy = -ball.speed * Math.cos(angle);
      playSound("paddleSound", 1.0);
    }
  }
  var brick = {
    row: 4,
    column: 8,
    width: 116,
    height: 61,
    border: 4,
    offSetLeft: 32,
    offSetTop: 32,
    padding: 10,
    fillColor: "white",
    strokeColor: "#CCCCCC"
  };
  var bricks = [];

  function createBricks() {
    for (var r = 0; r < brick.row; r++) {
      bricks[r] = [];
      for (var c = 0; c < brick.column; c++) {
        var randNum = Math.floor(Math.random() * subject.length);
        bricks[r][c] = {
          x: c * (brick.padding + brick.width) + brick.offSetLeft,
          y: r * (brick.padding + brick.height) + brick.offSetTop,
          status: 1,
          name: subject[randNum]
        };
      }
    }
  }

  function addNewBricks() {
    brick.row++;
    bricks[brick.row - 1] = [];
    for (var r = brick.row - 1; r > 0; r--) {
      for (var c = 0; c < brick.column; c++) {
        bricks[r][c] = {
          x: bricks[r - 1][c].x,
          y: bricks[r - 1][c].y + (brick.padding + brick.height),
          status: bricks[r - 1][c].status,
          name: bricks[r - 1][c].name
        };
      }
    }
    for (c = 0; c < brick.column; c++) {
      var randNum = Math.floor(Math.random() * subject.length);
      bricks[0][c] = {
        x: c * (brick.padding + brick.width) + brick.offSetLeft,
        y: 0 * (brick.padding + brick.height) + brick.offSetTop,
        status: 1,
        name: subject[randNum]
      };
    }
    if (LEVEL === 2) {
      var enhanced = [];
      for (var i = 0; i < 2; i++) {
        enhanced[i] = Math.floor(Math.random() * 8);
        for (var j = 0; j < i; j++) {
          if (enhanced[i] === enhanced[j]) {
            i--;
          }
        }
      }
      for (i = 0; i < 2; i++) {
        bricks[0][enhanced[i]].status = 2;
      }
    }
    if (LEVEL === 3) {
      enhanced = [];
      for (i = 0; i < 3; i++) {
        enhanced[i] = Math.floor(Math.random() * 8);
        for (j = 0; j < i; j++) {
          if (enhanced[i] === enhanced[j]) {
            i--;
          }
        }
      }
      for (i = 0; i < 3; i++) {
        bricks[0][enhanced[i]].status = 2;
      }
    }

    drawBricks();
  }

  // draw the bricks
  function drawBricks() {
    for (var r = 0; r < brick.row; r++) {
      for (var c = 0; c < brick.column; c++) {
        var b = bricks[r][c];
        // if the brick isn't broken
        if (b.status === 1) {
          ctx.lineWidth = brick.border;
          ctx.strokeStyle = "#CCCCCC";
          roundRect(ctx, b.x, b.y, brick.width, brick.height, 10, false, true);
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(b.name, b.x + 11, b.y + 24);
          ctx.font = "normal 16px Arial";
          ctx.fillStyle = "#555555";
          ctx.fillText("상태 :", b.x + 11, b.y + 46);
          ctx.fillStyle = "#FF8C40";
          ctx.fillText("미제출", b.x + 56, b.y + 46);
        }
        if (b.status === 2) {
          ctx.lineWidth = brick.border;
          ctx.strokeStyle = "black";
          roundRect(ctx, b.x, b.y, brick.width, brick.height, 10, false, true);
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(b.name, b.x + 11, b.y + 24);
          ctx.font = "normal 16px Arial";
          ctx.fillStyle = "#555555";
          ctx.fillText("상태 :", b.x + 11, b.y + 46);
          ctx.fillStyle = "#FF8C40";
          ctx.fillText("미제출", b.x + 56, b.y + 46);
        }
      }
    }
  }

  // ball brick collision
  function ballBrickCollision() {
    for (var r = 0; r < brick.row; r++) {
      for (var c = 0; c < brick.column; c++) {
        var b = bricks[r][c];
        // if the brick isn't broken
        if (b.status > 0) {
          if (
            ball.x + ball.radius + ball.dx > b.x &&
            ball.x - ball.radius + ball.dx < b.x + brick.width &&
            ball.y + ball.radius + ball.dy > b.y &&
            ball.y - ball.radius + ball.dy < b.y + brick.height
          ) {
            ball.dy = -ball.dy;
            b.status--; // the durability of bricks is reduced
            SCORE++;
            playSound("brickSound", 1.0);
          }
        }
      }
    }
  }

  function playSound(sound, volume) {
    var audio = document.getElementById(sound);

    if (audio.src != "") {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
  }

  function showGameStats(text, textX, textY) {
    // draw text
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(text, textX, textY);

    // draw image
    // ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
  }
  function time() {
    seconds += 1;
  }

  var interval1;
  var interval5;
  function startTimer() {
    interval1 = setInterval(function () {
      time();
      checkBrickInterval();
      brickPaddleCollision();
    }, 1000);
    interval5 = setInterval(createItem, 5000);
  }

  // DRAW FUNCTION
  function draw() {
    drawPaddle();

    drawBall();

    drawBricks();

    // SHOW SCORE
    showGameStats("Score:" + SCORE, 35, 25);
    // SHOW LIVES
    showGameStats("Life: " + LIFE, canvas.width - 100, 25);
    // SHOW LEVEL
    showGameStats("Timer: " + seconds, canvas.width - 200, 25);

    showGameStats("Level: " + LEVEL, canvas.width / 2, 25);
  }

  // game over
  function gameOver() {
    if (LIFE <= 0) {
      showYouLose();
      GAME_OVER = true;
    }
  }

  // level up
  function levelUp() {
    var isLevelDone = true;

    // check if all the bricks are broken
    for (var r = 0; r < brick.row; r++) {
      for (var c = 0; c < brick.column; c++) {
        isLevelDone = isLevelDone && bricks[r][c].status === 0;
      }
    }

    if (isLevelDone) {
      if (LEVEL >= MAX_LEVEL) {
        showYouWin();
        GAME_OVER = true;
        return;
      }
      playSound("levelUpSound", 1.0);
      seconds = 0;
      createBricks();
      ball.speed += 0.5;
      brick.row = 4;
      resetBall();
      LEVEL++;
      setBrickInterval();
    }
  }

  function setBrickInterval() {
    if (LEVEL === 2) {
      BrickInterval = 32;
    } else if (LEVEL === 3) {
      BrickInterval = 30;
    }
  }

  //add bricks at regular intervals according to level.
  function checkBrickInterval() {
    if (seconds % BrickInterval === 0 && seconds > 0) {
      addNewBricks();
    }
  }

  function brickPaddleCollision() {
    if (brick.row < 10) {
      return;
    }
    for (var c = 0; c < brick.column; c++) {
      if (bricks[9][c].status > 0) {
        showYouLose();
        reset();
        GAME_OVER = true;
        return;
      }
    }
  }

  var items = [];
  var itemColor = ["red", "blue"];
  function createItem() {
    for (var i in items) {
      if (items[i].status === 0) {
        items.splice(i, 1);
      }
    }
    var xPosition = canvas.width * Math.random();
    var xRadius = Math.floor(Math.random() * 15) + 10;
    var ySpeed = Math.floor(Math.random() * 4) + 1;
    var iStatus = Math.floor(Math.random() * 2) + 1;
    if (xPosition <= 2 * xRadius || xPosition + 2 * xRadius >= canvas.width) {
      xPosition = canvas.width / 2;
    }
    items.push({
      radius: xRadius,
      speed: ySpeed,
      x: xPosition,
      y: 80,
      status: iStatus
    });
  }

  function moveItem() {
    for (var i in items) {
      var item = items[i];

      if (item.y - item.radius < 0) {
        item.y *= -1;
      }
      if (item.status > 0) {
        ctx.beginPath();
        ctx.fillStyle = itemColor[item.status - 1];
        ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI);
        ctx.fill();
        item.y += item.speed;
      }
      if (item.y + item.radius > canvas.height) {
        item.status = 0;
      }
    }
  }

  function itemPaddleCollision() {
    for (var i in items) {
      var item = items[i];
      if (item.status > 0) {
        if (
          item.y + item.radius > paddle.y &&
          item.y + item.radius < paddle.y + paddle.height &&
          item.x + item.radius > paddle.x &&
          item.x - item.radius < paddle.x + paddle.width
        ) {
          if (item.status === 1) {
            expandBall();
          }
          if (item.status === 2) {
            expandPaddle();
          }
          item.status = 0;
        }
      }
    }
  }

  function expandBall() {
    ball.radius += 10;
    setTimeout(function () {
      ball.radius -= 10;
    }, 10000);
  }

  function expandPaddle() {
    paddle.width += 50;
    setTimeout(function () {
      paddle.width -= 50;
    }, 10000);
  }

  // UPDATE GAME FUNCTION
  function update() {
    //movePaddle();

    moveBall();

    ballWallCollision();

    ballPaddleCollision();

    ballBrickCollision();

    gameOver();

    levelUp();

    moveItem();

    itemPaddleCollision();
  }
  // var itemLoop;
  // var baseLoop;
  // GAME LOOP
  function loop() {
    // CLEAR THE CANVAS
    // ctx.drawImage(BG_IMG, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();

    update();

    // itemLoop = setInterval(moveItem, 20);
    // baseLoop = setInterval(baseItem, 5000);

    if (!GAME_OVER) {
      requestAnimationFrame(loop);
    }
  }

  function showYouWin() {
    saveRank("mode1", SCORE);
    playSound("winSound", 1.0);
    reset();
    alert("YOU WIN");
    menuContainer.style.display = "flex";
    mode1.style.display = "none";
  }

  // SHOW YOU LOSE
  function showYouLose() {
    saveRank("mode1", SCORE);
    playSound("loseSound", 1.0);
    reset();
    alert("GAME OVER");
    menuContainer.style.display = "flex";
    mode1.style.display = "none";
  }

  var subject = [];
  function getSubjects() {
    var tmp = subjects.DS_GRADEOFSTUDENT;
    //console.log(tmp.length);
    for (var i = 0; i < tmp.length; i++) {
      var name = tmp[i].TYPL_KOR_NM;
      if (name.length > 6) {
        name = name.substring(0, 6);
      }
      subject[i] = name;
    }
  }

  var menuContainer = document.querySelector(".menu-container");
  var mode1Btn = document.getElementById("mode1");
  var mode1 = document.querySelector(".mode1");

  mode1Btn.addEventListener("click", () => {
    menuContainer.style.display = "none";
    mode1.style.display = "block";
    getSubjects();
    reset();
    loop();
    startTimer();
  });
}
mode1_();
