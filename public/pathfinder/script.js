const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
// Adjust canvas dimensions
ctx.canvas.height = window.innerHeight / 6 * 3;
ctx.canvas.width = ctx.canvas.height;

let numRowsCols = 20;
let delay = 20;
let delayCounter = 0;
let isSearching = false;
let pixelSize;

// Time tracking
let time = { value: 0 };
let timeProxy = new Proxy(time, {
    set: function (target, key, value) {
        document.getElementById('timeDisplay').innerText = Math.max(value - (delayCounter * delay), 0);
        target[key] = value;
        return true;
    },
    get: function (target, key) {
        return key in target ? target[key] : 0;
    }
});
document.getElementById('timeDisplay').innerText = Math.max(timeProxy.value - (delayCounter * delay), 0);

let actualTime = { value: 0 };
let actualTimeProxy = new Proxy(actualTime, {
    set: function (target, key, value) {
        document.getElementById('actualTimeDisplay').innerText = value;
        target[key] = value;
        return true;
    },
    get: function (target, key) {
        return key in target ? target[key] : 0;
    }
});
document.getElementById('actualTimeDisplay').innerText = actualTimeProxy.value;

// Radio buttons handling
const typeRadioButtons = document.querySelectorAll('input[name="type"]');
let selectedType = 't1';
typeRadioButtons.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (isSearching) {
            isSearching = false;
        }
        selectedType = event.target.id;
    });
});

class Pixel {
    static grid = [];
    static start = null;
    static end = null;

    constructor(row, col, x, y, color, size) {
        this.row = row;
        this.col = col;
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.isStart = false;
        this.isEnd = false;
        this.type = 'empty';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    static findPixel(row, col) {
        if (row >= 0 && row < numRowsCols && col >= 0 && col < numRowsCols) {
            return this.grid[row][col];
        }
        return null;
    }

    static handleCanvasClick(x, y) {
        const col = Math.floor(x / pixelSize);
        const row = Math.floor(y / pixelSize);
        const pixel = this.findPixel(row, col);
        if (!pixel) return;

        if (selectedType === 't1' && !pixel.isEnd) {
            if (Pixel.start) {
                Pixel.start.color = 'black';
                Pixel.start.isStart = false;
                Pixel.start.type = 'empty';
                Pixel.start.draw();
            }
            pixel.color = 'red';
            pixel.isStart = true;
            Pixel.start = pixel;
            pixel.type = 'start';
        } else if (selectedType === 't2' && !pixel.isStart) {
            if (Pixel.end) {
                Pixel.end.color = 'black';
                Pixel.end.isEnd = false;
                Pixel.end.type = 'empty';
                Pixel.end.draw();
            }
            pixel.color = 'green';
            pixel.isEnd = true;
            Pixel.end = pixel;
            pixel.type = 'end';
        } else if (selectedType === 't3' && !pixel.isStart && !pixel.isEnd) {
            pixel.color = 'gray';
            pixel.type = 'wall';
        } else if (pixel.color !== 'red' && pixel.color !== 'green') {
            pixel.color = 'black';
            pixel.type = 'empty';
        }
        pixel.draw();
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pixelSize = Math.min(canvas.width / numRowsCols, canvas.height / numRowsCols);

    for (let row = 0; row < numRowsCols; row++) {
        let redraw = false;
        if (!(Pixel.start || Pixel.end)) {
            redraw = true;
            Pixel.grid[row] = [];
        }
        for (let col = 0; col < numRowsCols; col++) {
            if (redraw) Pixel.grid[row][col] = new Pixel(row, col, col * pixelSize, row * pixelSize, 'black', pixelSize);
            Pixel.grid[row][col].draw();
        }
    }
}

drawGrid();

let isDrawing = false;

function handleMouseEvents(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    Pixel.handleCanvasClick(mouseX, mouseY);
}

canvas.addEventListener('mousedown', function(e) {
    isDrawing = true;
    handleMouseEvents(e);
});

canvas.addEventListener('mousemove', function(e) {
    if (isDrawing) {
        handleMouseEvents(e);
    }
});

canvas.addEventListener('mouseup', function() {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', function() {
    isDrawing = false;
});

document.getElementById('bfsBtn').addEventListener('click', async () => {
    if (isSearching) {
        isSearching = false;
    }
    if (!Pixel.start || !Pixel.end) {
        showNotification("Please select start and end points.");
        return;
    }
    await search('bfs');
});

document.getElementById('dfsBtn').addEventListener('click', async () => {
    if (isSearching) {
        isSearching = false;
    }
    if (!Pixel.start || !Pixel.end) {
        showNotification("Please select start and end points.");
        return;
    }
    await search('dfs');
});

document.getElementById('astarBtn').addEventListener('click', async () => {
    if (isSearching) {
        isSearching = false;
    }
    if (!Pixel.start || !Pixel.end) {
        showNotification("Please select start and end points.");
        return;
    }
    await search('astar');
});

document.getElementById('resetBtn').addEventListener('click', () => {
    if (isSearching) {
        isSearching = false;
    }
    resetCanvas();
    drawGrid();
});

document.getElementById('resetAlgoBtn').addEventListener('click', () => {
    if (isSearching) {
        isSearching = false;
    }
    resetAlgo();
});

function resetCanvas() {
    Pixel.grid.flat().forEach(pixel => {
        pixel.color = 'black';
        pixel.isStart = false;
        pixel.isEnd = false;
        pixel.type = 'empty';
        pixel.draw();
    });
    Pixel.start = null;
    Pixel.end = null;
    timeProxy.value = 0;
}

function resetAlgo() {
    Pixel.grid.flat().forEach(pixel => {
        if (pixel.type !== 'start' && pixel.type !== 'end' && pixel.type !== 'wall') {
            pixel.color = 'black';
            pixel.type = 'empty';
            pixel.draw();
        }
    });
    drawGrid();
    timeProxy.value = 0;
}

async function search(algorithm) {
    if (!Pixel.start || !Pixel.end) {
        showNotification("Please select start and end points.");
        return;
    }

    const startPixel = Pixel.start;
    const endPixel = Pixel.end;

    isSearching = true;
    const before = Date.now();

    if (algorithm === 'bfs') {
        await bfs(startPixel, endPixel);
    } else if (algorithm === 'dfs') {
        await dfs(startPixel, endPixel);
    } else if (algorithm === 'astar') {
        await astar(startPixel, endPixel);
    }
    const after = Date.now();
    timeProxy.value = (after - before);
    actualTimeProxy.value = (after - before);
}

async function bfs(start, end) {
    const queue = [start];
    const visited = new Set();
    const parent = new Map();
    visited.add(start);

    while (queue.length > 0 && isSearching) {
        const current = queue.shift();
        if (current === end) {
            await tracePath(parent, start, end);
            showNotification('Path found!', true);
            return;
        }

        if (!current.isStart && !current.isEnd) {
            await drawNeighbor(current);
        }

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && neighbor.color !== 'gray') {
                visited.add(neighbor);
                parent.set(neighbor, current);
                queue.push(neighbor);
            }
        }
    }
    if (isSearching) showNotification('No path found.');
}

