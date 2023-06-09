"use strict";

window.addEventListener("load", initApp);

const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";

function initApp() {
  console.log("Delfinen svømmer!");
  updatePostsGrid();
  document.querySelector(".new-member-btn").addEventListener("click", addMemberClicked);
  document.querySelector("#input-search").addEventListener("keyup", inputSearchChanged);
  document.querySelector("#input-search").addEventListener("search", inputSearchChanged);
}
// Updates the grid showing the list of members
async function updatePostsGrid() {
  const members = await getMembers();
  showMembers(members);
}

// fetches members from firebase
async function getMembers() {
  const response = await fetch(`${endpoint}/members.json`);
  const data = await response.json();
  const members = prepareMemberData(data);
  return members;
}

// prepares the member data and returns it as an array
function prepareMemberData(memberObject) {
  const memberArray = [];
  for (const key in memberObject) {
    const member = memberObject[key];
    member.id = key;
    memberArray.push(member);
  }
  console.log(memberArray);
  return memberArray;
}

// When Add member is clicked it opens form
function addMemberClicked() {
  document.querySelector("#add-member-form").showModal();
  const newMemberForm = /*html*/ `
    <form id="new-member-form" method="dialog">
    <h1>Opret nyt medlem</h1>
    <label for="name">Navn:</label>
    <input type="text" id="name" name="name" required placeholder="Indtast navn på medlem" />
    <br>
    <br>
    <label for="age">Alder:</label>
    <input type="text" id="age" name="age" required placeholder="Indtast alder på medlem" />
    <br>
    <br>
    <label for="activity">Aktivitetsform:</label>
    <select id="activity" required>
      <option value="" selected>ikke valgt</option>
      <option value="competition">Konkurrencesvømmer</option>
      <option value="exercise">Motionist</option>
    </select>
    <br>
    <br>
    <label for="team">Hold:</label>
    <select id="team" required>
      <option value="" selected>ikke valgt</option>
      <option value="junior">Junior (under 18)</option>
      <option value="senior">Senior (18 og over)</option>
    </select>
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
    <label for="subscription">Medlemskab:</label>
    <select id="subscription" required>
      <option value="" selected>ikke valgt</option>
      <option value="1000">Ungdomssvømmer (under 18)</option>
      <option value="1600">Seniorsvømmer (18 og over)</option>
      <option value="1250">Pensionist (60 og over)</option>
      <option value="500">Passivt medlemskab</option>
    </select>
    <br>
    <br>
    <label for="paid">Kontingent:</label>
    <select id="paid" required>
      <option value="ikkebetalt" selected>Ikke Betalt</option>
      <option value="betalt">Betalt</option>
      </select>
    <br>
    <br>
    <button type="submit" value="submit">Opret</button>
    <input type="button" id="btn-cancel" value="Luk">
    </form>
    `;

  document.querySelector("#add-member-form").innerHTML = newMemberForm;

  document.querySelector("#add-member-form").addEventListener("submit", prepareNewMember);

  document.querySelector("#btn-cancel").addEventListener("click", () => {
    document.querySelector("#add-member-form").close();
  });
}

// Prepares all the data for creating a new member
async function prepareNewMember() {
  const name = document.querySelector("#name").value;
  const age = document.querySelector("#age").value;
  const activity = document.querySelector("#activity").value;
  const team = document.querySelector("#team").value;
  const disciplin = document.querySelector("#disciplin").value;
  const subscription = document.querySelector("#subscription").value;
  const paid = document.querySelector("#paid").value;

  // console.log(name, age, activity, team, disciplin, subscription);

  const respone = await submitNewMember(name, age, activity, team, disciplin, subscription, paid);
  if (respone.ok) {
    console.log("nyt medlem oprettet!");
    updatePostsGrid();
  }
}

// Takes the data received in prepareNewMember and puts it into firebase
async function submitNewMember(name, age, activity, team, disciplin, subscription, paid) {
  console.log("Submitting new member");
  const newMember = {
    name,
    age,
    activity,
    team,
    disciplin,
    subscription,
    paid,
  };
  const postAsJson = JSON.stringify(newMember);
  const response = await fetch(`${endpoint}/members.json`, {
    method: "POST",
    body: postAsJson,
  });
  return response;
}

// shows the individual member
function showMember(member) {
  const postHTML = /*html*/ ` <article class="grid-item">
                <h1 class="memberName">${member.name}</h1>
                <div class="btns">
                <button class="delete">Fjern medlem</button>
                <button class="update">Opdater oplysninger</button>
                </div>
                
            </article>`;
  document.querySelector("#members").insertAdjacentHTML("beforeend", postHTML);
  document.querySelector("#members article:last-child .delete").addEventListener("click", () => deleteMemberClicked(member));
  document.querySelector("#members article:last-child .update").addEventListener("click", () => updateMemberClicked(member));
  document.querySelector("#members article:last-child .memberName").addEventListener("click", () => memberNameClicked(member));
}

