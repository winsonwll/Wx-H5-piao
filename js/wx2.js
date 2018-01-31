var win = window;
var WX = (function(){
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf291235684db6dc5&redirect_uri=http%3a%2f%2fwww.piaobuyer.com%2fbind.html&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect',    //需要跳转授权
        url2 = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf291235684db6dc5&redirect_uri=http%3a%2f%2fwww.piaobuyer.com%2fbind.html&response_type=code&scope=snsapi_base&state=123#wechat_redirect',       //无需跳转授权，直接获取code
        userInfo = JSON.parse(localStorage.getItem('MY_USER_INFO')),
        api = 'http://www.piaobuyer.com';

    return {
        initialize: function(){
            this.getUserInfo();
        },
        isWeixin: function() {
            var ua = win.navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                return true;
            } else {
                return false;
            }
        },
        getUserInfo: function() {
            var self = this;
            if(!self.isWeixin){
                win.location.href = url;
                return false;
            }

            var code = self.getQueryString('code');
            if(userInfo){
                alert(111);
                win.location.href = './index.html';
            }else{
                alert(222);
                self.getUser(code);
            }
        },
        getUser: function (code) {
            if (code != null) {
                $.ajax({
                    type: 'POST',
                    url: api + '/Ticket/user/weixin.json',                      //获取用户信息接口
                    data: {code: code},
                    dataType: 'json',
                    cache: false,
                    async: false,
                    success: function(data) {
                        if (data.success_flag) {
                            alert(333);
                            localStorage.setItem('MY_USER_INFO', JSON.stringify(data.msg));
                        } else {
                            alert(444);
                            win.location.href = url;
                        }
                    }
                });
            } else {
                alert(555);
                win.location.href = url;
            }
        },
        getQueryString: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return decodeURIComponent(r[2]);
            return null;
        }
    }
})();

//初始化
WX.initialize();