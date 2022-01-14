const url = '';
//セレクタで選択した値を変数に代入
const chatArea = $('#chatArea')
const loginArea = $('#loginArea')
const message = $('#message')
const myChatList = $('#myChatList')
const userList = $('#userList')
const inputName = $('#inputName')
const iconList = $('#iconList')
const stampList = $('#stampList')
const userName = $('.userName')
const checkIcon = $('input[name=icon]:checked')
const FADE_TIME = 500
const STAMP_WIDTH = 150
const IMAGE_WIDTH = 500
let user = {}
let users = {}

$(() => {
    imagePath = (fileName) => { return 'images/' + fileName }

    addMessage = (value) => {
        if (!value) return
        let messageElement = $('<small>').addClass('text-muted pt-2 pb-2').text(value)
        myChatList.prepend(messageElement)
    }
    updateUserList = () => {
        if (!users) return
        userList.html('')
        $.each(users, (key, user) => {
            let img = $('<img>').attr({ src: imagePath(user.icon), class: 'icon' })
            let li = $('<li>').addClass('list-group-item').append(img).append(user.name)
            userList.append(li)
        })
    }
    createIcons = () => {
        const icons = [...Array(6).keys()].map(i => `${++i}.png`)
        icons.forEach((icon, index) => {
            index++

            let id = 'icon_' + index
            let label = $('<label>').attr({ for: id })
            let input = $('<input>').attr({ id: id, name: 'icon', type: 'radio', value: icon })
            if (index == 1) input.attr({ checked: 'checked' })
            let img = $('<img>').attr({ src: imagePath(icon), class: 'icon' })

            label.append([input, img])
            iconList.append(label)
        })
    }
    createStamps = () => {
        const stamps = [...Array(6).keys()].map(i => `stamp${++i}.png`)
        stamps.forEach((stamp, index) => {
            index++
            let imageId = 'stamp_' + index
            let a = $('<a>').attr({ stamp: imageId, class: 'uploadStamp' })
            let img = $('<img>').attr({ id: imageId, src: imagePath(stamp), class: 'stamp' })
            a.append(img)
            stampList.append(a)
        })
    }
    createHeaderElement = (data, isMyself) => {
        let dateStyle = (isMyself) ? 'p-3 text-primary' : 'p-1 text-dark'
        let userStyle = (isMyself) ? 'text-end' : 'text-start'
        let img = $('<img>').attr({ src: imagePath(data.user.icon), class: 'icon' })
        let userElement = $('<small>').addClass(dateStyle).append(img).append(data.user.name)
        let headerElement = $('<p>').addClass(userStyle).append([userElement])
        return headerElement
    }
    createFooterElement = (data, isMyself) => {
        const date_string = new Date(data.datetime).toLocaleString('ja-JP')
        let dateStyle = (isMyself) ? 'text-end' : 'text-start'
        let dateElement = $('<small>').addClass('text-muted').html(date_string)
        let footerElement = $('<div>').addClass(dateStyle).append(dateElement)
        return footerElement
    }
    createMessageElement = (data, isMyself) => {
        let chatStyle = (isMyself) ? 'p-3 balloon-right' : 'p-3 balloon-left'
        let message = data.message.replace(/\r?\n/g, '<br>')
        let messageElement = $('<div>').addClass(chatStyle).html(message)
        return messageElement
    }
    createChatMessage = (data) => {
        let isMyself = hasToken(data)
        let headerElement = createHeaderElement(data, isMyself)
        let messageElement = createMessageElement(data, isMyself)
        let footerElement = createFooterElement(data, isMyself)
        let chatElement = $('<div>').hide().append([headerElement, messageElement, footerElement])

        myChatList.prepend(chatElement)
        chatElement.fadeIn(FADE_TIME)
    }
    createChatImage = (data, params) => {
        let isMyself = hasToken(data)
        let headerElement = createHeaderElement(data, isMyself)
        let img = $('<img>').attr('src', data.image).attr('width', params.width)
        let messageElement = $('<div>').addClass('text-center').append(img)
        let footerElement = createFooterElement(data, isMyself)
        let chatElement = $('<div>').hide().append([headerElement, messageElement, footerElement])

        myChatList.prepend(chatElement)
        chatElement.fadeIn(FADE_TIME)
    }
    hasToken = (data) => {
        return (data.user.token == user.token)
    }

    createIcons()
    createStamps()
    loginArea.hide()
    chatArea.hide()
    stampList.hide()
    loginArea.fadeIn(FADE_TIME)

    let socket = io.connect(url)

    //ログイン処理
    $('#login').on('click', () => {//ログインボタンをクリックしたら
        let name = inputName.val()//入力された氏名を取得
        let icon = $('input[name=icon]:checked').val()
        if (name && icon) {//ログインが成功
            loginArea.hide()//ログイン画面を非表示
            chatArea.fadeIn(FADE_TIME)//チャットエリアを表示
            //サーバに送信
            socket.emit('auth', {
                name: name,
                icon: icon,
            })
        }
    })
    //ログアウト処理
    $('#logout').on('click', () => {
        socket.emit("logout")//serverに送る
        user ={} //ユーザー情報を初期化
        chatArea.hide()//チャットエリアを隠す
        loginArea.fadeIn(FADE_TIME)//ログイン画面を表示
    })

    $('#send').on('click', () => {
        if(message.val()=="")return
        socket.emit("message"　,{
            message:message.val(),
            user:user
        })//server側のメッセージ処理を行う
        message.val("")
    })

    //受信
    socket.on('logined', (data) => {
        user = data.user
        users = data.users
        userName.text(user.name)
        updateUserList()
    })
    socket.on('user_joined', (data) => {
        users = data.users
        let message = data.user.name + 'が入室しました'
        addMessage(message)
        updateUserList()
    })
    //メッセージの受信
    socket.on('message', (data) => {//serverから返ってきた値を表示
        createChatMessage(data)
    })
    //ログアウト通知
    socket.on('user_left', (data) => {
        users = data.users
        let message = data.user.name + 'が退出しました'
        addMessage(message)
        updateUserList()
    })
    //スタンプ投稿




    //スタンプ表示

    $(".stamp").on("click",()=>{
        stampList.toggle()//表示非表示の切替
    })
    $(".uploadStamp").on("click",(event) => {
        const image = new Image()
        image.src = $(event.target).attr("src")//クリック先の画像のパスを設定
        const mime_type ="image/png"//エンコードタイプの指定
        image.onload = () => {//パスが設定された時

            //メモ　：pngファイルは直接送ることが出来ないため、一度別の形式に変換して送信する
            const canvas = document.createElement("canvas")//キャンバスタグを生成
            canvas.width= image.naturalWidth//取得した画像の横幅
            canvas.height=image.naturalHeight//取得した画像の縦幅
            const ctx = canvas.getContext("2d")
            ctx.drawImage(image,0,0)//読み込んだ画像をキャンバスに張り付ける
            const base64 = canvas.toDataURL(mime_type)//画像をbase64形式に変換する
            //データの準備
            const data ={user:user,image:base64}
            socket.emit("upload_stamp",data)//データをサーバーに送信

        }

    })
    socket.on("load_stamp",(data)=>{
        createChatImage(data,{width:STAMP_WIDTH})
    })

        //画像アップロード
        $(".uploadImage").on("change",(event)=>{
            let file = event.target.files[0]
            let fileRender = new FileReader()
            fileRender.readAsDataURL(file)
            fileRender.onloadend = () => {
                const data ={
                    image:fileRender.result,
                    user:user,
                }
                socket.emit("upload_image",data)
                $(".uploadImage").val() = ""
            }
        })

        socket.on("load_image",(data)=>{
            createChatImage(data,{width:IMAGE_WIDTH})
        })

})