/* 
  聊天室的主要功能
*/

/* import html2canvas from "html2canvas" */

/* 
  1. 连接socketio服务
*/
var socket = io('http://localhost:7777')
var username, avatar
/* 
  2. 登录功能
*/
$('#login_avatar li').on('click', function() {
  $(this)
    .addClass('now')
    .siblings()
    .removeClass('now')
})
// 点击按钮，登录
$('#loginBtn').on('click', function() {
  // 获取用户名
  var username = $('#username')
    .val()
    .trim()
  if (!username) {
    alert('请输入用户名')
    return
  }
  // 获取选择的头像
  var avatar = $('#login_avatar li.now img').attr('src')

  // 需要告诉socket io服务，登录
  socket.emit('login', {
    username: username,
    avatar: avatar
  })
})

// 监听登录失败的请求
socket.on('loginError', data => {
  alert('用户名已经存在')
})
// 监听登录成功的请求
socket.on('loginSuccess', data => {
  // 需要显示聊天窗口
  // 隐藏登录窗口
  $('.login_box').fadeOut()
  $('.container').fadeIn()
  // 设置个人信息
  console.log(data)
  $('.avatar_url').attr('src', data.avatar)
  $('.user-list .username').text(data.username)

  username = data.username
  avatar = data.avatar
})

// 监听添加用户的消息
socket.on('addUser', data => {
  // 添加一条系统消息
  $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}加入了群聊</span>
      </p>
    </div>
  `)
  scrollIntoView()
})

// 监听用户列表的消息
socket.on('userList', data => {
  // 把userList中的数据动态渲染到左侧菜单
  $('.user-list ul').html('')
  data.forEach(item => {
    $('.user-list ul').append(`
      <li class="user">
        <div class="avatar"><img src="${item.avatar}" alt="" /></div>
        <div class="name">${item.username}</div>
      </li>      
    `)
  })

  $('#userCount').text(data.length)
})

// 监听用户离开的消息
socket.on('delUser', data => {
  // 添加一条系统消息
  $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}离开了群聊</span>
      </p>
    </div>
  `)
  scrollIntoView()
})

// 聊天功能
$('.btn-send').on('click', () => {
  // 获取到聊天的内容
  var content = $('#content').html()
  $('#content').html('')
  if (!content) return alert('请输入内容')

  // 发送给服务器
  socket.emit('sendMessage', {
    msg: content,
    username: username,
    avatar: avatar
  })
})


