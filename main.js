


let players = [
    {name:"P1",points:0},
    {name:"P2",points:0}
];


let currentPlayer = 0;
let maxPlayers = 1;
let currentScore = 0;
let probabilities = [];
let lastRoll = "";

const dices = [
    {value: 1, rolling:true, hasPoints:false, kept:false, needToKeep:false},
    {value: 1, rolling:true, hasPoints:false, kept:false, needToKeep:false},
    {value: 1, rolling:true, hasPoints:false, kept:false, needToKeep:false},
    {value: 1, rolling:true, hasPoints:false, kept:false, needToKeep:false},
    {value: 1, rolling:true, hasPoints:false, kept:false, needToKeep:false}
];

const scores = {
    last:0,
    current:0
};

const config = {};

function rollRandomValue() {
    return Math.floor(Math.random()*6 + 1);
}

function rollAll(dices) {
    for (let i = 0; i < dices.length; ++i) {
        dices[i].hasPoints = false;
        dices[i].rolling = true;
        dices[i].value = rollRandomValue();
    }
}

function resetDices(dices) {
    for (let i = 0; i < dices.length; ++i) {
        dices[i].value = 0;
        dices[i].rolling = false;
        dices[i].hasPoints = false;
        dices[i].kept = false;
        dices[i].needToKeep = false;
    }
}

function setValue(dices, from, howMany) {
    for (let i = 0; i < howMany; ++i) {
        dices[i+from].hasPoints = true;
    }
}

function get1(dice) {
    if (dice.value == 1) {
        return 10;
    } else if (dice.value == 5) {
        return 5;
    } else {
        return 0;
    }
}

function get3(dice) {
    let res = dice.value;
    if (res == 1) {
        res = 10;
    }
    return res * 10;
}

function get4(dice) {
    return get3(dice) * 2;
}

function get5(dice) {
    if (dice.value == 1) {
        return 1000;
    }
    return get4(dice) * 2;
}

function getCurrentScore(dices) {
    dices.map(a => a.hasPoints = false);
    let len = dices.length;
    let sDices = dices.toSorted((a,b) => a.value - b.value);
    let result = 0;
    if (len == 5){
        if (sDices[0].value == sDices[4].value) {
            let r = get5(sDices[0]);
            setValue(sDices, 0, 5);
            result += r;

        } else if (sDices[0].value == sDices[3].value) {
            let r = get4(sDices[0]);
            setValue(sDices, 0, 4);
            result += r;

            r = get1(sDices[4]);
            if (r > 0) {
                setValue(sDices, 4, 1);
                result += r;
            }
            
        } else if (sDices[1].value == sDices[4].value) {
            let r = get1(sDices[0]);
            if (r > 0) {
                setValue(sDices, 0, 1);
                result += r;
            }
            
            r = get4(sDices[1]);
            setValue(sDices, 1, 4);
            result += r;

        } else if (sDices[0].value == sDices[2].value) {
            let r = get3(sDices[0]);
            setValue(sDices, 0, 3);
            result += r;

            r = get1(sDices[3]);
            if (r > 0) {
                setValue(sDices, 3, 1);
                result += r;
            }
            
            r = get1(sDices[4]);
            if (r > 0) {
                setValue(sDices, 4, 1);
                result += r;
            }
            
        } else if (sDices[1].value == sDices[3].value) {
            let r = get1(sDices[0]);
            if (r > 0) {
                setValue(sDices, 0, 1);
                result += r;
            }
            
            r = get3(sDices[1]);
            setValue(sDices, 1, 3);
            result += r;

            r = get1(sDices[4]);
            if (r > 0) {
                setValue(sDices, 4, 1);
                result += r;
            }
        } else if (sDices[2].value == sDices[4].value) {
            let r = get1(sDices[0]);
            if (r > 0) {
                setValue(sDices, 0, 1);
                result += r;
            }

            r = get1(sDices[1]);
            if (r > 0) {
                setValue(sDices, 1, 1);
                result += r;
            }

            r = get3(sDices[2]);
            setValue(sDices, 2, 3);
            result += r;
        } 
    } else if (len == 4){
        if (sDices[0].value == sDices[3].value) {
            let r = get4(sDices[0]);
            setValue(sDices, 0, 4);
            result += r;

        } else if (sDices[0].value == sDices[2].value) {
            let r = get3(sDices[0]);
            setValue(sDices, 0, 3);
            result += r;

            r = get1(sDices[3]);
            if (r > 0) {
                setValue(sDices, 3, 1);
                result += r;
            }
        } else if (sDices[1].value == sDices[3].value) {
            let r = get1(sDices[0]);
            if (r > 0) {
                setValue(sDices, 0, 1);
                result += r;
            }
            r = get3(sDices[1]);
            setValue(sDices, 1, 3);
            result += r;
        } 
    } else if (len == 3){
        if (sDices[0].value == sDices[2].value) {
            let r = get3(sDices[0]);
            setValue(sDices, 0, 3);
            result += r;
        }
    }

    if (result == 0) {
        for (let i = 0; i < len; ++i) {
            let r = get1(sDices[i]);
            if (r > 0) {
                setValue(sDices, i, 1);
                result += r;
            }
        }
    }
    return result;
}

