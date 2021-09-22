var id = document.querySelector("#id");
var pwd = document.querySelector("#pwd");
var submit = document.querySelector("#login-submit");
var loginContainer = document.querySelector(".login-container");
var menuContainer = document.querySelector(".menu-container");
var userProfile = document.querySelector(".user-profile");
var userName = document.querySelector(".user-name");
var mode1 = document.querySelector(".mode1");
var mode2 = document.querySelector(".mode2");
var ranking = document.querySelector(".ranking");
var setting = document.querySelector(".setting");

mode1.style.display = "none";
mode2.style.display = "none";
menuContainer.style.display = "none";
ranking.style.display = "none";
setting.style.display = "none";

const getJSESSIONID = () => {
  const url = `https://checku.site/login/?id=${id.value}&pwd=${pwd.value}`;
  console.log(url);
  return fetch(url).then((res) => res.json());
};

const getUser = (JSESSIONID) => {
  const url = `https://checku.site/user/?JSESSIONID=${JSESSIONID}`;
  return fetch(url).then((res) => res.json());
};

const getSubjects = (JSESSIONID) => {
  const url = `https://checku.site/user/subject/?JSESSIONID=${JSESSIONID}`;
  return fetch(url).then((res) => res.json());
};

const showMenu = (USER) => {
  $(".login-container").hide();
  $(".menu-container").show();
  userProfile.src = USER["dmPhoto"];
  userName.innerHTML = USER["user"]["KOR_NM"];
};

const login = async () => {
  var JSESSIONID;
  var USER;

  JSESSIONID = await getJSESSIONID();
  console.log("JSESSIONID", JSESSIONID);

  if (JSESSIONID["ERRMSG"]) {
    alert(JSESSIONID["ERRMSG"]["ERRCODE"]);
  } else {
    USER = await getUser(JSESSIONID["JSESSIONID"]);
    console.log("USER", USER);

    while (USER["ERRMSGINFO"]) {
      JSESSIONID = await getJSESSIONID();
      console.log("JSESSIONID", JSESSIONID);

      USER = await getUser(JSESSIONID["JSESSIONID"]);
      console.log("USER", USER);
    }

    subjects = await getSubjects(JSESSIONID["JSESSIONID"]);
    user = USER;

    alert(`안녕하세요, ${USER["user"]["KOR_NM"]}님!`);

    showMenu(USER);
  }
};

const eneterkey = () => {
  if (window.event.keyCode == 13) {
    login();
  }
};

submit.addEventListener("click", login);
