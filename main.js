import "./style.css";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const radius = 20;

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
    this.size = 15;
  }
}

const o = new Object();

const particles = [];
const objects = [];

const drawPlayer = () => {
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(
    (canvasWidth - radius) / 2,
    (canvasHeight - radius) / 2,
    radius,
    0,
    2 * Math.PI
  );
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
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(o.x + o.size, o.y);
    ctx.lineTo(o.x + o.size / 2, o.y - o.size);
    ctx.closePath();
    ctx.fill();
  });
};

const frame = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawParticles();
  drawObjects();
  drawPlayer();

  requestAnimationFrame(frame);
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
