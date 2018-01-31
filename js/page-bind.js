define(['zepto', 'weixin', 'sm', 'smextend'], function () {

    weixin.getUserInfo();
    /*var userInfo = weixin.getUserInfo();
    if(!userInfo){
        return false;
    }*/

    $(function () {
        $(document).on("pageInit", "#page-bind", function (e, id, page) {
            var win = window,
                doc = document;

            var BIND = (function(){
                var $bindForm = $('#ID-form-bind'),                    //绑定表单
                    $bindBtn = $bindForm.find('button'),                //绑定按钮
                    $phone = $bindForm.find('input[name=MobilePhone]'),     //手机号
                    $referee = $bindForm.find('input[name=referee]'),  //邀请码
                    $msg = {                                         //提示信息
                        0: '请输入手机号',
                        1: '手机号格式不正确',
                        2: '请输入邀请码',
                        3: '邀请码格式不正确',
                        4: '恭喜您，绑定成功',
                        5: '登录失败'
                    };

                var $know = localStorage.getItem('know');

                return {
                    initialize: function(){
                        //检测登录
                        this.checkLogin();
                        //初始化
                        this.setting();
                        //事件
                        this.bindEvents();
                    },
                    //检测登录
                    checkLogin: function () {
                        $.ajax({
                            type: 'POST',
                            url: '/Ticket/user/isLogin.json',
                            dataType: 'json',
                            success: function (data) {
                                if(data.msg != ''){   //已登录
                                    $.router.back();
                                }
                            }
                        });
                    },
                    //初始化
                    setting: function () {
                        if(!$know){
                            $bindForm.before('<div class="bind-tip"><a href="javascript:;" id="ID-btn-know">知道了</a>为快速出票，请绑定手机号</div>')
                        }
                    },
                    //事件
                    bindEvents: function(){
                        var self = this;

                        $(doc).on('click', '#ID-btn-know', function () {
                            localStorage.setItem('know', 1);
                            $(this).parent().remove();
                        });

                        //监听是否有输入
                        var arr=[];
                        $bindForm.on('input', 'input', function(){
                            arr = $.grep ($bindForm.find('input'), function(item){
                                return $(item).val();
                            });
                            if(arr.length==2){
                                $bindBtn.addClass('button-yellow');
                            }else{
                                $bindBtn.removeClass('button-yellow');
                            }
                        });

                        //执行绑定
                        $bindBtn.on('click', function(){
                            var _this = $(this);

                            //检测手机号 邀请码
                            if(self.checkMobilePhone() && self.checkReferee()){
                                _this.hide();
                                _this.after('<button type="button" class="button button-round button-big button-yellow disabled">绑定中...</button>');

                                $.ajax({
                                    type: 'POST',
                                    url: '/Ticket/user/registerByweixin.json',
                                    data: $bindForm.serialize(),
                                    dataType: 'json',
                                    success: function (data) {
                                        if(data.success_flag == 1){
                                            $.toast($msg[4]);

                                            setTimeout(function(){
                                                win.location.href=weixin.getQueryString('return_url');
                                            },300);
                                            
                                        }else if(data.success_flag == 0 && data.msg == '' && data.error == '该微信号已绑定用户，请直接授权登录！'){
                                            win.location.href=weixin.getQueryString('return_url');
                                            
                                        } else{
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
                    //检测邀请码
                    checkReferee: function(){
                        var $val = $referee.val();
                        if($.trim($val).length!=0){
                            var re = /^[0-9a-zA-Z]{4}$/.test($val);
                            if(!re){
                                $.toast($msg[3]);
                                return false;
                            }
                        }else{
                            $.toast($msg[2]);
                            return false;
                        }
                        return true;
                    }
                }
            })();

            //初始化
            BIND.initialize();
        });
    });

    $.init();
});