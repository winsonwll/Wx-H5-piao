requirejs.config({
    baseUrl: '/Ticket/js/',
    paths: {
        ip: 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js',
        zepto: '//g.alicdn.com/sj/lib/zepto/zepto.min',
        sm: '//g.alicdn.com/msui/sm/0.6.2/js/sm.min',
        smextend: '//g.alicdn.com/msui/sm/0.6.2/js/sm-extend.min',
        juicer: 'juicer.min',
        picker: 'picker.min'
    },
    shim: {
        sm: {
            deps: ['zepto']
        },
        smextend: {
            deps: ['zepto', 'sm']
        }
    }
});

requirejs(['func']);