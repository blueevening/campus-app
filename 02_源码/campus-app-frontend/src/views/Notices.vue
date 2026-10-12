<template>
  <div class="page">
    <van-nav-bar title="消息通知" left-arrow @click-left="goBack">
      <template #right>
        <span class="nav-link" @click="readAll">全部已读</span>
      </template>
    </van-nav-bar>
    <div class="body">
      <van-empty v-if="!list.length" description="暂无通知" />
      <div v-else class="list">
        <div v-for="n in list" :key="n.id" class="item" :class="{ unread: !n.read }">
          <div class="dot" v-if="!n.read"></div>
          <div class="main">
            <strong>{{ n.title }}</strong>
            <p>{{ n.body }}</p>
            <small>{{ formatTime(n.createTime) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { noticeApi } from '../api'

export default {
  name: 'Notices',
  setup() {
    const router = useRouter()
    const list = ref([])
    const load = async () => {
      try {
        const res = await noticeApi.getList()
        list.value = (res.data && (res.data.list || res.data.records)) || []
      } catch (e) {
        showToast('加载失败')
      }
    }
    const readAll = async () => {
      try {
        await noticeApi.readAll()
        await load()
        showToast('已全部已读')
      } catch (e) {
        showToast('操作失败')
      }
    }
    const formatTime = (ts) => {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    onMounted(load)
    return { list, readAll, formatTime, goBack: () => router.back() }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.nav-link { font-size: 12px; color: #2c5282; }
.body { padding: 12px; }
.item {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  border: 1px solid #e8eef5;
}
.item.unread { border-color: #2c5282; }
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #d69e2e; margin-top: 6px; flex-shrink: 0;
}
.main strong { font-size: 14px; }
.main p { font-size: 12px; color: #718096; margin: 4px 0; }
.main small { font-size: 11px; color: #a0aec0; }
</style>
