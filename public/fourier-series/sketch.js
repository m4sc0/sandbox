let time = 0;
let wave = [];
let num = 4;
let strokeWidth = 2;

function setup() {
    createCanvas(801, 401);
}

function fourierSeries(t, nTerms) {
    let sum = 0;
    for (let n = 0; n < nTerms; n++) {
        let k = 2 * n + 1;
        sum += (4 / (k * PI)) * sin(k * t);
    }
    return sum;
}

function drawCirclesAndVectors(x, y, nTerms) {
    for (let n = 0; n < nTerms; n++) {
        let prevX = x;
        let prevY = y;
    
        let k = 2 * n + 1;
        let radius = 75 * (4 / (k * PI));
    
        x += radius * cos(k * time);
        y += radius * sin(k * time);
    
        // Draw the circle
        stroke(255, 100);
        strokeWeight(strokeWidth);
        noFill();
        ellipse(prevX, prevY, radius * 2);
    
        // Draw the vector
        stroke(255);
        strokeWeight(strokeWidth);
        line(prevX, prevY, x, y);
    }
    stroke(255);
    strokeWeight(strokeWidth);
    line(x, y, 300, y);
    return createVector(x, y);
}

function drawWave() {
    beginShape();
    noFill();
    for (let i = 0; i < wave.length; i++) {
        vertex(300 + i, wave[i]);
    }
    endShape();
}

function drawGrid() {
    stroke(50);
    strokeWeight(1);
    for (let x = 0; x < width; x += 50) {
        line(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 50) {
        line(0, y, width, y);
    }
    
    // Draw y-axis values
    fill(120);
    noStroke();
    textSize(12);
    for (let y = -100; y <= 100; y += 50) {
        textAlign(RIGHT, CENTER);
        text(y * -1, 500, y + 200);
    }
}

function draw() {
    background(0);
    
    // Draw the grid
    drawGrid();
  
    // Translate to the center
    translate(200, 200);
  
    // Draw the circles and vectors
    let v = drawCirclesAndVectors(0, 0, num);
  
    // Push the new y-coordinate to the wave array
    wave.unshift(v.y);
  
    // Draw the wave
    translate(0, 0);
    drawWave();
  
    // Update time
    time += 0.025;
  
    // Remove old points from the wave array to keep the wave moving
    if (wave.length > 500) {
      wave.pop();
    }
}

// Handle mouse wheel events
function mouseWheel(event) {
    num += event.delta > 0 ? -1 : 1;
    num = constrain(num, 1, 50); // constrain the value of num between 1 and 20
    document.getElementById('nTransforms').innerHTML = num;
    return false; // prevent default behavior
}

document.getElementById('nTransforms').innerHTML = num;
