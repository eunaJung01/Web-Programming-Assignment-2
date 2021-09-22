var menuContainer = document.querySelector(".menu-container");
var rankingBox = document.querySelector("#ranking");
var rankingPage = document.querySelector(".ranking");
var prevBtn = document.querySelector(".prev-btn");
var rank1container = document.querySelector(".mode1-rank .rank-container");
var rank2container = document.querySelector(".mode2-rank .rank-container");

var ref1 = database.ref("mode1");
ref1
  .orderByChild("score")
  .limitToLast(5)
  .on("value", function (snapshot) {
    var arr = [];
    snapshot.forEach(function (child) {
      arr.push({ name: child.key, score: child.val().score });
    });
    arr = arr.reverse();

    rank1container.innerHTML = "";

    for (var i = 0; i < arr.length; i++) {
      const name = arr[i].name;
      const score = arr[i].score;
      const el = `
    <div class="rank">
      <div class="rank-number">${i + 1}.</div>
      <div class="rank-name">${name}</div>
      <div class="rank-score">${score}점</div>
    </div>
    `;
      rank1container.insertAdjacentHTML("beforeend", el);
    }
  });

var ref2 = database.ref("mode2");
ref2
  .orderByChild("score")
  .limitToLast(5)
  .on("value", function (snapshot) {
    var arr = [];
    snapshot.forEach(function (child) {
      arr.push({ name: child.key, score: child.val().score });
    });
    arr = arr.reverse();

    rank2container.innerHTML = "";

    for (var i = 0; i < arr.length; i++) {
      const name = arr[i].name;
      const score = arr[i].score;
      const el = `
  <div class="rank">
    <div class="rank-number">${i + 1}.</div>
    <div class="rank-name">${name}</div>
    <div class="rank-score">${score}점</div>
  </div>
  `;
      rank2container.insertAdjacentHTML("beforeend", el);
    }
  });

rankingBox.addEventListener("click", () => {
  menuContainer.style.display = "none";
  rankingPage.style.display = "flex";
});

prevBtn.addEventListener("click", () => {
  menuContainer.style.display = "flex";
  rankingPage.style.display = "none";
});