function getValuesAsArray(dices) {
    return dices.map(a => a.value);
}

function getRandomScore() {
    dices.map(a => a.rolling=false);
    rollAll(dices);
    for (let i = 0; i < dices.length; ++i) {
        config.ld[i].innerHTML = dices[i].value;
    }
    let score = getTotalScore(dices);
    config.resultText.innerHTML = `${score}`;
    return score;
}

function rollSetUp(dices) {
    for (let i = 0; i < dices.length; ++i) {
        dices[i].rolling = false;
        if (config.d[i].checked) {
            dices[i].kept = true;
            dices[i].needToKeep = true;
        } else {
            dices[i].kept = false;
            
        }
    }
}

function presentRoll(dices, score, config, lastRoll, enableReroll) {
    for (let i = 0; i < dices.length; ++i) {
        config.ld[i].innerHTML = dices[i].value;
        if (dices[i].hasPoints) {
            config.d[i].checked = true;
        } else {
            config.d[i].checked = false;
        }
        if (dices[i].needToKeep || !dices[i].hasPoints) {
            config.d[i].disabled = true;
        } else {
            config.d[i].disabled = false;
        }
    }
    let totalScore = score.last+score.current;
    config.resultText.innerHTML = `Current Score: ${score.current} TotalScore: ${totalScore} Last Roll: ${lastRoll} Player points: ${players[0].points}`;
    if (enableReroll) {
        config.roll.disabled = false;
    } else {
        config.roll.disabled = true;
    }
}

function presentTempRoll(dices, score, config, lastRoll, enableReroll) {
    let totalScore = score.last+score.current;
    config.resultText.innerHTML = `Current Score: ${score.current} TotalScore: ${totalScore} Last Roll: ${lastRoll}`;
    if (enableReroll) {
        config.roll.disabled = false;
    } else {
        config.roll.disabled = true;
    }
}

function updateAfterUserSelect(dices, config) {
    for (let i = 0; i < dices.length; ++i) {
        if (config.d[i].checked) {
            dices[i].kept = true;
        } else {
            dices[i].kept = false;
        }
    }
}

function passTurn() {
    let possibleDices = dices.filter(a => !a.needToKeep);
    let totalPoints = 0;
    if (possibleDices.length == 0) {
        totalPoints = scores.last;
    } else {
        scores.current = getCurrentScore(possibleDices);
        if (scores.current > 0) {
            totalPoints = scores.current + scores.last;
        }
        players[0].points += totalPoints;
    }
    startPlayerTurn();
}

function reroll() {
    rollSetUp(dices);
    let possibleDices = dices.filter(a => !a.needToKeep);
    if (possibleDices.length == 0) {
        resetDices(dices);
        possibleDices = dices;
    }
    let toreroll = possibleDices.filter(a => !a.kept);
    rollAll(toreroll);
    lastRoll = dices.map(a => a.rolling ? a.value : 'X');
    scores.last += scores.current;
    scores.current = getCurrentScore(toreroll);
    let enableReroll = scores.current > 0;
    presentRoll(dices, scores, config, lastRoll, enableReroll);
}

function updateScore(ind) {
    updateAfterUserSelect(dices, config);
    let possibleDices = dices.filter(a => !a.needToKeep);
    let kept = possibleDices.filter(a => a.kept);
    scores.current = getCurrentScore(kept);
    let invalidDices = possibleDices.filter(a => a.kept && (!a.hasPoints)).length > 0;
    let enableReroll = (scores.current > 0) && !invalidDices;
    presentTempRoll(dices, scores, config, lastRoll, enableReroll);
}

function startPlayerTurn() {
    resetDices(dices);
    rollAll(dices);
    lastRoll = dices.map(a => a.rolling ? a.value : 'X');
    scores.last = 0;
    scores.current = getCurrentScore(dices);
    let enableReroll = scores.current > 0;
    presentRoll(dices, scores, config, lastRoll, enableReroll);
}

function initWindow() {
    config.resultText = document.getElementById("result");
    config.d = [
        document.getElementById("d0"),
        document.getElementById("d1"),
        document.getElementById("d2"),
        document.getElementById("d3"),
        document.getElementById("d4")
    ];
    config.ld = [
        document.getElementById("ld0"),
        document.getElementById("ld1"),
        document.getElementById("ld2"),
        document.getElementById("ld3"),
        document.getElementById("ld4")
    ];
    for (let i = 0; i < 5; ++i) {
        config.d[i].checked = false;
    }
    config.roll = document.getElementById("rollButton");
    config.pass = document.getElementById("passButton");
    startPlayerTurn();
}

