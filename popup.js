document.addEventListener('DOMContentLoaded', function() {
  var countdownElement = document.getElementById('countdown');
  var startButton = document.getElementById('start');
  var pauseButton = document.getElementById('pause');
  var resumeButton = document.getElementById('resume');
  var resetButton = document.getElementById('reset');
  var countdownInterval;
  var remainingTime = 0;
  var isPaused = false;

  function formatTime(time, years, months) {
  var days = Math.floor(time / (24 * 60 * 60));
  var hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
  var minutes = Math.floor((time % (60 * 60)) / 60);
  var seconds = Math.floor(time % 60);

  return years + 'y ' + months + 'm ' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
}

  function startCountdown(years, months, duration) {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  var startTime = Date.now();
  var endTime = startTime + duration * 1000;

  countdownInterval = setInterval(function() {
    var currentTime = Date.now();
    remainingTime = Math.max(0, endTime - currentTime);
    countdownElement.textContent = formatTime(remainingTime / 1000, years, months);

    if (remainingTime === 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = 'Время вышло!';
    }
  }, 1000);
}


  function pauseCountdown() {
    clearInterval(countdownInterval);
    isPaused = true;
  }

  function resumeCountdown() {
    if (isPaused) {
      isPaused = false;
      startCountdown(remainingTime / 1000);
    }
  }

  function resetCountdown() {
    clearInterval(countdownInterval);
    countdownElement.textContent = '';
    remainingTime = 0;
    isPaused = false;
  }

  startButton.addEventListener('click', function() {
  var years = parseInt(prompt('Введите количество лет:'));
  var months = parseInt(prompt('Введите количество месяцев:'));
  var days = parseInt(prompt('Введите количество дней:'));
  var hours = parseInt(prompt('Введите количество часов:'));
  var minutes = parseInt(prompt('Введите количество минут:'));
  var seconds = parseInt(prompt('Введите количество секунд:'));

  var duration = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
  startCountdown(years, months, duration);
});


  pauseButton.addEventListener('click', function() {
    pauseCountdown();
  });

  resumeButton.addEventListener('click', function() {
    resumeCountdown();
  });

  resetButton.addEventListener('click', function() {
    resetCountdown();
  });

  // Restore countdown state if available
  chrome.storage.local.get(['remainingTime', 'isPaused'], function(result) {
  if (result && result.remainingTime && result.remainingTime > 0) {
    remainingTime = result.remainingTime;
    isPaused = result.isPaused || false;
    if (!isPaused) {
      startCountdown(remainingTime / 1000);
    }
  }
});


  // Save countdown state
  function saveCountdownState() {
    var countdownState = {
      remainingTime: remainingTime,
      isPaused: isPaused
    };
    chrome.runtime.sendMessage({ action: 'saveCountdownState', state: countdownState });
  }

  // Send countdown state on unload
  window.addEventListener('beforeunload', function() {
    saveCountdownState();
  });

  // Message listener for background page
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateCountdown') {
      countdownElement.textContent = formatTime(request.remainingTime / 1000);
      remainingTime = request.remainingTime;
      isPaused = request.isPaused;
    }
  });
});
