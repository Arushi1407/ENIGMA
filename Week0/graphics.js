// graphics.js - Custom graphics library
class GWindow {
  constructor(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.objects = [];
    document.body.appendChild(this.canvas);

    // Event handling
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
  }

  add(obj) {
    this.objects.push(obj);
    this.redraw();
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.objects.forEach(obj => obj.draw(this.ctx));
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.objects.forEach(obj => {
      if (obj.contains(mouseX, mouseY)) {
        obj.listeners.forEach(callback => callback());
      }
    });
  }
}

class GObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.listeners = [];
  }

  addEventListener(type, callback) {
    if (type === "click") this.listeners.push(callback);
  }

  contains(mouseX, mouseY) {
    return mouseX >= this.x && mouseX <= this.x + this.width &&
           mouseY >= this.y && mouseY <= this.y + this.height;
  }
}

class GRect extends GObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.color = "black";
    this.filled = false;
  }

  setColor(color) { this.color = color; }
  setFilled(filled) { this.filled = filled; }

  draw(ctx) {
    ctx.fillStyle = this.color;
    if (this.filled) {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

class GOval extends GObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.color = "black";
    this.filled = false;
  }

  setColor(color) { this.color = color; }
  setFilled(filled) { this.filled = filled; }

  draw(ctx) {
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width/2,
      this.y + this.height/2,
      this.width/2,
      this.height/2,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = this.color;
    if (this.filled) ctx.fill();
    ctx.stroke();
  }

  contains(mouseX, mouseY) {
    const centerX = this.x + this.width/2;
    const centerY = this.y + this.height/2;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    return (dx ** 2)/((this.width/2) ** 2) + (dy ** 2)/((this.height/2) ** 2) <= 1;
  }
}

class GLabel extends GObject {
  constructor(text, x, y) {
    super(x, y, 0, 0);
    this.text = text;
    this.color = "black";
    this.font = "14px Arial";
  }

  setText(text) { this.text = text; }
  setFont(font) { this.font = font; }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.font = this.font;
    ctx.fillText(this.text, this.x, this.y);
  }

  contains() { return false; } // Labels aren't clickable
}