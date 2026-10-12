<template>
  <div class="lost-found-container">
    <van-nav-bar title="失物招领" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="edit" size="20" @click="goToPublish" />
      </template>
    </van-nav-bar>

    <!-- 分类筛选 -->
    <van-tabs v-model:active="activeType" @change="loadList">
      <van-tab title="全部" name="" />
      <van-tab title="寻物启事" name="LOST" />
      <van-tab title="招领启事" name="FOUND" />
    </van-tabs>

    <!-- 列表 -->
    <div class="list-content">
      <div class="lost-found-item" v-for="item in list" :key="item.id" @click="goToDetail(item.id)">
        <div class="item-header">
          <van-tag :type="item.type === 'LOST' ? 'danger' : 'success'" size="medium">
            {{ item.type === 'LOST' ? '寻物' : '招领' }}
          </van-tag>
          <span class="item-time">{{ formatDate(item.createTime) }}</span>
        </div>
        <h4 class="item-title text-ellipsis">{{ item.title }}</h4>
        <p class="item-desc text-ellipsis-2">{{ item.description }}</p>
        <div class="item-footer">
          <span class="item-location">
            <van-icon name="location-o" /> {{ item.location }}
          </span>
          <span class="item-contact">联系人：{{ item.contactName }}</span>
        </div>
      </div>

      <van-empty v-if="list.length === 0 && !loading" description="暂无失物招领信息" />
    </div>

    <!-- 加载更多 -->
    <van-loading v-if="loading" class="loading" />
    <div v-if="finished && list.length > 0" class="finished-text">没有更多了</div>

    <!-- 发布按钮 -->
    <div class="publish-btn" @click="goToPublish">
      <van-icon name="plus" size="24" color="#fff" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
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

    const loadList = async (reset = false) => {
      if (reset) {
        pageNum.value = 1
        list.value = []
        finished.value = false
      }

      loading.value = true
      try {
        const res = await lostFoundApi.getList({
          pageNum: pageNum.value,
          pageSize,
          type: activeType.value
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
        showToast('获取列表失败')
      } finally {
        loading.value = false
      }
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

    // 滚动加载更多
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight

      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading.value && !finished.value) {
        loadList()
      }
    }

    onMounted(() => {
      loadList(true)
      window.addEventListener('scroll', handleScroll)
    })

    return {
      list,
      activeType,
      loading,
      finished,
      loadList,
      formatDate,
      goToDetail,
      goToPublish,
      goBack
    }
  }
}
</script>

<style scoped>
.lost-found-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.list-content {
  padding: 12px;
}

.lost-found-item {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  cursor: pointer;
}

.lost-found-item:active {
  background: #f8f8f8;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-time {
  font-size: 12px;
  color: #999;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.item-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.item-location {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.finished-text {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: #999;
}

.publish-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
}

.publish-btn:active {
  transform: scale(0.95);
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
