"use strict";

window.addEventListener("load", initApp);

const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";

function initApp() {
  console.log("Delfinen svømmer!");
  getMembers();
  document.querySelector(".new-member-btn").addEventListener("click", addMemberClicked);
}

async function getMembers() {
  const response = await fetch(`${endpoint}/members.json`);
  const data = await response.json();
  const members = prepareMemberData(data);
  prepareMemberData(data);
  return members;
}

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

  document.querySelector("#add-member-form").addEventListener("submit", prepareNewMember);

  document.querySelector("#btn-cancel").addEventListener("click", () => {
    document.querySelector("#add-member-form").close();
  });
}

async function prepareNewMember() {
  console.log("nyt medlem oprettet!");
}