// 监听聊天的消息
socket.on('receiveMessage', data => {
  // 把接收到的消息显示到聊天窗口中
  if (data.username === username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  scrollIntoView()
})

function scrollIntoView() {
  // 当前元素的底部滚动到可视区
  $('.box-bd')
    .children(':last')
    .get(0)
    .scrollIntoView(false)
}


/* 
$('.screen-cut').on('click', function(){
    html2canvas(document.querySelector('#proMain'),{useCORS:ture}).then(function(canvas){
      var timers=new Date();
                var fullYear=timers.getFullYear();
                var month=timers.getMonth()+1;
                var date=timers.getDate();
                var randoms=Math.random()+'';
                //年月日加上随机数
                var numberFileName=fullYear+''+month+date+randoms.slice(3,10);
                var imgData=canvas.toDataURL();
                //保存图片
                var saveFile = function(data, filename){
                    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                    save_link.href = data;
                    save_link.download = filename;
 
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    save_link.dispatchEvent(event);
                };
                //最终文件名+文件格式
                var filename = numberFileName + '.png';
                saveFile(imgData,filename);
                //document.body.appendChild(canvas);  把截的图显示在网页上
            })
    })

 */


// 发送图片功能
$('#file').on('change', function() {
  var file = this.files[0]

  // 需要把这个文件发送到服务器， 借助于H5新增的fileReader
  var fr = new FileReader()
  fr.readAsDataURL(file)
  fr.onload = function() {
    socket.emit('sendImage', {
      username: username,
      avatar: avatar,
      img: fr.result
    })
  }
})


// 监听图片聊天信息
socket.on('receiveImage', data => {
  // 把接收到的消息显示到聊天窗口中
  if (data.username === username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  // 等待图片加载完成,在滚动到底部
  $('.box-bd img:last').on('load', function() {
    scrollIntoView()
  })
})



/* // 初始化jquery-emoji插件
$('.face').on('click', function() {
  $('#content').emoji({
    // 设置触发表情的按钮
    button: '.face',
    showTab: false,
    animation: 'slide',
    position: 'topRight',
    icons: [
      {
        name: 'QQ表情',
        path: 'lib/jquery-emoji/img/qq/',
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: '.gif'
      }
    ]
  })
}) */

$('.face').on('click', function() {
  $('#content').emoji({
    // 设置触发表情的按钮
    button:'.face',
    showTab: true,
    animation:'slide',
    position:'topLeft',
    icons: [{
        name: "贴吧表情",
        path: "lib/jquery-emoji/img/tieba/",
        maxNum: 50,
        file: ".jpg",
        placeholder: ":{alias}:",
        alias: {
            1: "hehe",
            2: "haha",
            3: "tushe",
            4: "a",
            5: "ku",
            6: "lu",
            7: "kaixin",
            8: "han",
            9: "lei",
            10: "heixian",
            11: "bishi",
            12: "bugaoxing",
            13: "zhenbang",
            14: "qian",
            15: "yiwen",
            16: "yinxian",
            17: "tu",
            18: "yi",
            19: "weiqu",
            20: "huaxin",
            21: "hu",
            22: "xiaonian",
            23: "neng",
            24: "taikaixin",
            25: "huaji",
            26: "mianqiang",
            27: "kuanghan",
            28: "guai",
            29: "shuijiao",
            30: "jinku",
            31: "shengqi",
            32: "jinya",
            33: "pen",
            34: "aixin",
            35: "xinsui",
            36: "meigui",
            37: "liwu",
            38: "caihong",
            39: "xxyl",
            40: "taiyang",
            41: "qianbi",
            42: "dnegpao",
            43: "chabei",
            44: "dangao",
            45: "yinyue",
            46: "haha2",
            47: "shenli",
            48: "damuzhi",
            49: "ruo",
            50: "OK"
        },
        title: {
            1: "呵呵",
            2: "哈哈",
            3: "吐舌",
            4: "啊",
            5: "酷",
            6: "怒",
            7: "开心",
            8: "汗",
            9: "泪",
            10: "黑线",
            11: "鄙视",
            12: "不高兴",
            13: "真棒",
            14: "钱",
            15: "疑问",
            16: "阴脸",
            17: "吐",
            18: "咦",
            19: "委屈",
            20: "花心",
            21: "呼~",
            22: "笑脸",
            23: "冷",
            24: "太开心",
            25: "滑稽",
            26: "勉强",
            27: "狂汗",
            28: "乖",
            29: "睡觉",
            30: "惊哭",
            31: "生气",
            32: "惊讶",
            33: "喷",
            34: "爱心",
            35: "心碎",
            36: "玫瑰",
            37: "礼物",
            38: "彩虹",
            39: "星星月亮",
            40: "太阳",
            41: "钱币",
            42: "灯泡",
            43: "茶杯",
            44: "蛋糕",
            45: "音乐",
            46: "haha",
            47: "胜利",
            48: "大拇指",
            49: "弱",
            50: "OK"
        }
    }, {
        name: "QQ高清",
        path: "lib/jquery-emoji/img/qq/",
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: ".gif",
        placeholder: "#qq_{alias}#"
    }, {
        name: "emoji高清",
        path: "lib/jquery-emoji/img/emoji/",
        maxNum: 84,
        file: ".png",
        placeholder: "#emoji_{alias}#"
    }]
})
})

