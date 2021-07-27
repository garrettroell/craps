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

// wait for dom content before adding listeners
document.addEventListener("DOMContentLoaded", (event) => {
  // add a listener to the roll button
  const rollBtn = document.getElementById("roll-once-button");
  const numRolls = document.getElementById("rolls-value");
  const totalTime = document.getElementById("time-simulated-value");
  const summary = document.getElementById("summary");
  const numShooters = document.getElementById("shooters-value");
  const netUnits = document.getElementById("net-units-value");
  const numWins = document.getElementById("wins-value");
  const numLosses = document.getElementById("losses-value");
  const currentPoint = document.getElementById("current-point");
  const rollsPerShooter = document.getElementById("rolls-per-shooter-value");
  const houseEdge = document.getElementById("house-edge-value");
  const rollsPerSecond = document.getElementById("rolls-per-second-value");
  const rollsSpeedSlider = document.getElementById("rolls-per-second-slider");
  const startStopButton = document.getElementById("start-stop-button");

  let intervalID;

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
      // simulationRunning = true;
      startSimulation(rollsPerSecond.innerHTML);

      // styles
      startStopButton.innerHTML = "STOP";
      startStopButton.style.backgroundColor = "#E45252";
      startStopButton.style.color = "white";
    } else {
      // trigger off state
      stopSimulation();
      // simulationRunning = false;
      // setInterval(function () {
      //   console.log("simulation running");
      // }, 500);
      // styles
      startStopButton.innerHTML = "Start";
      startStopButton.style.backgroundColor = "transparent";
      startStopButton.style.color = "#E45252";
    }
  });

  // while (simulationRunning) {
  // setInterval(function () {
  //   console.log("simulation running");
  // }, 500);
  // }

  // function to run for every roll
  rollBtn.addEventListener("click", function () {
    // get dice result for the roll
    let die1 = getRandomInt(6);
    let die2 = getRandomInt(6);
    let sum = die1 + die2;

    // update rolls and time
    numRolls.innerHTML = parseInt(numRolls.innerHTML) + 1;
    totalTime.innerHTML = secondsToHms(parseInt(numRolls.innerHTML) * 15);

    // let currentPoint = document.getElementById("current-point").innerHTML;

    // pointNumber of zero indicated off state
    let pointNumber =
      currentPoint.innerHTML === "Off" ? 0 : parseInt(currentPoint.innerHTML);

    // front line winner
    if ((pointNumber === 0) & [7, 11].includes(sum)) {
      netUnits.innerHTML = parseInt(netUnits.innerHTML) + 1;
      numWins.innerHTML = parseInt(numWins.innerHTML) + 1;
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
      summary.innerHTML += `Winner winner: ${sum}<br>`;
      currentPoint.innerHTML = "Off";
    }
    // seven out is rolled
    else if ((pointNumber !== 0) & (sum === 7)) {
      netUnits.innerHTML = parseInt(netUnits.innerHTML) - 1;
      numLosses.innerHTML = parseInt(numLosses.innerHTML) + 1;
      summary.innerHTML += `Seven out loser: 7<br>`;
      currentPoint.innerHTML = "Off";

      // during a point, a value that is not the point or seven is rolled
    } else {
      summary.innerHTML += `${sum}<br>`;
    }

    // update rolls per shooter after numShooters is updated
    rollsPerShooter.innerHTML = (
      numRolls.innerHTML / Math.max(numShooters.innerHTML, 1)
    ).toPrecision(2);

    console.log(netUnits.innerHTML, numWins.innerHTML, numLosses.innerHTML);
    console.log(
      "denominator",
      Math.max(parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML), 1)
    );

    houseEdge.innerHTML =
      (
        (-100 * netUnits.innerHTML) /
        Math.max(parseInt(numWins.innerHTML) + parseInt(numLosses.innerHTML), 1)
      ).toPrecision(3) + "%";
  });

  // document.getElementById("simulateFastBtn").addEventListener("click", () => {
  //   console.log("fast simulation");
  //   if (document.getElementById("simulateFastBtn").innerHTML === "STOP") {
  //     document.getElementById("simulateFastBtn").style.backgroundColor =
  //       "white";
  //     document.getElementById("simulateFastBtn").innerHTML = "Simulate fast";
  //   } else {
  //     document.getElementById("simulateFastBtn").style.backgroundColor =
  //       "lightred";
  //     document.getElementById("simulateFastBtn").innerHTML = "STOP";
  //   }
  // });
});

// setInterval(function () {
//   rollBtn.click()
// }, 1);
