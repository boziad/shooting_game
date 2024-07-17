import "./style.css";
const explosionAudio = document.getElementById("explosion");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const radius = 20;

class Player {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.health = 5;
  }
}

const player = new Player(
  (canvasWidth - radius) / 2,
  (canvasHeight - radius) / 2,
  radius
);

class Particle {
  constructor(oX, oY) {
    this.x = player.x;
    this.y = player.y;
    this.r = 2;
    this.v = 5;
    this.vectorX = -(this.x - oX);
    this.vectorY = -(this.y - oY);
    this.vectorNormalized = Math.sqrt(
      this.vectorX * this.vectorX + this.vectorY * this.vectorY
    );
    this.vx = (this.vectorX / this.vectorNormalized) * this.v;
    this.vy = (this.vectorY / this.vectorNormalized) * this.v;
  }
}

class Object {
  constructor() {
    this.x = Math.floor(Math.random() * canvas.width);
    this.y = Math.floor(Math.random() * canvas.height);
    this.w = 15;
    this.h = 15;
    this.v = 3;

    this.vectorX = -(this.x - player.x);
    this.vectorY = -(this.y - player.y);

    this.vectorNormalized = Math.sqrt(
      this.vectorX * this.vectorX + this.vectorY * this.vectorY
    );

    this.vx = (this.vectorX / this.vectorNormalized) * this.v;
    this.vy = (this.vectorY / this.vectorNormalized) * this.v;
  }
}

class Piece {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

class Collision {
  constructor(x, y) {
    this.pieces = [
      new Piece(x, y, 1, 1),
      new Piece(x, y, -1, 1),
      new Piece(x, y, 1, -1),
      new Piece(x, y, -1, -1),
    ];
    this.opacity = 1;
  }
}

const particles = [];
let objects = [];

let collisions = [];

const drawPlayer = () => {
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
  ctx.fill();
};

const drawParticles = () => {
  particles.forEach((p) => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc((p.x += p.vx), (p.y += p.vy), p.r, 0, 2 * Math.PI);
    ctx.fill();
  });
};

const drawObjects = () => {
  objects.forEach((o) => {
    ctx.fillStyle = "green";
    ctx.fillRect((o.x += o.vx), (o.y += o.vy), o.w, o.h);
  });
};

function RectCircleColliding(circle, rect) {
  if (rect) {
    const distX = Math.abs(circle.x - rect.x - rect.w / 2);
    const distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > rect.w / 2 + circle.r) {
      return false;
    }
    if (distY > rect.h / 2 + circle.r) {
      return false;
    }

    if (distX <= rect.w / 2) {
      return true;
    }
    if (distY <= rect.h / 2) {
      return true;
    }

    const dx = distX - rect.w / 2;
    const dy = distY - rect.h / 2;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  return false;
}

const checkCollision = () => {
  for (let i = 0; i < objects.length; i++) {
    for (let j = 0; j < particles.length; j++) {
      const res = RectCircleColliding(particles[j], objects[i]);
      if (res) {
        collisions.push(new Collision(objects[i].x, objects[i].y));
        objects.splice(i, 1);
      }
    }
  }
};

const drawCollisions = () => {
  collisions.forEach((c) => {
    c.pieces.forEach((p) => {
      ctx.fillStyle = `rgba(201, 242, 155, ${(c.opacity -= 0.01)})`;
      ctx.fillRect((p.x += p.vx), (p.y += p.vy), 8, 8);
    });
  });
};

const checkPlayerCollision = () => {
  for (let i = 0; i < objects.length; i++) {
    const res = RectCircleColliding(player, objects[i]);
    if (res) {
      objects.splice(i, 1);
      player.health--;
    }
  }
};

const drawHealth = () => {
  for (let i = 0; i < player.health; i++) {
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width - 150 + i * 25, 10, 20, 10);
  }
};

const drawScore = () => {
  ctx.font = "30px serif";
  ctx.fillStyle = "#000";
  const text = `Score : ${collisions.length}`;

  const textWidth = ctx.measureText(text).width;

  ctx.fillText(text, (canvasWidth - textWidth) / 2, 30);
};
const restartW = 100;
const restartH = 50;
const restartX = (canvasWidth - restartW) / 2;
const restartY = canvasHeight - 180;

const drawEndGame = () => {
  ctx.font = "48px serif";
  ctx.fillStyle = "#000";
  let text = "YOU LOST";

  let textWidth = ctx.measureText(text).width;
  ctx.fillText(text, (canvasWidth - textWidth) / 2, canvasHeight / 2);

  // button box
  ctx.strokeRect(restartX, restartY, restartW, restartH);

  // button text
  ctx.font = "bold 20px serif";
  text = "RESTART";
  textWidth = ctx.measureText(text).width;
  ctx.fillText(text, (canvasWidth - textWidth) / 2, canvasHeight - 150);
};

const times = [];
let fps;

const drawFPS = () => {
  const now = performance.now();
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;

  ctx.font = "15px serif";
  ctx.fillStyle = "#000";
  ctx.fillText(`FPS : ${fps}`, 10, 20);
};

let gameEnded = false;

const frame = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  if (player.health === 0) gameEnded = true;
  if (gameEnded) {
    //player.health === 0
    drawEndGame();
  } else {
    drawParticles();
    drawObjects();
    checkCollision();
    drawCollisions();
    checkPlayerCollision();
    drawHealth();
    drawScore();
    drawPlayer();

    drawFPS();
    requestAnimationFrame(frame);
  }
};

canvas.addEventListener("click", (e) => {
  if (gameEnded) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    if (
      mouseX >= restartX &&
      mouseX <= restartX + restartW &&
      mouseY >= restartY &&
      mouseY <= restartY + restartH
    ) {
      gameEnded = false;
      player.health = 5;
      collisions = [];
      objects = [];
      frame();
    }
  } else {
    particles.push(new Particle(e.offsetX, e.offsetY));
  }
});

addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      player.y -= 5;
      break;
    case "ArrowDown":
      player.y += 5;
      break;
    case "ArrowLeft":
      player.x -= 5;
      break;
    case "ArrowRight":
      player.x += 5;
      break;
  }
});

setInterval(() => {
  if (objects.length < 10) {
    objects.push(new Object());
  }
}, 1000);

frame();
