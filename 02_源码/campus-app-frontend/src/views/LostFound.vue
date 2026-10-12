<template>
  <div class="page lost-found-page">
    <van-nav-bar title="失物招领" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="edit" size="20" @click="goToPublish" />
      </template>
    </van-nav-bar>

    <div class="filter-section">
      <div class="filter-tabs">
        <div
          v-for="tab in typeTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeType === tab.value }"
          @click="switchType(tab.value)"
        >
          {{ tab.label }}
          <span v-if="tab.value === 'LOST'" class="tab-dot lost"></span>
          <span v-else-if="tab.value === 'FOUND'" class="tab-dot found"></span>
        </div>
      </div>
    </div>

    <div class="list-content">
      <div
        class="lost-found-item"
        v-for="item in list"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <div class="item-header">
          <span class="tag" :class="item.type === 'LOST' ? 'tag-red' : 'tag-green'">
            {{ item.type === 'LOST' ? '寻物' : '招领' }}
          </span>
          <span class="item-time">{{ formatDate(item.createTime) }}</span>
        </div>
        <h4 class="item-title">{{ item.title }}</h4>
        <p class="item-desc">{{ item.description }}</p>
        <div class="item-footer">
          <span class="item-location">
            <van-icon name="location-o" /> {{ item.location || '未知地点' }}
          </span>
          <span class="item-contact">联系人：{{ item.contactName || item.contact || '—' }}</span>
        </div>
      </div>

      <van-empty v-if="list.length === 0 && !loading" :description="emptyText" />

      <div v-if="loading" class="loading-wrap">
        <van-loading type="spinner" color="var(--primary)">加载中...</van-loading>
      </div>
      <div v-if="finished && list.length > 0" class="finished-text">没有更多了</div>
    </div>

    <div class="fab" @click="goToPublish">
      <van-icon name="plus" size="24" color="#fff" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { lostFoundApi } from '../api'

export default {
  name: 'LostFound',
  setup() {
    const router = useRouter()
    const list = ref([])
    const activeType = ref('')
    const loading = ref(false)
    const finished = ref(false)
    const pageNum = ref(1)
    const pageSize = 10

    const typeTabs = [
      { value: '', label: '全部' },
      { value: 'LOST', label: '寻物启事' },
      { value: 'FOUND', label: '招领启事' }
    ]

    const emptyText = computed(() => {
      if (activeType.value === 'LOST') return '暂无寻物启事'
      if (activeType.value === 'FOUND') return '暂无招领启事'
      return '暂无失物招领信息'
    })

    const loadList = async (reset = false) => {
      if (reset) {
        pageNum.value = 1
        list.value = []
        finished.value = false
      }
      if (loading.value) return
      loading.value = true
      try {
        const res = await lostFoundApi.getList({
          pageNum: pageNum.value,
          pageSize,
          type: activeType.value || undefined
        })
        const newList = res.data?.records || []
        if (reset) {
          list.value = newList
        } else {
          list.value = [...list.value, ...newList]
        }
        if (newList.length < pageSize) {
          finished.value = true
        } else {
          pageNum.value++
        }
      } catch (error) {
        showToast(error?.message || '获取列表失败')
      } finally {
        loading.value = false
      }
    }

    const switchType = (type) => {
      if (activeType.value === type) return
      activeType.value = type
      loadList(true)
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    }

    const goToDetail = (id) => {
      router.push(`/lost-found/${id}`)
    }

    const goToPublish = () => {
      router.push('/lost-found/publish')
    }

    const goBack = () => {
      router.back()
    }

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const clientHeight = document.documentElement.clientHeight
      if (scrollTop + clientHeight >= scrollHeight - 80 && !loading.value && !finished.value) {
        loadList(false)
      }
    }

    onMounted(() => {
      loadList(true)
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      list,
      activeType,
      loading,
      finished,
      typeTabs,
      emptyText,
      switchType,
      formatDate,
      goToDetail,
      goToPublish,
      goBack
    }
  }
}
</script>

<style scoped>
.lost-found-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 80px;
}

.filter-section {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 16px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-tab.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 14px rgba(44, 82, 130, 0.22);
}

.tab-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
}

.tab-dot.lost { background: var(--danger); }
.tab-dot.found { background: var(--success); }
.filter-tab.active .tab-dot.lost,
.filter-tab.active .tab-dot.found { background: rgba(255, 255, 255, 0.85); }

.list-content {
  padding: 12px 16px;
}

.lost-found-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.lost-found-item:hover {
  box-shadow: var(--shadow-md);
}

.lost-found-item:active {
  transform: scale(0.98);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-time {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.item-title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-desc {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-xs);
  color: var(--text-muted);
  gap: 8px;
}

.item-location {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-contact {
  flex-shrink: 0;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.finished-text {
  text-align: center;
  padding: 20px;
  font-size: var(--font-sm);
  color: var(--text-muted);
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 88px;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(44, 82, 130, 0.32);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.15s ease;
}

.fab:active {
  transform: scale(0.94);
}
</style>
