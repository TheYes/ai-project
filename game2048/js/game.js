class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.init();
    }

    init() {
        // 清空网格和分数
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.updateScore();
        this.tileContainer.innerHTML = '';
        
        // 添加两个初始数字
        this.addNewTile();
        this.addNewTile();
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[x][y] = value;
            this.createTileElement(x, y, value);
        }
    }

    createTileElement(x, y, value) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = value;
        tile.dataset.value = value;
        
        const cellSize = 100; // 假设每个格子是100px
        const gap = 16; // 假设间隙是16px
        
        tile.style.width = cellSize + 'px';
        tile.style.height = cellSize + 'px';
        tile.style.left = (y * (cellSize + gap)) + 'px';
        tile.style.top = (x * (cellSize + gap)) + 'px';
        
        this.tileContainer.appendChild(tile);
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    move(direction, isRecursive = false) {
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);

        // 移动和合并逻辑
        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                const row = this.grid[i].filter(cell => cell !== 0);
                if (direction === 'left') {
                    // 向左合并
                    for (let j = 0; j < row.length - 1; j++) {
                        if (row[j] === row[j + 1]) {
                            row[j] *= 2;
                            this.score += row[j];
                            row.splice(j + 1, 1);
                        }
                    }
                    // 填充剩余空间
                    while (row.length < 4) row.push(0);
                    this.grid[i] = row;
                } else {
                    // 向右合并
                    for (let j = row.length - 1; j > 0; j--) {
                        if (row[j] === row[j - 1]) {
                            row[j] *= 2;
                            this.score += row[j];
                            row.splice(j - 1, 1);
                            j--;
                        }
                    }
                    // 填充剩余空间
                    while (row.length < 4) row.unshift(0);
                    this.grid[i] = row;
                }
            }
        } else {
            // 转置矩阵以复用水平移动的逻辑
            this.grid = this.transpose(this.grid);
            if (direction === 'up') {
                this.move('left', true);
            } else {
                this.move('right', true);
            }
            this.grid = this.transpose(this.grid);
        }

        // 检查是否有移动
        if (oldGrid !== JSON.stringify(this.grid)) {
            moved = true;
        }

        if (moved) {
            this.updateScore();
            this.updateDisplay();
            this.addNewTile();
            
            // 只在非递归调用时检查游戏结束
            if (!isRecursive && this.isGameOver()) {
                setTimeout(() => {
                    alert('Game Over! Your score: ' + this.score);
                }, 100);
            }
        }
    }

    transpose(grid) {
        return grid[0].map((_, i) => grid.map(row => row[i]));
    }

    updateDisplay() {
        this.tileContainer.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTileElement(i, j, this.grid[i][j]);
                }
            }
        }
    }

    isGameOver() {
        // 检查是否还有空格
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // 检查是否还有可以合并的相邻数字
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                // 检查右边
                if (j < 3 && current === this.grid[i][j + 1]) return false;
                // 检查下边
                if (i < 3 && current === this.grid[i + 1][j]) return false;
            }
        }

        return true;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                game.move('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                game.move('right');
                break;
            case 'ArrowUp':
                e.preventDefault();
                game.move('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                game.move('down');
                break;
        }
    });

    // 新游戏按钮
    document.getElementById('new-game').addEventListener('click', () => {
        game.init();
    });

    // 触摸控制
    let touchStartX, touchStartY;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        if (!touchStartX || !touchStartY) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                game.move('right');
            } else {
                game.move('left');
            }
        } else {
            if (deltaY > 0) {
                game.move('down');
            } else {
                game.move('up');
            }
        }

        touchStartX = null;
        touchStartY = null;
    });
}); 