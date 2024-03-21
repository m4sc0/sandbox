class Bar {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx, color = "white") {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

var delay = 0;

const initializeCanvas = () => {
    const canvas = document.getElementById("canvas");
    return canvas.getContext("2d");
}

const createBars = (ctx) => {
    const numberOfBars = 100;
    const gap = 5;
    const totalGapWidth = gap * (numberOfBars - 1);
    const totalBarWidth = ctx.canvas.width - totalGapWidth;
    const barWidth = totalBarWidth / numberOfBars;
    const minHeight = 10;
    const maxHeightDifference = (ctx.canvas.height - minHeight) / numberOfBars;
    let x = 0;
    const bars = [];

    for (let i = 0; i < numberOfBars; i++) {
        const height = minHeight + i * maxHeightDifference;
        bars.push(new Bar(x, ctx.canvas.height - height, barWidth, height));
        x += barWidth + gap;
    }

    return bars;
}

const draw = (ctx, bars) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    bars.forEach(bar => bar.draw(ctx));
}

const swapBars = async (bars, index1, index2, ctx, timeout = 50) => {
    const temp = bars[index1];
    bars[index1] = bars[index2];
    bars[index2] = temp;
    [bars[index1].x, bars[index2].x] = [bars[index2].x, bars[index1].x];
    draw(ctx, bars);
    bars[index1].draw(ctx, "red");
    bars[index2].draw(ctx, "red");
    await new Promise(resolve => setTimeout(resolve, timeout));
    draw(ctx, bars);
}

const checkBars = async (bars, ctx) => {
    for (let i = 0; i < bars.length - 1; i++) {
        if (bars[i].height > bars[i + 1].height) {
            return false;
        }
        bars[i].draw(ctx, 'green');
        await new Promise(resolve => setTimeout(resolve, 5));
    }
    bars[bars.length - 1].draw(ctx, 'green');
    draw(ctx, bars);
    return true;
}

const shuffleBars = async (bars, ctx) => {
    for (let i = bars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        await swapBars(bars, i, j, ctx, 0);
    }
}

const bubbleSort = async (bars, ctx) => {
    let len = bars.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if (bars[j].height > bars[j + 1].height) {
                await swapBars(bars, j, j + 1, ctx, delay);
            }
        }
    }
}

const quickSort = async (bars, ctx) => {
    async function partition(A, lo, hi) {
        let pivot = A[hi].height;
        let i = lo - 1;

        for (let j = lo; j < hi; j++) {
            if (A[j].height <= pivot) {
                i++;
                // Execute swapBars for visual and array element swapping
                await swapBars(A, i, j, ctx, delay); // Ensure this swaps `height` and updates visual
            }
        }

        // Execute swapBars to move pivot into the correct place and update visual
        await swapBars(A, i + 1, hi, ctx, delay);

        return i + 1;
    }

    async function quickSortRec(A, lo, hi) {
        if (lo < hi) {
            const p = await partition(A, lo, hi);
            await quickSortRec(A, lo, p - 1);
            await quickSortRec(A, p + 1, hi);
        }
    }

    await quickSortRec(bars, 0, bars.length - 1);
};

async function heapSort(bars, ctx) {
    const n = bars.length;

    async function heapify(n, i) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n && bars[l].height > bars[largest].height) {
            largest = l;
        }

        if (r < n && bars[r].height > bars[largest].height) {
            largest = r;
        }

        if (largest !== i) {
            await swapBars(bars, i, largest, ctx, delay);
            await heapify(n, largest);
        }
    }

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i);
    }

    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        await swapBars(bars, 0, i, ctx, delay);
        // call max heapify on the reduced heap
        await heapify(i, 0);
    }
}

const setupUI = (bars, ctx) => {
    const shuffleButton = document.getElementById('shuffle');
    const bubbleSortButton = document.getElementById('bubbleSort');
    const quickSortButton = document.getElementById('quickSort');
    const heapSortButton = document.getElementById('heapSort');
    const slider = document.getElementById('delay');
    const delayOutput = document.getElementById('delayOutput');

    delayOutput.innerHTML = slider.value;

    slider.oninput = function () {
        delayOutput.innerHTML = this.value;
        delay = parseInt(this.value, 10);
    }

    shuffleButton.addEventListener('click', () => {
        shuffleBars(bars, ctx);
    });
    bubbleSortButton.addEventListener('click', async () => {
        await bubbleSort(bars, ctx);
        await checkBars(bars, ctx);
    });
    quickSortButton.addEventListener('click', async () => {
        await quickSort(bars, ctx);
        await checkBars(bars, ctx);
    });
    heapSortButton.addEventListener('click', async () => {
        await heapSort(bars, ctx);
        await checkBars(bars, ctx);
    });
}

const ctx = initializeCanvas();
const bars = createBars(ctx);
draw(ctx, bars);
setupUI(bars, ctx);
