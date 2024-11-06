class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.highScore = localStorage.getItem('2048-highScore') || 0;
        this.init();
    }

    init() {
        this.createGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.setupInputs();
    }

    createGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            gridElement.appendChild(cell);
        }
    }

    addRandomTile() {
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
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateDisplay() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    cell.appendChild(tile);
                }

                gridElement.appendChild(cell);
            }
        }

        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    move(direction) {
        let moved = false;
        const originalGrid = JSON.parse(JSON.stringify(this.grid));

        if (direction === 'left') {
            this.rotateGrid(0);
        } else if (direction === 'right') {
            this.rotateGrid(2);
        } else if (direction === 'up') {
            this.rotateGrid(1);
        } else if (direction === 'down') {
            this.rotateGrid(3);
        }

        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            row = row.concat(Array(4 - row.length).fill(0));
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            this.grid[i] = row;
        }

        if (direction === 'left') {
            this.rotateGrid(0);
        } else if (direction === 'right') {
            this.rotateGrid(2);
        } else if (direction === 'up') {
            this.rotateGrid(3);
        } else if (direction === 'down') {
            this.rotateGrid(1);
        }

        if (moved) {
            this.addRandomTile();
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('2048-highScore', this.highScore);
            }
            this.updateDisplay();
            this.checkGameStatus();
        }
    }

    rotateGrid(times) {
        for (let t = 0; t < times; t++) {
            let newGrid = Array(4).fill().map(() => Array(4).fill(0));
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    newGrid[j][3 - i] = this.grid[i][j];
                }
            }
            this.grid = newGrid;
        }
    }

    setupInputs() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.move('left');
                    break;
                case 'ArrowRight':
                    this.move('right');
                    break;
                case 'ArrowUp':
                    this.move('up');
                    break;
                case 'ArrowDown':
                    this.move('down');
                    break;
            }
        });

        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    this.move('left');
                } else {
                    this.move('right');
                }
            } else {
                if (diffY > 0) {
                    this.move('up');
                } else {
                    this.move('down');
                }
            }
        });
    }

    checkGameStatus() {
        if (this.grid.flat().includes(2048)) {
            alert("Congratulations! You've reached 2048!");
        } else if (!this.canMove()) {
            alert("Game over! No more moves available.");
        }
    }

    canMove() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return true;
                if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return true;
                if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return true;
            }
        }
        return false;
    }
}

// Global variables for tracking stats
let gamesPlayed = parseInt(localStorage.getItem('2048-gamesPlayed')) || 0;
let startTime = Date.now();

function updateStats() {
    document.getElementById('gamesPlayed').textContent = gamesPlayed;
    const timeInMinutes = Math.floor((Date.now() - startTime) / 60000);
    document.getElementById('timePlayed').textContent = `${timeInMinutes}:${String(Math.floor((Date.now() - startTime) / 1000) % 60).padStart(2, '0')}`;
}

function resetGame() {
    gamesPlayed++;
    localStorage.setItem('2048-gamesPlayed', gamesPlayed);
    window.game = new Game2048();
    updateStats();
}

window.game = new Game2048();
updateStats();
setInterval(updateStats, 1000);
