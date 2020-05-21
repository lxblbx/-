const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
var port =7777

const users = []//记录所有登录过的用户


server.listen(port, () =>{
    console.log('服务器启动成功' + '监听端口' + port)

});
// WARNING: app.listen(80) will NOT work here!

app.use(require('express').static('public'))

app.get('/', (req, res) => {
  res.redirect('/index.html')
});

io.on('connection', function(socket){
    /* console.log('新用户连接了') */

    socket.on('login', data =>{
        /* console.log(data) */
        //data在uesr存在，说明该用户已经登录，不在允许登录
        //data不在user中存在，允许登录
        let user = users.find(item => item.username == data.username)
        if(user){
            //用户存在，登录失败
            socket.emit('loginError', {msg: '登录失败'})
        }else{
            users.push(data)
            socket.emit('loginSuccess', data)
            /* console.log('登录成功') */

            //广播所有用户，有用户加入了聊天室
            /* socket.emit:告诉当前用户
            io.emit:广播事件 */
            io.emit('addUser', data)

            //告诉所有用户当前多少人在聊天室
            io.emit('userList', users)


            //存储起来名字和头像
            socket.username = data.username
            socket.avatar = data.avatar
            }
        
    })


    socket.on('disconnect', ()=>{
        //用户断开，把当前的用户信息从user删除
        let idx = users.findIndex(item => item.username === socket.username)
        users.splice(idx, 1)//删除断开连接的这个人

        io.emit('delUser', {
            username: socket.username,
            avatar: socket.avatar
        })

        io.emit('userList', users)
    })

    //接收消息
    socket.on('sendMessage', data =>{
        io.emit('receiveMessage', data)
    })
    //接收图片
    socket.on('sendImage', data =>{
        io.emit('receiveImage', data)
    })
})