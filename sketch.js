var rectangles = [];

PALETTES = [
  ['#70e5e8', '#f7f1e4', '#ffbb33', '#de5916', '#7a0a53'],
  // ["#d4dcec","#18110e","#94a8cc","#a45c24","#245c94","#b8a4f0"]
]

DIR_UP = 0;
DIR_DOWN = 1;
DIR_LEFT = 2;
DIR_RIGHT = 3;
DIR_ALL = 4;

MAX_WIDTH = 400;
MAX_HEIGHT = 400;

var pressTime = 0;
var pressPoint = {"x": 0,"y": 0};
var ignoreClick = false;

var curpalette = 0;


function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('background');
  frameRate(30);

  var pidx = floor(random(PALETTES.length))
  curpalette = PALETTES[pidx];

  MAX_WIDTH = displayWidth;
  MAX_HEIGHT = displayHeight;
}

function draw() {
  background(255);

  for (var i = rectangles.length-1; i >= 0; i--) {
    rectangles[i].draw();
  }

  if (mouseIsPressed) {
    var size = getSize();

    noFill();
    stroke(0);
    line(mouseX, mouseY, pressPoint.x, pressPoint.y);
    ellipse(pressPoint.x, pressPoint.y, size, size);
  }
}

function mousePressed() {
  pressTime = millis();
  pressPoint.x = mouseX;
  pressPoint.y = mouseY;
}

function keyReleased() {
  if (key == " ") {
    addRectangle(mouseX, mouseY, 1, DIR_ALL);
    return false;
  } else if (key == "C") {
    print("Clearing")
    rectangles = [];
  }
}

