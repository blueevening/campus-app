<template>
  <div class="app-root" :class="{ 'is-desktop': isDesktop, 'is-mobile': !isDesktop }">
    <!-- 网页端侧栏 -->
    <aside v-if="isDesktop && showNav" class="side-nav">
      <div class="side-brand">
        <span class="side-logo">校</span>
        <div>
          <strong>校园服务平台</strong>
          <small>{{ isAdmin ? '管理员' : '学生' }} · 2024-2025-2</small>
        </div>
      </div>
      <nav class="side-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="side-item"
          :class="{ active: isActive(item.to) }"
        >
          <van-icon :name="item.icon" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="app-shell" :class="{ 'with-side': isDesktop && showNav }">
      <div id="app" class="app-frame" :class="{ wide: isDesktop }">
        <router-view />
        <!-- 手机端底部导航 -->
        <van-tabbar v-if="!isDesktop && showNav" v-model="active" route>
          <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
          <van-tabbar-item icon="calendar-o" to="/course">课表</van-tabbar-item>
          <van-tabbar-item icon="bookmark-o" to="/score">成绩</van-tabbar-item>
          <van-tabbar-item icon="notes-o" to="/library">图书</van-tabbar-item>
          <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
        </van-tabbar>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'App',
  setup() {
    const active = ref(0)
    const route = useRoute()
    const store = useStore()
    const isDesktop = ref(window.matchMedia('(min-width: 900px)').matches)

    const menuItems = computed(() => {
      const base = [
        { to: '/', label: '首页', icon: 'home-o' },
        { to: '/course', label: '课程表', icon: 'calendar-o' },
        { to: '/score', label: '成绩查询', icon: 'chart-trending-o' },
        { to: '/library', label: '图书馆', icon: 'notes-o' },
        { to: '/news', label: '校园资讯', icon: 'newspaper-o' },
        { to: '/lost-found', label: '失物招领', icon: 'search' },
        { to: '/second-class', label: '第二课堂', icon: 'star-o' },
        { to: '/second-class/dashboard', label: '学分看板', icon: 'chart-trending-o' },
        { to: '/borrow-records', label: '借阅记录', icon: 'todo-list-o' },
        { to: '/notices', label: '消息通知', icon: 'bell' },
        { to: '/profile', label: '个人中心', icon: 'user-o' }
      ]
      if (store.getters.getRole === 2) {
        base.splice(1, 0,
          { to: '/admin/users', label: '用户管理', icon: 'friends-o' },
          { to: '/admin/scores', label: '成绩录入', icon: 'edit' },
          { to: '/admin/content', label: '内容审核', icon: 'warning-o' }
        )
      }
      return base
    })

    const showNav = computed(() => {
      const hideRoutes = ['/login', '/register']
      return !hideRoutes.includes(route.path)
    })

    const isAdmin = computed(() => store.getters.getRole === 2)

    const isActive = (to) => {
      if (to === '/') return route.path === '/'
      return route.path === to || route.path.startsWith(to + '/')
    }

    const onResize = () => {
      isDesktop.value = window.matchMedia('(min-width: 900px)').matches
    }

    onMounted(() => window.addEventListener('resize', onResize))
    onUnmounted(() => window.removeEventListener('resize', onResize))

    return {
      active,
      isDesktop,
      showNav,
      isAdmin,
      menuItems,
      isActive
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  background: #eef2f7;
  color-scheme: light;
  height: 100%;
}

.app-root {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(ellipse at top, rgba(44, 82, 130, 0.12), transparent 55%),
    linear-gradient(180deg, #e4ebf4 0%, #eef2f7 100%);
}

/* 网页端侧栏 */
.side-nav {
  width: 232px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #1a365d 0%, #12243a 100%);
  color: #fff;
  padding: 22px 14px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.side-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 6px 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,.1);
}

.side-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #d69e2e, #e0b44a);
  color: #1a202c;
  display: grid;
  place-items: center;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(214, 158, 46, 0.28);
}

.side-brand strong {
  display: block;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.side-brand small {
  opacity: 0.72;
  font-size: 11px;
}

.side-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  color: rgba(255,255,255,.78);
  font-size: 14px;
  transition: background .15s ease, color .15s ease, transform .15s ease;
}

.side-item:hover {
  background: rgba(255,255,255,.08);
  color: #fff;
  transform: translateX(2px);
}

.side-item.active {
  background: rgba(214, 158, 46, 0.22);
  color: #f6e05e;
  font-weight: 700;
  box-shadow: inset 3px 0 0 #d69e2e;
}

.app-shell {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.app-shell.with-side {
  padding: 20px 28px;
}

.app-frame {
  width: 100%;
  min-height: calc(100vh - 40px);
  background: #eef2f7;
  position: relative;
  box-shadow: 0 16px 40px rgba(20, 36, 58, 0.12);
  border-radius: 18px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1f2d3d;
  transform: translateZ(0);
  border: 1px solid rgba(255,255,255,.65);
}

/* 网页端内容区更宽，随窗口拉伸 */
.app-frame.wide {
  max-width: 1200px;
  min-height: calc(100vh - 40px);
}

/* 手机端铺满 */
.is-mobile .app-shell {
  padding: 0;
}

.is-mobile .app-frame {
  border-radius: 0;
  box-shadow: none;
  min-height: 100vh;
  border: none;
}

.with-tabbar {
  padding-bottom: 50px;
}

@media (max-width: 899px) {
  .side-nav { display: none; }
}
</style>