// goes through all of the members and displays them
function showMembers(listOfMembers) {
  document.querySelector("#members").innerHTML = "";
  listOfMembers.sort((a, b) => a.age - b.age);
  for (const member of listOfMembers) {
    showMember(member);
  }
}
// When the delete button is clicked it calls deleteMember with the id of the deleted member
async function deleteMemberClicked(member) {
  const response = await deleteMember(member.id);
  if (response.ok) {
    console.log("Member deleted!");
    updatePostsGrid();
  }
}
// Deletes the member
async function deleteMember(id) {
  deleteResultsForMember(id);
  const response = await fetch(`${endpoint}/members/${id}.json`, {
    method: "DELETE",
  });
  return response;
}
//updates the information of the member in the firebase and returns the updated member
async function updateMember(id, name, age, activity, team, disciplin, subscription, paid) {
  const updatedMember = {
    name,
    age,
    activity,
    team,
    disciplin,
    subscription,
    paid,
  };
  const postAsJson = JSON.stringify(updatedMember);
  const response = await fetch(`${endpoint}/members/${id}.json`, {
    method: "PUT",
    body: postAsJson,
  });
  return response;
}
// gets called when the Update button is clicked and opens the form for updating the info
async function updateMemberClicked(member) {
  document.querySelector("#update-form").showModal();

  const updateMemberForm = /*html*/ `
    <form id="new-member-form" method="dialog">
    <h1>Opret nyt medlem</h1>
    <label for="name">Navn:</label>
    <input type="text" id="name" name="name" required placeholder="Indtast navn på medlem" />
    <br>
    <br>
    <label for="age">Alder:</label>
    <input type="text" id="age" name="age" required placeholder="Indtast alder på medlem" />
    <br>
    <br>
    <label for="activity">Aktivitetsform:</label>
    <select id="activity" required>
      <option value="" selected>ikke valgt</option>
      <option value="competition">Konkurrencesvømmer</option>
      <option value="exercise">Motionist</option>
    </select>
    <br>
    <br>
    <label for="team">Hold:</label>
    <select id="team" required>
      <option value="" selected>ikke valgt</option>
      <option value="junior">Junior (under 18)</option>
      <option value="senior">Senior (18 og over)</option>
    </select>
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
    <label for="subscription">Medlemskab:</label>
    <select id="subscription" required>
      <option value="" selected>ikke valgt</option>
      <option value="1000">Ungdomssvømmer (under 18)</option>
      <option value="1600">Seniorsvømmer (18 og over)</option>
      <option value="1250">Pensionist (60 og over)</option>
      <option value="500">Passivt medlemskab</option>
    </select>
    <br>
    <br>
    <label for="paid">Kontingent:</label>
    <select id="paid" required>
      <option value="ikkebetalt" selected>Ikke Betalt</option>
      <option value="betalt">Betalt</option>
      </select>
    <br>
    <br>
    <button type="submit" value="submit">Opdater</button>
    <input type="button" id="btn-cancel" value="Luk">
    </form>
    `;

  document.querySelector("#update-form").innerHTML = updateMemberForm;
  const name = (document.querySelector("#name").value = member.name);
  const age = (document.querySelector("#age").value = member.age);
  const activity = (document.querySelector("#activity").value = member.activity);
  const team = (document.querySelector("#team").value = member.team);
  const disciplin = (document.querySelector("#disciplin").value = member.disciplin);
  const subscription = (document.querySelector("#subscription").value = member.subscription);
  const paid = (document.querySelector("#paid").value = member.paid);
  document.querySelector("#update-form").addEventListener("submit", () => prepareUpdatedPostData(member));
  document.querySelector("#btn-cancel").addEventListener("click", () => {
    document.querySelector("#update-form").close();
  });
}
// prepares the updated data and calls the updateMember function with that data
async function prepareUpdatedPostData(member) {
  const name = document.querySelector("#name").value;
  const age = document.querySelector("#age").value;
  const activity = document.querySelector("#activity").value;
  const team = document.querySelector("#team").value;
  const disciplin = document.querySelector("#disciplin").value;
  const subscription = document.querySelector("#subscription").value;
  const paid = document.querySelector("#paid").value;

  const response = await updateMember(member.id, name, age, activity, team, disciplin, subscription, paid);
  if (response.ok) {
    console.log(`${member.name} updated!`);
    updatePostsGrid();
  }
}
// opens a dialog for all the information on the member when the name is clicked
function memberNameClicked(member) {
  document.querySelector("#member-info").showModal();

  const memberHTML = /*html*/ `
    <h1>${member.name}</h1>
<p><b>Alder: </b> ${member.age}</p>
<p><b>Aktivitetsform: </b>${member.activity}</p>
<p><b>Hold: </b>${member.team}</p>
<p><b>Disciplin: </b>${member.disciplin}</p>
<p><b>Medlemskab: </b>${member.subscription}</p>
<p><b>Betaling: </b>${member.paid}</p>

    <form method="dialog">
		<button id ="closeModalButton">Close</button>
    </form>`;

  document.querySelector("#member-info").innerHTML = memberHTML;
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
// when you delete a member, it also deletes result for that member
async function deleteResultsForMember(id) {
  const results = await getResults();
  console.log(results);

  for (const result of results) {
    checkForUid(result);
  }
  //checks every UID if its the same as the member.id we deleted and deletes the result if it matches
  async function checkForUid(result) {
    console.log(`checking ${result.uid}`);
    if (result.uid == id) {
      const response = await fetch(`${endpoint}/results/${result.id}.json`, {
        method: "DELETE",
      });
      return response;
    }
  }
}

async function inputSearchChanged(event) {
  console.log("Searching");
  const query = event.target.value.toLowerCase();
  const members = await getMembers();
  const filteredPosts = members.filter((member) => member.name.toLowerCase().includes(query));
  showMembers(filteredPosts);
}
