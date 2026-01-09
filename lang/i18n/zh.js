// src/i18n/lang/zh.js
// 中文语言包（全项目所有自定义文本都在此配置）
export default {
    // 1. 公共通用模块（全项目复用的文本，优先级最高）
    common: {
        // 基础按钮
        submit: '提交',
        reset: '重置',
        confirm: '确认',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        add: '新增',
        query: '查询',
        refresh: '刷新',
        back: '返回',
        detail: '详情',
        export: '导出',
        import: '导入',
        // 提示信息（成功/失败/警告/提示）
        successTip: '操作成功！',
        failTip: '操作失败，请稍后重试！',
        warningTip: '请注意，该操作不可撤销！',
        infoTip: '请完善必填信息后提交！',
        emptyTip: '暂无数据',
        loadingTip: '加载中...',
        // 分页相关
        pagination: {
            total: '共 {total} 条数据',
            perPage: '每页 {size} 条',
            prev: '上一页',
            next: '下一页',
            jump: '跳转至',
            page: '页',
        },
        // 表单相关
        form: {
            required: '此项为必填项',
            inputError: '输入格式错误',
            lengthError: '输入长度不符合要求',
            phoneError: '请输入正确的手机号码',
            emailError: '请输入正确的邮箱地址',
        },
        // 权限/登录相关通用
        auth: {
            loginExpire: '登录已过期，请重新登录',
            noPermission: '暂无权限访问该页面',
            tokenError: '身份验证失败',
        },
    },

    // 2. 业务模块：登录模块（按页面/功能拆分，对应login页面）
    login: {
        title: '系统登录',
        username: '用户名',
        password: '密码',
        verifyCode: '验证码',
        rememberPwd: '记住密码',
        forgetPwd: '忘记密码？',
        register: '立即注册',
        loginBtn: '登录',
        otherLogin: '其他登录方式',
        wechatLogin: '微信登录',
        phoneLogin: '手机登录',
        usernamePlaceholder: '请输入用户名/手机号/邮箱',
        passwordPlaceholder: '请输入6-16位密码',
        verifyCodePlaceholder: '请输入4位验证码',
    },

    // 3. 业务模块：首页模块（对应home页面）
    home: {
        dashboard: '数据仪表盘',
        welcome: '欢迎回来，{name}',
        todayVisit: '今日访问量',
        totalUser: '总用户数',
        orderCount: '今日订单数',
        salesAmount: '今日销售额',
        quickMenu: '快捷菜单',
        notice: '系统通知',
        recentTask: '最近任务',
    },

    // 4. 业务模块：用户管理模块（对应user页面）
    user: {
        title: '用户管理',
        addUser: '新增用户',
        editUser: '编辑用户',
        deleteUser: '删除用户',
        batchDelete: '批量删除',
        userList: '用户列表',
        userDetail: '用户详情',
        // 表单字段
        realName: '真实姓名',
        phone: '手机号码',
        email: '邮箱地址',
        gender: '性别',
        male: '男',
        female: '女',
        status: '状态',
        enable: '启用',
        disable: '禁用',
        createTime: '创建时间',
        updateTime: '更新时间',
        remark: '备注信息',
    },

    // 5. 其他业务模块：可根据你的项目自行添加（如订单、商品、角色等）
    // order: { ... },
    // goods: { ... },
    // role: { ... }
};
