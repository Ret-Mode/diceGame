
const ActionEnum = Object.freeze({
    ROLLED: 0,
    DICE_SET_TO_KEEP: 1,
    DICE_SET_TO_ROLL: 2,
    PASS: 3
});


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

function get1Dice(dices, ind) {
    let val = dices[ind].value;
    if (val == 1) {
        setValue(dices, ind, 1);
        return 10;
    } else if (val == 5) {
        setValue(dices, ind, 1);
        return 5;
    } else {
         return 0;
    }
}

function get3Dice(dices, ind, other) {
    let val = dices[ind].value;
    if (val == 1) {
        val = 10;
    }
    let result = val * 10;
    setValue(dices, ind, 3);
    for (let i of other) {
         result += get1Dice(dices, i);
    }
    return result;
}

function get4Dice(dices, ind, other) {
    let val = dices[ind].value;
    if (val == 1) {
        val = 10;
    }
    let result = val * 10 * 2;
    setValue(dices, ind, 4);
    for (let i of other) {
         result += get1Dice(dices, i);
    }
    return result;
}

function get5Dice(dices) {
    if (dices[0].value == 1) {
      return 1000;
    }
    setValue(dices, 0, 5);
    return dices[0].value * 10 * 4;
}

function getCurrentScore(dices) {
    dices.map(a => a.hasPoints = false);
    let len = dices.length;
    let sDices = dices.toSorted((a,b) => a.value - b.value);
    let result = 0;
    if (len == 5){
        if (sDices[0].value == sDices[4].value) {
            result += get5Dice(sDices);

        } else if (sDices[0].value == sDices[3].value) {
            result += get4Dice(sDices, 0, [4]);

        } else if (sDices[1].value == sDices[4].value) {
            result += get4Dice(sDices, 1, [0]);

        } else if (sDices[0].value == sDices[2].value) {
            result += get3Dice(sDices, 0, [3, 4]);

        } else if (sDices[1].value == sDices[3].value) {
            result += get3Dice(sDices, 1, [0, 4]);

        } else if (sDices[2].value == sDices[4].value) {
            result += get3Dice(sDices, 2, [0, 1]);

        }
    } else if (len == 4){
        if (sDices[0].value == sDices[3].value) {
            result += get4Dice(sDices, 0, []);

        } else if (sDices[0].value == sDices[2].value) {
            result += get3Dice(sDices, 0, [3]);

        } else if (sDices[1].value == sDices[3].value) {
            result += get3Dice(sDices, 1, [0]);

        }
    } else if (len == 3){
        if (sDices[0].value == sDices[2].value) {
            result += get3Dice(sDices, 0, []);
        }
    }

    if (result == 0) {
        for (let i = 0; i < len; ++i) {
            result += get1Dice(sDices, 0);
        }
    }
    return result;
}

function getValuesAsArray(dices) {
    return dices.map(a => a.value);
}

function getRandomScore() {
    dices.map(a => {a.rolling=false;});
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

function updateAfterUserSelect(dices, dicesToKeep) {
    for (let i = 0; i < dices.length; ++i) {
        dices[i].kept = dicesToKeep[i];
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
    let diceIsBeingKept = config.d[ind].checked; 
    let dicesToKeep = config.d.map(a => a.checked);
    updateAfterUserSelect(dices, dicesToKeep);
    let possibleDices = dices.filter(a => !a.needToKeep);
    let kept = possibleDices.filter(a => a.kept);
    scores.current = getCurrentScore(kept);
    let invalidDices = possibleDices.filter(a => a.kept && (!a.hasPoints));
    let enableReroll = (scores.current > 0) && (invalidDices.length == 0);
    presentTempRoll(dices, scores, config, lastRoll, enableReroll);
}

function startPlayerTurn() {
    resetDices(dices);
    rollAll(dices);
    lastRoll = dices.map(a => a.value);
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

function changePlayers() {
  initWindow();
}
