let grid;
let nextGrid;
let w = 10;
let mouseSize = 10;

let dimX;
let dimY;

let rowCount;
let colCount;

let hueValue = 200; // Initial hue value

let createdPixels = 0;

const BG_COLOR = 15;

function setup() {
    dimX = window.innerWidth / 8 * 7;
    dimY = window.innerHeight / 8 * 7;
    rowCount = Math.floor(dimY / w);
    colCount = Math.floor(dimX / w);

    createCanvas(dimX, dimY);
    colorMode(HSB, 360, 100, 100); // Set color mode to HSB
    background(BG_COLOR);

    grid = fillGrid();

    // frameRate(30);
}

function draw() {
    background(BG_COLOR);

    nextGrid = JSON.parse(JSON.stringify(grid));
    for (let i = rowCount - 1; i >= 0; i--) {
        for (let j = 0; j < colCount; j++) {
            if (grid[i][j].sand == 1) {
                if (i < rowCount - 1 && grid[i + 1][j].sand == 0) {
                    nextGrid[i + 1][j].sand = 1;
                    nextGrid[i + 1][j].color = grid[i][j].color;
                    nextGrid[i][j].sand = 0;
                } else if (i < rowCount - 1 && j > 0 && j < colCount - 1 && grid[i + 1][j].sand != 0) {
                    if (grid[i + 1][j - 1].sand == 0 && grid[i][j - 1].sand == 0) {
                        if (Math.random() < 0.5) {
                            nextGrid[i + 1][j - 1].sand = 1;
                            nextGrid[i + 1][j - 1].color = grid[i][j].color;
                            nextGrid[i][j].sand = 0;
                        }
                    }
                    if (grid[i + 1][j + 1].sand == 0 && grid[i][j + 1].sand == 0) {
                        if (Math.random() < 0.5) {
                            nextGrid[i + 1][j + 1].sand = 1;
                            nextGrid[i + 1][j + 1].color = grid[i][j].color;
                            nextGrid[i][j].sand = 0;
                        }
                    }
                }
            }
        }
    }

    drawGrid(nextGrid);
    grid = nextGrid;

    if (mouseIsPressed) {
        mouseIsDown();
    }

    fill(255);
    textSize(16);
    text(`Created Pixels: ${createdPixels}`, 10, 20);
    text(`Counted Pixels: ${countedPixels()}`, 10, 40);

    if (keyIsDown(82) && countedPixels() != 0) { // R key
        choice = confirm('Are you sure you want to reset the grid?');
        if (choice) {
            resetGrid();
        }
    }
}

function mouseIsDown() {
    let i = Math.floor(mouseY / w);
    let j = Math.floor(mouseX / w);
    for (let di = -Math.floor(mouseSize / 2); di <= Math.floor(mouseSize / 2); di++) {
        for (let dj = -Math.floor(mouseSize / 2); dj <= Math.floor(mouseSize / 2); dj++) {
            let ni = i + di;
            let nj = j + dj;
            if (ni >= 0 && ni < rowCount && nj >= 0 && nj < colCount && Math.random() < 0.5) {
                if (grid[ni][nj].sand == 0) {
                    grid[ni][nj].sand = 1;
                    grid[ni][nj].color = hueValue;
                    createdPixels++;
                }
            }
        }
    }
    hueValue = (hueValue + 0.5) % 360; // Rotate hue value
}

function mouseDragged() {
    if (mouseX >= 0 && mouseX < dimX && mouseY >= 0 && mouseY < dimY) {
        mouseIsDown();
    }
}

function mousePressed() {
    if (mouseX >= 0 && mouseX < dimX && mouseY >= 0 && mouseY < dimY) {
        mouseIsDown();
    }
}

function fillGrid() {
    let curGrid = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
        curGrid[i] = new Array(colCount);
        for (let j = 0; j < colCount; j++) {
            curGrid[i][j] = { sand: 0, color: 0 };
        }
    }
    return curGrid;
}

function drawGrid(curGrid) {
    noStroke();
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (curGrid[i][j].sand == 1) {
                fill(curGrid[i][j].color, 100, 100); // Use stored color value
                rect(j * w, i * w, w, w);
            }
        }
    }
}

function resetGrid() {
    grid = fillGrid();
    createdPixels = 0;
}

function countedPixels() {
    let count = 0;
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (grid[i][j].sand == 1) {
                count++;
            }
        }
    }
    return count;
}
