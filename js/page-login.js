(function ($) {
    $(document).on("pageInit", "#page-login", function (e, id, page) {
        var win = window;
        var LOGIN = (function(){
            var $loginForm = $('#ID-form-login'),                    //登录表单
                $loginBtn = $loginForm.find('button'),                 //登录按钮
                $phone = $loginForm.find('input[name=MobilePhone]'),     //手机号
                $pwd = $loginForm.find('input[name=password]'),       //密码
                $msg = {                                                //提示信息
                    0: '请输入手机号',
                    1: '手机号格式不正确',
                    2: '手机号或密码不正确',
                    3: '请输入密码',
                    4: '密码格式为6-12位字母、数字',
                    5: '恭喜您，登录成功'
                };
            var bLogin = false;                  //是否登录状态

            return {
                initialize: function(){
                    //检测登录
                    this.checkLogin();
                    //事件
                    this.bindEvents();
                },
                //检测登录
                checkLogin: function(){
                    $.ajax({
                        type: 'POST',
                        url: '/Ticket/user/isLogin.json',
                        dataType: 'json',
                        success: function (data) {
                            if( data && data.success_flag && data.success_flag == 1 ){
                                bLogin = true;
                                $.router.back();
                                return;
                            }
                        }
                    });
                },
                //事件
                bindEvents: function(){
                    //监听是否有输入
                    var arr=[];
                    $loginForm.on('input', 'input', function(){
                        arr = $.grep ($loginForm.find('input'), function(item){
                            return $(item).val();
                        });
                        if(arr.length>0){
                            $loginBtn.addClass('button-yellow');
                        }else{
                            $loginBtn.removeClass('button-yellow');
                        }
                    });

                    //执行登录
                    var self = this;

                    $loginBtn.off().on('click', function(){
                        var _this = $(this);

                        //检测手机号 密码
                        if(self.checkMobilePhone() && self.checkPwd()){
                            _this.hide();
                            _this.after('<button type="button" class="button button-round button-big button-yellow disabled">登录中...</button>');
                            
                            $.ajax({
                                type: 'POST',
                                url: '/Ticket/user/login.json',
                                data: {mobilePhone: $.trim($phone.val()), password: hex_md5($.trim($pwd.val()))},
                                dataType: 'json',
                                success: function (data) {
                                    if(data.success_flag==1){
                                        $.toast($msg[5]);
                                        self.setCookie('phone', $.trim($phone.val()));
                                        setTimeout(function(){
                                            //$.router.back();
                                            win.location.href='./index.html';
                                        },500);
                                    }else{
                                        $.toast($msg[2]);
                                        _this.show();
                                        _this.next().remove();
                                        return false;
                                    }
                                }
                            });
                        }
                        return false;
                    });
                },
                //检测手机号
                checkMobilePhone: function(){
                    var $val = $phone.val();
                    if($.trim($val).length!=0){
                        var re = /^1[34578]\d{9}$/.test($val);
                        if(!re){
                            $.toast($msg[1]);
                            return false;
                        }
                    }else{
                        $.toast($msg[0]);
                        return false;
                    }
                    return true;
                },
                //检测密码
                checkPwd: function(){
                    var $val = $pwd.val();
                    if($.trim($val).length!=0){
                        var re = /^[0-9a-zA-z]{6,12}$/.test($val);
                        if(!re){
                            $.toast($msg[4]);
                            return false;
                        }
                    }else{
                        $.toast($msg[3]);
                        return false;
                    }
                    return true;
                },
                //写cookies
                setCookie: function (name,value) {
                    var Days = 30;
                    var exp = new Date();
                    exp.setTime(exp.getTime() + Days*24*60*60*1000);
                    document.cookie = name + "="+ encodeURI (value) + ";expires=" + exp.toGMTString();
                }
            }
        })();

        //初始化
        LOGIN.initialize();
    });

    $.init();
})(Zepto);