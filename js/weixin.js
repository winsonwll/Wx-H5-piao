var win = window;
var weixin = {
    config: {
        url:'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf291235684db6dc5&redirect_uri=http://www.piaobuyer.com/bind.html&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect',
        url2:'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf291235684db6dc5&redirect_uri=http://www.piaobuyer.com/bind.html&response_type=code&scope=snsapi_base&state=123#wechat_redirect',
        userInfo:JSON.parse(localStorage.getItem('MY_USER_INFO')),
        api:'http://www.piaobuyer.com'
    },
    isweixin: function() {
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
        $.ajax({
            type: 'get',
            url: weixin.config.api + '/Ticket/user/weixin.json?code='+code,
            cache:false,
            async: false,
            dataType: 'json',
            success: function(data){
                if (data.success_flag) {
                    localStorage.setItem('MY_USER_INFO', JSON.stringify(data.msg));
                }else{
                    win.location.href = weixin.config.url;
                }
            },
            error: function(data) {
                console.log(data);
            }
        })
    },
    getUserInfo: function(){
        if(weixin.config.userInfo != null){
            //win.location.href = weixin.config.url2;
            return JSON.parse(localStorage.getItem('MY_USER_INFO'));
            //win.history.back();
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