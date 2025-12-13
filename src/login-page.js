var username = document.getElementById('username');
var loginbtn = document.getElementById('login');
var osinterface = document.querySelector('div[os-interface]')
var logindiv = document.querySelector('div[login]')
loginbtn.addEventListener('click', () => {
  if (username.value == "") {
    console.log('Cannot Login')
  } else {
    commands.changename(username.value)
    logindiv.classList.add('hidden')
    osinterface.classList.remove('hidden')
    logindiv.style.display = "none";
  }
  
})