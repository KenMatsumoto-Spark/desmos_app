const baseURL = window.location.origin

function setCookie(name, value, days) {
  let expires = "";
  
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString()
  }
  
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; + path=/";
}

function getCookieValue(name) {
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  
  return null;
}

export async function yearSelect(){

  const yearsResponse = await axios.get(`${baseURL}/data/resource/year`)

  document.getElementById('studentYear').innerHTML = yearsResponse?.data?.yearsForSelect.map((year) => {
    const element = `<option value="${year}">${year}</option>`
    return element
  }).join('')
  
  document.getElementById('visualizeButton').disabled = false
}

export async function patchConfigurations(){
  const session = getCookieValue("userSession");
  const showNamesState = document.getElementById("showNamesChecked").checked

  const options = {
    method: 'PATCH',
    url: `${baseURL}/data/configurations`,
    headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/2023.5.8', 'Authorization' : `Bearer ${session}`},
    data:{
      showNames: showNamesState
    }
  };
  
  axios.request(options).then(function (response) {
    const myModal = new bootstrap.Modal(document.getElementById('editConfigurationsSuccessModal'))
    myModal.show()

  }).catch(function (error) {
    console.error(error);
  });
}

export async function renderForm(edit, currentName, currentYear, currentLink, currentId){

  document.getElementById('mainSection').innerHTML = `<div id="newStudent" >
  <form id="studentForm">
  <div class="form-group">
    <label for="studentName">Nome</label>
    <input type="string" class="form-control" id="studentName" aria-describedby="" placeholder="Nome do Aluno" value="${currentName ?? ""}">
        <small id="nameHelp" class="form-text text-muted"></small>
  </div>
  <div class="form-group">
    <label for="studentYearSem">Ano/Semestre</label>
    <input type="string" class="form-control" id="studentYearSem" placeholder="2000/1" value="${currentYear ?? ""}">
    <small id="yearHelp" class="form-text text-muted">Deve conter 4 digitos numericos, barra, um digito numerico</small>
  </div>
      <div class="form-group">
    <label for="studentLink">Link Desmos</label>
    <input type="string" class="form-control" id="studentLink" placeholder="www.desmos.com" value="${currentLink ?? ""}">
    <small id="desmosHelp" class="form-text text-muted">O link deve ser um grafico na plataforma desmos</small>
  </div>
  ${edit ?  
    `<button type="button" class="btn btn-success" onClick="submitFormEdit('${currentId}')">Editar</button>    
    </div>
    <div class="modal fade" id="editSuccessModal" tabindex="-1" role="dialog" aria-labelledby="editSuccessModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editSuccessModalLabel">Confirmar</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Aluno foi editado com sucesso!
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-dismiss="modal" href="/public/">Confirmar</button>
          </div>
        </div>
      </div>
    </div>` 

    : `<button type="button" class="btn btn-success" onClick="submitForm()">Enviar</button>
    </div>
    <div class="modal fade" id="creationSuccessModal" tabindex="-1" role="dialog" aria-labelledby="creationSuccessModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="creationSuccessModalLabel">Confirmar</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Aluno foi criado com sucesso!
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-dismiss="modal">Confirmar</button>
          </div>
        </div>
      </div>
    </div>`}
 
  </form>

  `  
}

export async function renderConfigurations(){
  const session = getCookieValue("userSession");

  if(!session){
    renderLogin()
  }else{

    const configResponse = await axios.get(`${baseURL}/data/configurations`)
    
    const showNames = configResponse?.data?.configurations?.showNames

    document.getElementById('mainSection').innerHTML = `<div class="config-buttons d-grid gap-2 col-6 mx-auto">
    <div class="col">
      <div id="showNamesCheck" class="nameCheck">
        <input class="form-check-input" type="checkbox" ${showNames ? 'checked' : ''} id="showNamesChecked">
        <label class="form-check-label" for="showNamesChecked">
          Mostrar Nomes Completos(somente usuários)
        </label>
      </div>
      <button id="configButton" type="button" class="manage-button btn btn-success btn-md text-nowrap" onClick="patchConfigurations()">Confirmar alterações</button>
        </div>
    </div>

    <div class="modal fade" id="editConfigurationsSuccessModal" tabindex="-1" role="dialog" aria-labelledby="editConfigurationsSuccessModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editConfigurationsSuccessModalLabel">Confirmar</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Configurações alteradas com sucesso!
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-dismiss="modal" href="/public/">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
    `  
  }
}

