// src/i18n/index.js
import { createI18n } from 'vue-i18n';
// 导入中文语言包
import zh from './zh';
import en from './en';
// 导入英文语言包（可选，不需要切换可删除）
// import en from './lang/en'

// 创建i18n实例
const i18n = createI18n({
    legacy: true, // 启用Vue3的组合式API（必须开启，否则组合式API中无法使用）
    locale: 'zh', // 默认语言：中文（核心配置，确保项目默认显示中文）
    fallbackLocale: 'zh', // 语言加载失败时的兜底语言：中文（防止出现英文）
    globalInjection: true, // 全局注入$t方法，所有组件可直接使用（无需手动导入）
    messages: {
        zh, // 注册中文语言包
        en, // 注册英文语言包（可选，不需要切换可删除）
    },
});

export default i18n;
