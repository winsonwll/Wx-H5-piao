var win=window,
    loginStatus= localStorage.getItem('MY_USER_INFO') ? true : false,      //登录状态
    userInfo={};            //用户信息
    
var weixin = {
    config: {
        url:'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf291235684db6dc5&redirect_uri=http://www.piaobuyer.com/bind.html?return_url='+encodeURIComponent(win.location.href)+'&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect',
        url2:'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf291235684db6dc5&redirect_uri='+encodeURIComponent(win.location.href)+'&response_type=code&scope=snsapi_base&state=123#wechat_redirect',
        userInfo:JSON.parse(localStorage.getItem('MY_USER_INFO')),
        api:'http://www.piaobuyer.com'
    },
    isWeixin: function() {
        var ua = win.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i) == 'micromessenger'){
            return true;
        } else {
            return false;
        }
    },
    getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
        var r = win.location.search.substr(1).match(reg);
        if (r!=null) return decodeURIComponent(r[2]); return null;
    },
    getUser: function(code) {
        ajax({
            url: weixin.config.api + '/Ticket/user/weixin.json?code='+code,
            dataType: 'json',
            success: function(data) {
                if (data.success_flag) {
                    localStorage.setItem('MY_USER_INFO', JSON.stringify(data.msg));
                }else{
                    win.location.href = weixin.config.url;
                }
            }
        });
    },
    getUserInfo: function(){
        if(weixin.config.userInfo != null){
            ajax({
                type: 'POST',
                url: weixin.config.api + '/Ticket/user/isLogin.json',
                dataType: 'json',
                success: function(data) {
                    if(data.msg == '' && data.success_flag == 0){
                        if (weixin.getQueryString('code') != null) {
                            ajax({
                                type: 'POST',
                                url: weixin.config.api + '/Ticket/user/AutoLogin.json?code='+weixin.getQueryString('code'),
                                dataType: 'json',
                                success: function(data){
                                    if (data.success_flag == 1) {   //自动登录成功
                                        loginStatus = true;
                                        win.location.reload();
                                    }else{
                                        localStorage.removeItem('MY_USER_INFO');
                                        win.location.href = weixin.config.url;
                                    }
                                }
                            });
                        } else {
                            win.location.href=weixin.config.url2;
                        }
                    }else {         //已登录
                        userInfo = data;
                        loginStatus = true;
                    }
                }
            });
        }else{
            if(weixin.getQueryString('code') != null){
                weixin.getUser(weixin.getQueryString('code'));
                return JSON.parse(localStorage.getItem('MY_USER_INFO'));
            }else{
                win.location.href = weixin.config.url;
            }
        }
    }
};

function ajax(opt){
    /*
     type		// open里面参数1：递交方式		默认get
     url			// open里面参数2：提交地址
     data		// 需要提交的数据
     async		// 请求状态					true 异步   false 同步
     dataType	// 获得响应的文本类型			默认text
     success		// 响应成功后执行的回调函数
     */

    var oAjax=null;
    var o={};

    o.type=opt.type || 'get';
    o.url=opt.url || '';
    o.data=opt.data || '';
    o.async=opt.async || true;
    o.dataType=opt.dataType || 'text';
    o.success=opt.success || null;

    //1 创建请求对象
    if(window.XMLHttpRequest){
        oAjax=new XMLHttpRequest();						//兼容IE7+ firefox chrome opera
    }else{
        oAjax=new ActiveXObject('Microsoft.XMLHttp');	//兼容IE5 6
    }

    //2 请求状态监控 设置回调函数
    oAjax.onreadystatechange=function(){
        if(oAjax.readyState==4){						//查看服务器响应的状态信息
            if(oAjax.status==200){						//请求结果   200 表示服务器页面响应正常 404 表示页面不存在
                switch(o.dataType){						//获得响应的文本内容并且回调函数输出
                    case 'text':
                        o.success && o.success(oAjax.responseText);
                        break;
                    case 'xml':
                        o.success && o.success(oAjax.responseXML);
                        break;
                    case 'json':
                        o.success && o.success(JSON.parse(oAjax.responseText));
                        break;
                }
                delete oAjax;	//收到返回结果后手动删除  目的是解决多个异步对象覆盖的问题
                oAjax=null;
            }else {
                console.log(oAjax.responseText);
            }
        }
    }

    /*
     readyState属性：请求状态
     0: 未初始化  还没有调用open()方法
     1: 载入      已调用send()方法，正在发送请求
     2: 载入完成   send()方法完成，已收到全部响应内容
     3: 解析       正在解析响应内容
     4: 完成       响应内容解析完成，可以在客户端调用
     */

    if(o.type=='get' && o.data){
        o.url += '?' + o.data;
    }

    //3 初始化请求
    oAjax.open(o.type,o.url,o.async);				//true 异步   false 同步

    //4 设置发送方式
    if(o.type=='get'){
        oAjax.send();
    }else{
        oAjax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        oAjax.send(o.data);
    }
}

weixin.getUserInfo();