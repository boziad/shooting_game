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
    this.x = (canvasWidth - radius) / 2;
    this.y = (canvasHeight - radius) / 2;
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

    this.vectorX = -(this.x - (canvasWidth - radius) / 2);
    this.vectorY = -(this.y - (canvasHeight - radius) / 2);

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
const objects = [];

const collisions = [];

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

const frame = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (player.health === 0) {
    ctx.font = "48px serif";
    ctx.fillStyle = "#000";
    const text = "YOU LOST";

    const textWidth = ctx.measureText(text).width;

    ctx.fillText(
      `YOU LOST`,
      (canvasWidth - textWidth) / 2,
      canvasHeight / 2 + 24
    );
  } else {
    drawParticles();
    drawObjects();
    checkCollision();
    drawCollisions();
    checkPlayerCollision();
    drawPlayer();

    drawFPS();
    requestAnimationFrame(frame);
  }
};

canvas.addEventListener("click", (e) => {
  particles.push(new Particle(e.offsetX, e.offsetY));
});

setInterval(() => {
  if (objects.length < 10) {
    objects.push(new Object());
  }
}, 1000);

frame();
