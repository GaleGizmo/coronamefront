// import { Notyf } from 'notyf'

const menuCoristas = document.getElementById("select_name");
document.addEventListener('click.bs.modal', (event) => {
  if (event.target.matches('.btn-secondary')) {
    event.stopPropagation();
  }
});
let coristaNameParsed = JSON.parse(localStorage.getItem("coristaName"));
const header = document.getElementById("header");
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
let nameToModify;

function checkCorista() {
  if (coristaNameParsed) {
    hideMenu();
    // notyf.open({
    //   type: "hello",
    //   message: "Ola, " + coristaNameParsed.name,
    // });
  } else getCoristas()
}
function hideMenu() {
  header.style.display = "block";
  menuCoristas.style.display = "none";
}
const getAllNames = async () => {
  const data = await fetch("https://coronamebackend.app.rockthebarrio.es/nombres");
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
    const toggleButton = document.createElement("button");

    const motivo$$ = document.createElement("p");
    cardName$$.classList.add("mb-3");
    cardName$$.setAttribute("id", name.name)
    cardName$$.setAttribute("data-id", name._id)
    cardName$$.classList.add("card_name");
    by.classList.add("by");
    points.classList.add("points");
    points.textContent = name.points;
    name$$.textContent = name.name;
    corista$$.textContent = name.author.name;
  
    motivo$$.textContent = name.reason;
    motivo$$.classList.add("reason");
    by.textContent = "by";
    toggleButton.textContent = "?";
    toggleButton.classList.add("btn");
    toggleButton.classList.add("btn-secondary");
    toggleButton.classList.add("reason");
   

    cardName$$.appendChild(name$$);
    cardName$$.appendChild(by);
    cardName$$.appendChild(corista$$);
    cardName$$.appendChild(points);
    if (name.reason) {
      cardName$$.appendChild(toggleButton);
    }

    // cardName$$.appendChild(motivo$$);
    namesList$$.appendChild(cardName$$);
    const modalContent = `
    <div class="modal fade" id="modal-${name._id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">${name.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>${name.reason}</p>
          </div>
        </div>
      </div>
    </div>
`;
    namesList$$.insertAdjacentHTML("beforeend", modalContent);
    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation()
      const modalElement = document.getElementById(`modal-${name._id}`);
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    });

    cardName$$.addEventListener("click", () => {
      addToVoted(name._id, name.name);
    });
  }
  
    namesToColor()
  


};
const namesToColor = function () {
  if (coristaNameParsed.namesVoted.length>0){
    for (const element of coristaNameParsed.namesVoted){
      const nameToPaint=document.querySelector(`[data-id="${element.votado}"]`)
      
      setVotedColor(element.points, nameToPaint)
     
    
    }
  }
}
let  nameToVote=""
const confirmationModal = new bootstrap.Modal(
  document.getElementById("confirmationModal")
);
async function addToVoted(nameId, nameSelected) {
  nameToVote=nameSelected
  const pointsToHandle = JSON.parse(localStorage.getItem("pointsToSend"));
  const namesVoted=JSON.parse(localStorage.getItem("coristaName")).namesVoted
  if (!pointsToHandle && !namesVoted.some((obj) => obj.votado === nameId) && namesVoted.length<3){
    notyf.error({
      message: "Elixe os puntos a engadir",
      duration: 2000,
      position: {
        x: "center",
        y: "top",
      },
    });
    return;
  }
  
  const handleConfirmation = () => {
  
   
    const modalMessage = document.getElementById("modal_message");
    console.log(nameId, namesVoted);
    if (
      namesVoted &&
      namesVoted.some((obj) => obj.votado === nameId)
    ) {
      let nameFound=namesVoted.find((obj) => obj.votado === nameId);
      nameToModify = {
        votado: nameId,
        points: -nameFound.points,
      };
      if (nameFound.points === 1) {
        modalMessage.textContent = `Vas a quitar ${nameFound.points} punto a ${nameToVote}`;
      } else {
        modalMessage.textContent = `Vas a quitar ${nameFound.points} puntos a ${nameToVote}`;
      }
    } else {
      if (namesVoted.length < 3) {
        nameToModify = {
          votado: nameId,
          points: pointsToHandle,
        };
        if (pointsToHandle === 1) {
          modalMessage.textContent = `Vas a sumar ${pointsToHandle} punto a ${nameToVote}`;
        } else {
          modalMessage.textContent = `Vas a sumar ${pointsToHandle} puntos a ${nameToVote}`;
        }
      } else {
        notyf.error({
          message: "Xa votaches os tres nomes",
          duration: 2000,
          position: {
            x: "center",
            y: "top",
          },
        });
        return;
      }
    }
    confirmationModal.show();

    

    // Si el usuario cancela, no hace nada
    document.getElementById("cancelButton").addEventListener("click", () => {
      confirmationModal.hide();
      nameToModify = "";
    });
  };
  
  handleConfirmation();
}
document.getElementById("confirmButton").addEventListener("click", async () => {
  try {
    await sendVotes(nameToModify);
    const votedName=document.getElementById(nameToVote)
    

    setVotedColor(nameToModify.points, votedName)
    
    localStorage.removeItem("pointsToSend")
    
    confirmationModal.hide();
    await getAllNames()
    setTimeout(() => {
      location.reload();
  }, 2000);
  
  
    
  } catch (err) {
    console.error("Error al enviar votos:", err);
  }

});
// function toggleName(coroName) {
//   if (
//     coristaNameParsed.namesVoted &&
//     coristaNameParsed.namesVoted.includes(coroName)
//   ) {
//     coristaNameParsed.namesVoted = coristaNameParsed.namesVoted.filter(
//       (name) => name != coroName
//     );
//   } else {
//     coristaNameParsed.namesVoted?.push(coroName);
//   }
// }

