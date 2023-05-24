"use strict";

let amount = 0;
const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";
window.addEventListener("load", initApp);

async function initApp() {
  const members = await getMembers();
  addTotalAmount(members);
  showTotalAmount();
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

function addTotalAmount(members) {
  members.forEach(findAmount);
  function findAmount(member) {
    console.log("run");
    if (member.subscription == "young") {
      amount = amount + 1000;
    } else if (member.subscription == "senior") {
      amount = amount + 1600;
    } else if (member.subscription == "old") {
      amount = amount + 1250;
    } else if (member.subscription == "passive") {
      amount = amount + 500;
    }
  }
}
function showTotalAmount() {
  document.querySelector("#amount").innerHTML = amount;
}

function showMember(member) {
  console.log(member.paid);
  const postHTML = /*html*/ ` <article class="grid-item">

                  <h1 class="memberName">${member.name}</h1>
                  <p>Har ikke betalt</p>
            
              </article>`;
  if (member.paid == "ikkebetalt") {
    document.querySelector("#members").insertAdjacentHTML("beforeend", postHTML);
  }
}

// goes through all of the members and displays them
function showMembers(listOfMembers) {
  document.querySelector("#members").innerHTML = "";

  for (const member of listOfMembers) {
    showMember(member);
  }
}
