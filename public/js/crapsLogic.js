// define helper functions

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
    return (totalProb * 100).toFixed(1);
  }
};

// function removeAllChildNodes(parent) {
//   while (parent.firstChild) {
//     parent.removeChild(parent.firstChild);
//   }
// }

// wait for dom content before adding listeners
document.addEventListener("DOMContentLoaded", (event) => {
  // make working with dom elements easier
  const rollBtn = document.getElementById("roll-once-button");
  const numRolls = document.getElementById("rolls-value");
  const totalTime = document.getElementById("time-simulated-value");
  const summary = document.getElementById("summary");
  const numShooters = document.getElementById("shooters-value");
  const passNetUnits = document.getElementById("pass-net-units-value");
  const passAndOddsNetUnits = document.getElementById(
    "pass-odds-net-units-value"
  );
  const dontPassNetUnits = document.getElementById("dont-net-units-value");
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
  const oddsMultiplierInput = document.getElementById("odds-multiplier");

  const bonusOps = document.getElementById("bonus-ops");
  const allSmalls = document.getElementById("all-smalls");
  const allTalls = document.getElementById("all-talls");
  const makeEmAlls = document.getElementById("make-em-alls");
  const luckEvaluator = document.getElementById("luck-evaluator");

  let allSmall = false;
  let allTall = false;
  let makeEmAll = false;

  // set up odds multiplier
  let oddsMultiplier = oddsMultiplierInput.value;
  oddsMultiplierInput.addEventListener("input", () => {
    oddsMultiplier = oddsMultiplierInput.value;
  });

  // set up roll tracker
  let intervalID;
  let PDFValues = {};
  let allRollData = {};
  let allTallSmall = {};
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((num) => {
    allRollData[num] = 0;
    if (num !== 7) {
      allTallSmall[num] = false;
    }
  });

  // set up start/stop button
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

    if (sum !== 7) {
      allTallSmall[sum] = true;
    } else {
      // no 7
      [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].forEach((num) => {
        allTallSmall[num] = false;
      });
      bonusOps.innerHTML = parseInt(bonusOps.innerHTML) + 1;
      allSmall = false;
      allTall = false;
      makeEmAll = false;
    }

    Object.keys(allTallSmall).forEach((key) => {
      currentCircle = document.getElementById(`number-circle-${key}`);
      allTallSmall[key] === true
        ? (currentCircle.style.backgroundColor = "#e45252")
        : (currentCircle.style.backgroundColor = "transparent");
    });

    let currentColumn;
    let maxRollCount = Math.max(...Object.values(allRollData));
    Object.keys(allRollData).forEach((key) => {
      currentColumn = document.getElementById(`roll-tracker-${key}`);
      currentColumn.style.height = `${
        (100 * allRollData[key]) / maxRollCount
      }%`;
    });

    // pointNumber of zero indicated off state
    let pointNumber =
      currentPoint.innerHTML === "Off" ? 0 : parseInt(currentPoint.innerHTML);

    // front line winner
    if ((pointNumber === 0) & [7, 11].includes(sum)) {
      passNetUnits.innerHTML = parseInt(passNetUnits.innerHTML) + 1;
      dontPassNetUnits.innerHTML = parseInt(dontPassNetUnits.innerHTML) - 1;
      passAndOddsNetUnits.innerHTML =
        parseInt(passAndOddsNetUnits.innerHTML) + 1;
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
        summary.innerHTML = `Front Line Winner: ${sum}<br>` + summary.innerHTML;
      }
    }
    // front line loser
    else if ((pointNumber === 0) & [2, 3, 12].includes(sum)) {
      passNetUnits.innerHTML = parseInt(passNetUnits.innerHTML) - 1;
      if (sum !== 12) {
        // 12 is a push
        dontPassNetUnits.innerHTML = parseInt(dontPassNetUnits.innerHTML) + 1;
      }
      passAndOddsNetUnits.innerHTML =
        parseInt(passAndOddsNetUnits.innerHTML) - 1;
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
        // summary.innerHTML += `Front Line Loser: ${sum}<br>`;
        summary.innerHTML = `Front Line Loser: ${sum}<br>` + summary.innerHTML;
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
        summary.innerHTML =
          `New point established: ${sum}<br>` + summary.innerHTML;
      }
    }
    // point number is rolled
    else if ((pointNumber !== 0) & (sum === pointNumber)) {
      passNetUnits.innerHTML = parseInt(passNetUnits.innerHTML) + 1;
      dontPassNetUnits.innerHTML = parseInt(dontPassNetUnits.innerHTML) - 1;
      if ([4, 10].includes(pointNumber)) {
        passAndOddsNetUnits.innerHTML = (
          parseInt(passAndOddsNetUnits.innerHTML) +
          1 +
          2 * oddsMultiplier
        ).toFixed(1);
      } else if ([5, 9].includes(pointNumber)) {
        passAndOddsNetUnits.innerHTML = (
          parseInt(passAndOddsNetUnits.innerHTML) +
          1 +
          1.5 * oddsMultiplier
        ).toFixed(1);
      } else if ([6, 8].includes(pointNumber)) {
        passAndOddsNetUnits.innerHTML = (
          parseInt(passAndOddsNetUnits.innerHTML) +
          1 +
          1.2 * oddsMultiplier
        ).toFixed(1);
      }
      numWins.innerHTML = parseInt(numWins.innerHTML) + 1;
      percentile.innerHTML = binomialCDF(
        parseInt(numWins.innerHTML),
        0.49293,
        parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML)
      );
      summary.innerHTML = `Winner winner: ${sum}<br>` + summary.innerHTML;
      currentPoint.innerHTML = "Off";
    }
    // seven out is rolled
    else if ((pointNumber !== 0) & (sum === 7)) {
      passNetUnits.innerHTML = parseInt(passNetUnits.innerHTML) - 1;
      dontPassNetUnits.innerHTML = parseInt(dontPassNetUnits.innerHTML) + 1;
      passAndOddsNetUnits.innerHTML =
        parseInt(passAndOddsNetUnits.innerHTML) -
        (1 + parseInt(oddsMultiplier));
      numLosses.innerHTML = parseInt(numLosses.innerHTML) + 1;
      percentile.innerHTML = binomialCDF(
        parseInt(numWins.innerHTML),
        0.49293,
        parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML)
      );
      summary.innerHTML = `Seven out loser: 7<br>` + summary.innerHTML;
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
      summary.innerHTML = `${sum}<br>` + summary.innerHTML;
    }

    // update rolls per shooter after numShooters is updated
    rollsPerShooter.innerHTML = (
      numRolls.innerHTML / Math.max(numShooters.innerHTML, 1)
    ).toFixed(2);

    houseEdge.innerHTML =
      (
        (-100 * passNetUnits.innerHTML) /
        Math.max(parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML), 1)
      ).toFixed(1) + "%";

    // Check all small, tall, and make em all
    const isTrue = (currentValue) => currentValue === true;
    if (!allSmall) {
      // map to make dictionary of true and false
      let smallVals = [2, 3, 4, 5, 6].map((num) => {
        return allTallSmall[num];
      });

      // check if all values are true
      allSmall = smallVals.every(isTrue);

      // increment counter
      if (allSmall) {
        allSmalls.innerHTML = parseInt(allSmalls.innerHTML) + 1;
      }
    }
    if (!allTall) {
      // map to make dictionary of true and false
      let tallVals = [8, 9, 10, 11, 12].map((num) => {
        return allTallSmall[num];
      });

      // check if all values are true
      allTall = tallVals.every(isTrue);

      // increment counter
      if (allTall) {
        allTalls.innerHTML = parseInt(allTalls.innerHTML) + 1;
      }
    }
    if (!makeEmAll & (allTall & allSmall)) {
      makeEmAll = true;
      makeEmAlls.innerHTML = parseInt(makeEmAlls.innerHTML) + 1;
    }

    // fills in luck evaluator
    let totalDescisions =
      parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML);
    if (totalDescisions >= 3) {
      // add dotted line by changing psuedo property

      // document.styleSheets[0].insertRule(
      //   ".luck-evaluator::after{border-color: black;}",
      //   0
      // );

      // create an object with keys = all possible number of wins, values = PDF output for each value
      let possibleWinValues = [];

      for (var i = 0; i <= totalDescisions; i++) {
        possibleWinValues.push(i);
      }

      PDFValues = {};
      possibleWinValues.forEach((wins) => {
        PDFValues[wins] = parseFloat(
          binomialPMF(wins, 0.49293, totalDescisions)
        );
      });

      let maxProb = Math.max.apply(Math, Object.values(PDFValues));

      // console.log(PDFValues, maxProb);

      while (luckEvaluator.firstChild) {
        luckEvaluator.removeChild(luckEvaluator.firstChild);
      }

      Object.keys(PDFValues).forEach((wins) => {
        // console.log(wins, `${(100 * PDFValues[wins]) / maxProb}%`);
        var column = document.createElement("LI");
        column.style.height = `${(100 * PDFValues[wins]) / maxProb}%`;
        column.style.width = "100%";
        if (wins === numWins.innerHTML) {
          column.style.backgroundColor = "white";
        } else {
          column.style.backgroundColor = "#e45252";
        }

        luckEvaluator.appendChild(column);
      });
    }

    // the height of the divs is controlled by their probability with the max prob = 100%

    // the current number of wins is a different color than the rest

    // hover gives the number of wins/win percentage
  });
});