function mouseReleased() {
  // Check for collisions
  var rect = getCollidingRectangle(mouseX, mouseY);
  if (rect) {
    rect.growing = [0,0,0,0];
    return;
  }

  if (mouseButton == LEFT) {
    var dx = mouseX - pressPoint.x;
    var dy = mouseY - pressPoint.y;
    var dir = -1;

    if (abs(dx) > abs(dy)) {
      if (dx > 0) {
        dir = DIR_RIGHT;
      } else {
        dir = DIR_LEFT;
      }
    } else if (abs(dy) > abs(dx)) {
      if (dy > 0) {
        dir = DIR_DOWN;
      } else {
        dir = DIR_UP;
      }
    }
    if (dir != -1) {
      addRectangle(pressPoint.x, pressPoint.y, getSize(), dir);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getSize() {
  return (millis()-pressTime)/50;
}

function addRectangle(x, y, size, dir) {
  append(rectangles, new Rectangle(x, y, size, dir));
  lastDir = dir;
  lastSize = size;
}

function getCollidingRectangle(x, y) {
  for (var i = rectangles.length-1; i >= 0; i--) {
    r = rectangles[i];
    if (r.overlapsPoint(mouseX,mouseY)) {
      return r;
    }
  }
}



function Rectangle(x,y,size,direction) {
  size = ceil(size);
  this.x = x;
  this.y = y;
  this.w = size;
  this.h = size;
  this.growing = [0,0,0,0];
  this.color = floor(random(curpalette.length));

  switch(direction) {
    case DIR_UP:
    case DIR_DOWN:
      this.growing[DIR_UP] = 1;
      this.growing[DIR_DOWN] = 1;
      this.h = 0;
      this.x -= floor(size/2);
      break;
    case DIR_LEFT:
    case DIR_RIGHT:
      this.growing[DIR_LEFT] = 1;
      this.growing[DIR_RIGHT] = 1;
      this.w = 0;
      this.y -= floor(size/2);
      break;
    case DIR_ALL:
      this.growing[DIR_UP] = 1;
      this.growing[DIR_DOWN] = 1;
      this.growing[DIR_LEFT] = 1;
      this.growing[DIR_RIGHT] = 1;
      this.w = 0;
      this.h = 0;
    default:
      break;
  }

  this.clamp = function(r) {
    if (this.w > r.w) {
      this.middleX(r.middleX());
    } {
      if (this.left() < r.left()) this.left(r.left());
      if (this.right() > r.right()) this.right(r.right());
    }
    if (this.h > r.h) {
      this.middleY(r.middleY());
    } {
      if (this.top() < r.top()) this.top(r.top());
      if (this.bottom() > r.bottom()) this.bottom(r.bottom());
    }
  }
  this.clip = function(r) {
    var x1 = max(this.left(), r.left())
    var y1 = max(this.top(), r.top());
    var x2 = min(this.right(), r.right());
    var y2 = min(this.bottom(), r.bottom());
    this.x = x1
    this.y = y1;
    this.w = max(0, x2 - x1);
    this.h = max(0, y2 - y1);
    return this
  }

  this.overlapsPoint = function(x,y) {
    return x > this.left() && x < this.right() &&
           y > this.top() && y < this.bottom();
  }

  this.overlapsX = function(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x;
  }

  this.overlapsY = function(r) {
    return this.top() < r.bottom() && this.bottom() > r.top();
  }

  this.overlaps = function(r) {
    return this.overlapsX(r) && this.overlapsY(r);
  }

  this.middleX = function(val) {
    if (val) this.x = val - this.width / 2;
    return this.x + this.width / 2;
  }

  this.middleY = function(val) {
    if (val) this.y = val - this.h / 2;
    return this.y + this.height / 2;
  }

  this.left = function(val, inplace) {
    if (val) {
      if (inplace) {
        var delta = this.x - val;
        this.w += delta;
      }
      this.x = val;
    }
    return this.x;
  }
  this.right = function(val, inplace) {
    if (val) {
      if (inplace) {
        var delta = this.right() - val;
        this.w += -delta;
      }
      this.x = val - this.w;
    }
    return this.x+this.w;
  }
  this.top = function(val, inplace) {
    if (val) {
      if (inplace) {
        var delta = this.y - val;
        this.h += delta;
      }
      this.y = val;
    }
    return this.y;
  }
  this.bottom = function(val, inplace) {
    if (val) {
      if (inplace) {
        var delta = this.bottom() - val;
        this.h += -delta;
      }
      this.y = val - this.h;
    }
    return this.y+this.h;
  }

  this.draw = function() {
    // Grow left/right:
    this.x -= this.growing[DIR_LEFT];
    this.w += this.growing[DIR_LEFT];
    this.w += this.growing[DIR_RIGHT];

    if (this.left() < 0) {
      this.growing[DIR_LEFT] = 0;
    }
    if (this.right() > MAX_WIDTH) {
      this.growing[DIR_RIGHT] = 0;
    }

    if (this.growing[DIR_LEFT] != 0 || this.growing[DIR_RIGHT] != 0) {
      for (var i = rectangles.length-1; i >= 0; i--) {
        var other = rectangles[i];
        if (other === this) {
          continue;
        }

        if (this.growing[DIR_LEFT] != 0) {
          if (this.left() > other.left() && this.left() < other.right() && this.overlapsY(other)) {
            this.growing[DIR_LEFT] = 0;
            this.left(other.right(), true);
          }
        }
        if (this.growing[DIR_RIGHT] != 0) {
          if (this.right() > other.left() && this.right() < other.right() && this.overlapsY(other)) {
            this.growing[DIR_RIGHT] = 0;
            this.right(other.left(), true);
          }
        }
      }
    }

    // Grow up/down :
    this.y -= this.growing[DIR_UP];
    this.h += this.growing[DIR_UP];
    this.h += this.growing[DIR_DOWN];

    if (this.top() < 0) {
      this.growing[DIR_UP] = 0;
    }
    if (this.bottom() > MAX_HEIGHT) {
      this.growing[DIR_DOWN] = 0;
    }

    if (this.growing[DIR_DOWN] != 0 || this.growing[DIR_UP] != 0) {
      for (var i = rectangles.length-1; i >= 0; i--) {
        var other = rectangles[i];
        if (other === this) {
          continue;
        }

        if (this.growing[DIR_UP] != 0) {
          if (this.top() > other.top() && this.top() < other.bottom() && this.overlapsX(other)) {
            this.growing[DIR_UP] = 0;
            this.top(other.bottom(), true);
          }
        }
        if (this.growing[DIR_DOWN] != 0) {
          if (this.bottom() > other.top() && this.bottom() < other.bottom() && this.overlapsX(other)) {
            this.growing[DIR_DOWN] = 0;
            this.bottom(other.top(), true);
          }
        }
      }
    }

    fill(curpalette[this.color]);
    noStroke();
    rect(this.x,this.y,this.w,this.h);
  }

}
