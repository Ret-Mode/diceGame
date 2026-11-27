
let players = [
    {name:"P1",points:0},
    {name:"P2",points:0}
];


let currentPlayer = 0;
let maxPlayers = 1;
let currentScore = 0;
let probabilities = [];
let lastRoll = "";
let charts = [];

const dices = [
    {value: 1, kept:false, old:false},
    {value: 1, kept:false, old:false},
    {value: 1, kept:false, old:false},
    {value: 1, kept:false, old:false},
    {value: 1, kept:false, old:false}
];

const pointGroups = {pts:[],noPts:[]};

const scores = {
    last:0,
    current:0,
    currentMax:0
};

const config = {};

function reset(dices) {
    dices.forEach(a => a.kept = a.old = false);
}

function rollRandomValue() {
    return Math.floor(Math.random()*6 + 1);
}

function roll(dices) {
    dices.map(a => a.value = rollRandomValue());
}

function getPoints(diceVal, length) {
    if (diceVal == 1) diceVal = 10;
    if (length == 5) {
        return diceVal == 10 ? 1000 : diceVal * 10 * 4;
    } else if (length == 4) {
       return diceVal * 10 * 2;
    } else if (length == 3) {
       return diceVal * 10;
    }
    return (diceVal == 10 || diceVal == 5) ? diceVal : 0;
}

function splitToGroups(dices) {
    let groups = [];
    let sDices = dices.toSorted((a,b) => a.value - b.value);
    let len = sDices.length;
    let options = [
        [0,5,[]],[0,4,[4]],[1,5,[0]],[0,3,[3,4]],[1,4,[0,4]],[2,5,[0,1]]
    ];
    for (let [from, to, rest] of options) {
        if (len >= to && sDices[from].value == sDices[to-1].value) {
            groups.push(sDices.slice(from, to));
            rest.map(a => {if (a < len) groups.push([sDices[a]])});
            return groups;
        }
    }
    return sDices.map(a => [a]); 
}

function getTotalPoints(groups) {
    return groups.reduce((a,b) => a + getPoints(b[0].value, b.length), 0);
}

function actualRoll(sDices) {
    roll(sDices);
    let groups = splitToGroups(sDices);
    let points = 0;
    groups.forEach(a => {
      let p;
      if ((p = getPoints(a[0].value, a.length))>0) {
        pointGroups.pts.push(a);
      } else {
        pointGroups.noPts.push(a);
      }
      a.map(b => b.kept = p>0);
      points += p;
    });
    config.d.map((a, ind) => a.disabled = !(a.checked = dices[ind].kept));
    config.ld.map((a, ind) => a.innerHTML = dices[ind].value);
    config.resultText.innerHTML = points;
}

function reroll() {
    dices.map(a => a.old ||= a.kept);
    let sDices = dices.filter(a => !a.old);
    roll(sDices);
    actualRoll(sDices);
}

function toggleDice(ind) {
    dices[ind].kept = !dices[ind].kept;
    let pDices = dices.filter(a => !a.old && a.kept);
    let groups = splitToGroups(pDices);
    let points = getTotalPoints(groups);
    config.resultText.innerHTML = points;
}

function startPlayerTurn() {
    reset(dices);
    let sDices = dices;
    actualRoll(sDices);
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

    getChart(5, document.getElementById("5k6"));
    getChart(4, document.getElementById("4k6"));
    getChart(3, document.getElementById("3k6"));
    getChart(2, document.getElementById("2k6"));
    getChart(1, document.getElementById("1k6"));

    startPlayerTurn();
}

function changePlayers() {
    startPlayerTurn();
}

//===== Probabilities and plots

function createDistribution(dicesNum) {
    let dist = {};
    let total = Math.pow(6,dicesNum);
    let vals = [];
    for (let i = 0; i < dicesNum; ++i) vals.push(1);
    let dices = vals.map(a => {return {value : a};});
    do {
        dices.forEach((a,b)=> a.value = vals[b]);

        let pts = getTotalPoints(splitToGroups(dices));
        dist[String(pts)] = (dist[String(pts)] ??= 0) + 100/total;
        vals[0]++;
        for (let i = 0; i < dicesNum-1; ++i) {
            if (vals[i] > 6) {
                vals[i] = 1;
                vals[i+1]++;
            } else {
                break;
            }
        }
    } while (vals[dicesNum - 1] <= 6);
    let sortedLabels = Object.keys(dist).sort((a,b) => Number(a) - Number(b));
    return {
        labels: sortedLabels,
        values: sortedLabels.map(a => dist[a]),
        incremental:sortedLabels.map((sum => a => sum += dist[a])(0)),
        decremental:sortedLabels.toReversed().map((sum => a => sum += dist[a])(0)).reverse()

    }
}

function getChart(diceNum, element) {
  let d = createDistribution(diceNum);
  return new Chart(
    element,
    {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          {label: 'Equal',data: d.values},
          {label: 'Less or Equal',data: d.incremental},
          {label: 'Greater or Equal',data: d.decremental}
        ]
      },
      options: {
        interaction: {intersect:false, mode:'nearest', axis:'x'},
        scales: {x: {ticks: {display: true,autoSkip: false}}}
      }
    }
  );
}
