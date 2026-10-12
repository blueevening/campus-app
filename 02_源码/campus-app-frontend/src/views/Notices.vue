<template>
  <div class="page">
    <van-nav-bar title="消息通知" left-arrow @click-left="goBack">
      <template #right>
        <span class="nav-link" :class="{ disabled: !unreadCount || loading }" @click="readAll">
          全部已读
        </span>
      </template>
    </van-nav-bar>
    <div class="notice-body">
      <div class="summary page-card">
        <div>
          <div class="section-title">通知中心</div>
          <p class="muted">
            共 {{ list.length }} 条
            <template v-if="unreadCount"> · <span class="unread-text">{{ unreadCount }} 条未读</span></template>
          </p>
        </div>
        <span v-if="unreadCount" class="tag tag-gold">未读</span>
        <span v-else class="tag tag-green">已全部已读</span>
      </div>

      <div v-if="loading" class="loading-box">
        <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
      </div>
      <van-empty v-else-if="!list.length" description="暂无通知" />
      <div v-else class="list">
        <div
          v-for="n in list"
          :key="n.id"
          class="item page-card"
          :class="{ unread: !n.read }"
        >
          <div class="dot" v-if="!n.read"></div>
          <div class="main">
            <div class="title-line">
              <strong>{{ n.title }}</strong>
              <span class="tag" :class="n.read ? 'tag-gray' : 'tag-blue'">
                {{ n.read ? '已读' : '未读' }}
              </span>
            </div>
            <p>{{ n.body }}</p>
            <small class="muted">{{ formatTime(n.createTime) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { noticeApi } from '../api'

export default {
  name: 'Notices',
  setup() {
    const router = useRouter()
    const list = ref([])
    const loading = ref(true)
    const readingAll = ref(false)

    const unreadCount = computed(() => list.value.filter((n) => !n.read).length)

    const load = async () => {
      loading.value = true
      try {
        const res = await noticeApi.getList()
        list.value = (res.data && (res.data.list || res.data.records)) || []
      } catch (e) {
        showToast(e.message || '加载通知失败')
      } finally {
        loading.value = false
      }
    }

    const readAll = async () => {
      if (readingAll.value) return
      if (!unreadCount.value) {
        showToast('没有未读通知')
        return
      }
      readingAll.value = true
      try {
        await noticeApi.readAll()
        await load()
        showToast('已全部标记已读')
      } catch (e) {
        showToast(e.message || '操作失败')
      } finally {
        readingAll.value = false
      }
    }

    const formatTime = (ts) => {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    onMounted(load)

    return {
      list,
      loading,
      unreadCount,
      readAll,
      formatTime,
      goBack: () => router.back()
    }
  }
}
</script>

<style scoped>
.notice-body {
  padding: var(--space-3);
  display: grid;
  gap: var(--space-3);
}

.summary {
  padding: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.unread-text {
  color: var(--accent);
  font-weight: 600;
}

.nav-link {
  font-size: var(--font-sm);
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
}

.nav-link.disabled {
  color: var(--text-muted);
  cursor: default;
}

.item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-2);
}

.item.unread {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 7px;
  flex-shrink: 0;
}

.main {
  flex: 1;
  min-width: 0;
}

.title-line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.main strong {
  font-size: var(--font-md);
  color: var(--text-primary);
}

.main p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 6px 0;
  line-height: 1.6;
}

.main small {
  font-size: var(--font-xs);
}

.loading-box {
  padding: var(--space-8);
  display: flex;
  justify-content: center;
}
</style>
