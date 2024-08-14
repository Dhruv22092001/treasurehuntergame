document.addEventListener("DOMContentLoaded", function() {
    const gameBoard = document.getElementById("gameBoard");
    const roundNumberDisplay = document.getElementById("roundNumber");
    const bagContentsDisplay = document.getElementById("bagContents");
    const totalScoreDisplay = document.getElementById("totalScore");
    const endButton = document.getElementById("endButton");

    const GRID_SIZE = 8;
    const TOTAL_OBSTACLES = 10;
    const TOTAL_TREASURES = 18;

    let roundNumber = 0;
    let totalScore = 0;
    let bag = [];
    let grid = [];
    let hunterPosition = { x: 0, y: 0 };

    function initializeGrid() {
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                grid[i][j] = null;
                const cell = document.createElement("div");
                cell.classList.add("cell");
                gameBoard.appendChild(cell);
            }
        }
    }

    function renderGrid() {
        const cells = gameBoard.children;
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const cellIndex = i * GRID_SIZE + j;
                const cell = cells[cellIndex];
                cell.className = "cell";
                if (i === hunterPosition.y && j === hunterPosition.x) {
                    cell.classList.add("treasure-hunter");
                    cell.textContent = "H";
                } else if (grid[i][j] === "obstacle") {
                    cell.classList.add("obstacle");
                } else if (grid[i][j] && typeof grid[i][j] === "number") {
                    cell.classList.add("treasure");
                    cell.textContent = grid[i][j];
                } else {
                    cell.textContent = "";
                }
            }
        }
    }

    function placeRandomly(type, count, quadrant) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                if (quadrant === "top-left") {
                    x = Math.floor(Math.random() * GRID_SIZE / 2);
                    y = Math.floor(Math.random() * GRID_SIZE / 2);
                } else {
                    x = Math.floor(Math.random() * GRID_SIZE);
                    y = Math.floor(Math.random() * GRID_SIZE);
                }
            } while (grid[y][x] !== null);

            if (type === "hunter") {
                hunterPosition = { x, y };
            } else {
                grid[y][x] = type;
            }
        }
    }

    function setupGame() {
        initializeGrid();

        // Place hunter in top-left quadrant
        placeRandomly("hunter", 1, "top-left");

        // Place obstacles
        placeRandomly("obstacle", TOTAL_OBSTACLES);

        // Place treasures
        for (let i = 1; i <= 6; i++) {
            placeRandomly(i, 3);
        }

        renderGrid();
    }

    function updateStatus() {
        roundNumberDisplay.textContent = roundNumber;
        bagContentsDisplay.textContent = bag.length > 0 ? bag.join(", ") : "Empty";
        totalScoreDisplay.textContent = totalScore;
    }

    function calculateScore() {
        let points = 0;
        let scoreMessage = "";

        if (bag[0] === bag[1] && bag[1] === bag[2]) {
            points = 300 + bag.reduce((a, b) => a + b, 0);
            scoreMessage = `Three of a kind! Scored ${points} points.`;
        } else if (bag[0] === bag[1] || bag[1] === bag[2] || bag[0] === bag[2]) {
            points = 200 + bag.reduce((a, b) => a + b, 0);
            scoreMessage = `Two of a kind! Scored ${points} points.`;
        } else if ((bag.includes(1) && bag.includes(2) && bag.includes(3)) ||
                   (bag.includes(2) && bag.includes(3) && bag.includes(4)) ||
                   (bag.includes(3) && bag.includes(4) && bag.includes(5)) ||
                   (bag.includes(4) && bag.includes(5) && bag.includes(6))) {
            points = 100 + bag.reduce((a, b) => a + b, 0);
            scoreMessage = `Run! Scored ${points} points.`;
        } else {
            points = bag.reduce((a, b) => a + b, 0);
            scoreMessage = `Different values! Scored ${points} points.`;
        }

        alert(scoreMessage);
        totalScore += points;
        bag = [];
    }

    function handleMove(dx, dy) {
        const newX = hunterPosition.x + dx;
        const newY = hunterPosition.y + dy;

        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
            alert("Cannot move outside the grid!");
            return false;
        }

        if (grid[newY][newX] === "obstacle") {
            alert("Cannot move into an obstacle!");
            return false;
        }

        hunterPosition.x = newX;
        hunterPosition.y = newY;

        if (grid[newY][newX] && typeof grid[newY][newX] === "number") {
            bag.push(grid[newY][newX]);
            grid[newY][newX] = null;

            if (Math.random() < 0.5) {
                placeRandomly("obstacle", 1);
            } else {
                placeRandomly(Math.floor(Math.random() * 6) + 1, 1);
            }

            if (bag.length === 3) {
                calculateScore();
            }
        }

        return true;
    }

    function startRound() {
        roundNumber++;
        updateStatus();
        renderGrid();
    }

    document.addEventListener("keydown", function(event) {
        let moved = false;
        if (event.key === "a") {
            moved = handleMove(-1, 0);
        } else if (event.key === "d") {
            moved = handleMove(1, 0);
        } else if (event.key === "w") {
            moved = handleMove(0, -1);
        } else if (event.key === "s") {
            moved = handleMove(0, 1);
        } else {
            alert("Invalid input! Use 'a', 'd', 'w', 's' to move.");
        }

        if (moved) {
            startRound();
        }
    });

    endButton.addEventListener("click", function() {
        const performanceIndex = roundNumber > 0 ? (totalScore / roundNumber).toFixed(2) : 0;
        alert(`Game Over! Your performance index is ${performanceIndex}.`);
        endButton.disabled = true;
    });

    setupGame();
});
