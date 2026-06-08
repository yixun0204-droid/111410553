const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const startBtn = document.getElementById('start-btn');

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;
const TICK_INTERVAL = 150;

let snake, food, direction, nextDirection, score, highScore;
let gameLoop, isRunning, isGameOver;

function init() {
  const mid = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  isRunning = false;
  isGameOver = false;
  highScore = parseInt(localStorage.getItem('snake-high-score') || '0', 10);
  highScoreEl.textContent = highScore;
  spawnFood();
  draw();
}

function spawnFood() {
  const occupied = new Set(snake.map(c => `${c.x},${c.y}`));
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (occupied.has(`${pos.x},${pos.y}`));
  food = pos;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if ((i + j) % 2 === 0) {
        ctx.fillStyle = '#1a4a7a';
        ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  ctx.fillStyle = '#e94560';
  ctx.shadowColor = '#e94560';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  const fx = food.x * CELL_SIZE + CELL_SIZE / 2;
  const fy = food.y * CELL_SIZE + CELL_SIZE / 2;
  ctx.arc(fx, fy, CELL_SIZE / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  const head = snake[0];
  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    const isHead = i === 0;
    const padding = isHead ? 1 : 2;
    const radius = 3;

    ctx.fillStyle = isHead ? '#53d769' : '#4caf50';
    ctx.shadowColor = isHead ? '#53d769' : '#4caf50';
    ctx.shadowBlur = isHead ? 12 : 4;

    const x = seg.x * CELL_SIZE + padding;
    const y = seg.y * CELL_SIZE + padding;
    const w = CELL_SIZE - padding * 2;
    const h = CELL_SIZE - padding * 2;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    if (isHead) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      const eyeSize = 3;
      let ex1, ey1, ex2, ey2;
      if (direction.x === 1) {
        ex1 = seg.x * CELL_SIZE + CELL_SIZE * 0.65;
        ey1 = seg.y * CELL_SIZE + CELL_SIZE * 0.3;
        ex2 = seg.x * CELL_SIZE + CELL_SIZE * 0.65;
        ey2 = seg.y * CELL_SIZE + CELL_SIZE * 0.7;
      } else if (direction.x === -1) {
        ex1 = seg.x * CELL_SIZE + CELL_SIZE * 0.35;
        ey1 = seg.y * CELL_SIZE + CELL_SIZE * 0.3;
        ex2 = seg.x * CELL_SIZE + CELL_SIZE * 0.35;
        ey2 = seg.y * CELL_SIZE + CELL_SIZE * 0.7;
      } else if (direction.y === -1) {
        ex1 = seg.x * CELL_SIZE + CELL_SIZE * 0.3;
        ey1 = seg.y * CELL_SIZE + CELL_SIZE * 0.35;
        ex2 = seg.x * CELL_SIZE + CELL_SIZE * 0.7;
        ey2 = seg.y * CELL_SIZE + CELL_SIZE * 0.35;
      } else {
        ex1 = seg.x * CELL_SIZE + CELL_SIZE * 0.3;
        ey1 = seg.y * CELL_SIZE + CELL_SIZE * 0.65;
        ex2 = seg.x * CELL_SIZE + CELL_SIZE * 0.7;
        ey2 = seg.y * CELL_SIZE + CELL_SIZE * 0.65;
      }
      ctx.beginPath();
      ctx.arc(ex1, ey1, eyeSize, 0, Math.PI * 2);
      ctx.arc(ex2, ey2, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
}

function update() {
  direction = { ...nextDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    gameOver();
    return;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem('snake-high-score', String(highScore));
    }
    spawnFood();
  } else {
    snake.pop();
  }
}

function gameOver() {
  isRunning = false;
  isGameOver = true;
  clearInterval(gameLoop);
  overlayTitle.textContent = '遊戲結束';
  overlayMessage.textContent = `得分: ${score}`;
  startBtn.textContent = '重新開始';
  overlay.classList.remove('hidden');
  draw();
}

function startGame() {
  if (gameLoop) clearInterval(gameLoop);
  init();
  isRunning = true;
  isGameOver = false;
  scoreEl.textContent = '0';
  overlay.classList.add('hidden');
  gameLoop = setInterval(() => {
    update();
    draw();
  }, TICK_INTERVAL);
}

function setDirection(x, y) {
  if (!isRunning) return;
  if (x === -direction.x && y === -direction.y) return;
  if (x === nextDirection.x && y === nextDirection.y) return;
  nextDirection = { x, y };
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': setDirection(0, -1); break;
    case 'ArrowDown': case 's': case 'S': setDirection(0, 1); break;
    case 'ArrowLeft': case 'a': case 'A': setDirection(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D': setDirection(1, 0); break;
    case ' ': e.preventDefault(); if (isGameOver || !isRunning) startGame(); break;
  }
});

startBtn.addEventListener('click', startGame);

let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  const t = e.changedTouches[0];
  if (!touchStartX || !touchStartY) return;
  const rect = canvas.getBoundingClientRect();
  const endX = t.clientX;
  const endY = t.clientY;
  touchStartX = 0;
  touchStartY = 0;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = endX - centerX;
  const dy = endY - centerY;

  if (Math.abs(dx) > Math.abs(dy)) {
    setDirection(dx > 0 ? 1 : -1, 0);
  } else {
    setDirection(0, dy > 0 ? 1 : -1);
  }
}, { passive: false });

init();
