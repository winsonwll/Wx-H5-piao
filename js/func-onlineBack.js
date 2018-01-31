define(['ip',  'zepto','sm', 'smextend', 'juicer', 'picker'], function () {
    //引入接口
    var Picker = require('picker');

    var win=window,
        doc=document;

    try{
        //错误的调用
        var city = localStorage.getItem('city') ? $.trim(localStorage.getItem('city')) : remote_ip_info['city'];  //定位到的城市
    }catch(e){
        //显示异常的详细信息
        console.log("没有获取到城市");
    }

    localStorage.setItem('city', city);

    //缓存接口的url地址
    var PORT = {
        //根据城市获取演出接口
        getShowsByCity: '/Ticket/show/getShowsByCity.json',

        //获取演出信息接口
        getShow: '/Ticket/show/getShow.json',

        //获取所有挂单接口
        //getOrderS: '/Ticket/order/getOrderS.json',

        //根据场次获取所有挂单接口
        getAllOrdersByshowTimeid: '/Ticket/order/GetAllOrdersByshowTimeid.json',

        //根据票价获取所有挂单接口
        getAllOrdersByshowPriceid: '/Ticket/order/GetAllOrdersByshowPriceid.json',

        //获取挂单人的手机号接口
        getPhoneByOrderId: '/Ticket/user/getPhoneByOrderId.json',

        //获取挂单详情接口
        getOrder: '/Ticket/order/getOrder.json',

        //发布挂单接口
        saveOrders: '/Ticket/order/saveOrders.json',

        //获取热门搜索接口
        getTopShows: '/Ticket/show/getTopShows.json',

        //获取我的进行中的挂单演出接口
        getMyShows: '/Ticket/order/GetMyShows.json',

        //获取我的已下架的挂单演出接口
        getMyOffShows: '/Ticket/order/GetMyOffShows.json',

        //获取我的挂单中进行中的接口
        getMyOrdersByShowId: '/Ticket/order/GetMyOrdersByShowId.json',

        //获取我的挂单中已下架的接口
        getMyOffOrdersByShowId: '/Ticket/order/GetMyOffOrdersByShowId.json',

        //修改进行中的挂单接口
        getMyOrders: '/Ticket/order/getMyOrders.json',

        //修改已下架的挂单接口
        getMyOffOrders: '/Ticket/order/getMyOffOrders.json',

        //更新挂单接口
        updateOrders: '/Ticket/order/updateOrders.json',

        //上下架挂单接口
        updateOrderStatus: '/Ticket/order/updateOrderStatus.json',

        //提交演出信息接口
        saveShowTemp: '/Ticket/show/saveShowTemp.json',

        //意见反馈接口
        IssueOpinion: '/Ticket/user/IssueOpinion.json',

        //微信分享接口
        generateSignature: '/Ticket/wechat/generateSignature.json'
    };

    //定义立即执行函数
    var Ticket = (function(){
        return {
            init: function () {
                //执行各页面
                if(loginStatus){
                    this.Page();
                    this.wxShare();
                }
            },
            Page: function () {
                var This = this;

                //首页轮播图
                $('#ID-swiper').swiper({
                    loop: true,
                    centeredSlides: true,
                    autoplay: 3000,
                    autoplayDisableOnInteraction: false
                });

                //首页
                $(document).on("pageInit", "#page-index", function (e, id, page) {
                    var MAIN = (function(){
                        var $showList = $('#ID-show-list'),             //演出列表
                            $showListTpl = $('#Tpl-show-list'),         //演出列表模板
                            $cityPicker = $('#ID-city-picker'),         //选择城市按钮
                            $cityList = $('#ID-city-list'),             //城市列表
                            $cityCur = $('#ID-city-cur');               //当前城市

                        return {
                            initialize: function(){
                                //初始化
                                this.setting();
                                //无限滚动加载演出列表
                                this.loadShowList();
                                //事件
                                this.bindEvents();
                            },
                            //初始化
                            setting: function () {
                                if(!city){city = '全国';}
                                $cityPicker.html(city+'<i class="icon icon-down"></i>');
                                $cityCur.html(city);
                            },
                            //无限滚动加载演出列表
                            loadShowList: function(){
                                if(city == '全国'){ city=''; }

                                $showList.html('');
                                $showList.next().remove();
                                if($showList.find('li').length==0){
                                    var loading = false;    // 加载flag
                                    var itemsPerLoad = 10;  // 每次加载添加多少条目
                                    var maxItems = 200;     // 最多可加载的条目
                                    var lastIndex = 0;     // 上次加载的序号
                                    var pageIndex = 1;      // 页数

                                    function addItems(number, lastIndex) {
                                        var html='';        // 生成新条目的HTML

                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.getShowsByCity,
                                            data: {
                                                pageIndex: pageIndex,
                                                pageSize: number,
                                                searchName: '',
                                                cityName: city
                                            },
                                            dataType: 'json',
                                            success: function (data) {
                                                var result = {
                                                    len: [data.resultList.length],
                                                    list: data.resultList
                                                };

                                                var format = function (d) {
                                                    return This.formatDate(d);
                                                };
                                                juicer.register('format', format); //注册自定义函数
                                                var num = function (d) {
                                                    if(d!=null){
                                                        return '<small>¥</small>'+d+' <small>起</small>';
                                                    }else{
                                                        return '<button type="button" class="button button-fill button-danger button-round">我要卖票</button>';
                                                    }
                                                };
                                                juicer.register('num', num); //注册自定义函数

                                                var tpl = $showListTpl.html(),
                                                    html = juicer(tpl, result);

                                                if(result.len>0){
                                                    $showList.append(html);
                                                }else{
                                                    $showList.after(html);
                                                }

                                                maxItems=data.pager.totalRows;
                                                pageIndex++;
                                                if(pageIndex>data.pager.totalPages){
                                                    pageIndex=data.pager.totalPages;
                                                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                    $.detachInfiniteScroll($('.infinite-scroll'));
                                                    // 删除加载提示符
                                                    $('.infinite-scroll-preloader').remove();
                                                    return;
                                                }
                                            }
                                        });
                                    }

                                    addItems(itemsPerLoad, 0);      //预先加载10条

                                    // 注册'infinite'事件处理函数
                                    $(document).on('infinite', '.infinite-scroll-bottom',function() {
                                        if (loading) return;        // 如果正在加载，则退出
                                        loading = true;             // 设置flag

                                        $showList.next().remove();
                                        $showList.after('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');

                                        setTimeout(function () {    // 模拟1s的加载过程
                                            loading = false;        // 重置加载flag
                                            if (lastIndex >= maxItems) {
                                                // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                $.detachInfiniteScroll($('.infinite-scroll'));
                                                // 删除加载提示符
                                                $('.infinite-scroll-preloader').remove();
                                                return;
                                            }
                                            addItems(itemsPerLoad, lastIndex);               // 添加新条目
                                            lastIndex = $('.list-container li').length;  // 更新最后加载的序号
                                            $.refreshScroller();                            //容器发生改变,如果是js滚动，需要刷新滚动
                                        }, 1000);
                                    });
                                }
                            },
                            //事件
                            bindEvents: function () {
                                var self = this;

                                //我要卖票按钮
                                $showList.on('click', 'button', function () {
                                    var $showId = $(this).parents('a').attr('data-showid');
                                    $.router.load('./supply.html?sid='+$showId);
                                    //win.location.href = './supply.html?sid='+$showId;
                                    return false;
                                });

                                //选择城市
                                $cityList.on('click', '.item-content', function () {
                                    var _this = $(this);

                                    city = $.trim(_this.text());
                                    $cityCur.html(city);
                                    $cityPicker.html(city+'<i class="icon icon-down"></i>');
                                    localStorage.setItem('city', city);

                                    self.loadShowList();
                                    $.closeModal('.popup-city');
                                })
                            }
                        }
                    })();

                    //首页初始化
                    MAIN.initialize();
                });

                //详情页
                $(document).on("pageInit", "#page-show", function (e, id, page) {
                    var SHOW = (function(){
                        var $showId = '',                       //演出id
                            $sellBtn = $('#ID-sell'),           //我要卖票按钮
                            $deal = $('#ID-deal'),              //演出信息
                            $timePicker = $('#ID-showTime-picker'),   //选择演出场次按钮
                            $timeText = $('#ID-showTime-picker div'),   //选择演出场次文字
                            $pricePicker = $('#ID-showPrice-picker'), //选择演出票价按钮
                            $priceText = $('#ID-showPrice-picker div'), //选择演出票价文字
                            $timeId = 0,      //场次ID
                            $priceId = 0,     //票价ID
                            $orderList = $('#ID-order-list'),   //挂单列表
                            $popupOrder = $('#ID-popup-order'),     //挂单详情
                            $telBtn = $('#ID-tel'),              //联系按钮
                            $feedbackBar = $('#ID-feedback-bar'),              //意见反馈
                            $orderDetail = $('#ID-order-detail'),        //挂单详情
                            $showInfoTpl = $('#Tpl-show-info'),          //演出详情模板
                            $orderDetailTpl = $('#Tpl-order-detail');    //挂单详情模板

                        var $arrTime = [],
                            $arrTime2 = [],
                            $arrPrice = [],
                            $arrPrice2 = [],
                            $pickerIndex = 0;

                        return {
                            initialize: function(){
                                //检测演出id
                                this.checkShow();
                                //初始化页面
                                this.setting();
                                //事件
                                this.bindEvents();
                            },
                            //检测演出id
                            checkShow: function(){
                                $showId = This.getQueryString('sid');
                                if(!$showId){
                                    $.router.back();
                                    return;
                                }
                            },
                            //初始化页面
                            setting: function(){
                                $sellBtn.attr('href', './supply.html?sid='+$showId);

                                var self = this;
                                //获取演出详细信息
                                $.ajax({
                                    type: 'POST',
                                    url: PORT.getShow,
                                    data: {showId: $showId},
                                    dataType: 'json',
                                    success: function (data) {
                                        if(data[0]!==null){
                                            putShow(data);
                                            putShowTime(data);
                                            putShowPrice(data);

                                            $timeId = $arrTime[0].showTimeId;           //场次ID
                                            $priceId = $arrPrice[0][0].showPriceId;     //票价ID

                                            //根据showTimeid获取全部票价的挂单
                                            self.getOrdersByshowTime($timeId);

                                            self.setShowPrice($timeId);
                                        }else{
                                            $.router.back();
                                            return false;
                                        }
                                    }
                                });

                                //渲染演出信息
                                function putShow(data){
                                    var result = {
                                        list: data[0]
                                    };

                                    var format = function (d) {
                                        return This.formatDate(d);
                                    };
                                    juicer.register('format', format); //注册自定义函数

                                    var tpl = $showInfoTpl.html(),
                                        html = juicer(tpl, result);

                                    $deal.html(html);
                                    sessionStorage.setItem("desc", data[0].showName);
                                    sessionStorage.setItem("img", data[0].photo);
                                }

                                //渲染场次
                                function putShowTime(data){
                                    for(var i=0,len=data[1].length;i<len;i++){
                                        $arrTime[i]={
                                            showTimeId: data[1][i].id,
                                            showTime: This.formatDate(data[1][i].showTime, 1)
                                        };
                                        $arrTime2[i]={
                                            text: This.formatDate(data[1][i].showTime, 1),
                                            value: data[1][i].id
                                        };
                                    }
                                    $timeText.text($arrTime[0].showTime);
                                }

                                //渲染票价
                                function putShowPrice(data){
                                    for(var i=0,len=data[2].length;i<len;i++){
                                        $arrPrice[i]=[];
                                        for(var n=0,length=data[2][i].length;n<length;n++){
                                            for(var m in data[2][i][n]){
                                                $arrPrice[i][n]={
                                                    showTimeId: data[2][i][n].showTimeId,
                                                    showPriceId: data[2][i][n].id,
                                                    areaPrice: data[2][i][n].areaName
                                                };
                                            }
                                        }
                                    }
                                    $priceText.text('全部票价');
                                }
                            },
                            //事件
                            bindEvents: function(){
                                var self = this;

                                //选择场次
                                $timePicker.on('click', function(){
                                    $timePicker.addClass('cur');

                                    var $picker = new Picker({
                                        data: [$arrTime2],
                                        selectedIndex: [0],
                                        title: '选择场次'
                                    });

                                    $picker.show();
                                    $picker.on('picker.select', function (index, selectedIndex) {
                                        var selectedIndex = selectedIndex[0];

                                        $timeId = index[0];
                                        $priceId = $arrPrice[selectedIndex][0].showPriceId;     //票价ID
                                        self.setShowPrice($timeId);

                                        $timeText.text($arrTime[selectedIndex].showTime);
                                        $priceText.text('全部票价');

                                        //根据showTimeid获取选择的场次的所有挂单
                                        self.getOrdersByshowTime($timeId);

                                        $pricePicker.removeClass('cur');
                                    });

                                    $picker.on('picker.cancel', function () {
                                        $timePicker.removeClass('cur');
                                    });
                                });

                                //选择票价
                                $pricePicker.on('click', function(){
                                    $pricePicker.addClass('cur');

                                    var $picker = new Picker({
                                        data: [$arrPrice2],
                                        selectedIndex: [$pickerIndex],
                                        title: '选择票价'
                                    });

                                    $picker.show();

                                    $picker.on('picker.select', function (index, selectedIndex) {
                                        var selectedIndex = selectedIndex[0];
                                        $pickerIndex = selectedIndex;

                                        $priceId = index[0];
                                        $priceText.text($arrPrice2[selectedIndex].text);

                                        if(selectedIndex>0){
                                            //根据showPriceid获取指定票价的挂单
                                            self.getOrdersByshowPrice($priceId);
                                        }else{
                                            $timeId = index[0];
                                            //根据showTimeid获取选择的场次的所有挂单
                                            self.getOrdersByshowTime($timeId);
                                        }

                                        $timePicker.removeClass('cur');
                                    });

                                    $picker.on('picker.cancel', function () {
                                        $pricePicker.removeClass('cur');
                                    });
                                });

                                //查看挂单详情
                                $(doc).on('click','.view-order', function () {
                                    var $oid = $(this).attr('data-oid');          //获取挂单id

                                    if($oid){
                                        //获取手机号码
                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.getPhoneByOrderId,
                                            data: {orderId: $oid},
                                            dataType: 'json',
                                            success: function (data) {
                                                if(data.success_flag == 1){
                                                    var $phone=data.msg;
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: PORT.getOrder,
                                                        data: {orderId: $oid},
                                                        dataType: 'json',
                                                        //async: false,
                                                        success: function (data) {
                                                            if(data){
                                                                var result = {
                                                                    list: data,
                                                                    leave: [data.sellNum-data.soldNum]
                                                                };

                                                                var format = function (d) {
                                                                    return This.formatDate(d,1);
                                                                };
                                                                juicer.register('format', format); //注册自定义函数

                                                                var tpl = $orderDetailTpl.html(),
                                                                    html = juicer(tpl, result);

                                                                $orderDetail.html(html);
                                                                $telBtn.attr('href', 'tel:'+$phone);

                                                                $.popup($popupOrder);

                                                                $telBtn.on('click', function () {
                                                                    setTimeout(function () {
                                                                        $feedbackBar.show();
                                                                    },1000)
                                                                })
                                                            }else{
                                                                $.toast('挂单信息不存在');
                                                            }
                                                        }
                                                    });
                                                }else{
                                                    $.toast("亲，这是您自己的挂单哦~");
                                                }
                                            }
                                        });
                                    }else{
                                        $.toast('挂单信息不存在');
                                    }
                                });
                            },
                            //根据showTimeid获取所有的挂单
                            getOrdersByshowTime: function (showTimeId) {
                                var self = this;
                                self.orderTpl(PORT.getAllOrdersByshowTimeid, 'showTime', showTimeId);
                            },
                            //根据showPriceid获取所有的挂单
                            getOrdersByshowPrice: function (showPriceId) {
                                var self = this;
                                self.orderTpl(PORT.getAllOrdersByshowPriceid, 'showPrice', showPriceId);
                            },
                            //设置票价
                            setShowPrice: function(timeId){
                                $arrPrice2=[];
                                for(var i=0,len=$arrPrice.length;i<len;i++){
                                    for(var j=0,length=$arrPrice[i].length;j<length;j++){
                                        if($arrPrice[i][j].showTimeId == timeId){
                                            //$arrPrice2[j]='票价：'+$arrPrice[i][j].areaPrice;
                                            $arrPrice2[j]={
                                                text: '票价：'+$arrPrice[i][j].areaPrice,
                                                value: $arrPrice[i][j].showPriceId
                                            };
                                        }

                                    }
                                }
                                $arrPrice2.unshift({
                                    text: '全部票价',
                                    value: $timeId
                                });
                                return $arrPrice2;
                            },
                            //挂单列表模板
                            orderTpl: function (url, key, id) {
                                $orderList.html('');
                                $orderList.next().remove();

                                if($orderList.find('li').length==0){
                                    var loading = false;    // 加载flag
                                    var itemsPerLoad = 10;  // 每次加载添加多少条目
                                    var maxItems = 100;     // 最多可加载的条目
                                    var lastIndex = 0;     // 上次加载的序号
                                    var pageIndex = 1;      // 页数

                                    function addItems(number, lastIndex) {
                                        var html='';        // 生成新条目的HTML
                                        var data = {};

                                        if(key == 'showTime'){
                                            data = {
                                                pageIndex: pageIndex,
                                                pageSize: number,
                                                showTimeid: id
                                            }
                                        }else{
                                            data = {
                                                pageIndex: pageIndex,
                                                pageSize: number,
                                                showPriceid: id
                                            }
                                        }

                                        $.ajax({
                                            type: 'POST',
                                            url: url,
                                            data: data,
                                            dataType: 'json',
                                            //async: false,
                                            success: function (data) {
                                                maxItems=data.pager.totalRows;
                                                if(data.resultList.length>0){
                                                    $sellBtn.parent().show();
                                                    $('.bar-footer~.content').css('bottom','2.2rem');

                                                    for (var i = 0, len = data.resultList.length; i < len; i++) {
                                                        html += '<li>' +
                                                            '<a class="view-order" data-oid="'+data.resultList[i][0]+'">' +
                                                            '<div class="item-content">' +
                                                            '<div class="item-media">' +
                                                            '<img src="'+data.resultList[i][14]+'">' +
                                                            '</div>' +
                                                            '<div class="item-inner">' +
                                                            '<div class="item-title-row">' +
                                                            '<div class="item-title">'+data.resultList[i][2]+'</div>' +
                                                            '</div>' +
                                                            '<div class="item-subtitle">剩余张数：'+(data.resultList[i][10]-data.resultList[i][11])+'</div>' +
                                                            '</div>' +
                                                            '</div>' +
                                                            '<div class="item-price">' +
                                                            '<del>¥'+data.resultList[i][7]+'</del>'+
                                                            '<small>¥</small>'+data.resultList[i][9]+
                                                            '</div>' +
                                                            '</a>' +
                                                            '</li>';
                                                    }
                                                    // 添加新条目
                                                    $orderList.append(html);
                                                }else{
                                                    $sellBtn.parent().hide();
                                                    $('.bar-footer~.content').css('bottom',0);

                                                    html += '<div class="search-error">' +
                                                        '<dl>' +
                                                        '<dt><img src="images/i-search-error.png" style="width: 4rem"></dt>' +
                                                        '<dd>暂无挂单</dd>' +
                                                        '<dd><a class="button button-big button-round button-yellow" href="supply.html?sid='+$showId+'">我有票</a></dd>' +
                                                        '</dl>' +
                                                        '</div>';
                                                    $orderList.after(html);
                                                }

                                                pageIndex++;
                                                if(pageIndex>data.pager.totalPages){
                                                    pageIndex=data.pager.totalPages;
                                                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                    $.detachInfiniteScroll($('.infinite-scroll'));
                                                    // 删除加载提示符
                                                    $('.infinite-scroll-preloader').remove();
                                                    return;
                                                }
                                            }
                                        });
                                    }

                                    addItems(itemsPerLoad, 0);      //预先加载10条

                                    // 注册'infinite'事件处理函数
                                    $(document).on('infinite', '.infinite-scroll-bottom',function() {
                                        if (loading) return;        // 如果正在加载，则退出
                                        loading = true;             // 设置flag

                                        $orderList.next().remove();
                                        $orderList.after('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');

                                        setTimeout(function () {    // 模拟1s的加载过程
                                            loading = false;        // 重置加载flag
                                            if (lastIndex >= maxItems) {
                                                // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                $.detachInfiniteScroll($('.infinite-scroll'));
                                                // 删除加载提示符
                                                $('.infinite-scroll-preloader').remove();
                                                return;
                                            }
                                            addItems(itemsPerLoad, lastIndex);               // 添加新条目
                                            lastIndex = $('.list-container li').length;  // 更新最后加载的序号
                                            $.refreshScroller();                            //容器发生改变,如果是js滚动，需要刷新滚动
                                        }, 1000);
                                    });
                                }
                            }
                        }
                    })();

                    //初始化
                    SHOW.initialize();
                });

                //发布挂单
                $(document).on("pageInit", "#page-supply", function (e, id, page) {
                    var SUPPLY = (function(){
                        var $showId = '',                           //演出id
                            $backBtn = $('#ID-back'),              //返回按钮
                            $supplyBtnBar = $('#ID-bar-btn-supply'),      //提交挂单按钮区

                            $showInfo = $('#ID-showInfo'),                //演出信息
                            $showInfoTpl = $('#Tpl-show-info'),  //演出信息模板
                            $showTime = $('#ID-showTime'),       //场次
                            $showTimeTpl = $('#Tpl-show-time'),  //场次模板

                            $showForm = $('#ID-form-supply'),   //挂单表单
                            $arr = [],
                            $num=0,
                            $date=0,
                            $pFlag=false,
                            $active = null,
                            $index = 0;

                        var $arrTime = [],      //场次
                            $arrPrice = [],    //票价
                            $arrParPrice = [];

                        return {
                            initialize: function(){
                                //检测演出id
                                this.checkShow();
                                //初始化页面
                                this.setting();
                                //事件
                                this.bindEvents();
                                //执行提交
                                this.doSupply();
                            },
                            //检测演出id
                            checkShow: function(){
                                $showId = This.getQueryString('sid');
                                if(!$showId){
                                    $.router.back();
                                    return;
                                }
                            },
                            //初始化页面
                            setting: function(){
                                var self = this;
                                //获取演出详细信息
                                $.ajax({
                                    type: 'POST',
                                    url: PORT.getShow,
                                    data: {showId: $showId},
                                    dataType: 'json',
                                    success: function (data) {
                                        if(data[0]!==null){
                                            putShow(data);
                                            putShowTime(data);
                                            putShowPrice(data);
                                        }else{
                                            $.router.back();
                                            return false;
                                        }
                                    }
                                });

                                //渲染演出信息
                                function putShow(data){
                                    var result = {
                                        list: data[0]
                                    };

                                    var tpl = $showInfoTpl.html(),
                                        html = juicer(tpl, result);
                                    $showInfo.html(html);
                                }

                                //渲染场次
                                function putShowTime(data){
                                    var html_supplyBtn = '';

                                    for(var i=0,len=data[1].length;i<len;i++){
                                        $arrTime[i]={
                                            showTimeId: data[1][i].id,
                                            showTime: This.formatDate(data[1][i].showTime, 1)
                                        };

                                        if(i==0){
                                            html_supplyBtn +='<a href="javascript:;" class="show">立即提交</a>';
                                        }else{
                                            html_supplyBtn +='<a href="javascript:;">立即提交</a>';
                                        }
                                    }

                                    $supplyBtnBar.html(html_supplyBtn);

                                    var result = {
                                        list: $arrTime
                                    };
                                    var sum = function (d) {
                                        return parseInt(d)+1;
                                    };
                                    juicer.register('sum', sum); //注册自定义函数

                                    var tpl = $showTimeTpl.html(),
                                        html = juicer(tpl, result);
                                    $showTime.html(html);
                                }

                                //渲染票价
                                function putShowPrice(data){
                                    var html='',
                                        $perPrice = '',
                                        $sellNum = 1,
                                        $restDay = 5;

                                    for(var i=0,len=data[2].length;i<len;i++){
                                        $arrPrice[i]=[];
                                        for(var j=0,length=data[2][i].length;j<length;j++){
                                            for(var key in data[2][i][j]){
                                                $arrPrice[i][j]={
                                                    showTimeId: data[2][i][j].showTimeId,
                                                    showPriceId: data[2][i][j].id,
                                                    areaPrice: data[2][i][j].areaName
                                                };
                                            }
                                        }

                                        /*$.ajax({
                                            type: 'POST',
                                            url: PORT.getMyOrders,
                                            data: { showTimeId: $arrTime[i].showTimeId},
                                            dataType: 'json',
                                            async: false,
                                            success: function (data) {
                                                $arrParPrice[i]=[];
                                                if(data.length>0){
                                                    for(var k=0,len=data.length;k<len;k++){
                                                        $arrParPrice[i][k] = {
                                                            showPriceId: data[k].showPriceId,
                                                            perPrice: data[k].perPrice,
                                                            sellNum: data[k].sellNum,
                                                            restDay: data[k].restDay
                                                        }
                                                    }
                                                }
                                            }
                                        });*/
                                    }

                                    for(var m=0,len=$arrTime.length;m<len;m++){
                                        if(m == 0){
                                            html += '<div id="tab1" class="tab active">';
                                        }else{
                                            html += '<div id="tab'+(m+1)+'" class="tab">';
                                        }

                                        html += '<div class="row">' +
                                            '<div class="col-15">票价</div>' +
                                            '<div class="col-30">同行价</div>' +
                                            '<div class="col-33">数 量</div>' +
                                            '<div class="col-20">有效期</div>' +
                                            '</div>';

                                        for(var n=0,length=$arrPrice[m].length;n<length;n++){
                                            /*if($arrParPrice[m].length>0){
                                                if($arrPrice[m][n].showPriceId == $arrParPrice[m][0].showPriceId){
                                                    $perPrice = $arrParPrice[m][0].perPrice;
                                                    $sellNum = $arrParPrice[m][0].sellNum;
                                                    $restDay = $arrParPrice[m][0].restDay;
                                                }else{
                                                    $perPrice = '';
                                                    $sellNum = 1;
                                                    $restDay = 5;
                                                }
                                            }else{
                                                $perPrice = '';
                                                $sellNum = 1;
                                                $restDay = 5;
                                            }*/

                                            html += '<div class="row" data-showPriceId="'+$arrPrice[m][n].showPriceId+'">' +
                                                '<div class="col-15" data-parValueId="'+$arrPrice[m][n].showPriceId+'">'+$arrPrice[m][n].areaPrice+'</div>' +
                                                '<div class="col-30 selling-price"><input type="number" min="0" value="'+$perPrice+'"></div>' +
                                                '<div class="col-33">' +
                                                '<div class="num-picker">' +
                                                '<div class="minus"></div><input type="number" class="input" value="'+$sellNum+'"><div class="plus"></div>' +
                                                '</div>' +
                                                '</div>' +
                                                '<div class="col-20">' +
                                                '<div class="expiry-date">' +
                                                '<input type="number" class="pickerDate" value="'+$restDay+'" readonly>' +
                                                '</div>' +
                                                '</div>' +
                                                '</div>';
                                        }

                                        //html += '<div class="bar bar-footer"><button type="submit" class="btn-supply button-gray">提 交</button></div>' +
                                        html += '</div>';
                                    }
                                    $showForm.html(html);
                                }
                            },
                            //事件
                            bindEvents: function(){
                                //返回确认
                                $backBtn.on('click', function(){
                                    if($arr.length>0){
                                        $.confirm('退出后该挂单将丢失哦~', function () {
                                            $.router.back();
                                        });
                                    }else{
                                        $.router.back();
                                    }
                                });

                                //选择场次
                                $(".lst").swiper({
                                    observer:true,
                                    freeMode: true,
                                    slidesPerView: 'auto'
                                });

                                $showTime.on('touchstart', 'a', function () {
                                    $active = $showForm.find('.active');
                                    $index = $(this).attr('data-index');
                                    $supplyBtnBar.find('a').removeClass('show cur');
                                    $supplyBtnBar.find('a').eq($index).addClass('show');
                                });

                                //监听是否有输入
                                $showForm.on('input', '.active .selling-price input', function(){
                                    $arr = $.grep ($showForm.find('.active .selling-price input'), function(item){
                                        return $(item).val();
                                    });
                                    if($arr.length>0){
                                        $supplyBtnBar.find('a').removeClass('show');
                                        $supplyBtnBar.find('a').eq($index).addClass('cur');
                                        //$showForm.find('.active button').addClass('button-yellow');
                                    }else{
                                        $supplyBtnBar.find('a').removeClass('cur');
                                        $supplyBtnBar.find('a').eq($index).addClass('show');
                                        //$showForm.find('.active button').removeClass('button-yellow');
                                    }
                                    if($(this).val().length>0 && $(this).val()<=1){
                                        $(this).val('1');
                                    }
                                });

                                //同行价
                                /*$showForm.on('blur', '.active .selling-price input', function () {
                                    var $priceVal = $.trim($(this).val());
                                    var re = /^\+?[1-9][0-9]*$/.test($priceVal);
                                    if(!re){
                                        $.toast('请输入正确的挂单价');
                                        return;
                                    }else {
                                        $pFlag=true;
                                    }
                                });*/

                                //表单操作
                                //数量加
                                $showForm.on('click', '.active .plus', function () {
                                    var iNum=$(this).prev().val();
                                    $(this).prev().val(++iNum);
                                    $num++;

                                    $supplyBtnBar.find('a').removeClass('show');
                                    $supplyBtnBar.find('a').eq($index).addClass('cur');
                                    //$showForm.find('.active button').addClass('button-yellow');
                                });
                                //数量减
                                $showForm.on('click', '.active .minus', function () {
                                    var iNum=$(this).next().val();
                                    iNum--;
                                    if(iNum<=1){
                                        iNum=1;
                                    }
                                    $(this).next().val(iNum);
                                    $num++;

                                    $supplyBtnBar.find('a').removeClass('show');
                                    $supplyBtnBar.find('a').eq($index).addClass('cur');

                                    //$showForm.find('.active button').addClass('button-yellow');
                                    if(iNum == 1){
                                        $num = 0;

                                        $supplyBtnBar.find('a').removeClass('cur');
                                        $supplyBtnBar.find('a').eq($index).addClass('show');
                                        //$showForm.find('.active button').removeClass('button-yellow');
                                    }
                                });

                                //选择有效期
                                $showForm.on('click', '.active .pickerDate', function () {
                                    var _this = $(this);
                                    $date = _this.val();

                                    var data = [
                                        {
                                            text: '5',
                                            value: 5
                                        }, {
                                            text: '4',
                                            value: 4
                                        },
                                        {
                                            text: '3',
                                            value: 3
                                        }, {
                                            text: '2',
                                            value: 2
                                        },
                                        {
                                            text: '1',
                                            value: 1
                                        }
                                    ];

                                    var $picker = new Picker({
                                        data: [data],
                                        selectedIndex: [5-$date],
                                        title: '选择有效期(天)'
                                    });

                                    $picker.show();
                                    $picker.on('picker.select', function (index, selectedIndex) {
                                        var index = index[0];
                                        _this.val(index);
                                    });

                                    $picker.on('picker.select', function (index, selectedIndex) {
                                        var index = index[0];
                                        _this.val(index);

                                        if(index != $date){
                                            $date=1;

                                            $supplyBtnBar.find('a').removeClass('show');
                                            $supplyBtnBar.find('a').eq($index).addClass('cur');
                                            //$showForm.find('.active button').addClass('button-yellow');
                                        }
                                    });
                                });

                                $(doc).on('click', '.close-popup', function () {
                                    win.location.reload();
                                })

                                $supplyBtnBar.on('click', '.show', function () {
                                    $.toast("请输入正确的挂单信息");
                                });
                            },
                            //执行提交
                            doSupply: function () {
                                //$showForm
                                $supplyBtnBar.on('click', '.cur', function () {
                                    var _this = $(this);
                                    var $input = $showForm.find('.active .selling-price input');

                                    for(var i=0,len=$input.length;i<len;i++){
                                        if($($input[i]).val()!=''){
                                            $pFlag = true;
                                            break;
                                        }
                                    }

                                    if(!$pFlag){
                                        $.toast('请输入正确的挂单价');
                                        return false;
                                    }

                                    if($arr.length>0 || $num>0 || $date==1){
                                        var requesParam = "ShowId="+$showId+"&ShowTimeId="+$('#ID-showTime .active').attr('data-showtimeid')+"&";
                                        var ShowPriceId = [];
                                        var PerPrice = [];
                                        var SellNum = [];
                                        var restDay = [];

                                        //获取所有填写票面价
                                        $.each($showForm.find('.active .selling-price input'), function(index, item){
                                            var $val = $.trim($(item).val());
                                            if($val){
                                                ShowPriceId.push($(item).parent().prev().attr('data-parvalueid'));
                                                PerPrice.push($val);
                                                SellNum.push($(item).parent().next().find('input').val());
                                                restDay.push($(item).parent().next().next().find('input').val());
                                            }
                                        });

                                        for ( var i = 0; i < ShowPriceId.length; i++) {
                                            if (i > 0) {
                                                requesParam += "&";
                                            }
                                            requesParam += "order[" + i + "].ShowPriceId=" + ShowPriceId[i];//设置票面价Id
                                            requesParam += "&order[" + i + "].PerPrice=" + PerPrice[i];//出售同行价
                                            requesParam += "&order[" + i + "].SellNum=" + SellNum[i];//出售数量
                                            requesParam += "&order[" + i + "].restDay=" + restDay[i];//有效时间
                                        }

                                        _this.hide();
                                        _this.after('<a href="javascript:;" class="show">发布中...</a>');

                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.saveOrders,
                                            data: requesParam,
                                            dataType: 'json',
                                            success: function (data) {
                                                if(data.success_flag){
                                                    var popupHTML = '<div class="popup">' +
                                                        '<header class="bar bar-nav">' +
                                                        '<a class="icon icon-left pull-left close-popup"></a>' +
                                                        '<h1 class="title">挂单提醒</h1>' +
                                                        '</header>' +

                                                        '<div class="content">' +
                                                        '<div class="supply-tips">' +
                                                        '<dl>' +
                                                        '<dt><span class="icon icon-check"></span> 恭喜您</dt>' +
                                                        '<dd>挂单成功</dd>' +
                                                        '</dl>' +
                                                        '<ul>' +
                                                        '<li>' +
                                                        '<a href="./index.html" class="button button-round button-big button-yellow" external>继续挂单</a>' +
                                                        '</li>' +
                                                        '<li>' +
                                                        '<a href="./myshow.html" class="button button-light button-big button-round" external>查看我的挂单</a>' +
                                                        '</li>' +
                                                        '<li>' +
                                                        '<a href="./feedback.html" class="button button-light button-big button-round" external>意见反馈</a>' +
                                                        '</li>' +
                                                        '</ul>' +
                                                        '</div>' +
                                                        '</div>' +
                                                        '</div>';

                                                    $.popup(popupHTML);

                                                    _this.show();
                                                    _this.next().remove();
                                                }else{
                                                    $.toast(data.error);
                                                }
                                            }
                                        });
                                    }else{
                                        $.toast("请输入正确的挂单信息");
                                    }
                                    return false;
                                });
                            }
                        }
                    })();

                    //初始化
                    SUPPLY.initialize();
                });

                /*搜索页*/
                $(document).on("pageInit", "#page-search", function (e, id, page) {
                    var SEARCH = (function(){
                        var $searchForm = $('#ID-search-form'),      //搜索表单
                            $search = $('#search'),                   //搜索框
                            $clearKeywordBtn = $('.btn-clear-keyword'),  //清空搜索框按钮

                            $cityPicker = $('#ID-city-picker'),         //选择城市按钮
                            $cityList = $('#ID-city-list'),             //城市列表
                            $cityCur = $('#ID-city-cur'),               //当前城市

                            $searchHot = $('#ID-hot-search'),      //热门搜索
                            $searchHotTpl = $('#Tpl-search-hot'),     //热门搜索模板
                            $recordList = $('#ID-record-list'),         //搜索记录
                            $recordListTpl = $('#Tpl-record-list');     //搜索记录模板

                        return {
                            initialize: function(){
                                //初始化
                                this.setting();
                                //热门搜索
                                this.hot();
                                //搜索记录
                                this.record();
                                //事件
                                this.bindEvents();
                            },
                            //初始化
                            setting: function () {
                                if(!city){city = '全国';}
                                $cityPicker.html('<i class="icon-address"></i> '+city);
                                $cityCur.html(city);
                            },
                            //热门搜索
                            hot: function () {
                                $.ajax({
                                    type: 'POST',
                                    url: PORT.getTopShows,
                                    dataType: 'json',
                                    success: function (data) {
                                        var result = {
                                            list: data
                                        };

                                        var tpl = $searchHotTpl.html(),
                                            html = juicer(tpl, result);

                                        $searchHot.html(html);
                                    }
                                });
                            },
                            //搜索记录
                            record: function(){
                                //本地存储的搜索记录
                                var recordList = localStorage.getItem('record');
                                if(recordList){
                                    var aRecord=recordList.split('%$$%');
                                    if(aRecord){
                                        var result = {
                                            list: aRecord
                                        };

                                        var tpl = $recordListTpl.html(),
                                            html = juicer(tpl, result);

                                        $recordList.html(html);
                                    }
                                }
                            },
                            //事件
                            bindEvents: function(){
                                var self = this;

                                //选择城市
                                $cityList.on('click', '.item-content', function () {
                                    var _this = $(this);

                                    city = $.trim(_this.text());
                                    $cityCur.html(city);
                                    $cityPicker.html('<i class="icon-address"></i> '+city);
                                    localStorage.setItem('city', city);
                                    $.closeModal('.popup-city');
                                });

                                //监听搜索
                                $search.on({
                                    input: function(){
                                        var _this = $(this);
                                        if($.trim(_this.val())){
                                            _this.next('span').show();
                                        }else{
                                            _this.next('span').hide();
                                        }
                                    },
                                    focus: function () {
                                        var _this = $(this);
                                        _this.css('textAlign', 'left');
                                        _this.prev('label').css('left', '0.3rem');
                                    },
                                    blur: function() {
                                        var _this = $(this);
                                        _this.css('textAlign', 'center');
                                        _this.prev('label').css('left', '22%');
                                    }
                                });

                                //清空搜索框
                                $clearKeywordBtn.on('click', function(){
                                    $(this).prev('input').val('');
                                    $(this).hide();
                                });

                                //删除单个搜索记录
                                $recordList.on('click', 'span', function(){
                                    var sRecord=localStorage.getItem('record');
                                    var aRecord=sRecord.split('%$$%');
                                    if(aRecord.length>1){
                                        var index=$.inArray($(this).parents('li').attr('data-record'), aRecord);
                                        aRecord.splice(index,1);
                                        localStorage.setItem("record", aRecord.join('%$$%'));
                                        $(this).parents('li').remove();
                                    }else{
                                        localStorage.removeItem('record');
                                        $recordList.remove();
                                    }
                                });

                                //清空全部搜索历史
                                $recordList.on('click', '.clear-all', function(){
                                    localStorage.removeItem('record');
                                    $recordList.remove();
                                });

                                //提交搜索
                                $searchForm.on('submit', function(){
                                    var $val = $.trim($search.val());

                                    if($val == ''){
                                        $.toast("搜索内容不能为空");
                                        return false;
                                    }

                                    var sRecord=localStorage.getItem('record');
                                    if(sRecord){
                                        var aRecord=sRecord.split('%$$%');
                                        if($.inArray($val, aRecord)==-1){
                                            aRecord.push($val);
                                            localStorage.setItem("record", aRecord.join('%$$%'));
                                        }
                                    }else{
                                        localStorage.setItem("record", $val);
                                    }
                                    self.record();

                                    $.router.load("./search-result.html?k="+encodeURI($val));
                                    return false;
                                });

                                $searchHot.on('click', 'a', function () {
                                    $search.val($(this).text());
                                    $searchForm.trigger('submit');
                                });

                                $recordList.on('click', '.item-title', function () {
                                    $search.val($(this).text());
                                    $searchForm.trigger('submit');
                                });
                            }
                        }
                    })();

                    //初始化
                    SEARCH.initialize();
                });

                /*搜索结果页*/
                $(document).on("pageInit", "#page-search-result", function (e, id, page) {
                    var RESSEARCH = (function(){
                        var $keyword = '',                           //搜索关键词
                            $searchForm = $('#ID-search-form'),      //搜索表单
                            $search = $('#search'),                  //搜索框
                            $clearKeywordBtn = $('.btn-clear-keyword'),  //清空搜索框按钮

                            $showList = $('#ID-show-list'),                  //搜索结果列表
                            $showListTpl = $('#Tpl-show-list');              //搜索结果列表模板

                        return {
                            initialize: function(){
                                //检测搜索词
                                this.checkKeyword();
                                //初始化页面
                                this.setting();
                                //事件
                                this.bindEvents();
                            },
                            //检测搜索词
                            checkKeyword: function () {
                                $keyword = This.getQueryString('k');
                                if(!$keyword){
                                    $.router.back();
                                    return;
                                }
                            },
                            //初始化页面
                            setting: function () {
                                //搜索记录
                                var sRecord=localStorage.getItem('record');

                                if(sRecord){
                                    var aRecord=sRecord.split('%$$%');
                                    if($.inArray($keyword, aRecord)==-1){
                                        aRecord.push($keyword);
                                        localStorage.setItem("record", aRecord.join('%$$%'));
                                    }
                                }else{
                                    localStorage.setItem("record", $keyword);
                                }

                                //展示搜索结果
                                $search.val($keyword);
                                $clearKeywordBtn.show();

                                if(city == '全国'){ city=''; }

                                $showList.html('');
                                $showList.next().remove();
                                //无限滚动加载演出列表
                                if($showList.find('li').length==0){
                                    var loading = false;    // 加载flag
                                    var itemsPerLoad = 10;  // 每次加载添加多少条目
                                    var maxItems = 200;     // 最多可加载的条目
                                    var lastIndex = 0;     // 上次加载的序号
                                    var pageIndex = 1;      // 页数

                                    function addItems(number, lastIndex) {
                                        var html='';        // 生成新条目的HTML

                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.getShowsByCity,
                                            data: {
                                                pageIndex: pageIndex,
                                                pageSize: number,
                                                searchName: $keyword,
                                                cityName: city
                                            },
                                            dataType: 'json',
                                            success: function (data) {
                                                var result = {
                                                    len: [data.resultList.length],
                                                    list: data.resultList
                                                };

                                                var format = function (d) {
                                                    return This.formatDate(d);
                                                };
                                                juicer.register('format', format); //注册自定义函数

                                                var num = function (d) {
                                                    if(d!=null){
                                                        return '<small>¥</small>'+d+' <small>起</small>';
                                                    }else{
                                                        return '<button type="button" class="button button-fill button-danger button-round">我要卖票</button>';
                                                    }
                                                };
                                                juicer.register('num', num); //注册自定义函数

                                                var tpl = $showListTpl.html(),
                                                    html = juicer(tpl, result);

                                                if(result.len>0){
                                                    $showList.append(html);
                                                }else{
                                                    $showList.after(html);
                                                }

                                                maxItems=data.pager.totalRows;
                                                pageIndex++;
                                                if(pageIndex>data.pager.totalPages){
                                                    pageIndex=data.pager.totalPages;
                                                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                    $.detachInfiniteScroll($('.infinite-scroll'));
                                                    // 删除加载提示符
                                                    $('.infinite-scroll-preloader').remove();
                                                    return;
                                                }
                                            }
                                        });
                                    }

                                    addItems(itemsPerLoad, 0);      //预先加载10条

                                    // 注册'infinite'事件处理函数
                                    $(document).on('infinite', '.infinite-scroll-bottom',function() {
                                        if (loading) return;        // 如果正在加载，则退出
                                        loading = true;             // 设置flag

                                        $showList.next().remove();
                                        $showList.after('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');

                                        setTimeout(function () {    // 模拟1s的加载过程
                                            loading = false;        // 重置加载flag
                                            if (lastIndex >= maxItems) {
                                                // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                $.detachInfiniteScroll($('.infinite-scroll'));
                                                // 删除加载提示符
                                                $('.infinite-scroll-preloader').remove();
                                                return;
                                            }
                                            addItems(itemsPerLoad, lastIndex);               // 添加新条目
                                            lastIndex = $('.list-container li').length;  // 更新最后加载的序号
                                            $.refreshScroller();                            //容器发生改变,如果是js滚动，需要刷新滚动
                                        }, 1000);
                                    });
                                }
                            },
                            //事件
                            bindEvents: function(){
                                var self = this;

                                //我要卖票按钮
                                $showList.on('click', 'button', function () {
                                    var $showId = $(this).parents('a').attr('data-showid');
                                    //win.location.href = './supply.html?sid='+$showId;
                                    $.router.load('./supply.html?sid='+$showId);
                                    return false;
                                });

                                //监听搜索
                                $search.on('input', function(){
                                    var _this = $(this);
                                    if($.trim(_this.val())){
                                        _this.next('span').show();
                                    }else{
                                        _this.next('span').hide();
                                    }
                                });

                                //清空搜索框
                                $clearKeywordBtn.on('click', function(){
                                    $(this).prev('input').val('');
                                    $(this).hide();
                                });

                                //搜索
                                $searchForm.on('submit', function(){
                                    $keyword = $.trim($search.val());

                                    if($keyword != ''){
                                        self.setting();
                                    }else{
                                        $.toast("搜索内容不能为空");
                                        return false;
                                    }
                                });
                            }
                        }
                    })();

                    //初始化
                    RESSEARCH.initialize();
                });

                //我的
                $(document).on("pageInit", "#page-my", function (e, id, page) {
                    var MY = (function(){
                        var $myInfo = $('#ID-myInfo'),
                            $phone = $('#ID-phone'),                    //手机号
                            $inviteCode = $('#ID-inviteCode');          //邀请码

                        return {
                            initialize: function(){
                                //初始化
                                this.setting();
                            },
                            //初始化
                            setting: function () {
                                var html = '<dt><img src="'+userInfo.photo+'"> <i></i></dt>' +
                                    '<dd>'+userInfo.realname+'</dd>';
                                $myInfo.html(html);
                                $phone.html(userInfo.mobilePhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));
                                $inviteCode.html(userInfo.code);
                            }
                        }
                    })();

                    //初始化
                    MY.initialize();
                });

                //我的挂单
                $(document).on("pageInit", "#page-myshow", function (e, id, page) {
                    var MYSHOW = (function(){
                        var $showListOn = $('#ID-show-list-on'),        //进行中的挂单演出
                            $showListTplOn = $('#Tpl-show-list-on'),    //进行中的挂单演出列表模板
                            $showListOff = $('#ID-show-list-off'),      //已下架的挂单演出
                            $showListTplOff = $('#Tpl-show-list-off'); //已下架的挂单演出列表模板

                        return {
                            initialize: function(){
                                //无限滚动加载演出列表
                                this.loadShowList($showListOn, PORT.getMyShows, $showListTplOn);
                                this.loadShowList($showListOff, PORT.getMyOffShows, $showListTplOff);
                            },
                            //无限滚动加载演出列表
                            loadShowList: function(obj, url, template){
                                obj.html('');
                                obj.next().remove();

                                if(obj.find('li').length==0){
                                    var loading = false;    // 加载flag
                                    var itemsPerLoad = 10;  // 每次加载添加多少条目
                                    var maxItems = 200;     // 最多可加载的条目
                                    var lastIndex = 0;     // 上次加载的序号
                                    var pageIndex = 1;      // 页数

                                    function addItems(number, lastIndex) {
                                        var html='';        // 生成新条目的HTML

                                        $.ajax({
                                            type: 'POST',
                                            url: url,
                                            dataType: 'json',
                                            success: function (data) {
                                                var result = {
                                                    len: [data.length],
                                                    list: data
                                                };

                                                var format = function (d) {
                                                    return This.formatDate(d);
                                                };
                                                juicer.register('format', format); //注册自定义函数

                                                var tpl = template.html(),
                                                    html = juicer(tpl, result);

                                                if(result.len>0){
                                                    obj.append(html);
                                                }else{
                                                    obj.after(html);
                                                }

                                                /*maxItems=data.pager.totalRows;
                                                 pageIndex++;
                                                 if(pageIndex>data.pager.totalPages){
                                                 pageIndex=data.pager.totalPages;
                                                 // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                 $.detachInfiniteScroll($('.infinite-scroll'));
                                                 // 删除加载提示符
                                                 $('.infinite-scroll-preloader').remove();
                                                 return;
                                                 }*/
                                            }
                                        });
                                    }

                                    addItems(itemsPerLoad, 0);      //预先加载10条

                                    // 注册'infinite'事件处理函数
                                    $(document).on('infinite', '.infinite-scroll-bottom',function() {
                                        if (loading) return;        // 如果正在加载，则退出
                                        loading = true;             // 设置flag

                                        obj.next().remove();
                                        obj.after('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');

                                        setTimeout(function () {    // 模拟1s的加载过程
                                            loading = false;        // 重置加载flag
                                            if (lastIndex >= maxItems) {
                                                // 加载完毕，则注销无限加载事件，以防不必要的加载
                                                $.detachInfiniteScroll($('.infinite-scroll'));
                                                // 删除加载提示符
                                                $('.infinite-scroll-preloader').remove();
                                                return;
                                            }
                                            addItems(itemsPerLoad, lastIndex);               // 添加新条目
                                            lastIndex = $('.list-container li').length;  // 更新最后加载的序号
                                            $.refreshScroller();                            //容器发生改变,如果是js滚动，需要刷新滚动
                                        }, 1000);
                                    });
                                }
                            }
                        }
                    })();

                    //初始化
                    MYSHOW.initialize();
                });

                //挂单明细
                $(document).on("pageInit", "#page-myorder", function (e, id, page) {
                    var MYORDER = (function(){
                        var $showId = '',               //演出id
                            $type = '',                  //挂单类型
                            $show = $('#ID-show'),      //演出信息
                            $myorder = $('#ID-myorder'),    //我的挂单列表
                            $sellBtn = $('#ID-sell'),           //我要卖票按钮

                            $editForm = null,
                            $arr = [],
                            $num=0,
                            $date=0;

                        return {
                            initialize: function(){
                                //检测演出id和挂单类型
                                this.checkShow();

                                if($type == 1){
                                    //进行中的挂单
                                    this.ordering();
                                }else if($type == 2){
                                    //已下架的挂单
                                    this.ordered();
                                }

                                //事件
                                this.bindEvents();
                            },
                            //检测演出id
                            checkShow: function(){
                                $showId = This.getQueryString('sid');
                                $type = This.getQueryString('type');

                                if(!$showId || !$type){
                                    $.router.back();
                                    return;
                                }

                                $sellBtn.attr('href', './supply.html?sid='+$showId);
                            },
                            //渲染进行中的挂单
                            ordering: function(){
                                var self = this;
                                self.orderTpl(PORT.getMyOrdersByShowId, 1, $myorder);
                            },
                            //渲染已下架的挂单
                            ordered: function(){
                                var self = this;
                                self.orderTpl(PORT.getMyOffOrdersByShowId, 2, $myorder);
                            },
                            //事件
                            bindEvents: function(){
                                var self = this;

                                //管理挂单
                                $myorder.on('click','.btn-handle', function () {
                                    var _this = $(this),
                                        $showTimeId = _this.attr('data-showtimeid');

                                    var url = '',
                                        btn = '';

                                    if($type == 1){
                                        //进行中的挂单
                                        url = PORT.getMyOrders;
                                        btn = '下 架'
                                    }else if($type == 2){
                                        //已下架的挂单
                                        url = PORT.getMyOffOrders;
                                        btn = '上 架'
                                    }

                                    var buttons1 = [
                                        {
                                            text: '请选择操作',
                                            label: true
                                        },
                                        {
                                            text: '修 改',
                                            onClick: function() {
                                                self.editOrderTpl(url, $showTimeId);
                                            }
                                        },
                                        {
                                            text: btn,
                                            onClick: function() {
                                                if($type == 1){
                                                    //下架
                                                    _this.parents('.card').find('.btn-off').show().addClass('translateX');
                                                }else if($type == 2){
                                                    //上架
                                                    _this.parents('.card').find('.btn-on').show().addClass('translateX');
                                                }

                                                _this.after('<a href="javascript:;" class="btn-cancel">完 成</a>');
                                                _this.hide();
                                            }
                                        }
                                    ];
                                    var buttons2 = [
                                        {
                                            text: '取 消'
                                        }
                                    ];
                                    var groups = [buttons1, buttons2];
                                    $.actions(groups);
                                });

                                //下架
                                $myorder.on('click','.btn-off', function () {
                                    var _this = $(this),
                                        $orderId = _this.attr('data-orderid');

                                    $.confirm('确定要下架该挂单吗?', function () {
                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.updateOrderStatus,
                                            data: {
                                                orderId: $orderId,
                                                status: 0
                                            },      //传1就是上架，其他如0就是下架
                                            dataType: 'json',
                                            success: function (data) {
                                                if(data.success_flag == 1){
                                                    $.toast("该挂单下架成功");

                                                    var len = _this.parents('.card-content').find('.row').length-1;
                                                    if(len==1){
                                                        _this.parents('.card-content').next().hide();
                                                        _this.parents('.card-content').html('<div class="row">该场次挂单已全部下架</div>');
                                                    }else{
                                                        _this.parents('.row').remove();
                                                    }
                                                }else{
                                                    $.toast(data.error);
                                                }
                                            }
                                        });
                                    });
                                });

                                //上架
                                $myorder.on('click','.btn-on', function () {
                                    var _this = $(this),
                                        $orderId = _this.attr('data-orderid');

                                    $.confirm('确定要上架该挂单吗?', function () {
                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.updateOrderStatus,
                                            data: {
                                                orderId: $orderId,
                                                status: 1
                                            },      //传1就是上架，其他如0就是下架
                                            dataType: 'json',
                                            success: function (data) {
                                                if(data.success_flag == 1){
                                                    $.toast("该挂单上架成功");

                                                    var len = _this.parents('.card-content').find('.row').length-1;
                                                    if(len==1){
                                                        _this.parents('.card-content').next().hide();
                                                        _this.parents('.card-content').html('<div class="row">该场次挂单已全部上架</div>');
                                                    }else{
                                                        _this.parents('.row').remove();
                                                    }
                                                }else{
                                                    $.toast(data.error);
                                                }
                                            }
                                        });
                                    });
                                });

                                //点击完成 取消上下架
                                $myorder.on('click','.btn-cancel', function () {
                                    var _this = $(this);
                                    _this.prev().show();
                                    _this.hide();

                                    if($type == 1){     //取消下架
                                        _this.parents('.card').find('.btn-off').hide().removeClass('translateX');
                                    }else if($type == 2){   //取消上架
                                        _this.parents('.card').find('.btn-on').hide().removeClass('translateX');
                                    }
                                });

                                //返回确认
                                $(doc).on('click', '#ID-back', function(){
                                    $.confirm('退出后您填写的信息将丢失哦~', function () {
                                        $.closeModal('.popup-edit');
                                    });
                                });

                                //监听是否有输入
                                $(doc).on('input', 'input', function(){
                                    $arr = $.grep($editForm.find('input'), function(item){
                                        return $(item).val();
                                    });
                                    if($arr.length>0){
                                        $editForm.find('button').addClass('button-yellow');
                                    }else{
                                        $editForm.find('button').removeClass('button-yellow');
                                    }
                                    if($(this).val().length>0 && $(this).val()<=1){
                                        $(this).val('1');
                                    }
                                });

                                //数量加
                                $(doc).on('click', '.plus', function(){
                                    var iNum=$(this).prev().val();
                                    $(this).prev().val(++iNum);
                                    $num++;
                                    $editForm.find('button').addClass('button-yellow');
                                });
                                //数量减
                                $(doc).on('click', '.minus', function(){
                                    var iNum=$(this).next().val();
                                    iNum--;
                                    if(iNum<=0){
                                        iNum=0;
                                    }
                                    $(this).next().val(iNum);
                                    $num++;
                                    $editForm.find('button').addClass('button-yellow');
                                });

                                //选择有效期
                                $(doc).on('click', '.pickerDate', function () {
                                    var _this = $(this);
                                    $date = _this.val();

                                    var data = [
                                        {
                                            text: '5',
                                            value: 5
                                        }, {
                                            text: '4',
                                            value: 4
                                        },
                                        {
                                            text: '3',
                                            value: 3
                                        }, {
                                            text: '2',
                                            value: 2
                                        },
                                        {
                                            text: '1',
                                            value: 1
                                        }
                                    ];

                                    var $picker = new Picker({
                                        data: [data],
                                        selectedIndex: [5-$date],
                                        title: '选择有效期(天)'
                                    });

                                    $picker.show();
                                    $picker.on('picker.select', function (index, selectedIndex) {
                                        var index = index[0];
                                        _this.val(index);

                                        if(index != $date){
                                            $date=1;
                                            $editForm.find('button').addClass('button-yellow');
                                        }
                                    });
                                });

                                self.doEdit();
                            },
                            //执行修改
                            doEdit: function () {
                                $(doc).on('click', 'button[type=submit]', function(){
                                    if($arr.length>0 || $num>0 || $date==1){
                                        var requesParam = "";
                                        var ShowPriceId = [];
                                        var PerPrice = [];
                                        var SellNum = [];
                                        var restDay = [];

                                        //获取所有填写票面价
                                        $.each($editForm.find('.selling-price input'), function(index, item){
                                            var $val = $.trim($(item).val());
                                            if($val){
                                                ShowPriceId.push($(item).parent().prev().attr('data-id'));
                                                PerPrice.push($val);
                                                SellNum.push($(item).parent().next().find('input').val());
                                                restDay.push($(item).parent().next().next().find('input').val());
                                            }
                                        });

                                        for ( var i = 0; i < ShowPriceId.length; i++) {
                                            if (i > 0) {
                                                requesParam += "&";
                                            }
                                            requesParam += "order[" + i + "].id=" + ShowPriceId[i];//设置票面价Id
                                            requesParam += "&order[" + i + "].PerPrice=" + PerPrice[i];//出售同行价
                                            requesParam += "&order[" + i + "].SellNum=" + SellNum[i];//出售数量
                                            requesParam += "&order[" + i + "].restDay=" + restDay[i];//有效时间
                                        }

                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.updateOrders,
                                            data: requesParam,
                                            dataType: 'json',
                                            success: function (data) {
                                                if(data.success_flag){
                                                    $.toast("修改挂单成功");
                                                    setTimeout(function () {
                                                        win.location.reload();
                                                    },300);
                                                }else{
                                                    $.toast(data.error);
                                                }
                                            }
                                        });
                                    }else{
                                        $.toast("您还没有修改相关信息哦~");
                                    }
                                    return false;
                                });
                            },
                            //挂单明细模板
                            orderTpl: function (url, otype, obj) {
                                var html='';
                                $.ajax({
                                    type: 'POST',
                                    url: url,
                                    data: { showId: $showId},
                                    dataType: 'json',
                                    success: function (data) {
                                        if(data.length>0){
                                            var tpl = '<div class="item-title-row">' +
                                                '<div class="item-title">'+data[0].showName+'</div>' +
                                                '</div>' +
                                                '<div class="item-text">'+data[0].venueName+'</div>';
                                            $show.html(tpl);

                                            for(var i=0,len=data.length;i<len;i++){
                                                html += '<div class="card">' +
                                                    '<div class="card-header">场次：'+This.formatDate(data[i].showTime, 1)+'</div>' +
                                                    '<div class="card-content form-supply">' +
                                                    '<div class="row">' +
                                                    '<div class="col-20">票价</div>' +
                                                    '<div class="col-20">同行价</div>' +
                                                    '<div class="col-15">数量</div>' +
                                                    '<div class="col-30">有效期至</div>' +
                                                    '<div class="col-15">浏览</div>' +
                                                    '</div>';

                                                for(var j in data[i].myOders){
                                                    html += '<div class="row">' +
                                                        '<div class="col-20">'+data[i].myOders[j].areaName+'</div>' +
                                                        '<div class="col-20">'+data[i].myOders[j].perPrice+'</div>' +
                                                        '<div class="col-15">'+data[i].myOders[j].sellNum+'</div>' +
                                                        '<div class="col-30">'+This.formatDate(data[i].myOders[j].deadline)+'</div>' +
                                                        '<div class="col-15">'+data[i].myOders[j].views+'</div>';
                                                    if(otype == 1){
                                                        html += '<a href="javascript:;" class="btn-off" data-orderid="'+data[i].myOders[j].id+'">下架</a>';
                                                    }else{
                                                        html += '<a href="javascript:;" class="btn-on" data-orderid="'+data[i].myOders[j].id+'">上架</a>';
                                                    }

                                                    html += '</div>';
                                                }
                                                html += '</div>' +
                                                    '<div class="card-footer">' +
                                                    '<a href="javascript:;" class="btn-handle" data-showtimeid="'+data[i].showTimeId+'">管 理</a>';

                                                html += '</div>' +
                                                    '</div>';
                                            }
                                        }else{
                                            html += '<div class="search-error">' +
                                                '<dl>' +
                                                '<dt><img src="images/i-search-error.png" style="width: 4rem"></dt>' +
                                                '<dd>暂无挂单</dd>' +
                                                '</dl>' +
                                                '</div>';
                                        }
                                        obj.html(html);
                                    }
                                });
                            },
                            //修改挂单模板
                            editOrderTpl: function (url, showTimeId) {
                                $.ajax({
                                    type: 'POST',
                                    url: url,
                                    data: { showTimeId: showTimeId},
                                    dataType: 'json',
                                    success: function (data) {
                                        if(data.length>0){
                                            var popupHTML = '<div class="popup popup-edit">' +
                                                '<header class="bar bar-nav">' +
                                                '<a class="icon icon-left pull-left" id="ID-back"></a>' +
                                                '<h1 class="title">修改挂单</h1>' +
                                                '</header>' +

                                                '<div class="content">' +
                                                '<form method="post" id="ID-editForm">' +
                                                '<div class="content-block-title">场次：'+This.formatDate(data[0].showTime, 1)+'</div>' +
                                                '<div class="form-supply">' +
                                                '<div class="row" style="background-color: #FBFBFB; font-size: 0.7rem; padding: 0.2rem 0;">' +
                                                '<div class="col-15">票价</div>' +
                                                '<div class="col-30">同行价</div>' +
                                                '<div class="col-33">数 量</div>' +
                                                '<div class="col-20">有效期</div>' +
                                                '</div>' +
                                                '<div class="tab">';

                                            for(var i=0,len=data.length;i<len;i++){
                                                popupHTML += '<div class="row">' +
                                                    '<div class="col-15" data-id="'+data[i].id+'">'+data[i].areaName+'</div>' +
                                                    '<div class="col-30 selling-price">' +
                                                    '<input type="number" value="'+data[i].perPrice+'">' +
                                                    '</div>' +
                                                    '<div class="col-33">' +
                                                    '<div class="num-picker">' +
                                                    '<div class="minus"></div>' +
                                                    '<input type="number" class="input" value="'+data[i].sellNum+'">' +
                                                    '<div class="plus"></div>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '<div class="col-20">' +
                                                    '<div class="expiry-date">' +
                                                    '<input type="number" class="pickerDate" value="'+data[i].restDay+'" readonly>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '</div>';
                                            }
                                            popupHTML += '<div class="content-block">' +
                                                '<button type="submit" class="button button-round button-big button-gray">提交修改</button>' +
                                                '</div>' +
                                                '</div>' +
                                                '</div>' +
                                                '</form>' +
                                                '</div>' +
                                                '</div>';

                                            $.popup(popupHTML);

                                            $editForm = $(doc).find('#ID-editForm');
                                        }else{
                                            $.toast("挂单不存在");
                                        }
                                    }
                                });
                            }
                        }
                    })();

                    //初始化
                    MYORDER.initialize();
                });

                //提交演出信息
                $(document).on("pageInit", "#page-addshow", function (e, id, page) {
                    var ADDSHOW = (function(){
                        var $addshowForm = $('#ID-form-addshow'),                          //提交演出信息表单
                            $submitBtn = $addshowForm.find('button'),                       //提交按钮
                            $showName = $addshowForm.find('input[name=ShowName]'),         //演出名
                            $cityName = $addshowForm.find('input[name=CityName]'),         //城市
                            $venueName = $addshowForm.find('input[name=VenueName]'),       //场馆

                            $msg = {                                                //提示信息
                                0: '演出名称不能为空',
                                1: '演出城市不能为空',
                                2: '演出场馆不能为空',
                                3: '提交成功，我们会尽快完善您提交的信息',
                                4: '提交失败，您可以重新填写再提交'
                            };

                        var $arr=[];

                        return {
                            initialize: function(){
                                //事件
                                this.bindEvents();
                            },
                            //事件
                            bindEvents: function(){
                                var self = this;

                                //监听是否有输入
                                $addshowForm.on('input', 'input', function(){
                                    $arr = $.grep ($addshowForm.find('input'), function(item){
                                        return $(item).val();
                                    });
                                    if($arr.length == 3){
                                        $submitBtn.addClass('button-yellow');
                                    }else{
                                        $submitBtn.removeClass('button-yellow');
                                    }
                                });

                                //执行登录
                                $submitBtn.on('click', function(){
                                    var _this = $(this);

                                    //检测演出名称  演出城市  演出场馆
                                    if(self.checkShowName() && self.checkCityName() && self.checkVenueName()){
                                        _this.hide();
                                        _this.after('<button type="button" class="button button-round button-big button-yellow disabled">提交中...</button>');

                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.saveShowTemp,
                                            data: $addshowForm.serialize(),
                                            dataType: 'json',
                                            success: function (data) {
                                                if(data.success_flag == 1){
                                                    var popupHTML = '<div class="popup">' +
                                                        '<header class="bar bar-nav">' +
                                                        '<a class="icon icon-left pull-left close-popup"></a>' +
                                                        '<h1 class="title">提交演出信息</h1>' +
                                                        '</header>' +

                                                        '<div class="content">' +
                                                        '<div class="supply-tips">' +
                                                        '<dl>' +
                                                        '<dt><span class="icon icon-check"></span> 提交成功</dt>' +
                                                        '<dd>感谢您的反馈，我们会第一时间处理</dd>' +
                                                        '</dl>' +
                                                        '<ul>' +
                                                        '<li>' +
                                                        '<a href="./index.html" class="button button-round button-big button-yellow" external>返回首页</a>' +
                                                        '</li>' +
                                                        '<li>' +
                                                        '<a href="feedback.html" class="button button-light button-big button-round" external>意见反馈</a>' +
                                                        '</li>' +
                                                        '</ul>' +
                                                        '</div>' +
                                                        '</div>' +
                                                        '</div>';

                                                    $.popup(popupHTML);

                                                    _this.show();
                                                    _this.next().remove();
                                                }else{
                                                    $.toast($msg[4]);
                                                    _this.show();
                                                    _this.next().remove();
                                                }
                                            }
                                        });
                                    }
                                    return false;
                                });
                            },
                            //检测演出名称
                            checkShowName: function(){
                                var $val = $showName.val();
                                if($.trim($val).length==0){
                                    $.toast($msg[0]);
                                    return false;
                                }
                                return true;
                            },
                            //检测演出城市
                            checkCityName: function(){
                                var $val = $cityName.val();
                                if($.trim($val).length==0){
                                    $.toast($msg[1]);
                                    return false;
                                }
                                return true;
                            },
                            //检测演出场馆
                            checkVenueName: function(){
                                var $val = $venueName.val();
                                if($.trim($val).length==0){
                                    $.toast($msg[2]);
                                    return false;
                                }
                                return true;
                            }
                        }
                    })();

                    //初始化
                    ADDSHOW.initialize();
                });

                //意见反馈
                $(document).on("pageInit", "#page-feedback", function (e, id, page) {
                    var FEEDBACK = (function(){
                        var $feedbackForm = $('#ID-form-feedback'),                          //意见反馈表单
                            $submitBtn = $feedbackForm.find('button'),                       //提交按钮
                            $textarea = $feedbackForm.find('textarea'),                     //意见表单

                            $msg = {                                                //提示信息
                                0: '请填写您的宝贵意见和建议',
                                2: '提交成功，我们会尽快完善您提交的信息',
                                3: '提交失败，您可以重新填写再提交'
                            };

                        var $arr=[];

                        return {
                            initialize: function(){
                                //事件
                                this.bindEvents();
                            },
                            //事件
                            bindEvents: function(){
                                var self = this;

                                //监听是否有输入
                                $feedbackForm.on('input', 'textarea', function(){
                                    $arr = $.grep ($feedbackForm.find('textarea'), function(item){
                                        return $(item).val();
                                    });
                                    if($arr.length>0){
                                        $submitBtn.addClass('button-yellow');
                                    }else{
                                        $submitBtn.removeClass('button-yellow');
                                    }
                                });

                                //执行登录
                                $submitBtn.on('click', function(){
                                    var _this = $(this);

                                    //检测意见表单
                                    if(self.checkFeedback()){
                                        _this.hide();
                                        _this.after('<button type="button" class="button button-round button-big button-yellow disabled">提交中...</button>');

                                        $.ajax({
                                            type: 'POST',
                                            url: PORT.IssueOpinion,
                                            data: $feedbackForm.serialize(),
                                            dataType: 'json',
                                            success: function (data) {
                                                if(data.success_flag == 1){
                                                    var popupHTML = '<div class="popup">' +
                                                        '<header class="bar bar-nav">' +
                                                        '<a class="icon icon-left pull-left close-popup"></a>' +
                                                        '<h1 class="title">意见反馈</h1>' +
                                                        '</header>' +

                                                        '<div class="content">' +
                                                        '<div class="supply-tips">' +
                                                        '<dl>' +
                                                        '<dt><span class="icon icon-check"></span> 提交成功</dt>' +
                                                        '<dd>我们会尽快完善相关功能</dd>' +
                                                        '</dl>' +
                                                        '<ul>' +
                                                        '<li>' +
                                                        '<a href="./index.html" class="button button-round button-big button-yellow" external>返回首页</a>' +
                                                        '</li>' +
                                                        '</ul>' +
                                                        '</div>' +
                                                        '</div>' +
                                                        '</div>';

                                                    $.popup(popupHTML);

                                                    _this.show();
                                                    _this.next().remove();
                                                }else{
                                                    $.toast($msg[3]);
                                                    _this.show();
                                                    _this.next().remove();
                                                }
                                            }
                                        });
                                    }
                                    return false;
                                });
                            },
                            //检测意见表单
                            checkFeedback: function(){
                                var $val = $textarea.val();
                                if($.trim($val).length==0){
                                    $.toast($msg[0]);
                                    return false;
                                }
                                return true;
                            }
                        }
                    })();

                    //初始化
                    FEEDBACK.initialize();
                });
            },
            //格式化时间戳
            formatDate: function(now){
                var now = new Date(now);
                var year=now.getFullYear();
                var month=(now.getMonth()+1) < 10 ? '0'+(now.getMonth()+1) : now.getMonth()+1;
                var date=now.getDate() < 10 ? '0'+now.getDate() : now.getDate();
                var hour=now.getHours() < 10 ? '0'+now.getHours() : now.getHours();
                var minute=now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes();

                if(arguments[1]==1){
                    return year+"-"+month+"-"+date+" "+hour+":"+minute;
                }else{
                    return year+"-"+month+"-"+date;
                }
            },
            //获取地址栏url中的指定参数
            getQueryString: function(key){
                var reg = new RegExp("(^|&)"+key+"=([^&]*)(&|$)");  //构造一个含有目标参数的正则表达式对象
                var result = window.location.search.substr(1).match(reg);   //匹配目标参数
                return result?decodeURIComponent(result[2]):null;   //返回参数值
            },
            //微信分享
            wxShare: function () {
                $.ajax({
                    type: 'GET',
                    url: PORT.generateSignature,
                    data: {
                        url: win.location.href
                    },
                    dataType: 'json',
                    success: function (data) {
                        if(data){
                            var $desc = sessionStorage.getItem("desc") ? sessionStorage.getItem("desc")+'的全部挂单' : '卖票邦—帮卖票，专注服务演出票务同行的平台';
                            var $img = sessionStorage.getItem("img") ? sessionStorage.getItem("img") : 'http://www.piaobuyer.com/Ticket/images/logo.jpg';

                            wx.config({
                                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                                appId: data.appId, // 必填，公众号的唯一标识
                                timestamp: data.timestamp, // 必填，生成签名的时间戳
                                nonceStr: data.noncestr, // 必填，生成签名的随机串
                                signature: data.singature,// 必填，签名
                                jsApiList: ['onMenuShareAppMessage', 'onMenuShareQQ', 'hideMenuItems']
                            });

                            wx.ready(function () {
                                //分享到朋友
                                wx.onMenuShareAppMessage({
                                    title: '卖票邦—帮卖票，专注服务演出票务同行的平台', // 分享标题
                                    desc: $desc,  // 分享描述
                                    link: win.location.href, // 分享链接
                                    imgUrl: $img,// 分享图标
                                    success: function(){
                                        //用户确认分享后执行的回调函数
                                        console.log('分享成功');
                                        //shareSuccess.apply(null, arguments);
                                    },
                                    cancel: function(){
                                        console.log('分享失败');
                                        // 用户取消分享后执行的回调函数
                                    }
                                });

                                //分享到qq
                                wx.onMenuShareQQ({
                                    title: '卖票邦—帮卖票，专注服务演出票务同行的平台', // 分享标题
                                    desc: $desc,  // 分享描述
                                    link: win.location.href, // 分享链接
                                    imgUrl: $img,// 分享图标
                                    success: function(){
                                        //用户确认分享后执行的回调函数
                                        console.log('分享成功');
                                        //shareSuccess.apply(null, arguments);
                                    },
                                    cancel: function(){
                                        console.log('分享失败');
                                        // 用户取消分享后执行的回调函数
                                    }
                                });

                                //批量隐藏菜单项
                                wx.hideMenuItems({
                                    menuList: [
                                        'menuItem:share:timeline', // 分享到朋友圈
                                        'menuItem:share:weiboApp', // 分享到微博
                                        'menuItem:share:QZone', // 分享到qq空间
                                        'menuItem:copyUrl' // 复制链接
                                    ],
                                    success: function (res) {
                                        console.log('已隐藏“分享到朋友圈”，“分享到微博”，“分享到qq空间”，“复制链接”等按钮');
                                    },
                                    fail: function (res) {
                                        console.log(JSON.stringify(res));
                                    }
                                });
                            });

                            wx.error(function (res) {
                                alert(res.errMsg);
                            });
                        }else{
                            console.log('获取分享接口失败')
                        }
                    }
                });
            }
        }
    })();

    //调用立即执行函数
    $(function(){
        Ticket.init();
        $.init();
    });
});