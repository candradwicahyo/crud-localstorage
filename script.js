window.addEventListener("DOMContentLoaded", () => {
  
  let tasks = [];
  
  const content = document.querySelector('.content');
  const modal = document.querySelector('.modal-title');
  const inputName = document.querySelector('.input-name');
  const inputNumber = document.querySelector('.input-number');
  const inputEmail = document.querySelector('.input-email');
  
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-modal')) {
      const type = event.target.dataset.type.toLowerCase();
      modal.textContent = `modal ${type} data`;
      if (modal.textContent.includes('add')) clear();
    }
  });
  
  function clear() {
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => form.reset());
  }
  
  const btnSubmit = document.querySelector('.btn-submit');
  btnSubmit.addEventListener('click', insertData);
  
  function insertData() {
    if (modal.textContent.includes('add')) {
      const data = getInputValues();
      if (validate(data) == true) {
        if (isDataExist(data)) return alerts('error', 'Alert', 'Data is already in the list!');
        tasks.unshift(data);
        saveToLocalstorage();
        alerts('success', 'Success', 'Data has been added!');
        loadData();
        clear();
      }
    }
  }
  
  function getInputValues() {
    return {
      name: inputName.value.trim(),
      number: inputNumber.value.trim(),
      email: inputEmail.value.trim()
    };
  }
  
  function validate({ name, number, email }) {
    if (!name && !number && !email) return alerts('error', 'Alert', `field's is empty!`);
    if (!name || !number || !email) return alerts('error', 'Alert', `field is empty!`);
    if (name.length < 3) return tooShort('name', 3);
    if (name.length > 100) return tooLong('name', 100);
    if (name.match(/[0-9]/gmi)) return alerts('error', 'Alert', 'name just only contain letters!');
    if (number.length < 8) return tooShort('number', 8);
    if (number.length > 13) return tooLong('number', 13);
    if (number.match(/[a-zA-Z]/gmi)) return alerts('error', 'Alert', 'phone number just only contain numbers!');
    if (email.length < 5) return tooShort('email', 5);
    return true;
  }
  
  function tooShort(name, limit) {
    return alerts('error', 'Alert', `${name} must be more then ${limit} characrer!`);
  }
  
  function tooLong(name, limit) {
    return alerts('error', 'Alert', `${name} must be less then ${limit} characrer!`);
  }
  
  function isDataExist({ name, number, email }) {
    let result = false;
    tasks.forEach(task => {
      if (task.name.toLowerCase() == name.toLowerCase() && task.number == number && task.email.toLowerCase() == email.toLowerCase()) result = true;
      if (task.name.toLowerCase() == name.toLowerCase() && task.number == number && task.email.toLowerCase() != email.toLowerCase()) result = false;
      if (task.name.toLowerCase() == name.toLowerCase() && task.number != number && task.email.toLowerCase() == email.toLowerCase()) result = false;
    });
    return result;
  }
  
  function showUI(data, index = 0) {
    const result = render(data, index);
    content.insertAdjacentHTML('beforeend', result);
  }
  
  function render({ name, number, email }, index) {
    return `
    <tr>
      <td class="p-3 fw-light">${name}</td>
      <td class="p-3 fw-light">${number}</td>
      <td class="p-3 fw-light">${email}</td>
      <td class="p-3 fw-light">
        <button 
          class="btn btn-success btn-sm rounded-0 m-1 btn-edit btn-modal" 
          data-type="edit" 
          data-index="${index}"
          data-bs-toggle="modal" 
          data-bs-target="#modalBox">edit</button>
        <button 
          class="btn btn-danger btn-sm rounded-0 m-1 btn-delete"
          data-index="${index}">
          delete
        </button>
      </td>
    </tr>
    `;
  }
  
  // save to localatorage 
  function saveToLocalstorage() {
    localStorage.setItem('crud', JSON.stringify(tasks));
  }
  
  // plugin sweetalert2
  function alerts(icon, title, text, position = 'center') {
    swal.fire ({
      position: position,
      icon: icon,
      title: title,
      text: text
    });
  }
  
  // load data 
  function loadData() {
    content.innerHTML = '';
    const item = localStorage.getItem('crud');
    tasks = (item) ? JSON.parse(item) : [];
    tasks.forEach((task, index) => showUI(task, index));
  }
  
  loadData();
  
  // edit data 
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-edit')) {
      const index = event.target.dataset.index;
      inputName.value = tasks[index].name;
      inputNumber.value = tasks[index].number;
      inputEmail.value = tasks[index].email;
      editData(index);
    }
  });
  
  function editData(index) {
    btnSubmit.addEventListener('click', function() {
      if (modal.textContent.includes('edit')) {
        const data = getInputValues();
        if (validate(data) == true) {
          if (isDataExist(data)) return alerts('error', 'Alert', 'Data is already in the list!');
          tasks[index] = data;
          saveToLocalstorage();
          alerts('success', 'Success', 'Data has been updated!');
          loadData();
          index = null;
        }
      }
    });
  }
  
  // delete data
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-delete')) {
      const index = event.target.dataset.index;
      swal.fire ({
        icon: 'info',
        title: 'are you sure?',
        text: 'do you want to delete this data?',
        showCancelButton: true
      })
      .then(response => {
        if (response.isConfirmed) {
          tasks.splice(index, 1);
          saveToLocalstorage();
          alerts('success', 'Success', 'Data has been deleted!');
          loadData();
        }
      });
    }
  });
  
  // search data
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('keyup', function() {
    const value = this.value.trim().toLowerCase();
    searchData(value);
  });
  
  function searchData(value) {
    const result = Array.from(content.rows);
    result.forEach(data => {
      const str = data.textContent.toLowerCase();
      data.style.display = (str.indexOf(value) != -1) ? '' : 'none';
    });
  }
  
  // delete all data
  const btnDeleteAllData = document.querySelector('.btn-all');
  btnDeleteAllData.addEventListener('click', deleteAllData);
  
  function deleteAllData() {
    swal.fire ({
      icon: 'info',
      title: 'are you sure?',
      text: 'do you want to delete all data?',
      showCancelButton: true
    })
    .then(response => {
      if (response.isConfirmed) {
        tasks = [];
        saveToLocalstorage();
        alerts('success', 'Success', 'All data has been deleted!');
        loadData();
      }
    });
  }
  
});