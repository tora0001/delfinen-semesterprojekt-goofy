"use strict";

window.addEventListener("load", initApp);

const endpoint = "https://delfinen-36fde-default-rtdb.firebaseio.com/";

function initApp() {
  console.log("Delfinen svømmer!");
  getMembers();
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
