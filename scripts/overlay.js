(function () {
  "use strict";

  var STORAGE_KEY = "southside-fight-overlay-v1";
  var redCornerLabel = document.getElementById("redCornerLabel");
  var blueCornerLabel = document.getElementById("blueCornerLabel");
  var redName = document.getElementById("redName");
  var blueName = document.getElementById("blueName");
  var roundLabel = document.getElementById("roundLabel");
  var timer = document.getElementById("timer");
  var redCornerInput = document.getElementById("redCornerInput");
  var blueCornerInput = document.getElementById("blueCornerInput");
  var redInput = document.getElementById("redInput");
  var blueInput = document.getElementById("blueInput");
  var roundInput = document.getElementById("roundInput");
  var durationInput = document.getElementById("durationInput");
  var startPause = document.getElementById("startPause");

  var durationMs = 180000;
  var remainingMs = durationMs;
  var endAt = 0;
  var running = false;

  function parseDuration(value) {
    var text = String(value || "").trim();
    var parts = text.split(":");
    var seconds;
    if (parts.length === 2) {
      seconds = Number(parts[0]) * 60 + Number(parts[1]);
    } else {
      seconds = Number(text);
    }
    if (!isFinite(seconds) || seconds < 1) seconds = 180;
    return Math.min(seconds, 60 * 60) * 1000;
  }

  function formatTime(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var minutes = Math.floor(total / 60);
    var seconds = total % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          redCorner: redCornerInput.value,
          blueCorner: blueCornerInput.value,
          red: redInput.value,
          blue: blueInput.value,
          round: roundInput.value,
          duration: durationInput.value,
        }),
      );
    } catch (error) {}
  }

  function loadSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      redCornerInput.value = saved.redCorner || redCornerInput.value;
      blueCornerInput.value = saved.blueCorner || blueCornerInput.value;
      redInput.value = saved.red || redInput.value;
      blueInput.value = saved.blue || blueInput.value;
      roundInput.value = saved.round || roundInput.value;
      durationInput.value = saved.duration || durationInput.value;
    } catch (error) {}
  }

  function updateLabels() {
    redCornerLabel.textContent = (redCornerInput.value || "RED CORNER").trim();
    blueCornerLabel.textContent = (
      blueCornerInput.value || "BLUE CORNER"
    ).trim();
    redName.textContent = (redInput.value || "RED FIGHTER").trim();
    blueName.textContent = (blueInput.value || "BLUE FIGHTER").trim();
    var round = Math.max(1, Math.min(20, Number(roundInput.value) || 1));
    roundInput.value = round;
    roundLabel.textContent = "ROUND " + round;
    saveSettings();
  }

  function updateTimer() {
    timer.textContent = formatTime(remainingMs);
    timer.classList.toggle("warning", remainingMs > 0 && remainingMs <= 10000);
    startPause.textContent = running ? "Pause" : "Start";
  }

  function applyDuration(resetTimer) {
    durationMs = parseDuration(durationInput.value);
    durationInput.value = formatTime(durationMs);
    if (resetTimer) remainingMs = durationMs;
    saveSettings();
    updateTimer();
  }

  function toggleTimer() {
    if (running) {
      remainingMs = Math.max(0, endAt - Date.now());
      running = false;
    } else if (remainingMs > 0) {
      endAt = Date.now() + remainingMs;
      running = true;
    }
    updateTimer();
  }

  function resetTimer(resetRound) {
    running = false;
    if (resetRound) {
      roundInput.value = 1;
      updateLabels();
    }
    applyDuration(true);
  }

  function changeTime(deltaSeconds) {
    if (running) remainingMs = Math.max(0, endAt - Date.now());
    remainingMs = Math.max(
      0,
      Math.min(60 * 60 * 1000, remainingMs + deltaSeconds * 1000),
    );
    if (running) endAt = Date.now() + remainingMs;
    updateTimer();
  }

  function changeRound(delta) {
    var next = Math.max(
      1,
      Math.min(20, (Number(roundInput.value) || 1) + delta),
    );
    roundInput.value = next;
    updateLabels();
    resetTimer();
  }

  function swapCorners() {
    var current = redInput.value;
    redInput.value = blueInput.value;
    blueInput.value = current;
    updateLabels();
  }

  function tick() {
    if (running) {
      remainingMs = Math.max(0, endAt - Date.now());
      if (remainingMs <= 0) running = false;
      updateTimer();
    }
    requestAnimationFrame(tick);
  }

  redCornerInput.addEventListener("input", updateLabels);
  blueCornerInput.addEventListener("input", updateLabels);
  redInput.addEventListener("input", updateLabels);
  blueInput.addEventListener("input", updateLabels);
  roundInput.addEventListener("input", updateLabels);
  durationInput.addEventListener("change", function () {
    applyDuration(!running);
  });
  startPause.addEventListener("click", toggleTimer);
  document.getElementById("reset").addEventListener("click", function () {
    resetTimer(true);
  });
  document.getElementById("minusTen").addEventListener("click", function () {
    changeTime(-10);
  });
  document.getElementById("plusTen").addEventListener("click", function () {
    changeTime(10);
  });
  document
    .getElementById("previousRound")
    .addEventListener("click", function () {
      changeRound(-1);
    });
  document.getElementById("nextRound").addEventListener("click", function () {
    changeRound(1);
  });
  document
    .querySelector(".corner-red")
    .addEventListener("dblclick", swapCorners);
  document
    .querySelector(".corner-blue")
    .addEventListener("dblclick", swapCorners);

  document.addEventListener("keydown", function (event) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT") return;
    if (event.code === "Space") {
      event.preventDefault();
      toggleTimer();
    } else if (event.key.toLowerCase() === "r") {
      resetTimer(true);
    } else if (event.key.toLowerCase() === "n" || event.key === "ArrowUp") {
      changeRound(1);
    } else if (event.key.toLowerCase() === "p" || event.key === "ArrowDown") {
      changeRound(-1);
    }
  });

  loadSettings();
  updateLabels();
  applyDuration(true);
  tick();
})();
