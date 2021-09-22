var menuContainer = document.querySelector(".menu-container");
var settingBox = document.querySelector("#setting");
var settingPage = document.querySelector(".setting");
var prevBtn = document.querySelector(".setting-prev-btn");

settingBox.addEventListener("click", () => {
  menuContainer.style.display = "none";
  settingPage.style.display = "flex";
});

prevBtn.addEventListener("click", () => {
  menuContainer.style.display = "flex";
  settingPage.style.display = "none";
});

// AUDIO SETTING
var bgmCtl = document.querySelector(".switch-bgm");
bgmCtl.addEventListener("click", () => {
  var fileNames = [
    "wallSound",
    "bottomSound",
    "paddleSound",
    "brickSound",
    "winSound",
    "loseSound",
    "levelUpSound"
  ];

  var paths = [
    "sound/discord/mention-3.mp3",
    "sound/discord/left.mp3",
    "sound/discord/joined.mp3",
    "sound/discord/message.mp3",
    "sound/discord/incoming-2.mp3",
    "sound/discord/voice-disconnect.mp3",
    "sound/discord/mention-2.mp3"
  ];

  if (bgmCtl.checked) {
    for (var i = 0; i < fileNames.length; i++) {
      var audio = document.getElementById(fileNames[i]);
      audio.src = paths[i];
    }
  } else {
    for (const filename of fileNames) {
      var audio = document.getElementById(filename);
      audio.src = "";
    }
  }
});

// Ranking Setting
var isRank = document.querySelector(".switch-ranking");
isRank.addEventListener("click", () => {
  if (isRank.checked) {
    isSaveRank = true;
  } else {
    isSaveRank = false;
  }
});
