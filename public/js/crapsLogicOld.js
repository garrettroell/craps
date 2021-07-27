// define some functions

// function to get the value of a single dice roll
function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay + sDisplay;
}

// wait for dom content before adding listeners
document.addEventListener("DOMContentLoaded", (event) => {
  // add a listener to the roll button
  var rollBtn = document.getElementById("rollBtn");
  rollBtn.addEventListener("click", function () {
    // get dice result for the roll
    let die1 = getRandomInt(6);
    let die2 = getRandomInt(6);
    let sum = die1 + die2;

    // update the result of the roll and the number of rolls
    document.getElementById("rollSum").innerHTML = sum;
    document.getElementById("numberRolls").innerHTML =
      parseInt(document.getElementById("numberRolls").innerHTML) + 1;

    // up
    document.getElementById("simulatedTime").innerHTML = secondsToHms(
      parseInt(document.getElementById("numberRolls").innerHTML) * 25
    );

    let currentPoint = document.getElementById("pointNumber").innerHTML;

    let pointNumber = currentPoint === "Off" ? 0 : parseInt(currentPoint);

    if ((pointNumber === 0) & [7, 11].includes(sum)) {
      if (
        document
          .getElementById("summary")
          .innerHTML.includes("Seven out loser: 7")
      ) {
        document.getElementById(
          "summary"
        ).innerHTML = `Front Line Winner: ${sum}<br>`;
      } else {
        document.getElementById(
          "summary"
        ).innerHTML += `Front Line Winner: ${sum}<br>`;
      }
      document.getElementById("netUnits").innerHTML =
        parseInt(document.getElementById("netUnits").innerHTML) + 1;
      rollBtn.innerHTML = "Come Out Roll";
    } else if ((pointNumber === 0) & [2, 3, 12].includes(sum)) {
      if (
        document
          .getElementById("summary")
          .innerHTML.includes("Seven out loser: 7")
      ) {
        document.getElementById(
          "summary"
        ).innerHTML = `Front Line Loser: ${sum}<br>`;
      } else {
        document.getElementById(
          "summary"
        ).innerHTML += `Front Line Loser: ${sum}<br>`;
      }
      document.getElementById("netUnits").innerHTML =
        parseInt(document.getElementById("netUnits").innerHTML) - 1;
      rollBtn.innerHTML = "Come Out Roll";
    } else if ((pointNumber === 0) & [4, 5, 6, 8, 9, 10].includes(sum)) {
      if (
        document
          .getElementById("summary")
          .innerHTML.includes("Seven out loser: 7")
      ) {
        document.getElementById(
          "summary"
        ).innerHTML = `New Point established: ${sum}<br>`;
      } else {
        document.getElementById(
          "summary"
        ).innerHTML += `New Point established: ${sum}<br>`;
      }
      document.getElementById("pointNumber").innerHTML = sum;
      rollBtn.innerHTML = `Roll a ${sum} to win`;
    } else if ((pointNumber !== 0) & (sum === pointNumber)) {
      document.getElementById(
        "summary"
      ).innerHTML += `Winner winner: ${sum}<br>`;
      document.getElementById("pointNumber").innerHTML = "Off";
      document.getElementById("netUnits").innerHTML =
        parseInt(document.getElementById("netUnits").innerHTML) + 1;
      rollBtn.innerHTML = "Come Out Roll";
    } else if ((pointNumber !== 0) & (sum === 7)) {
      document.getElementById("summary").innerHTML += `Seven out loser: 7<br>`;
      document.getElementById("pointNumber").innerHTML = "Off";
      document.getElementById("netUnits").innerHTML =
        parseInt(document.getElementById("netUnits").innerHTML) - 1;
      rollBtn.innerHTML = "Come Out Roll";
    } else {
      document.getElementById("summary").innerHTML += `${sum}<br>`;
    }
  });

  document.getElementById("simulateFastBtn").addEventListener("click", () => {
    console.log("fast simulation");
    if (document.getElementById("simulateFastBtn").innerHTML === "STOP") {
      document.getElementById("simulateFastBtn").style.backgroundColor =
        "white";
      document.getElementById("simulateFastBtn").innerHTML = "Simulate fast";
    } else {
      document.getElementById("simulateFastBtn").style.backgroundColor =
        "lightred";
      document.getElementById("simulateFastBtn").innerHTML = "STOP";
    }
  });
});

// setInterval(function () {
//   rollBtn.click()
// }, 1);
