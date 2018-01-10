window.onload = function(){
	mychat.init();
	var tearea = document.getElementById("cqy-ipt");
	//回车发送消息
	tearea.onkeypress = function(e){
		var theEvent = e || window.event;      
			var code = theEvent.keyCode || theEvent.which || theEvent.charCode;  
		if(code == 13){
			mychat.sendmeg();
			this.val("");
		}
	}
}
//获取时间
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
//mychat 定义
var Mychat = function(){
	this.socket = null
}
Mychat.prototype = {
	init: function(){
		this.socket = io.connect("http://192.168.29.244:8888");//与服务器进行连接
		//系统消息
		this.socket.on("system",function(data){
			var isleave = data.flag ? "加入" : "离开";
			var	html = '<div class="cqy-system-meg"><span>系统提示: 老铁-<span class="cqy-outname">'+data.name+'</span>'+isleave+'本聊天室。</span></div>';
			$(".cqy-chatcontent").append(html);
		})
		//用户发送信息
		this.socket.on("showmsg",function(data){
			var html = '';
			html += '<div class="cqy-othertalk">';
			html += '<span><img class="cqy-talk-s cqy-left" src="imgs/youke1.jpg"></span>';
			html +=	'<div><span class="cqy-talkname">'+data.myname+'</span><span>'+data.time+'</span><p>'+data.font+'</p></div></div>';
			$(".cqy-chatcontent").append(html);
		})
	},
	//检查名字是否重复
	checkname : function(that){
		var nickname  = $(that).parents(".cqy-login").children(".cqy-hh").find("input").val();
		var introduce = $(that).parents(".cqy-login").children(".cqy-hhh").find("input").val();
		if(nickname === ""){
			alert("宝贝,名称不能为空哦");
		}else{
			var userzc = {
				nickname : nickname,
				introduce: introduce
			}
			this.socket.emit("nickname",userzc);
			//提示用户注册信息
			this.socket.on("login",function(data){
				if(data.success){
					$(".cqy-mask").hide();
					$(".cqy-username").text(nickname);
					$(".cqy-userqx").text(introduce);
				}
				alert(data.message);
			})
			//更新在线用户
			this.socket.on("online",function(data){
				console.log(data);
				var html = '';
				var system = '';
				data.map((value,inedx)=>{
					html += '<li><span class="cqy-userdetail"></span><span class="cqy-userndetailame">'+value.name+'</span></li>';
				})
				$(".cqy-online").find("ul").empty();
				$(".cqy-online").find("ul").append(html);
				$(".cqy-online").mCustomScrollbar();
			})
		}
	},
	//退出注册
	loginout : function(){
		window.opener=null;
		window.open('','_self');
		window.close();
		io.disconnect();
	},
	//发送消息
	sendmeg : function(){
		var sendstr  = $("#cqy-ipt").val();
		var username = $(".cqy-username").text();
		var time = getNowFormatDate();
		var html = '';
		this.socket.emit("sendmeg",{font: sendstr, myname: username});
		html += '<div class="cqy-metalk">';						
		html +=	'<div><span>'+time+'</span><span class="cqy-talkname1">'+username+'</span><p>'+sendstr+'</p></div>';
		html +=	'<span><img class="cqy-talk-s cqy-right" src="imgs/youke1.jpg"></span></div>';
		$(".cqy-chatcontent").append(html);
		$("#cqy-ipt").val("");
	}
}
// send = document.getElementById('cqy-sendmsg');

// function sendsocket (){
// 	var userdata = document.getElementById("cqy-ipt").value;
// 	var data = {
// 		mydata : userdata
// 	}
// 	socket.emit('foo', data);//发送一个名为foo的事件
// }
// send.onclick=function(){
// 	sendsocket();
// }
var mychat = new Mychat();