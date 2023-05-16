"use strict";

window.addEventListener("load", initApp);

const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";

function initApp() {
  console.log("Delfinen svømmer!");
  updatePostsGrid();
  document
    .querySelector(".new-member-btn")
    .addEventListener("click", addMemberClicked);
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
      <option value="young">Ungdomssvømmer (under 18)</option>
      <option value="senior">Seniorsvømmer (18 og over)</option>
      <option value="old">Pensionist (60 og over)</option>
      <option value="passive">Passivt medlemskab</option>
    </select>
    <br>
    <br>
    <button type="submit" value="submit">Opret</button>
    <input type="button" id="btn-cancel" value="Luk">
    </form>
    `;

  document.querySelector("#add-member-form").innerHTML = newMemberForm;

  document
    .querySelector("#add-member-form")
    .addEventListener("submit", prepareNewMember);

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

  // console.log(name, age, activity, team, disciplin, subscription);

  const respone = await submitNewMember(
    name,
    age,
    activity,
    team,
    disciplin,
    subscription
  );
  if (respone.ok) {
    console.log("nyt medlem oprettet!");
    updatePostsGrid();
  }
}

// Takes the data received in prepareNewMember and puts it into firebase
async function submitNewMember(
  name,
  age,
  activity,
  team,
  disciplin,
  subscription
) {
  console.log("Submitting new member");
  const newMember = { name, age, activity, team, disciplin, subscription };
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
                <button class="delete">Delete</button>
                <button class="update">Update</button>
                </div>
                
            </article>`;
  document.querySelector("#members").insertAdjacentHTML("beforeend", postHTML);
  document
    .querySelector("#members article:last-child .delete")
    .addEventListener("click", () => deleteMemberClicked(member));
  document
    .querySelector("#members article:last-child .update")
    .addEventListener("click", () => updateMemberClicked(member));
  document
    .querySelector("#members article:last-child .memberName")
    .addEventListener("click", () => memberNameClicked(member));
}

// goes through all of the members and displays them
function showMembers(listOfMembers) {
  document.querySelector("#members").innerHTML = "";
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
  const response = await fetch(`${endpoint}/members/${id}.json`, {
    method: "DELETE",
  });
  return response;
}
//updates the information of the member in the firebase and returns the updated member
async function updateMember(
  id,
  name,
  age,
  activity,
  team,
  disciplin,
  subscription
) {
  const updatedMember = { name, age, activity, team, disciplin, subscription };
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
      <option value="young">Ungdomssvømmer (under 18)</option>
      <option value="senior">Seniorsvømmer (18 og over)</option>
      <option value="old">Pensionist (60 og over)</option>
      <option value="passive">Passivt medlemskab</option>
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
  const activity = (document.querySelector("#activity").value =
    member.activity);
  const team = (document.querySelector("#team").value = member.team);
  const disciplin = (document.querySelector("#disciplin").value =
    member.disciplin);
  const subscription = (document.querySelector("#subscription").value =
    member.subscription);
  document
    .querySelector("#update-form")
    .addEventListener("submit", () => prepareUpdatedPostData(member));
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

  const response = await updateMember(
    member.id,
    name,
    age,
    activity,
    team,
    disciplin,
    subscription
  );
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
<p>${member.age}</p>
<p>${member.activity}</p>
<p>${member.team}</p>
<p>${member.disciplin}</p>
<p>${member.subscription}</p>

    <form method="dialog">
		<button id ="closeModalButton">Close</button>
    </form>`;

  document.querySelector("#member-info").innerHTML = memberHTML;
}
