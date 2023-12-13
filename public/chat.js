var listUsers = []
var startTrasmissao = false
var startApresentacao  = false
let microphone = false 
let camera= false
const socket = io()


const urlSearch = new URLSearchParams(window.location.search)
const username = urlSearch.get("username")
const selectRoom = urlSearch.get("selectRoom")

var peer = new Peer(username)

peer.on('open', function(id) {
  document.getElementById("localUserId").innerHTML= id 
  socket.emit("room", {
    id,
    selectRoom
  })
  
  });

function  renderUserlist(list)  {
  listUsers= list[0].filter(u => u != username)
  
  var sala = document.getElementById("room")
  let quantidadeColunas = Math.round(Math.sqrt(list[0].length))
  
  sala.style.gridTemplateColumns = 'repeat(' + quantidadeColunas + ', ' +   '1fr)';
  var filhosSala = sala.children;

  for (var i = filhosSala.length - 1; i >= 0; i--) {
    var filho = filhosSala[i];
    if (filho.id != "localUser") {
      
      sala.removeChild(filho);
    }
  }
  listUsers.forEach(i =>  {
      

      let videoElement = document.createElement('video');
      videoElement.id = 'remote-video_' + i;
      videoElement.autoplay = true;
      videoElement.className = "userVideo";
      videoElement.muted = true
      

      var paragrafo = document.createElement("p")
      paragrafo.textContent = i
      paragrafo.className = "userId"

      var divContainer = document.createElement("div");
      divContainer.className = "video"
      divContainer.appendChild(videoElement);
      divContainer.appendChild(paragrafo);
      sala.appendChild(divContainer)
  })
  
}

socket.on("UsersNaSala", (list)=>{ 
  console.log(startTrasmissao)

  renderUserlist(Object.values(list))
  if (startTrasmissao){
    chamada.transmitir()
  }
  if(startApresentacao){
    streamTela.transmitir()
  }
})

socket.on("userLimpaTela",async (u)=>{
  let user = Object.values(u)[0]
  let videoElement = document.getElementById("remote-video_" + user.username)
  if (videoElement){
    videoElement.srcObject = null
  }
  else{
    console.log("video nao encontrado")
  }
})

peer.on('call', (call) => {
  call.answer(null);
  video = document.getElementById("remote-video_" + call.peer)
  call.on("stream", (remoteStream) => {
    console.log("on")
    video.srcObject = remoteStream;
    document.body.addEventListener("mousemove", function () {
      video.muted = false
    })
    document.addEventListener('touchstart', function () {
      video.muted = false
    });
    
  })
})

function interromperTransmissao (stream){
  if(stream){
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());    
  }
}


const chamada = {
  stream : null,
  gravação: (camera , microphone) => {
    navigator.mediaDevices.getUserMedia({ video: camera, audio: microphone })
    .then((stream) => {
      chamada.stream = stream
      document.getElementById("localVideo").srcObject = stream;
      chamada.transmitir()
    }).catch((error) => {
      console.error('Erro ao iniciar a chamada:', error);
    })
  },
  transmitir : () =>{
    if (chamada.stream) {
      
      listUsers.forEach(usuario =>{
        var call = peer.call(usuario, chamada.stream);
        startTrasmissao =true
        
      })
    }else {
      console.error('Nenhum stream disponível para transmitir.');
    }
  },
  interromperExibicaoRemota : async() => {
    interromperTransmissao (chamada.stream)
    document.getElementById("localVideo").srcObject = null;
    chamada.stream = null
    startTrasmissao = false
    socket.emit("limpartela",{
      username
    })
  },

}
const streamTela ={
  stream : null,
  apresentar: () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    .then((stream) => {
      streamTela.stream = stream
      document.getElementById('remote-video_' + username).srcObject = stream;
      streamTela.transmitir()
    }).catch((error) => {
      console.error('Erro ao iniciar a chamada:', error);
    })
  },
  transmitir : () =>{
    if (streamTela.stream) {
      
      listUsers.forEach(usuario =>{
        var call = peer.call(usuario, streamTela.stream);
        startApresentacao =true
      })
    }else {
      console.error('Nenhum stream disponível para transmitir.');
    }
  },  
  interromperExibicaoRemota : () => {
    interromperTransmissao (streamTela.stream)
    startApresentacao = false
    streamTela.stream = null
    socket.emit("limpartela",{
      username
    })
  },
}


function gravação (){
  if (microphone == false && camera == false) {
    chamada.interromperExibicaoRemota()
  }else{
    chamada.gravação(camera , microphone)
  }
}

document.getElementById("microphone").addEventListener("click",  function() {
  microphone = !microphone 
  let iconElement = this.querySelector('i')
  
  if (iconElement.classList.contains("fa-microphone-slash")) {
    this.style.backgroundColor = "rgb(60,64,67)"
    iconElement.classList.remove("fa-microphone-slash");
    iconElement.classList.add("fa-microphone");
    
  }else {
    this.style.backgroundColor = "rgb(234,67,53)"
    iconElement.classList.remove("fa-microphone");
    iconElement.classList.add("fa-microphone-slash");
  }
  gravação()
});

document.getElementById("starCamera").addEventListener("click",  function() {
  camera = !camera
  let iconElement = this.querySelector('i')
  
  if (iconElement.classList.contains("fa-video-slash")) {
    this.style.backgroundColor = "rgb(60,64,67)"
    iconElement.classList.remove("fa-video-slash");
    iconElement.classList.add("fa-video");
    
  }else {
    this.style.backgroundColor = "rgb(234,67,53)"
    iconElement.classList.remove("fa-video");
    iconElement.classList.add("fa-video-slash");
  }

  gravação()
});

document.getElementById("apresentacao").addEventListener("click",  function() {
  let element = document.getElementById('remote-video_' + username) 


  if (getComputedStyle(this).getPropertyValue("background-color") == "rgb(234, 67, 53)") {
    this.style.backgroundColor = "rgb(60,64,67)"
} else {
  this.style.backgroundColor = "rgb(234,67,53)"
}

  if(element == null){
  let videoElement = document.createElement('video');
  videoElement.id = 'remote-video_' + username;
  videoElement.autoplay = true;
  videoElement.className = "userVideo";
  videoElement.muted = true
  

  var paragrafo = document.createElement("p")
  paragrafo.textContent = username
  paragrafo.className = "userId"


  let div = document.createElement("div")
  div.appendChild(videoElement);
  div.appendChild(paragrafo);

  document.getElementById("room").appendChild(div);
  streamTela.apresentar()
  }else{
    element.parentNode.remove();
    streamTela.interromperExibicaoRemota()
  }

})