let coristasList = null;

const getCoristas = async () => {
  const data = await fetch("https://coronamebackend.app.rockthebarrio.es/coristas");
  const coristas = await data.json();
  if (typeof coristas != "string") {
    coristasList = coristas;

    const coristasNames = coristasList
      .filter((member) => member.name !== "Anónimo")
      .filter((member) => !member.logged)
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
const sendThreePointsButton$$ = document.getElementById("sendThreePoints");
const sendTwoPointsButton$$ = document.getElementById("sendTwoPoints");
const sendOnePointButton$$ = document.getElementById("sendOnePoint");
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
      const data = await response.json();

      coristaData[0].logged = true;
      coristaNameParsed = coristaData[0];
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

const sendVotes = async (votado) => {
  try {
    coristaNameParsed.voted = true;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(votado),
    };
    const coristaId = JSON.parse(localStorage.getItem("coristaName"))._id;
  

    const response = await fetch(
      `https://coronamebackend.app.rockthebarrio.es/nombres/addVoto/${coristaId}`,
      options
    );
    const responseData = await response.json();
    console.log("Respuesta:", responseData);
    await notyf.success({
      message: responseData.message,
      duration: 2000,
      position: {
        x: "center",
        y: "top",
      },
    });
    localStorage.setItem(
      "coristaName",
      JSON.stringify(responseData.coristaName)
    );

  } catch (err) {
    console.error("Error en el envio:", err);
  }
};
// const noMoreVotes=()=>{
//   notyf.error({
//     message: "Rematou o plazo para votar",
//     duration: 2000,
//     position: {
//       x: "center",
//       y: "top",
//     },
//   });
// }
const setPointsToSend = (points) => {
  if (JSON.parse(localStorage.getItem("pointsToSend")) == points) {
    points = 0;
  }

  localStorage.setItem("pointsToSend", JSON.stringify(points));
};

botonSetCorista$$.addEventListener("click", setCorista);

sendThreePointsButton$$.addEventListener("click", () => {
  setPointsToSend(3);
  sendThreePointsButton$$.classList.toggle("selected");
 
  sendTwoPointsButton$$.classList.remove("selected");
  sendOnePointButton$$.classList.remove("selected");
});
sendTwoPointsButton$$.addEventListener("click", () => {
  setPointsToSend(2);
  sendTwoPointsButton$$.classList.toggle("selected");
  sendThreePointsButton$$.classList.remove("selected");
  sendOnePointButton$$.classList.remove("selected");
});
sendOnePointButton$$.addEventListener("click", () => {
  setPointsToSend(1);
  sendOnePointButton$$.classList.toggle("selected");
  sendTwoPointsButton$$.classList.remove("selected");
  sendThreePointsButton$$.classList.remove("selected");
});

function setVotedColor (points, divToColor) {
  console.log(points, divToColor);
  switch (points) {
    case 3:
      updateButtonStyle(sendThreePointsButton$$, true, "#1be31b", divToColor);
      break;
    case 2:
      updateButtonStyle(sendTwoPointsButton$$, true, "#FFD700", divToColor);
      break;
    case 1:
      updateButtonStyle(sendOnePointButton$$, true, "#6fd9f6", divToColor);
      break;
    case -3:
      updateButtonStyle(sendThreePointsButton$$, false, "#ffffff", divToColor);
      break;
    case -2:
      updateButtonStyle(sendTwoPointsButton$$, false, "#ffffff", divToColor);
      break;
    case -1:
      updateButtonStyle(sendOnePointButton$$, false, "#ffffff", divToColor);
      break;
  }
}
function updateButtonStyle(button, disabled, backgroundColor, element) {
  button.disabled = disabled;
  element.style.backgroundColor = backgroundColor;
  if (disabled) {
    button.classList.remove("pointsButton");
    button.classList.add("disabledButton");
  } else {
    button.removeAttribute("disabled");
    button.classList.add("pointsButton");
    button.classList.remove("disabledButton");
  }
}
// sendVotesButton$$.addEventListener("click", noMoreVotes);
checkCorista();

// getCoristas();
getAllNames();