export async function renderManager(){
  const session = getCookieValue("userSession");

  if(!session){
    renderLogin()
  }else{
    document.getElementById('mainSection').innerHTML = `<div class="config-buttons d-grid gap-2 col-6 mx-auto">
      <div class="col">
    <button type="submit" class="manage-button btn btn-success btn-lg text-nowrap" onClick="renderForm()">Inserir Estudante</button>
    <button type="submit" class="manage-button btn btn-success btn-lg text-nowrap" onClick="renderConfigurations()">Configurações</button>
    <button type="submit" class="manage-button btn btn-success btn-lg text-nowrap" onClick="logout()">Sair</button>
      </div>
  </div>
  `  
  }
}

export async function renderLogin(){
  document.getElementById('mainSection').innerHTML = `<div id="loginAdm" >
  <form id="loginForm">
  <div class="form-group">
    <label for="adminLogin">Login</label>
    <input type="string" class="form-control" id="adminLogin" aria-describedby="" placeholder="Usuario">
  </div>
  <div class="form-group">
    <label for="adminPassword">Password</label>
    <input type="string" class="form-control" id="adminPassword" placeholder="Senha">
    <small id="loginHelp" class="form-text text-muted"></small>
  </div>
  <button type="button" class="btn btn-primary" onClick="submitLogin()">Entrar</button>
</form>
</div>`  
}

export async function logout(){
  setCookie("userSession", "", -7);
  
  document.location.href="/public/"
}

export async function submitForm() {
  const session = getCookieValue("userSession");

  const studentName = document.getElementById('studentName').value
  const studentYear = document.getElementById('studentYearSem').value
  const studentLink = document.getElementById('studentLink').value

  const options = {
    method: 'POST',
    url: `${baseURL}/data/create`,
    headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/2023.5.8', 'Authorization' : `Bearer ${session}`},
    data: {
      name: studentName,
      year: studentYear,
      desmos: studentLink
    }
  };
  
  axios.request(options).then(function (response) {
    const myModal = new bootstrap.Modal(document.getElementById('creationSuccessModal'))
    myModal.show()

    renderForm()
  }).catch(function (error) {
    const invalid = error.response?.data?.invalid

    var nameErrorMessage = ''
    var yearErrorMessage = ''
    var desmosErrorMessage = ''

    invalid?.map((i) => {
      switch(i.field){
        case 'name':
        nameErrorMessage += `<p style="font-size:120%; color: red">${i.message}</p>`
      }
      switch(i.field){
        case 'year':
          yearErrorMessage += `<p style="font-size:120%; color: red">${i.message}</p>`
      }
      switch(i.field){
        case 'desmos':
          desmosErrorMessage += `<p style="font-size:120%; color: red">${i.message}</p>`
      }
    })

    if(nameErrorMessage !== '') document.getElementById('nameHelp').innerHTML = nameErrorMessage 
    else document.getElementById('nameHelp').innerHTML = ""
    if(yearErrorMessage !== '') document.getElementById('yearHelp').innerHTML = yearErrorMessage
    else document.getElementById('yearHelp').innerHTML = ""
    if(desmosErrorMessage !== '') document.getElementById('desmosHelp').innerHTML = desmosErrorMessage
    else document.getElementById('desmosHelp').innerHTML = ""
    console.error(error);
  });

  return false
}

export async function submitFormEdit(currentId) {
  const session = getCookieValue("userSession");

  const studentName = document.getElementById('studentName').value
  const studentYear = document.getElementById('studentYearSem').value
  const studentLink = document.getElementById('studentLink').value

  const options = {
    method: 'PATCH',
    url: `${baseURL}/data/edit`,
    headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/2023.5.8', 'Authorization' : `Bearer ${session}`},
    data: {
      name: studentName,
      year: studentYear,
      desmos: studentLink,
      id: currentId
    }
  };
  
  axios.request(options).then(function (response) {
    const myModal = new bootstrap.Modal(document.getElementById('editSuccessModal'))
    myModal.show()
  }).catch(function (error) {
    const invalid = error.response?.data?.invalid

    var nameErrorMessage = ''
    var yearErrorMessage = ''
    var desmosErrorMessage = ''

    invalid?.map((i) => {
      switch(i.field){
        case 'name':
        nameErrorMessage += `<p style="font-size:120%; color: red">${i.message}</p>`
      }
      switch(i.field){
        case 'year':
          yearErrorMessage += `<p style="font-size:120%; color: red">${i.message}</p>`
      }
      switch(i.field){
        case 'desmos':
          desmosErrorMessage += `<p style="font-size:120%; color: red">${i.message}</p>`
      }
    })

    if(nameErrorMessage !== '') document.getElementById('nameHelp').innerHTML = nameErrorMessage 
    else document.getElementById('nameHelp').innerHTML = ""
    if(yearErrorMessage !== '') document.getElementById('yearHelp').innerHTML = yearErrorMessage
    else document.getElementById('yearHelp').innerHTML = ""
    if(desmosErrorMessage !== '') document.getElementById('desmosHelp').innerHTML = desmosErrorMessage
    else document.getElementById('desmosHelp').innerHTML = ""
    console.error(error);
  });

  return false
}

