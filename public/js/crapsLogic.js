// define some functions

// function to get the value of a single dice roll
function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

function secondsToHms(d) {
  d = Number(d);

  m = Math.floor(d / 60);
  h = Math.floor(d / 3600);
  days = Math.floor(d / 86400);

  if (d < 60) {
    return d + " seconds";
  } else if (d < 3600) {
    return m + (m === 1 ? " minute" : " minutes");
  } else if (d < 86400) {
    return h + (h === 1 ? " hour" : " hours");
  } else if (d < 31536000) {
    return days + (days === 1 ? " day" : " days");
  }
}

function isNewShooter(summary) {
  return (summary === "") | summary.includes("Seven out loser: 7");
}

// functions for evaluating percentile of performance
factorialize = (num) => {
  if (num < 0) return -1;
  else if (num == 0) return 1;
  else {
    return num * factorialize(num - 1);
  }
};

binomialPMF = (numSuccess, prob, numTrials) => {
  const permutationFactor =
    factorialize(numTrials) /
    (factorialize(numSuccess) * factorialize(numTrials - numSuccess));
  const orderedFactor =
    Math.pow(prob, numSuccess) * Math.pow(1 - prob, numTrials - numSuccess);
  return permutationFactor * orderedFactor;
};

binomialCDF = (numSuccess, prob, numTrials) => {
  let totalProb = 0;
  for (let i = 0; i <= numSuccess; i++) {
    totalProb += binomialPMF(i, prob, numTrials);
  }

  if (isNaN(totalProb)) {
    return "breaks >86 wins";
  } else {
    return (totalProb * 100).toPrecision(3);
  }
};

