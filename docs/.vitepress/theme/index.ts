import DefaultTheme from 'vitepress/theme'
// import MyLayout from './MyLayout.vue';
import './styles/vars.css';
import './styles/custom.css';
import './styles/components/vp-doc.css'
import axios from 'axios';
import api from './api/index';
import mediumZoom from 'medium-zoom'
import {useRoute} from 'vitepress'
import {nextTick, onMounted, watch} from 'vue'

export default {
    ...DefaultTheme,
    // Layout: MyLayout,
    enhanceApp(ctx) {
        // extend default theme custom behaviour.
        DefaultTheme.enhanceApp(ctx);

        // 全局挂载 API 接口
        ctx.app.config.globalProperties.$http = axios
        if (typeof window !== 'undefined') {
            // @ts-ignore
            window.$api = api;
        }

        // register your custom global components
        // ctx.app.component('MyGlobalComponent' /* ... */)
    },
    setup() {
        const route = useRoute()
        const initZoom = () => {
            mediumZoom('.main img', {background: 'var(--vp-c-bg)'}) // Should there be a new?
        }
        onMounted(() => {
            initZoom()
        })
        watch(
            () => route.path,
            () => nextTick(() => initZoom()),
        )
    },
}
