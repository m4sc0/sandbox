function drawBranch(ctx, x, y, length, angle, depth, angleChange, lengthFactor) {
    if (depth === 0) return;
  
    ctx.beginPath();
    ctx.moveTo(x, y);
  
    const xEnd = x + length * Math.cos(angle * Math.PI / 180);
    const yEnd = y + length * Math.sin(angle * Math.PI / 180);
  
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = 'white';
    ctx.stroke();
  
    drawBranch(ctx, xEnd, yEnd, length * lengthFactor, angle + angleChange, depth - 1, angleChange, lengthFactor);
    drawBranch(ctx, xEnd, yEnd, length * lengthFactor, angle - angleChange, depth - 1, angleChange, lengthFactor);
}
  
function updateTexts(angle, length, depth) {
    document.getElementById('angleText').innerText = angle;
    document.getElementById('lengthText').innerText = length;
    document.getElementById('depthText').innerText = depth;
}
  
function drawTree() {
    const canvas = document.getElementById('fractalCanvas');
    if (!canvas.getContext) return;
  
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const angleChange = parseFloat(document.getElementById('angleSlider').value);
    const lengthFactor = parseFloat(document.getElementById('lengthSlider').value) / 100;
    const depth = parseInt(document.getElementById('depthSlider').value, 10);

    updateTexts(angleChange, lengthFactor, depth);
  
    drawBranch(ctx, canvas.width / 2, canvas.height / 12 * (12 - 1), canvas.height / 5, -90, depth, angleChange, lengthFactor);
  }
  
  drawTree(); // Initial draw