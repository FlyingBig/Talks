var express = require('express');
var	app = express();
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);
var usersmeg = []; //存放在线用户信息
app.use('/', express.static(__dirname + '/www')); //指定静态HTML文件的位置
server.listen(8888);
//TODO (以后公用方法专门建包)
function getNowFormatDate() {
    var date = new Date();
    var seperator2 = ":";
    var strDate = date.getDate();
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getHours() + seperator2 + date.getMinutes()+ seperator2 + date.getSeconds();
    return currentdate;
}
io.on("connection",function(socket){
	/**
	 * 这是判断昵称是否存在的一个方法
	 * @param  nickname -- 用户输入的名称
	 * @return null                            
	 */
	socket.on('nickname',function(userzc){
		var nickname = userzc.nickname;
		var introduce = userzc.introduce;
		var isrepeat = false;
		usersmeg.map((val)=>{
			if(val.name === nickname){
				isrepeat = true;
				return;
			}
		})
		if(!isrepeat){
			//用对象为了方便以为扩展用户的更多功能(eg:会员啦)
			var user = {
				name : nickname,
				introduce : introduce
			}
			socket.userIndex = usersmeg.length;
            socket.nickname  = nickname;
			usersmeg.push(user);
			socket.emit("login",{message:"恭喜你注册成功!",success:true});
			io.sockets.emit("online",usersmeg);
			socket.broadcast.emit('system', {name:nickname, flag:true});
		}else{
			socket.emit("login",{message:"该昵称已存在!",success:false})
		}
	});
	//用户发送消息
	socket.on("sendmeg",function(data){
		var time = getNowFormatDate();
		data.time = time;
		socket.broadcast.emit('showmsg',data);
	//	socket.emit('sendsuccess',true)
	})
	//断开连接
	socket.on('disconnect', function() {
		var outname = usersmeg[socket.userIndex];
	    //将断开连接的用户从users中删除
	    usersmeg.splice(socket.userIndex, 1);
	    //通知除自己以外的所有人
	    socket.broadcast.emit('online', usersmeg);
	    //flag  == 进来 | 离开
	    outname? socket.broadcast.emit('system', {name:outname.name,flag:false}) : null;
	});
})