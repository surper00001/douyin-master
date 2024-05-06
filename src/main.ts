// 这段 TypeScript 代码是一个 Vue 应用程序的脚本，主要用于初始化应用程序、配置全局状态和设置事件处理器。
import { createApp } from 'vue'
import App from './App.vue'
import './assets/less/index.less'
import { startMock } from '@/mock'
import router from './router'
import mixin from './utils/mixin'
// 配置 Vue 应用程序，使用 VueLazyload 插件预加载图片，并在加载失败时显示一个占位符。
import VueLazyload from '@jambonn/vue-lazyload'
import { createPinia } from 'pinia'
// 添加一个 click 指令，使用 vClick 函数作为事件处理器
import { useClick } from '@/utils/hooks/useClick'
import bus, { EVENT_KEY } from '@/utils/bus'

window.isMoved = false
window.isMuted = true
window.showMutedNotice = true
HTMLElement.prototype.addEventListener = new Proxy(HTMLElement.prototype.addEventListener, {
  apply(target, ctx, args) {
    const eventName = args[0]
    const listener = args[1]
    if (listener instanceof Function && eventName === 'click') {
      args[1] = new Proxy(listener, {
        apply(target1, ctx1, args1) {
          // console.log('e', args1)
          // console.log('click点击', window.isMoved)
          if (window.isMoved) return
          try {
            return target1.apply(ctx1, args1)
          } catch (e) {
            console.error(`[proxyPlayerEvent][${eventName}]`, listener, e)
          }
        }
      })
    }
    return target.apply(ctx, args)
  }
})

const vClick = useClick()
const pinia = createPinia()
const app = createApp(App)
app.mixin(mixin)
const loadImage = new URL('./assets/img/icon/img-loading.png', import.meta.url).href
app.use(VueLazyload, {
  preLoad: 1.3,
  loading: loadImage,
  attempt: 1
})
app.use(pinia)
app.use(router)
app.mount('#app')
app.directive('click', vClick)

//放到最后才可以使用pinia
startMock()
// 我们使用 useClick 函数添加了一个点击事件处理逻辑。当按钮被点击时，会触发 EVENT_KEY.ButtonClicked 事件，并在事件总线中发布该事件。同时，我们监听这个事件，并在控制台输出一条消息。
setTimeout(() => {
  bus.emit(EVENT_KEY.HIDE_MUTED_NOTICE)
  window.showMutedNotice = false
}, 2000)
bus.on(EVENT_KEY.REMOVE_MUTED, () => {
  window.isMuted = false
})
