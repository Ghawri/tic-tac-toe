const {createServer} = require('http');
const {Server} = require('socket.io');
// const express = require('express')
const path = require('path')
const BASE_URL = process.env.BASE_URL


// const app= express();
const httpServer = createServer();
const io = new Server(httpServer, { 
    cors:`${BASE_URL}`
});



//----------------deployement-------------------

// const __dirname1= path.resolve();
// if(process.env.NODE_ENV==='production'){
//     app.use(express.static(path.join(__dirname1,'/tic-tac-toe-online/build')))

//     app.get('*',(req,res)=>{
//         res.sendFile(path.resolve(__dirname1,'tic-tac-toe-online','build','index.html'))
//     })
// }else{
//     app.get('/',(req,res)=>{
//         res.send(" running")
//     })
// }


//----------------deployement-------------------

const Alluser ={}
const Allrooms =[]
io.on("connection", (socket) => {

    

    Alluser[socket.id]={
        socket:socket,
        online:true,
    }


socket.on('request_to_play',(data)=>{
  const currentuser = Alluser[socket.id]
  currentuser.playername=data.playername
//   console.log(currentuser)


let opponentplayer;
for(const key in Alluser){
    const user = Alluser[key];
    if(user.online&&!user.playing && socket.id !== key){
        opponentplayer =user
        break;

    }
}

if(opponentplayer){

    Allrooms.push({
        player1:opponentplayer,
        player2:currentuser
    })
    currentuser.socket.emit('OpponentFound',{
        opponentname :opponentplayer.playername,
        playingAs:'circle',
    })
    opponentplayer.socket.emit('OpponentFound',{
        opponentname :currentuser.playername,
        playingAs:'cross',
    })

    currentuser.socket.on("PlayerMoveFromClient",(data)=>{
        opponentplayer.socket.emit('PlayerMoveFromServer',{
            ...data
        })
    })
    opponentplayer.socket.on("PlayerMoveFromClient",(data)=>{
        currentuser.socket.emit('PlayerMoveFromServer',{
           ...data
        })
    })
}
else{
    currentuser.socket.emit('OpponentNotFound')
}
})
socket.on('disconnect',function(){

    const currentuser = Alluser[socket.id];
    currentuser.online=false
    currentuser.playing=false

    for (let index = 0; index < Allrooms.length; index++) {
        const {player1,player2} = Allrooms[index];

        if(player1.socket.id=== socket.id){
            player2.socket.emit("OpponentLeftMatch")
            break;
        }
        if(player2.socket.id === socket.id){
             player1.socket.emit("OpponentLeftMatch")
             break;
        }
    }
})
});

httpServer.listen(3000);