export async function deleteStudent(id){
  const session = getCookieValue("userSession");

  const options = {
    method: 'DELETE',
    url: `${baseURL}/data/delete/${id}`,
    headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/2023.5.8', 'Authorization' : `Bearer ${session}`},
  };
  
  axios.request(options).then(function (response) {
    document.location.href="/public/"
  }).catch(function (error) {
    console.error(error);
  });
}

export async function submitLogin() {
  const login = document.getElementById('adminLogin').value
  const password = document.getElementById('adminPassword').value

  const options = {
    method: 'POST',
    url: `${baseURL}/data/login`,
    headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/2023.5.8'},
    data: {
      login,
      password
    }
  };
  
  axios.request(options).then(function (response) {
    const token = response?.data?.adminToken
    setCookie("userSession", token, 7);

    renderManager()
  }).catch(function (error) {
    document.getElementById('loginHelp').innerHTML = `<p style="font-size:120%; color: red">${error.response.data}</p>`
    console.error(error);
  });

  return false
}

export async function renderList(page) {
  const session = getCookieValue("userSession");

  document.getElementById('visualizeButton').disabled = true

  const filter = document.getElementById('studentYear').value

  const searchResult = await axios.get(`${baseURL}/data`, {
    params: {
      year: filter,
      page,
      isAdmin: session
    }
  })
  
  const data = searchResult?.data?.students
  const students = data?.docs
  const hasPrevPage = data?.hasPrevPage
  const hasNextPage = data?.hasNextPage
  const prevPage = data?.prevPage
  const nextPage = data?.nextPage

  if(!students){
    document.getElementById('albumItens').innerHTML=" NENHUM ESTUDANTE ENCONTRADO."
  } else{
    document.getElementById('albumItens').innerHTML = students.map((student) => {
      const element = `<div class="col-md-4">
        <div class="card mb-4 box-shadow">
          <div id="calculator-${students.indexOf(student)}" style="height: 200px;"></div>
          <div class="card-body">
            <p class="card-text">${student.name}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline-success"  onclick=" window.open('${student.desmos}','_blank')">Visualizar no Desmos</button>
              </div>
              <small class="student-year text-muted">${student.year}</small>
            </div>

            ${session ? `
              <div class="manage-session">

              <button type="button" class="btn btn-sm btn-outline-warning edit-button" onClick="renderForm(true, '${student.name}', '${student.year}', '${student.desmos}', '${student._id}')"> Editar </button>
              <button type="button" class="btn btn-sm btn-outline-danger delete-button" data-toggle="modal" data-target="#deleteModal${student._id}"> Apagar </button>
              <div class="modal fade" id="deleteModal${student._id}" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="deleteModalLabel">Confirmar</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      O aluno: ${student.name} será apagado!
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                      <button type="button" class="btn btn-danger" onCLick="deleteStudent('${student._id}')">Confirmar</button>
                    </div>
                  </div>
                </div>
              </div>
              </div>


              ` : ``}
          </div>
        </div>
      </div>`
      return element
    }).join('')
  
    students.map(async (student) =>{
      const response = await axios.get(student.desmos)
  
      var elt = document.getElementById(`calculator-${students.indexOf(student)}`);
      Desmos.GraphingCalculator(elt, {expressions: false, keypad: false, settingsMenu: false}).setState(response?.data?.state);
    
    })

    document.getElementById('pagination').innerHTML = `${hasPrevPage ? `<li  class="page-item"><button id="previousButton" class="page-link btn-outline-success" onclick="renderList(${prevPage})">Anterior</button></li>` : `<li class="page-item disabled">
      <button id="previousButton" class="page-link btn-outline-success" href="#" tabindex="-1">Anterior</button>
    </li>`}

    ${hasNextPage ? `<li class="page-item"><button id="previousButton" class="page-link btn-outline-success" onclick="renderList(${nextPage})" style:"color: green">Proximo</button></li>` : `<li class="page-item disabled">
      <button id="previousButton" class="page-link btn-outline-success" href="#" tabindex="-1">Proximo</button>
    </li>`}

    `
  }
  
  
  $('.collapse').collapse('hide')
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;


  setTimeout(function(){
    document.getElementById('visualizeButton').disabled = false
  }, 2000);
}