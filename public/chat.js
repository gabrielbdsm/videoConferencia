var listUsers = []
var startTrasmissao = false
const socket = io()


const urlSearch = new URLSearchParams(window.location.search)
const username = urlSearch.get("username")

var peer = new Peer(username)

peer.on('open', function(id) {
  document.getElementById("localUserId").innerHTML= id 
  
  socket.emit("room", {
    id
  })
  
  });

function  renderUserlist(list)  {
  listUsers= list[0].filter(u => u != username)
  sala = document.getElementById("otherUsers")

  while (sala.firstChild) {
    sala.removeChild(sala.firstChild);
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
      divContainer.className = "userContainer"
      divContainer.appendChild(videoElement);
      divContainer.appendChild(paragrafo);
      sala.appendChild(divContainer)
  })
}

socket.on("UsersNaSala", (list)=>{ 
  renderUserlist(Object.values(list))
})

socket.on("UsersNaSalaAtualizado", (list)=>{ 
  renderUserlist(Object.values(list))
  if (startTrasmissao){
    chamada.transmitir()
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
  })
})

const chamada = {
  stream : null,
  iniciargravação: () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      chamada.stream = stream
      chamada.transmitir()
    }).catch((error) => {
      console.error('Erro ao iniciar a chamada:', error);
    })
  },

  transmitir : () =>{
    if (chamada.stream) {
      document.getElementById("localVideo").srcObject = chamada.stream;
      listUsers.forEach(usuario =>{
        var call = peer.call(usuario, chamada.stream);
        startTrasmissao =true
        call.on("stream", (remoteStream) => {
          document.getElementById("remote-video_" + call.peer).srcObject = remoteStream;
        });
      })
    }else {
      console.error('Nenhum stream disponível para transmitir.');
    }
  }
}
document.getElementById("startVideo").addEventListener("click", ()=> chamada.iniciargravação());