// wait for dom content before adding listeners
document.addEventListener("DOMContentLoaded", (event) => {
  // make working with dom elements easier
  const rollBtn = document.getElementById("roll-once-button");
  const numRolls = document.getElementById("rolls-value");
  const totalTime = document.getElementById("time-simulated-value");
  const summary = document.getElementById("summary");
  const numShooters = document.getElementById("shooters-value");
  const netUnits = document.getElementById("pass-net-units-value");
  const numWins = document.getElementById("wins-value");
  const numLosses = document.getElementById("losses-value");
  const currentPoint = document.getElementById("current-point");
  const rollsPerShooter = document.getElementById("rolls-per-shooter-value");
  const houseEdge = document.getElementById("house-edge-value");
  const rollsPerSecond = document.getElementById("rolls-per-second-value");
  const rollsSpeedSlider = document.getElementById("rolls-per-second-slider");
  const startStopButton = document.getElementById("start-stop-button");
  const percentile = document.getElementById("percentile-value");
  const longestRoll = document.getElementById("longest-roll");
  const shooterRollLength = document.getElementById("shooter-roll-length");

  let intervalID;
  let allRollData = {};
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((num) => {
    allRollData[num] = 0;
  });
  // console.log(allRollData);

  function stopSimulation() {
    clearInterval(intervalID);
  }

  function startSimulation(rollsPerSecond) {
    intervalID = setInterval(() => {
      rollBtn.click();
    }, 1000 / rollsPerSecond);
  }

  // listen for slider changes and update field
  rollsSpeedSlider.oninput = function () {
    rollsPerSecond.innerHTML = this.value;
  };

  startStopButton.addEventListener("click", () => {
    if (startStopButton.innerHTML === "Start") {
      // trigger on state
      startSimulation(rollsPerSecond.innerHTML);
      // styles
      startStopButton.innerHTML = "STOP";
      startStopButton.style.backgroundColor = "#E45252";
      startStopButton.style.color = "white";
    } else {
      // trigger off state
      stopSimulation();
      // styles
      startStopButton.innerHTML = "Start";
      startStopButton.style.backgroundColor = "transparent";
      startStopButton.style.color = "#E45252";
    }
  });

  // function to run for every roll
  rollBtn.addEventListener("click", function () {
    // get dice result for the roll
    let die1 = getRandomInt(6);
    let die2 = getRandomInt(6);
    let sum = die1 + die2;

    // update rolls and time
    numRolls.innerHTML = parseInt(numRolls.innerHTML) + 1;
    totalTime.innerHTML = secondsToHms(parseInt(numRolls.innerHTML) * 15);
    shooterRollLength.innerHTML = parseInt(shooterRollLength.innerHTML) + 1;
    allRollData[sum] = allRollData[sum] + 1;

    // let maxRolls = Math.max();
    // console.log(Object.values(allRollData));
    let currentColumn;
    // console.log(Math.max(...Object.values(allRollData)));
    let maxRollCount = Math.max(...Object.values(allRollData));
    Object.keys(allRollData).forEach((key) => {
      currentColumn = document.getElementById(`roll-counter-${key}`);
      currentColumn.style.height = `${
        (100 * allRollData[key]) / maxRollCount
      }%`;
    });

    // pointNumber of zero indicated off state
    let pointNumber =
      currentPoint.innerHTML === "Off" ? 0 : parseInt(currentPoint.innerHTML);

    // front line winner
    if ((pointNumber === 0) & [7, 11].includes(sum)) {
      netUnits.innerHTML = parseInt(netUnits.innerHTML) + 1;
      numWins.innerHTML = parseInt(numWins.innerHTML) + 1;
      percentile.innerHTML = binomialCDF(
        parseInt(numWins.innerHTML),
        0.49293,
        parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML)
      );

      // new shooter
      if (summary.innerHTML.includes("Seven out loser: 7")) {
        summary.innerHTML = `Front Line Winner: ${sum}<br>`;
        numShooters.innerHTML = parseInt(numShooters.innerHTML) + 1;
        // same shooter
      } else {
        summary.innerHTML += `Front Line Winner: ${sum}<br>`;
      }
    }
    // front line loser
    else if ((pointNumber === 0) & [2, 3, 12].includes(sum)) {
      netUnits.innerHTML = parseInt(netUnits.innerHTML) - 1;
      numLosses.innerHTML = parseInt(numLosses.innerHTML) + 1;
      percentile.innerHTML = binomialCDF(
        parseInt(numWins.innerHTML),
        0.49293,
        parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML)
      );

      // new shooter
      if (isNewShooter(summary.innerHTML)) {
        summary.innerHTML = `Front Line Loser: ${sum}<br>`;
        numShooters.innerHTML = parseInt(numShooters.innerHTML) + 1;
        // same shooter
      } else {
        summary.innerHTML += `Front Line Loser: ${sum}<br>`;
      }
    }
    // point number established
    else if ((pointNumber === 0) & [4, 5, 6, 8, 9, 10].includes(sum)) {
      currentPoint.innerHTML = sum;
      // new shooter
      if (isNewShooter(summary.innerHTML)) {
        summary.innerHTML = `New point established: ${sum}<br>`;
        numShooters.innerHTML = parseInt(numShooters.innerHTML) + 1;
        // same shooter
      } else {
        summary.innerHTML += `New point established: ${sum}<br>`;
      }
    }
    // point number is rolled
    else if ((pointNumber !== 0) & (sum === pointNumber)) {
      netUnits.innerHTML = parseInt(netUnits.innerHTML) + 1;
      numWins.innerHTML = parseInt(numWins.innerHTML) + 1;
      percentile.innerHTML = binomialCDF(
        parseInt(numWins.innerHTML),
        0.49293,
        parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML)
      );
      summary.innerHTML += `Winner winner: ${sum}<br>`;
      currentPoint.innerHTML = "Off";
    }
    // seven out is rolled
    else if ((pointNumber !== 0) & (sum === 7)) {
      netUnits.innerHTML = parseInt(netUnits.innerHTML) - 1;
      numLosses.innerHTML = parseInt(numLosses.innerHTML) + 1;
      percentile.innerHTML = binomialCDF(
        parseInt(numWins.innerHTML),
        0.49293,
        parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML)
      );
      summary.innerHTML += `Seven out loser: 7<br>`;
      currentPoint.innerHTML = "Off";
      // check if roll was the longest yet if so replace longest roll
      if (
        parseInt(shooterRollLength.innerHTML) > parseInt(longestRoll.innerHTML)
      ) {
        longestRoll.innerHTML = shooterRollLength.innerHTML;
      }

      // reset current shooter rolls
      shooterRollLength.innerHTML = 0;

      // during a point, a value that is not the point or seven is rolled
    } else {
      summary.innerHTML += `${sum}<br>`;
    }

    // update rolls per shooter after numShooters is updated
    rollsPerShooter.innerHTML = (
      numRolls.innerHTML / Math.max(numShooters.innerHTML, 1)
    ).toPrecision(2);

    houseEdge.innerHTML =
      (
        (-100 * netUnits.innerHTML) /
        Math.max(parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML), 1)
      ).toPrecision(3) + "%";
  });
});