async function dfs(start, end) {
    const stack = [start];
    const visited = new Set();
    const parent = new Map();

    while (stack.length > 0 && isSearching) {
        const current = stack.pop();

        if (current === end) {
            await tracePath(parent, start, end);
            showNotification('Path found!', true);
            return;
        }

        if (!visited.has(current)) {
            visited.add(current);
            if (!current.isStart && !current.isEnd) {
                await drawNeighbor(current);
            }

            const neighbors = getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor) && neighbor.color !== 'gray') {
                    parent.set(neighbor, current);
                    stack.push(neighbor);
                }
            }
        }
    }
    if (isSearching) showNotification('No path found.');
}

async function astar(start, end) {
    const openSet = new PriorityQueue((a, b) => a.priority - b.priority);
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const closedSet = new Set();

    gScore.set(start, 0);
    fScore.set(start, heuristic(start, end));
    openSet.enqueue({ element: start, priority: fScore.get(start) });

    while (!openSet.isEmpty() && isSearching) {
        const { element: current } = openSet.dequeue();
        if (current === end) {
            await tracePath(cameFrom, start, end);
            showNotification('Path found!', true);
            return;
        }

        if (!current.isStart && !current.isEnd) {
            await drawNeighbor(current);
        }

        closedSet.add(current);

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (closedSet.has(neighbor) || neighbor.color === 'gray') continue;

            const tentative_gScore = gScore.get(current) + 1;

            if (tentative_gScore < (gScore.get(neighbor) || Infinity)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentative_gScore);
                fScore.set(neighbor, tentative_gScore + heuristic(neighbor, end));

                if (!openSet.contains(neighbor)) {
                    openSet.enqueue({ element: neighbor, priority: fScore.get(neighbor) });
                } else {
                    openSet.updatePriority(neighbor, fScore.get(neighbor));
                }
            }
        }
    }
    if (isSearching) showNotification('No path found.');
}

function getNeighbors(pixel) {
    const neighbors = [];
    const directions = [
        { row: -1, col: 0 }, { row: 1, col: 0 },
        { row: 0, col: -1 }, { row: 0, col: 1 }
    ];

    directions.forEach(dir => {
        const newRow = pixel.row + dir.row;
        const newCol = pixel.col + dir.col;

        const neighbor = Pixel.findPixel(newRow, newCol);
        if (neighbor) {
            neighbors.push(neighbor);
        }
    });

    return neighbors;
}

async function drawNeighbor(current) {
    current.color = 'blue';
    current.type = 'filled';
    current.draw();
    await sleep(delay);
}

function heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

async function tracePath(parent, start, end) {
    let current = end;
    const path = [];

    while (current !== start) {
        path.unshift(current);
        current = parent.get(current);
    }
    path.unshift(start);

    for (const node of path) {
        if (!node.isStart && !node.isEnd) {
            node.color = 'yellow';
            node.type = 'filled';
            node.draw();
            // await sleep(delay);
        }
    }
}

function sleep(ms) {
    delayCounter += 1;
    return new Promise(resolve => setTimeout(resolve, ms));
}

class PriorityQueue {
    constructor(comparator = (a, b) => a - b) {
        this._heap = [];
        this._comparator = comparator;
    }

    isEmpty() {
        return this._heap.length === 0;
    }

    enqueue(element) {
        this._heap.push(element);
        this._heap.sort((a, b) => this._comparator(a, b));
    }

    dequeue() {
        return this._heap.shift();
    }

    contains(element) {
        return this._heap.some(item => item.element === element);
    }

    updatePriority(element, newPriority) {
        const index = this._heap.findIndex(item => item.element === element);
        if (index !== -1) {
            this._heap[index].priority = newPriority;
            this._heap.sort((a, b) => this._comparator(a, b));
        }
    }
}

function showNotification(message, isSuccess = false) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.className = isSuccess ? 'success' : 'failure';
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.getElementById('numCells').addEventListener('input', (event) => {
    numRowsCols = Math.min(Math.max(parseInt(event.target.value, 10), 0), 60);
    resetCanvas();
    drawGrid();
});

document.getElementById('delaySlider').addEventListener('input', (event) => {
    delay = parseInt(event.target.value, 10);
    document.get('delayValue').innerText = delay;
});
