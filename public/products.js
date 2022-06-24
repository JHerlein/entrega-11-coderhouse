
const socket = io()

const template = Handlebars.compile(`
                                    <table>
                                      <tr>
                                        <th>Title</th>
                                        <th>Price</th>
                                        <th>Photo</th>
                                      </tr>
                                      {{#each product}}
                                      <tr>
                                        <th>{{this.title}}</th>
                                        <th>{{this.price}}</th>
                                        <th><img src={{this.thumbnail}}></img></th>
                                      </tr>
                                      {{/each}}                                    
                                     `);
const getData = async () => {
  const data = await fetch('http://localhost:8080/api/products-test')
  return data.json().then(result => document.querySelector('span').innerHTML = template({product:result}))
}

socket.on('render', async () => {
  console.log("Render triggered")
  const data = await fetch('http://localhost:8080/api/products-test')
  return data.json().then(result => document.querySelector('span').innerHTML = template({product:result}))
})

socket.on('newProduct', (data) => {
  console.log(data)  
  alert(data)
  getData()
  return false  
})

function addMessage(e){
  const mensaje = {
      author: document.getElementById('username').value,
      text: document.getElementById('texto').value,
      time: new Date()
  }
  socket.emit('new-message',mensaje)
  location.reload()
  return false
}

// let button = document.getElementById("submit-btn")

// // button.addEventListener('click',
// //   
// // )

// button.addEventListener('submit',console.log("asdasd2"))
// // // getData()

function addProductjs(){
  console.log("Producto submitido")
  socket.emit('productAdded','asd')
}

async function render(data){
  console.log('Mensajes rendered')
  console.log(data)
  userData = await fetch('http://localhost:8080/login-info').then(result=> {    
    return result.json() 
  })
  console.log(userData.user)
  
  const html = data.map((elem,index) => {
      return(`<div>
              <strong>${elem.author}</strong>:
              <em class="time">${elem.time}</em>              
              <i>${elem.text}</i>
              </div>
              `)
  }).join(" ")
  document.getElementById('messages').innerHTML = html
  document.getElementById('user').innerHTML = `Bienvenido ${userData.user}!`}


socket.on('messages', data => {
  console.log('Mensajes emitidos recibidos cliente')
  render(data)
return false
})

render()

// variable to store our intervalID
var nIntervId;
var count = 0

function checkTimeOut() {
  // check if already an interval has been set up  
  nIntervId = setInterval(getSession, 1000);   
  
}

async function getSession(){  
  userData = await fetch('http://localhost:8080/login-info').then(result=> {    
    return result.json() 
  })
  console.log(userData)  
  if(userData == undefined){
    location.href = 'http://localhost:8080/';    
    clearInterval(nIntervId)
  }
}

checkTimeOut()