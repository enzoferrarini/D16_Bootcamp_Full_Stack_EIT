let myToast = new bootstrap.Toast(document.getElementById('myToast'));
let myToastConfirm = new bootstrap.Toast(document.getElementById('myToastConfirm'));
let btnAddContact= document.getElementById("btnAddContact");
let btnCancelChanges= document.getElementById("btnCancelChanges");
let nameInput= document.getElementById("idName");
let emailInput= document.getElementById("idEmail");
let birthDayInput= document.getElementById("idBirthDay");
let msgNameInput= document.getElementById("idMsgName");
let msgEmailInput= document.getElementById("idMsgEmail");
let msgDateInput= document.getElementById("idMsgBirthDay");

let contacts=[];
let nextIdContact=0;
let contactCount=0;
let currentContactId=-1;
let deleteteIdSelection=-1;
let validForm=true;

const saveLS=()=>{
    var contactsAsString = JSON.stringify(contacts);
    localStorage.setItem("myContacts", contactsAsString);
}

const formatDate=(date)=>{
    let fecha = new Date(date);
    let dia = fecha.getDate().toString().padStart(2, '0');
    let mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 ya que los meses van de 0 a 11
    let anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

const highlightRow=(element)=>{   
    let elementoPadre = element.parentNode.parentNode;
    elementoPadre.classList.add("highlightRow");
}

const unHighlightAllRow=()=>{   
    let trsHL = document.getElementsByClassName("highlightRow");
    for (let index = 0; index < trsHL.length; index++) {
        trsHL[index].classList.remove("highlightRow");       
    } 
}

const saveNewContact=()=>{ 
    //OBTENGO LE ULTIMO ID DE LA BASE DE CONTACTOS
    for (var i = 0; i < contacts.length; i++) {
        var objeto = contacts[i];
        if(nextIdContact<objeto.ID)
            nextIdContact=objeto.ID;
    }

    let newContact={
        ID: ++nextIdContact,
        NOMBRE: nameInput.value,
        FECHANACIMIENTO: birthDayInput.value,
        EMAIL: emailInput.value,
    }

    contacts.push(newContact)
    saveLS();
    return newContact;
}

const validateName = () => {
    let name=nameInput.value; 
    if (verificarNoVacio(name)){
        if(verificarCaracteresAlfabeticos_LM_Espacio(name)){
            if(validarLongitudCadena(nameInput.value, 3, 20)){
                cleanMsgError(nameInput,msgNameInput);
            }
            else {
                let msg="Mínimo 3 caracteres y Máximo 10";
                showMsgError(nameInput,msgNameInput,msg);
                validForm=false;
            }
        }
        else
        {
            let msg="Solo se permiten caracteres alfabéticos y las únicas letras que pueden ser mayúscula son las primeras";
            showMsgError(nameInput,msgNameInput,msg);
            validForm=false;
        }
    }
    else
    {
        let msg="Campo Obligatorio";
        showMsgError(nameInput,msgNameInput,msg);
        validForm=false;
    }
}

const validateEmail = () => {
    let email=emailInput.value;
    if (verificarNoVacio(email)){
        if(validarEmail(email)){
            cleanMsgError(emailInput,msgEmailInput);
        }
        else {
            let msg="E-mail inválido";
            showMsgError(emailInput,msgEmailInput,msg);
            validForm=false;
        }
    }else{
        let msg="Campo Obligatorio";
        showMsgError(emailInput,msgEmailInput,msg);
        validForm=false;
    }
}

const validateFechaNacimiento = () => {
    let bd_d=birthDayInput.value;
    if (verificarNoVacio(bd_d)){      
        if(bd_d.length==10)
        {
            cleanMsgError(birthDayInput,msgDateInput);    
        }else{
            let msg="La Fecha tiene que tener exactamente 8 Números";
            showMsgError(birthDayInput,msgDateInput,msg);
            validForm=false;
        }    
    }else{
        let msg="Campo Obligatorio";
        showMsgError(birthDayInput,msgDateInput,msg);
        validForm=false;
    }
}

const addContact=()=>{
    validForm=true;
    validateEmail();
    validateName();
    validateFechaNacimiento();
    if(validForm)
    {
        let msg="agregado";
        if(currentContactId!=-1)
        {
            deleteContacto(currentContactId);
            msg="editado";
        }
               
        let aNewContact=saveNewContact();
        showMessageToast(`Contacto ${msg} exitosamente <br> <strong>${aNewContact.NOMBRE}</strong>`);
        cleanForm();
        loadContacts(contacts);
    }
}

const editContact=(e)=>{
    myToastConfirm.hide();
    cleanForm();
    currentContactId=e.target.id;
    unHighlightAllRow();
    
    let selectedContact = contacts.find(function(objeto) {
        return objeto.ID == e.target.id;
      });

    nameInput.value=selectedContact.NOMBRE;
    emailInput.value=selectedContact.EMAIL;
    birthDayInput.value=selectedContact.FECHANACIMIENTO;   
    enableEditing();
    highlightRow(e.target);
}

const deleteContacto=(idContact)=>{
    var newListContacts = contacts.filter(function(objeto) {
        return objeto.ID != idContact;
    });
    contacts=newListContacts;
}


const deleteContactoFromList=(e)=>{
    cleanForm();
    deleteteIdSelection=e.target.id;
    let selectedContact = contacts.find(function(objeto) {
        return objeto.ID == e.target.id;
      });

    let idMsgToastConfirmDiv=document.getElementById("idMsgToastConfirmDiv");
    idMsgToastConfirmDiv.innerHTML=`Esta seguro que desea Eliminar el contacto <br><strong> ${selectedContact.NOMBRE}</strong>`;
    myToastConfirm.show();
}

const confirmDelete=()=>{
    myToastConfirm.hide();
    deleteContacto(deleteteIdSelection);  
    cleanForm();
    saveLS();    
    loadContacts(contacts); 
    showMessageToast("Contacto eliminado exitosamente...");
}

const cancelDelete=()=>{
    deleteteIdSelection=-1;
    myToastConfirm.hide();
    cleanForm();
}

const contactForm=(aContact, contactNumber)=>{
    let value=`<tr>
        <td class="pt-2 pb-2">${contactNumber}</td>
        <td class="pt-2 pb-2 text-start d-blue text-nowrap">${aContact.NOMBRE}</td>
        <td class="pt-2 pb-2 ">${aContact.EMAIL}</td>
        <td class="pt-2 pb-2">${formatDate(aContact.FECHANACIMIENTO)}</td>
        <td class="pt-2 pb-2">
            <i id="${aContact.ID}" class="edit fa-solid fa-pen-to-square m-1"></i>
            <i id="${aContact.ID}" class="delete fa-regular fa-trash-can m-1"></i>
        </td>
    </tr>`;
    return value;
}

const loadContacts=(contacts)=>{
    //Ordeno alfabeticamente. 
    contacts.sort(function(a, b) {
        return a.NOMBRE.localeCompare(b.NOMBRE);
      });

    contactCount=0;
    let contactContainer=document.getElementById("contactsContainer");
    let listContacts="";
    contacts.forEach(function(objeto) {
        contactCount++;
        listContacts+=contactForm(objeto,contactCount);
    });
        
    contactContainer.innerHTML=`
    <div class="table-responsive">
        <table class="table table-hover table-sm">
            <thead>
                <tr class=" fw-normal fs-6 ">
                    <th scope="col">#</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">E-mail</th>
                    <th scope="col" class="text-nowrap">Fecha Nacimiento</th>
                    <th scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>${listContacts}</tbody>
        </table>
        <div id="emailHelp" class="form-text text-start text-secondary">${contactCount} contacto/s</div>
    </div>`;

    let fiEditCollection=document.getElementsByClassName("edit");
    let fiDeleteCollection=document.getElementsByClassName("delete");

    for (let index = 0; index < fiEditCollection.length; index++) {
        fiEditCollection[index].addEventListener('click', editContact);
    }

    for (let index = 0; index < fiDeleteCollection.length; index++) {
        fiDeleteCollection[index].addEventListener('click', deleteContactoFromList);
    }
}

//VERIFICO SI HAY CONTACTOS EN EL LS, SINO HAY, CREO CONTACTOS POR DEFAULT PARA MOSTRAR ALGO
if (localStorage.getItem("myContacts")) {
    contacts = JSON.parse(localStorage.getItem("myContacts"));
    loadContacts(contacts);
}
else
{
    contacts = [
        { ID:1,NOMBRE: 'Ferrarini Enzo', FECHANACIMIENTO: '1980-12-05', EMAIL: 'ferrarini.enzo@gmail.com' },
        { ID:2,NOMBRE: 'Herrera Juan Carlos', FECHANACIMIENTO: '1985-12-10', EMAIL: 'herrera.juan@hotmail.com' },
        { ID:3,NOMBRE: 'Baschini Vanesa', FECHANACIMIENTO: '2000-02-02', EMAIL: 'baschini.vanesa@gmail.com' },
        { ID:4,NOMBRE: 'Veronica Gonzalez', FECHANACIMIENTO: '1995-06-12', EMAIL: 'gonzalez.veronica@yahoo.com' },
        { ID:5,NOMBRE: 'Dolci Alfredo', FECHANACIMIENTO: '1995-03-09', EMAIL: 'dolci.alfredo@gmail.com' },
        { ID:6,NOMBRE: 'Goltz Micaela', FECHANACIMIENTO: '1995-09-14', EMAIL: 'goltz.micaela@hotmail.com' }
        ];

    saveLS();
}
///////////////////////////


const cancelChanges=()=>{
    unHighlightAllRow();
    cleanForm();
}

const enableEditing=()=>{
    btnCancelChanges.style.display="inline-block";
    btnAddContact.innerHTML = "Guardar Cambios";
}

const disableEditing=()=>{
    btnCancelChanges.style.display="none";
    btnAddContact.innerHTML = "Agregar Contacto";
}

const showMessageToast=(msg)=>{
    let msgToast =document.getElementById("idMsgToast");
    msgToast.innerHTML=msg;
    myToast.show();
}

const cleanForm = () => {
    let inputCollection=document.getElementsByTagName("input");
    let errorsCollection=document.getElementsByClassName("erroMessage");
    for (let index = 0; index < inputCollection.length; index++) {
        inputCollection[index].value="";
    }
    for (let index = 0; index < errorsCollection.length; index++) {
        errorsCollection[index].classList.remove("animation");
        errorsCollection[index].classList.add("hidden");
        errorsCollection[index].innerText = "";
    }
    disableEditing();
    unHighlightAllRow();
    currentContactId=-1;
    deleteteIdSelection=-1;    
}

document.addEventListener("DOMContentLoaded", function () {
    btnAddContact.addEventListener('click', addContact);
    btnCancelChanges.addEventListener('click', cancelChanges);
    disableEditing();    
});

const showMsgError = (htmlElement,htmlElementMsg, msg) => {
    cleanMsgError(htmlElement,htmlElementMsg);
    if(htmlElement)
        htmlElement.setAttribute('aria-invalid', 'true');
    htmlElementMsg.innerText = msg;
    htmlElementMsg.style.display = "block";
    validForm = false;
    htmlElementMsg.classList.remove("hidden");
    htmlElementMsg.classList.add("animation");
}

const cleanMsgError = (htmlElement,htmlElementMsg) => {
    if(htmlElement)
        htmlElement.setAttribute('aria-invalid', 'false');
    htmlElementMsg.innerText = "";
    htmlElementMsg.style.display = "none";
    htmlElementMsg.classList.remove("animation");
    htmlElementMsg.classList.add("hidden");
}