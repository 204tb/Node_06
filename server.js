const express = require('express')
const app = express()

const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }))

const dotenv = require('dotenv')
dotenv.config()
const host = process.env.HOST
const port = process.env.PORT

const uuidv4 = require('uuid').v4
let users = {}

app.get('/', (req, res) => {
    res.render('index.ejs')
})


io.on('connection', (socket) => {
    socket.on('auth', (user) => {
        //トークンがあれば処理内
        if (user.token) return
        //トークン発行
        user.token = uuidv4()
        //ユーザリスト追加
        users[socket.id] = user
        //data の作成
        let data = {
            user: user,
            users: users,
        }
        console.log(data)
        //本人にデータを返す
        socket.emit('logined', data)
        //本人以外すべてにデータを返す
        socket.broadcast.emit('user_joined', data)
    })

    socket.on('message', (data) => {
        console.log(data)
        data.datetime =Date.now()//データを送信した時刻
        io.emit('message', data)
    })
    //stampの送信
    socket.on('upload_stamp', (data) => {
        //console.log(data)
        data.datetime =Date.now()//データを送信した時刻
        io.emit('load_stamp', data)
    })
    
    //ファイルの送信
    socket.on('upload_image', (data) => {
        console.log(data)
        data.datetime =Date.now()//データを送信した時刻
        io.emit('load_image', data)
    })

    //ログアウト処理
    const logout = (socket) => {
        const user = users[socket.id]//userをidで特定して値を保持
        delete users[socket.id]//ユーザ一覧から削除

        socket.broadcast.emit("user_left",{//ログアウト者以外に一斉通知
            user:user,//ログアウトユーザー
            users:users,//ログアウト後のユーザ一覧
        })
    }
    socket.on('logout', () => {
        logout(socket)//関数で処理を行う
    })
    socket.on('disconnect', () => {//切断されたときに自動的に実行される
        logout(socket)//関数で処理を行う
    })
    
})

http.listen(port, host, () => {
    console.log('http://' + host + ':' + port)
})