const getAllNames = async () => {
  const data = await fetch(
    "https://coronamebackend.app.rockthebarrio.es/nombres"
  );
  const names = await data.json();
  if (typeof names != "string") {
    drawNames(names);
  }
};
const drawNames = (names) => {
  const namesList$$ = document.getElementById("show_names");
  namesList$$.innerHTML = "";
  const sortedNames = names.sort((a, b) => a.name.localeCompare(b.name));

  for (const name of sortedNames) {
    const cardName$$ = document.createElement("div");
    const name$$ = document.createElement("h2");
    const corista$$ = document.createElement("h4");
    const by = document.createElement("p");
    const motivo$$ = document.createElement("p");
    cardName$$.classList.add("mb-3");
    cardName$$.classList.add("card_name");
    by.classList.add("by");
    name$$.textContent = name.name;
    corista$$.textContent = name.author.name;
    motivo$$.textContent = name.reason;
    by.textContent = "by";
    cardName$$.appendChild(name$$);
    cardName$$.appendChild(by);
    cardName$$.appendChild(corista$$);
    cardName$$.appendChild(motivo$$);

    namesList$$.appendChild(cardName$$);
  }
};
let coristasList = null;
const getCoristas = async () => {
  const data = await fetch(
    "https://coronamebackend.app.rockthebarrio.es/coristas"
  );
  const coristas = await data.json();
  if (typeof coristas != "string") {
    coristasList = coristas;
    const coristasNames = coristas.map((el) => el.name);

    loadCoristas(coristasNames);
  }
};
// const loadCoristas = (members) => {
//   const anonymousOption = "Anónimo";
//   const sortedMembers = members
//     .filter((member) => member !== anonymousOption)
//     .sort((a, b) => a.localeCompare(b));
//   sortedMembers.unshift(anonymousOption);
//   const selectField$$ = document.getElementById("choir_member");

//   for (const member of sortedMembers) {
//     const option = document.createElement("option");
//     option.value = member;
//     option.text = member;
//     selectField$$.appendChild(option);
//   }
// };

// const nameForm$$ = document.getElementById("names_form");
// const addNameIcon = document.querySelector(".icon-add");
// const sendName = async (e) => {
//   e.preventDefault();

//   const choirName$$ = document.querySelector("#choir_name");
//   const choirMember$$ = document.getElementById("choir_member");
//   const corista = coristasList.filter(
//     (member) => member.name === choirMember$$.value
//   );

//   const nameReason$$ = document.querySelector("#name_reason");
//   const nameToSend = {
//     name: choirName$$.value,
//     author: corista[0]._id,
//     reason: nameReason$$.value,
//   };
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(nameToSend),
//   };

//   await fetch("https://coronamebackend.app.rockthebarrio.es/nombres", options);
//   await getAllNames();
//   nameForm$$.reset();
//   const itemsToHide=document.querySelectorAll(".hidden")
//   showForm(itemsToHide)
//   addNameIcon.classList.add("hidden")
// };
// getCoristas();
getAllNames();

// const nameDiv$$ = document.getElementById("name_div");
// const coristaDiv$$ = document.getElementById("corista_div");
// const reasonDiv$$ = document.getElementById("motivo_div");
// const sendButton$$= document.getElementById("send_name")
// const showForm = (itemsToChange) => {
  
//   for (const element of itemsToChange){
//     element.classList.toggle("hidden")
//     element.classList.toggle("shown")
//   }
  
// };


// addNameIcon.addEventListener("click", ()=>{
//     const itemsToShow=document.querySelectorAll(".shown")
//     showForm(itemsToShow)
//     addNameIcon.classList.add("shown")
// });
// nameForm$$.addEventListener("submit", sendName);
