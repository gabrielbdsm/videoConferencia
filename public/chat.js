var listUsers = []

const socket = io()


const urlSearch = new URLSearchParams(window.location.search)
const username = urlSearch.get("username")

var peer = new Peer(username)

peer.on('open', function(id) {
  document.getElementById("id_user").innerHTML= id 
  
  socket.emit("sala", {
    id
  })
  
  });

async function  renderUserlist(list) {
  listUsers= list[0].filter(u => u != username)
  
  sala = document.getElementById("outrosUsers")
  while (sala.firstChild) {
    sala.removeChild(sala.firstChild);
  }
  listUsers.forEach(i =>{
    let videoElement = document.createElement('video');
    videoElement.id = 'remote-video_' + i;
    videoElement.autoplay = true;
    videoElement.className = "users";
    sala.appendChild(videoElement)
})
}

socket.on("UsersNaSala", (list)=>{ 
    renderUserlist(Object.values(list))
})

socket.on("UsersNaSalaAtualizado", (list)=>{ 
  renderUserlist(Object.values(list))
})


peer.on('call', (call) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream)  => {
        call.answer();
        
        call.on("stream", (remoteStream) => {
          console.log("passou8" + call.peer)
          document.getElementById("remote-video_" + call.peer).srcObject = remoteStream;
        });
      })
      .catch((err) => {
        console.error('Erro ao atender a chamada:', err);
      });
  });
  

  function iniciarChamada() {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        document.getElementById("recordedVideo").srcObject = stream;
        console.log("iniciarChamada" +listUsers)
        listUsers.forEach(usuario =>{
          var call = peer.call(usuario, stream);
          call.on("stream", (remoteStream) => {
            document.getElementById("remote-video_" + call.peer).srcObject = remoteStream;
        });
        })
        
      })
      .catch((error) => {
        console.error('Erro ao iniciar a chamada:', error);
      });
  }
  
  function callUser() {
    iniciarChamada();
  }
  
  document.getElementById("startVideo").addEventListener("click", callUser);