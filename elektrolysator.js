var app = document.getElementById('app');

const RIGHT = 'right';
const LEFT = 'left';
const TOP = 'top';
const BOTTOM = 'bottom';
const LINERATIO = 0.2;
const RATIO = 0.8;
const SPEED_NORMAL = 5;
const FPS = 60;
const CLOCKWISE = 'clockwise';
const HORIZONTAL_CLASS = 'switch--horizontal';

var SPEED;
var gameStarted = false;
var boardDrawn = false;
var then;
var now;
var elapsed;
var data = {x: 960};
var counter = 0;
var switches;
var linePoints = [];
var dots;

var fpsInterval = 1000 / FPS;
var distance = Math.floor(data.x * LINERATIO);
data.y = Math.floor(data.x * RATIO);

linePoints.push(data.x / 2 - distance);
linePoints.push(data.x / 2);
linePoints.push(data.x / 2 + distance);
linePoints.push(data.y / 2 - distance / 2);
linePoints.push(data.y / 2 + distance / 2);

const SWITCH_MAP = {
    1: {
        line: 1,
        position: 1
    },
    2: {
        line: 1,
        position: 2,
    },
    3: {
        line: 1,
        position: 3
    },
    4: {
        line: 2,
        position: 1
    },
    5: {
        line: 2,
        position: 2
    },
    6: {
        line: 2,
        position: 3
    },
    7: {
        line: 3,
        position: 1
    },
    8: {
        line: 3,
        position: 2
    },
    9: {
        line: 3,
        position: 3
    },
    10: {
        line: 4,
        position: 1
    },
    11: {
        line: 4,
        position: 2
    },
    12: {
        line: 4,
        position: 3
    },
    13: {
        line: 4,
        position: 4
    },
    14: {
        line: 5,
        position: 1
    },
    15: {
        line: 5,
        position: 2
    },
    16: {
        line: 5,
        position: 3
    },
    17: {
        line: 5,
        position: 4
    },
};

function startGame() {
    var level = document.querySelector('select').value;
    getLevel(level, function () {
        gameStarted = true;
        drawDots();
        animateDot();
    });
}

function resetGame() {
    then = Date.now();
    counter = 0;
    SPEED = SPEED_NORMAL;
    document.querySelectorAll('.dot').forEach(function (item) {
        item.remove();
    });
    document.querySelectorAll('.switch').forEach(function (item) {
        item.remove();
    });
}

function getLevel(level, cb) {
    resetGame();
    return fetch(`level${level}.json`)
        .then(response => response.json())
        .then(function (data) {
            switches = data.switches;
            dots = data.dots;
            drawSwitches();
            cb();
        });
}

function drawBoard() {
    if (boardDrawn) {
        return;
    }
    var board = document.createElement('div');
    board.classList.add('board');
    board.id = 'board';
    board.style.width = data.x + 'px';
    board.style.height = data.y + 'px';
    var innerBorder = document.createElement('div');
    innerBorder.classList.add('inner-border');
    board.append(innerBorder);
    app.append(board);

    // Draw paths
    var line;
    line = document.createElement('div');
    line.classList.add('line', 'line--vertical', 'line--1');
    line.style.left = `calc(50% - ${distance}px)`;
    board.append(line);

    line = document.createElement('div');
    line.classList.add('line', 'line--vertical', 'line--2');
    line.style.left = '50%';
    board.append(line);

    line = document.createElement('div');
    line.classList.add('line', 'line--vertical', 'line--3');
    line.style.left = `calc(50% + ${distance}px`;
    board.append(line);

    line = document.createElement('div');
    line.classList.add('line', 'line--horizontal', 'line--4');
    line.style.top = `calc(50% - ${distance / 2}px`;
    board.append(line);

    line = document.createElement('div');
    line.classList.add('line', 'line--horizontal', 'line--5');
    line.style.top = `calc(50% + ${distance / 2}px`;
    board.append(line);
}

function drawDots() {
    var board = document.getElementById('board');
    dots.forEach(function (item) {
        var dot = document.createElement('div');
        dot.classList.add('dot');
        item.dom = dot;
        board.append(dot);

        item.x = (item.x / 100) * data.x;
        item.y = (item.y / 100) * data.y;
    });
}

function drawSwitches() {
    var board = document.getElementById('board');
    switches.items.forEach(function (item) {
        var currentSwitch = SWITCH_MAP[item];
        var switchItem = document.createElement('div');
        switchItem.classList.add('switch');
        var left;
        var top;
        if (currentSwitch.line === 1) {
            left = `calc(50% - ${distance}px)`;
        } else if (currentSwitch.line === 2) {
            left = '50%';
        } else if (currentSwitch.line === 3) {
            left = `calc(50% + ${distance}px)`;
        } else if (currentSwitch.line === 4) {
            top = `calc(50% - ${distance / 2}px)`;
        } else {
            top = `calc(50% + ${distance / 2}px)`;
        }

        if (currentSwitch.line < 4) {
            if (currentSwitch.position === 1) {
                top = `calc(50% - ${distance}px)`;
            } else if (currentSwitch.position === 2) {
                top = '50%';
            } else {
                top = `calc(50% + ${distance}px)`;
            }
        } else {
            if (currentSwitch.position === 1) {
                left = `calc(50% - ${distance / 2 * 3}px)`;
            } else if (currentSwitch.position === 2) {
                left = `calc(50% - ${distance / 2}px)`;
            } else if (currentSwitch.position === 3) {
                left = `calc(50% + ${distance / 2}px)`;
            } else {
                left = `calc(50% + ${distance / 2 * 3}px)`;
            }
        }

        switchItem.style.left = left;
        switchItem.style.top = top;
        switches[item] = {};
        switches[item].dom = switchItem;
        board.append(switchItem);
    });
}

