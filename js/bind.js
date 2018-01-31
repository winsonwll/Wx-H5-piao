requirejs.config({
    baseUrl: '/Ticket/js/',
    paths: {
        zepto: '//g.alicdn.com/sj/lib/zepto/zepto.min',
        weixin: 'weixin',
        sm: '//g.alicdn.com/msui/sm/0.6.2/js/sm.min',
        smextend: '//g.alicdn.com/msui/sm/0.6.2/js/sm-extend.min'
    },
    shim: {
        sm: {
            deps: ['zepto', 'weixin']
        },
        smextend: {
            deps: ['zepto', 'weixin', 'sm']
        },
        wx: {
            deps: ['zepto']
        }
    }
});

requirejs(['page-bind']);