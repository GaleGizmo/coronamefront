// import { Notyf } from 'notyf'

const menuCoristas = document.getElementById("select_name");

let coristaNameParsed = JSON.parse(localStorage.getItem("coristaName"))
const notyf = new Notyf({
  types: [
    {
      type: "hello",
      background: "blue",
      icon: false,
      position: {
        x: "center",
        y: "top",
      },
    },
  ],
});

function checkCorista() {
  // const coristaName = localStorage.getItem("coristaName");

  if (coristaNameParsed) {
    // coristaNameParsed = JSON.parse(coristaName);
    hideMenu();
    notyf.open({
      type: "hello",
      message: "Ola, " + coristaNameParsed.name,
    });
  }
}
function hideMenu() {
  menuCoristas.style.display = "none";
}
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

  const sortedNames = names.sort((a, b) => {
    if (a.points === b.points) {
      // Orden alfabético si los puntos son iguales
      return a.name.localeCompare(b.name);
    } else {
      // Orden por puntos si los puntos son diferentes
      return b.points - a.points;
    }
  });

  for (const name of sortedNames) {
    const cardName$$ = document.createElement("div");
    const name$$ = document.createElement("h2");
    const corista$$ = document.createElement("h4");
    const by = document.createElement("p");
    const points = document.createElement("span");
    // const motivo$$ = document.createElement("p");
    cardName$$.classList.add("mb-3");
    cardName$$.classList.add("card_name");
    by.classList.add("by");
    points.classList.add("points");
    points.textContent = name.points;
    name$$.textContent = name.name;
    corista$$.textContent = name.author.name;
    if (coristaNameParsed && coristaNameParsed.namesVoted.includes(name._id)) {
      cardName$$.classList.add("selected");
    }
    // motivo$$.textContent = name.reason;
    by.textContent = "by";

    cardName$$.appendChild(name$$);
    cardName$$.appendChild(by);
    cardName$$.appendChild(corista$$);
    cardName$$.appendChild(points);
    // cardName$$.appendChild(motivo$$);

    namesList$$.appendChild(cardName$$);
    cardName$$.addEventListener("click", () => {
      toggleName(name._id);
      cardName$$.classList.toggle("selected");
    });
  }
};
function toggleName(coroName) {
  if (
    coristaNameParsed.namesVoted &&
    coristaNameParsed.namesVoted.includes(coroName)
  ) {
    coristaNameParsed.namesVoted = coristaNameParsed.namesVoted.filter(
      (name) => name != coroName
    );
  } else {
    coristaNameParsed.namesVoted?.push(coroName);
  }
}

let coristasList = null;

const getCoristas = async () => {
  const data = await fetch(
    "https://coronamebackend.app.rockthebarrio.es/coristas"
  );
  const coristas = await data.json();
  if (typeof coristas != "string") {
    coristasList = coristas;
    
    const coristasNames = coristasList
      .filter((member) => member.name !== "Anónimo").filter((member)=>!member.logged)
      .map((el) => el.name);

    loadCoristas(coristasNames);
  }
};
const selectField$$ = document.getElementById("coristas");



const loadCoristas = (members) => {
  const sortedMembers = members.sort((a, b) => a.localeCompare(b));
  
  for (const member of sortedMembers) {
    const option = document.createElement("option");
    option.value = member;
    option.text = member;
    selectField$$.appendChild(option);
  }
};

const botonSetCorista$$ = document.getElementById("set_corista");
const sendVotesButton$$ = document.getElementById("send_votes");

async function setCorista() {
  hideMenu();
  const coristaData = coristasList.filter(
    (corista) => corista.name === selectField$$.value
  );

  const coristaId = coristaData[0]._id;
  try {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ logged: true }),
    };
    
    const response = await fetch(
      `https://coronamebackend.app.rockthebarrio.es/coristas/editCorista/${coristaId}`,
      options
    );
    
    if (response.ok) {
      const data = await response.json(); console.log("Respuesta", data);
      coristaData[0].logged = true;
      coristaNameParsed=coristaData[0]
      notyf.open({
        type: "hello",
        message: "Ola, " + coristaNameParsed.name,
      });
      localStorage.setItem("coristaName", JSON.stringify(coristaNameParsed));
      
    } else {
      console.error("Error al realizar la solicitud PUT");
    }
  } catch (error) {
    console.error("Error en la solicitud PUT:", error);
  }
}

const sendVotes = async () => {
  if (coristaNameParsed.namesVoted?.length==0) {
    notyf.error({
      message: "Non marcaches ningún nome",
      duration: 2000,
      position: {
        x: "center",
        y: "top",
      },
    });
    return;
  }
  try {
    const dataToSend = {
      votados: coristaNameParsed.namesVoted,
     
    };

    coristaNameParsed.voted = true;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    };
    const coristaId= JSON.parse(localStorage.getItem("coristaName"))._id
    console.log(coristaId)
    
    const response = await fetch(
      `https://coronamebackend.app.rockthebarrio.es/nombres/addVoto/${coristaId}`,
      options
    );
    const responseData = await response.json();
    console.log("Respuesta:", responseData)
    notyf.success({
      message: responseData.message,
      duration: 2000,
      position: {
        x: "center",
        y: "top",
      },
    });
    localStorage.setItem("coristaName", JSON.stringify(coristaNameParsed));

    await getAllNames();
  } catch (err) {
    console.error("Error en el envio:", err);
  }
};
botonSetCorista$$.addEventListener("click", setCorista);
sendVotesButton$$.addEventListener("click", sendVotes);
checkCorista();
getCoristas();
getAllNames();

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