function animateDot() {
    requestAnimationFrame(animateDot);
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        dots.forEach(function (item) {
            if (!gameStarted && counter < switches.items.length) {
                return;
            }
            var direction;
            if (item.hasReachedTarget) {
                checkCollision(item);
                direction = item.direction;
            } else {
                direction = getDotDirection(item);
            }
            if (direction === RIGHT) {
                item.x += SPEED;
            }
            if (direction === BOTTOM) {
                item.y += SPEED;
            }
            if (direction === LEFT) {
                item.x -= SPEED;
            }
            if (direction === TOP) {
                item.y -= SPEED;
            }

            if (item.x < 0) {
                item.x = 0;
            }
            if (item.x > data.x) {
                item.x = data.x;
            }
            if (item.y < 0) {
                item.y = 0;
            }
            if (item.y > data.y) {
                item.y = data.y;
            }

            item.dom.style.transform = `translate(${item.x}px, ${item.y}px)`;
        });
    }
}

function getDotDirection(dot) {
    var x = dot.x;
    var y = dot.y;
    var isClockWise = dot.clk === CLOCKWISE;

    if (dot.target !== null) {
        var target = SWITCH_MAP[dot.target];
        if (target.line > 3) {
            target.y = linePoints[target.line - 1];
            if (target.position > 2) {
                target.x = data.x;
            } else {
                target.x = 0;
            }
        } else {
            target.x = linePoints[target.line - 1];
            if (target.position > 1) {
                target.y = data.y;
            } else {
                target.y = 0;
            }
        }

        if (
            ((dot.y === target.y && (dot.x >= (target.x - SPEED) && dot.x <= (target.x + SPEED))) ||
                (dot.x === target.x && (dot.y >= (target.y - SPEED) && dot.y <= (target.y + SPEED))))
        ) {
            dot.x = target.x;
            dot.y = target.y;
            if (target.x === 0) {
                dot.direction = RIGHT;
            } else if (target.y === 0) {
                dot.direction = BOTTOM;
            } else if (dot.y === data.y) {
                dot.direction = TOP;
            } else {
                dot.direction = LEFT;
            }
            dot.hasReachedTarget = true;
            return dot.direction;
        }
    }

    if (x < data.x && ((isClockWise && y === 0) || (!isClockWise && y === data.y))) {
        dot.direction = RIGHT;
    } else if (y < data.y && ((isClockWise && x === data.x) || (!isClockWise && x === 0))) {
        dot.direction = BOTTOM;
    } else if (x > 0 && ((isClockWise && y === data.y) || (!isClockWise && y === 0))) {
        dot.direction = LEFT;
    } else if (y > 0 && ((isClockWise && x === 0) || (!isClockWise && x === data.x))) {
        dot.direction = TOP;
    }
    return dot.direction;
}

function checkCollision(dot) {
    var switchItem = switches[dot.target];
    var switchInfo = SWITCH_MAP[dot.target];
    var dotRect = dot.dom.getBoundingClientRect();
    var targetRect = switchItem.dom.getBoundingClientRect();
    if (dotRect.x < targetRect.x + targetRect.width &&
        dotRect.x + dotRect.width > targetRect.x &&
        dotRect.y < targetRect.y + targetRect.height &&
        dotRect.y + dotRect.height > targetRect.y
    ) {
        var horizontal = switchItem.dom.classList.contains(HORIZONTAL_CLASS);
        if ((switchInfo.line < 4 && !horizontal) || (switchInfo.line > 3 && horizontal)) {
            switchItem.dom.remove();
            dot.dom.remove();
            counter += 1;
            if (counter === switches.items.length) {
                finishGame();
            }
        } else {
            failGame();
        }
    }
}

function finishGame() {
    dots.forEach(function (item) {
        item.dom.classList.add('dot--winning');
    });
    gameStarted = false;
    SPEED = 20;
}

function failGame() {
    dots.forEach(function (item) {
        item.dom.classList.add('dot--failing');
    });
    gameStarted = false;
}

drawBoard();
getLevel(1, () => {});

document.body.addEventListener('click', function () {
    if (gameStarted) {
        switches.items.forEach(function (item) {
            switches[item].dom.classList.toggle(HORIZONTAL_CLASS);
        });
    }
});

document.querySelector('.start').addEventListener('click', function (e) {
    e.stopPropagation();
    if (!gameStarted) {
        startGame();
    }
});

document.querySelector('select').addEventListener('change', function (e) {
    getLevel(e.target.value, () => {});
});
