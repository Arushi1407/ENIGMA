// Custom graphics library for CS106J Assignment 5
class GWindow {
    constructor(width, height) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext("2d");
      this.objects = [];
      document.body.appendChild(this.canvas);
    }
  
    add(obj) {
      this.objects.push(obj);
      this.redraw();
    }
  
    redraw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.objects.forEach(obj => obj.draw(this.ctx));
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
      if (type === "click") {
        this.listeners.push(callback);
      }
    }
  
    contains(mouseX, mouseY) {
      // Basic bounding box check (override for shapes like oval)
      return mouseX >= this.x && mouseX <= this.x + this.width &&
             mouseY >= this.y && mouseY <= this.y + this.height;
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
      ctx.ellipse(this.x + this.width/2, this.y + this.height/2, 
                  this.width/2, this.height/2, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      if (this.filled) ctx.fill();
      ctx.stroke();
    }
  
    contains(mouseX, mouseY) {
      // Oval collision check (simplified)
      const centerX = this.x + this.width/2;
      const centerY = this.y + this.height/2;
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      return (dx*dx)/((this.width/2)**2) + (dy*dy)/((this.height/2)**2) <= 1;
    }
  }
  
  // Add similar classes for GRect, GLabel, GImage as needed