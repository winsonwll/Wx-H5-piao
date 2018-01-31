(function ($) {
    $(document).on("pageInit", "#page-reg", function (e, id, page) {
        var win = window;
        var REG = (function(){
            var $regForm = $('#ID-form-reg'),                    //注册表单
                $regBtn = $regForm.find('button'),                //注册按钮
                $sendsmsBtn = $('#ID-sendsms'),                  //获取验证码按钮
                $phone = $regForm.find('input[name=MobilePhone]'),     //手机号
                $vcode = $regForm.find('input[name=vcode]'),   //验证码
                $pwd = $regForm.find('input[name=password]'),  //密码
                $repwd = $regForm.find('input[name=repassword]'),  //确认密码
                $referee = $regForm.find('input[name=referee]'),  //邀请码
                $msg = {                                         //提示信息
                    0: '请输入手机号',
                    1: '手机号格式不正确',
                    2: '手机号已被注册',
                    3: '请输入验证码',
                    4: '验证码不正确',
                    5: '验证码已过期',
                    6: '验证码已发送，请在30分钟内输入',
                    7: '请输入密码',
                    8: '密码格式为6-12位字母、数字',
                    9: '两次密码输入不一致',
                    10: '请输入邀请码',
                    11: '邀请码格式不正确',
                    12: '恭喜您，注册成功'
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
                    $regForm.on('input', 'input', function(){
                        arr = $.grep ($regForm.find('input'), function(item){
                            return $(item).val();
                        });
                        if(arr.length>0){
                            $regBtn.addClass('button-yellow');
                        }else{
                            $regBtn.removeClass('button-yellow');
                        }
                    });

                    //执行注册
                    var self = this;
                    $regBtn.on('click', function(){
                        var _this = $(this);

                        //检测手机号 验证码 密码 邀请码
                        if(self.checkMobilePhone() && self.checkPwd() && self.checkRepwd() && self.checkReferee()){
                            _this.hide();
                            _this.after('<button type="button" class="button button-round button-big button-yellow disabled">注册中...</button>');

                            $.ajax({
                                type: 'POST',
                                url: '/Ticket/user/register.json',
                                data: $regForm.serialize(),
                                dataType: 'json',
                                success: function (data) {
                                    if(data.success_flag){
                                        $.toast($msg[12]);
                                        setTimeout(function(){
                                            win.location.href='./index.html';
                                        },300);
                                    }else{
                                        $.toast(data.error);
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
                /*//检测验证码
                checkVcode: function(){
                    var self = this;
                    $sendsmsBtn.off().on('click', function(){
                        var _this = $(this);
                        //检测手机号
                        if(self.checkMobilePhone()){
                            _this.hide();
                            _this.after('<div class="button disabled"><span>10</span>s后重试</div>');
                            $.toast($msg[6]);

                            var iNum = parseInt(_this.next().find('span').text());
                            var iTimer = setInterval(function(){
                                iNum--;
                                _this.next().find('span').text(iNum);
                                if(iNum==0){
                                    _this.show();
                                    _this.next().remove();
                                    clearInterval(iTimer);
                                }
                            }, 1000)
                        }
                    });
                    if($.trim($vcode.val()).length!=0){
                        //验证验证码
                    }else{
                        $.toast($msg[3]);
                        return false;
                    }
                    return true;
                },*/
                //检测密码
                checkPwd: function(){
                    var $val = $pwd.val();
                    if($.trim($val).length!=0){
                        var re = /^[0-9a-zA-z]{6,12}$/.test($val);
                        if(!re){
                            $.toast($msg[8]);
                            return false;
                        }
                    }else{
                        $.toast($msg[7]);
                        return false;
                    }
                    return true;
                },
                //检测确认密码
                checkRepwd: function(){
                    var $val = $pwd.val(),
                        $reval = $repwd.val();

                    if($.trim($reval) == $.trim($val)){
                        return true;
                    }else{
                        $.toast($msg[9]);
                        return false;
                    }
                },
                //检测邀请码
                checkReferee: function(){
                    var $val = $referee.val();
                    if($.trim($val).length!=0){
                        var re = /^\d{11}$/.test($val);
                        if(!re){
                            $.toast($msg[11]);
                            return false;
                        }
                    }else{
                        $.toast($msg[10]);
                        return false;
                    }
                    return true;
                }
            }
        })();

        //初始化
        REG.initialize();
    });

    $.init();
})(Zepto);