"use strict";

window.addEventListener("load", initApp);

const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";

let selectedDisciplin = "";

function initApp() {
  console.log("running");
  document.querySelector("#filter-by-disciplin").addEventListener("change", filterResults);
  updatePostsGrid();
  document.querySelector(".new-result-btn").addEventListener("click", addResultClicked);
}

//updates the grid of results
async function updatePostsGrid() {
  const results = await getResults();
  showResults(results);
}

// goes through all of the results and displays them and also takes the filter into consideration
function showResults(listOfMembers) {
  document.querySelector("#members").innerHTML = "";

  for (const member of listOfMembers) {
    if (selectedDisciplin === "" || member.disciplin === selectedDisciplin) {
      showResult(member);
    }
  }
}

//fetches results from the firebase
async function getResults() {
  const response = await fetch(`${endpoint}/results.json`);
  const data = await response.json();
  const results = prepareResultData(data);
  return results;
}

// prepares the results data and returns it as an array
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

//connects the name from the members array to the uid in the results array
async function getMemberName(uid) {
  const response = await fetch(`${endpoint}/members/${uid}.json`);
  const data = await response.json();
  if (response.ok && data && data.name) {
    return data.name;
  }
}

// shows the individual result
function showResult(result) {
  getMemberName(result.uid).then((name) => {
    const postHTML = /*html*/ ` <article class="grid-item">
                <h1 class="resultName">${name}</h1>
                <p class="resultTime"><b>Tid:</b> ${result.time}</p>
                <p class="resultDate"><b>Dato:</b> ${result.date}</p>
                <p class="resultDisciplin"><b>Disciplin:</b> ${result.disciplin}</p>
                <p class="resultCompetition"><b>Stævne:</b> ${result.competition}</p>
                <p class="resultPlacement"><b>Placering:</b> ${result.placement}</p>
                <div class="results-btns">
                <button class="update-result">Opdater resultat</button>
                <button class="delete-result">Delete</button>
                </div>
                
            </article>`;
    document.querySelector("#members").insertAdjacentHTML("beforeend", postHTML);
    document.querySelector("#members article:last-child .delete-result").addEventListener("click", () => deleteResultClicked(result));
    document.querySelector("#members article:last-child .update-result").addEventListener("click", () => updateResultClicked(result));
  });
}

function filterResults(event) {
  selectedDisciplin = event.target.value;
  updatePostsGrid();
}

// Prepares all the data for creating a new result
async function prepareNewResult() {
  const uid = document.querySelector("#uid").value;
  const time = document.querySelector("#time").value;
  const date = document.querySelector("#date").value;
  const disciplin = document.querySelector("#disciplin").value;
  const competition = document.querySelector("#competition").value;
  const placement = document.querySelector("#placement").value;

  const respone = await submitNewResult(uid, time, date, disciplin, competition, placement);
  if (respone.ok) {
    console.log("nyt medlem oprettet!");
    updatePostsGrid();
  }
}

// Takes the data received in prepareNewResult and puts it into firebase
async function submitNewResult(uid, time, date, disciplin, competition, placement) {
  console.log("Submitting new member");
  const newResult = { uid, time, date, disciplin, competition, placement };
  const postAsJson = JSON.stringify(newResult);
  const response = await fetch(`${endpoint}/results.json`, {
    method: "POST",
    body: postAsJson,
  });
  return response;
}

//gets the members so it can be connected to the result after it's been prepared as an array
async function getMembersForResults() {
  const response = await fetch(`${endpoint}/members.json`);
  const data = await response.json();
  const members = prepareMemberDataForResults(data);
  return members;
}

//prepares the members in an array so it can be connected to the result
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

// When Add result is clicked it opens form
async function addResultClicked() {
  document.querySelector("#add-result-form").showModal();

  const members = await getMembersForResults();
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
      <label for="competition">Stævne:</label>
      <input type="text" id="competition" name="competition" placeholder="Indtast navn på stævne"/>
      <br>
      <br>
      <label for="placement">Placering:</label>
      <input type="number" id="placement" name="placement" placeholder="Indtast placering ved stævne"/>
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

async function updateResultClicked(result) {
  document.querySelector("#update-form").showModal();

  const members = await getMembersForResults();
  const memberOptions = members.map((member) => `<option value="${member.id}">${member.name}</option>`).join("");

  const updateResultForm = /*html*/ `
    <form id="new-result-form" method="dialog">
      <h1>Opdater resultat</h1>    
      <label for="uid">Vælg medlem:</label>
      <select id="uid" name="uid" required>
        ${memberOptions}
      </select>  
      <br>
      <br>
      <label for="time">Tid:</label>
      <input type="text" id="time" name="time" required placeholder="00:00" value="${result.time}"/>
      <br>
      <br>
      <label for="competition">Stævne:</label>
      <input type="text" id="competition" name="competition" placeholder="Indtast navn på stævne" value="${result.competition}"/>
      <br>
      <br>
      <label for="placement">Placering:</label>
      <input type="number" id="placement" name="placement" placeholder="Indtast placering ved stævne" value="${result.placement}"/>
      <br>
      <br>
      <label for="date">Dato:</label>
      <input type="date" id="date" name="date" required value="${result.date}"/>
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
      <button type="submit" value="submit">Opdater</button>
      <input type="button" id="btn-cancel" value="Luk">
    </form>
  `;

  document.querySelector("#update-form").innerHTML = updateResultForm;
  document.querySelector("#disciplin").value = result.disciplin;
  document.querySelector("#update-form").addEventListener("submit", () => prepareUpdatedResultData(result));
  document.querySelector("#btn-cancel").addEventListener("click", () => {
    document.querySelector("#update-form").close();
  });
}

async function prepareUpdatedResultData(result) {
  const uid = document.querySelector("#uid").value;
  const time = document.querySelector("#time").value;
  const date = document.querySelector("#date").value;
  const disciplin = document.querySelector("#disciplin").value;
  const competition = document.querySelector("#competition").value;
  const placement = document.querySelector("#placement").value;

  const response = await updateResult(result.id, time, date, disciplin, competition, placement);
  if (response.ok) {
    console.log(`${result.time} updated!`);
    updatePostsGrid();
  }
}

async function updateResult(uid, time, date, disciplin, competition, placement) {
  const updatedResult = { uid, time, date, disciplin, competition, placement };
  const postAsJson = JSON.stringify(updatedResult);
  const response = await fetch(`${endpoint}/results/${uid}.json`, {
    method: "PUT",
    body: postAsJson,
  });
  return response;
}

async function deleteResultClicked(result) {
  const response = await deleteResult(result.id);
  if (response.ok) {
    console.log("Result deleted!");
    updatePostsGrid();
  }
}
// Deletes the result
async function deleteResult(id) {
  const response = await fetch(`${endpoint}/results/${id}.json`, {
    method: "DELETE",
  });
  return response;
}
