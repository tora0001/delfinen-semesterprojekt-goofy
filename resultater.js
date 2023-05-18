"use strict";

window.addEventListener("load", initApp);

const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";

function initApp() {
  console.log("running");
  updatePostsGrid();
  document.querySelector(".new-result-btn").addEventListener("click", addResultClicked);
}

async function updatePostsGrid() {
  const results = await getResults();
  showResults(results);
}

function showResults(listOfMembers) {
  document.querySelector("#members").innerHTML = "";
  for (const member of listOfMembers) {
    showResult(member);
  }
}

async function getResults() {
  const response = await fetch(`${endpoint}/results.json`);
  const data = await response.json();
  const results = prepareResultData(data);
  return results;
}

function prepareResultData(resultObject) {
  const resultArray = [];
  for (const key in resultObject) {
    const result = resultObject[key];
    result.id = key;
    resultArray.push(result);
  }
  console.log(resultArray);
  return resultArray;
}

async function getMemberName(uid) {
  const response = await fetch(`${endpoint}/members/${uid}.json`);
  const data = await response.json();
  if (response.ok && data && data.name) {
    return data.name;
  }
}

function showResult(result) {
  getMemberName(result.uid).then((name) => {
    const postHTML = /*html*/ ` <article class="grid-item">
                <h1 class="resultName">${name}</h1>
                <p class="resultTime">${result.time}</p>
                <p class="resultDate">${result.date}</p>
                <p class="resultDisciplin">${result.disciplin}</p>
                <div class="results-btns">
                <button class="update-result">Opdater resultat</button>
                <button class="update-contest">Opdater stævner</button>
                </div>
                
            </article>`;
    document.querySelector("#members").insertAdjacentHTML("beforeend", postHTML);
  });
}

async function prepareNewResult() {
  const uid = document.querySelector("#uid").value;
  const time = document.querySelector("#time").value;
  const date = document.querySelector("#date").value;
  const disciplin = document.querySelector("#disciplin").value;

  const respone = await submitNewResult(uid, time, date, disciplin);
  if (respone.ok) {
    console.log("nyt medlem oprettet!");
    updatePostsGrid();
  }
}

async function submitNewResult(uid, time, date, disciplin) {
  console.log("Submitting new member");
  const newResult = { uid, time, date, disciplin };
  const postAsJson = JSON.stringify(newResult);
  const response = await fetch(`${endpoint}/results.json`, {
    method: "POST",
    body: postAsJson,
  });
  return response;
}

async function getMembersForResults() {
  const response = await fetch(`${endpoint}/members.json`);
  const data = await response.json();
  const members = prepareMemberDataForResults(data);
  return members;
}

function prepareMemberDataForResults(memberObject) {
  const memberArray = [];
  for (const key in memberObject) {
    const member = memberObject[key];
    member.id = key;
    memberArray.push(member);
  }
  console.log(memberArray);
  return memberArray;
}

async function addResultClicked() {
  document.querySelector("#add-result-form").showModal();

  const members = await getMembersForResults(); // Retrieve the list of members
  const memberOptions = members.map((member) => `<option value="${member.id}">${member.name}</option>`).join("");

  const addResultForm = /*html*/ `
    <form id="new-result-form" method="dialog">
      <h1>Opret nyt resultat</h1>
      <label for="uid">Vælg medlem:</label>
      <select id="uid" name="uid" required>
        ${memberOptions}
      </select>
      <br>
      <br>
      <label for="time">Tid:</label>
      <input type="text" id="time" name="time" required placeholder="00:00"/>
      <br>
      <br>
      <label for="date">Dato:</label>
      <input type="date" id="date" name="date" required />
      <br>
      <br>
      <label for="disciplin">Disciplin:</label>
      <select id="disciplin" required>
        <option value="" selected>ikke valgt</option>
        <option value="breast">Brystsvømning</option>
        <option value="butterfly">Butterfly</option>
        <option value="crawl">Crawl</option>
        <option value="backcrawl">Rygcrawl</option>
      </select>
      <br>
      <br>
      <button type="submit" value="submit">Opret</button>
      <input type="button" id="btn-cancel" value="Luk">
    </form>
  `;

  document.querySelector("#add-result-form").innerHTML = addResultForm;
  document.querySelector("#new-result-form").addEventListener("submit", prepareNewResult);
  document.querySelector("#btn-cancel").addEventListener("click", () => {
    document.querySelector("#new-result-form").close();
  });
}