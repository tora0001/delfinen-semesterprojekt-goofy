"use strict";

window.addEventListener("load", initApp);

const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";

let selectedDisciplin = "";

function initApp() {
  console.log("running");
  document.querySelector("#filter-by-disciplin").addEventListener("change", filterResults);
  updatePostsGrid();
  document.querySelector(".new-result-btn").addEventListener("click", addResultClicked);
  document.querySelector(".open-top-btn").addEventListener("click", topButtonClicked);
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
                <p class="resultTeam"><b>Hold:</b> ${result.team}</p>
                <div class="results-btns">
                <button class="delete-result">Slet Resultat</button>
                </div>
                
            </article>`;
    document.querySelector("#members").insertAdjacentHTML("beforeend", postHTML);
    document.querySelector("#members article:last-child .delete-result").addEventListener("click", () => deleteResultClicked(result));
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
  const team = document.querySelector("#team").value;

  const respone = await submitNewResult(uid, time, date, disciplin, competition, placement, team);
  if (respone.ok) {
    console.log("nyt medlem oprettet!");
    updatePostsGrid();
  }
}

// Takes the data received in prepareNewResult and puts it into firebase
async function submitNewResult(uid, time, date, disciplin, competition, placement, team) {
  console.log("Submitting new member");
  const newResult = { uid, time, date, disciplin, competition, placement, team };
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
      <input type="text" id="time" name="time" required placeholder="Indtast tid i sekunder"/>
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
        <option value="Brystsvømning">Brystsvømning</option>
        <option value="Butterfly">Butterfly</option>
        <option value="Crawl">Crawl</option>
        <option value="Ryg Crawl">Rygcrawl</option>
      </select>
      <br>
      <br>
      <label for="team">Hold:</label>
      <select id="team" required>
        <option value="" selected>ikke valgt</option>
        <option value="Senior">Senior</option>
        <option value="Junior">Junior</option>
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
    document.querySelector("#add-result-form").close();
  });
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


async function topButtonClicked(){
  document.querySelector("#top-five-dialog").showModal();
  const results = await getResults();
  showResultsTop(results);
}

// goes through all of the results and displays them and also takes the filter into consideration
function showResultsTop(listOfMembers) {
  document.querySelector("#top-five-dialog").innerHTML = /*html*/ `      
  <select name="filter-by-disciplin-top" id="filter-by-disciplin-top">
  <option value="" selected>Alle discipliner</option>
  <option value="Brystsvømning">Brystsvømning</option>
  <option value="butterfly">Butterfly</option>
  <option value="Crawl">Crawl</option>
  <option value="Rygcrawl">Rygcrawl</option>
</select>;`
const disciplin = (document.querySelector("#filter-by-disciplin-top").value =selectedDisciplin);
document.querySelector("#filter-by-disciplin-top").addEventListener("change", filterResultsTop);
  for (const member of listOfMembers) {
    if (selectedDisciplin === "" || member.disciplin === selectedDisciplin) {
      showTopResult(member);
    }
  }
}

// shows the individual result
function showTopResult(result) {
  console.log("heeey");
  getMemberName(result.uid).then((name) => {
    const postHTML = /*html*/ ` <article class="grid-item">
                <h1 class="resultName">${name}</h1>
                <p class="resultTime"><b>Tid:</b> ${result.time}</p>
         
            </article>`;
    document.querySelector("#top-five-dialog").insertAdjacentHTML("beforeend", postHTML);
  });
}
async function filterResultsTop(event) {
  selectedDisciplin = event.target.value;
  const results = await getResults();
showResultsTop(results);
}