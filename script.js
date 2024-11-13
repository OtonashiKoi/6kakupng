const stats = {
    stat1: { label: '雜談力', value: 75 },
    stat2: { label: '玄學', value: 70 },
    stat3: { label: '好吃', value: 77 },
    stat4: { label: '中二', value: 94 },
    stat5: { label: '武力', value: 80 },
    stat6: { label: '雀力', value: 60 }
};

let fillColor = '#6366f1';
const size = 600; // 增加尺寸
const center = size / 2;
const radius = size * 0.3; // 調整半徑比例

function initInputs() {
    const container = document.getElementById('statInputs');
    Object.entries(stats).forEach(([key, stat]) => {
        const div = document.createElement('div');
        div.className = 'stat-input';
        div.innerHTML = `
            <input type="text" value="${stat.label}" 
                   onchange="updateLabel('${key}', this.value)">
            <input type="number" value="${stat.value}" min="0" max="100"
                   onchange="updateValue('${key}', this.value)">
        `;
        container.appendChild(div);
    });
}

function updateLabel(key, value) {
    stats[key].label = value;
    updateChart();
}

function updateValue(key, value) {
    stats[key].value = Math.min(100, Math.max(0, parseInt(value) || 0));
    updateChart();
}

function getPolygonPoints() {
    const points = [];
    const values = Object.values(stats).map(s => s.value);
    
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const value = values[i] / 100;
        const x = center + radius * value * Math.cos(angle);
        const y = center + radius * value * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    
    return points.join(' ');
}

function getAxisPoints(index) {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
}

function getLabelPosition(index, offset) {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const x = center + (radius + offset) * Math.cos(angle);
    const y = center + (radius + offset) * Math.sin(angle);
    return { x, y };
}

function updateChart() {
    const svg = document.getElementById('chart');
    svg.innerHTML = '';
    
    // 背景網格
    [0.2, 0.4, 0.6, 0.8, 1].forEach(scale => {
        const points = Array(6).fill().map((_, i) => {
            const { x, y } = getAxisPoints(i);
            return `${center + (x - center) * scale},${center + (y - center) * scale}`;
        }).join(' ');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points);
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', '#ddd');
        polygon.setAttribute('stroke-width', '1');
        svg.appendChild(polygon);
    });

    // 軸線
    Array(6).fill().forEach((_, i) => {
        const { x, y } = getAxisPoints(i);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', center);
        line.setAttribute('y1', center);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#ddd');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    });

    // 數據多邊形
    const dataPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    dataPolygon.setAttribute('points', getPolygonPoints());
    dataPolygon.setAttribute('fill', fillColor);
    dataPolygon.setAttribute('fill-opacity', '0.5');
    dataPolygon.setAttribute('stroke', fillColor);
    dataPolygon.setAttribute('stroke-width', '2');
    svg.appendChild(dataPolygon);

    // 標籤和數值
    Object.values(stats).forEach((stat, i) => {
        // 調整標籤位置
        const labelPos = getLabelPosition(i, 20); // 增加偏移量
        const valuePos = getLabelPosition(i, 80); // 增加偏移量

        // 標籤
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', labelPos.x);
        labelText.setAttribute('y', labelPos.y);
        labelText.setAttribute('class', 'chart-label');
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('dominant-baseline', 'middle');
        labelText.textContent = stat.label;
        svg.appendChild(labelText);

        // 數值背景圓角矩形
        const width = 70; // 增加寬度
        const height = 45; // 增加高度
        const valueBackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        valueBackground.setAttribute('x', valuePos.x - width/2);
        valueBackground.setAttribute('y', valuePos.y - height/2);
        valueBackground.setAttribute('width', width);
        valueBackground.setAttribute('height', height);
        valueBackground.setAttribute('rx', '1');
        valueBackground.setAttribute('ry', '1');
        valueBackground.setAttribute('fill', fillColor);
        valueBackground.setAttribute('fill-opacity', '0.2');
        svg.appendChild(valueBackground);

        // 數值文字
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', valuePos.x);
        valueText.setAttribute('y', valuePos.y);
        valueText.setAttribute('class', 'chart-value');
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('dominant-baseline', 'middle');
        valueText.textContent = stat.value;
        svg.appendChild(valueText);
    });
}

function downloadChart() {
    const svg = document.getElementById('chart');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 設置畫布大小為 600x600
    canvas.width = 600;
    canvas.height = 600;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = 'hexagon-chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        URL.revokeObjectURL(url);
    };
    img.src = url;
}

document.getElementById('colorPicker').addEventListener('input', (e) => {
    fillColor = e.target.value;
    document.getElementById('colorValue').textContent = `已選擇顏色: ${fillColor}`;
    updateChart();
});

initInputs();
updateChart();
document.getElementById('colorValue').textContent = `已選擇顏色: ${fillColor}`;