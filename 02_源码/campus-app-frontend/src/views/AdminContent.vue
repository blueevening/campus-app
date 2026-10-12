<template>
  <div class="page">
    <van-nav-bar title="内容审核" left-arrow @click-left="goBack" />
    <div class="admin-body">
      <div v-if="loading" class="loading-box">
        <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
      </div>

      <template v-else>
        <div class="panel page-card">
          <div class="section-title">校园资讯</div>
          <p class="muted panel-desc">共 {{ news.length }} 条 · 可下架违规内容或恢复展示</p>
          <van-empty v-if="!news.length" description="暂无资讯" />
          <div v-else class="content-list">
            <div v-for="n in news" :key="n.id" class="content-row">
              <div class="content-main">
                <div class="title-line">
                  <strong>{{ n.title }}</strong>
                  <span class="tag" :class="n.hidden ? 'tag-red' : 'tag-green'">
                    {{ n.hidden ? '已下架' : '展示中' }}
                  </span>
                </div>
                <p class="muted">{{ n.category }} · {{ n.publishTime }}</p>
              </div>
              <van-button
                size="small"
                :type="n.hidden ? 'success' : 'danger'"
                plain
                :loading="actingKey === `news-${n.id}`"
                @click="toggle('news', n)"
              >
                {{ n.hidden ? '恢复展示' : '下架' }}
              </van-button>
            </div>
          </div>
        </div>

        <div class="panel page-card">
          <div class="section-title">失物招领</div>
          <p class="muted panel-desc">共 {{ lost.length }} 条 · 可下架违规信息或恢复展示</p>
          <van-empty v-if="!lost.length" description="暂无信息" />
          <div v-else class="content-list">
            <div v-for="l in lost" :key="l.id" class="content-row">
              <div class="content-main">
                <div class="title-line">
                  <strong>{{ l.title }}</strong>
                  <span class="tag" :class="l.hidden ? 'tag-red' : 'tag-green'">
                    {{ l.hidden ? '已下架' : '展示中' }}
                  </span>
                </div>
                <p class="muted">{{ l.type }} · {{ l.location }}</p>
              </div>
              <van-button
                size="small"
                :type="l.hidden ? 'success' : 'danger'"
                plain
                :loading="actingKey === `lost-${l.id}`"
                @click="toggle('lost-found', l)"
              >
                {{ l.hidden ? '恢复展示' : '下架' }}
              </van-button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast } from 'vant'
import { adminApi } from '../api'

export default {
  name: 'AdminContent',
  setup() {
    const router = useRouter()
    const store = useStore()
    const news = ref([])
    const lost = ref([])
    const loading = ref(true)
    const actingKey = ref('')
    const isAdmin = computed(() => Number(store.getters.getRole) === 2)

    const load = async () => {
      loading.value = true
      try {
        const res = await adminApi.getContent()
        news.value = (res.data && res.data.news) || []
        lost.value = (res.data && res.data.lostFound) || []
      } catch (e) {
        showToast(e.message || '加载内容失败')
      } finally {
        loading.value = false
      }
    }

    const toggle = async (type, item) => {
      const key = type === 'news' ? `news-${item.id}` : `lost-${item.id}`
      actingKey.value = key
      try {
        await adminApi.setContentHidden(type, item.id, !item.hidden)
        showToast(item.hidden ? '已恢复展示' : '已下架')
        await load()
      } catch (e) {
        showToast(e.message || '操作失败')
      } finally {
        actingKey.value = ''
      }
    }

    onMounted(() => {
      if (!isAdmin.value) {
        showToast('仅管理员可访问内容审核')
        router.replace('/profile')
        return
      }
      load()
    })

    return {
      news,
      lost,
      loading,
      actingKey,
      toggle,
      goBack: () => router.back()
    }
  }
}
</script>

<style scoped>
.admin-body {
  padding: var(--space-3);
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 900px) {
  .admin-body {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.panel {
  padding: var(--space-4);
}

.panel-desc {
  margin-bottom: var(--space-3);
}

.content-list {
  display: flex;
  flex-direction: column;
}

.content-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border-color);
}

.content-row:last-child {
  border-bottom: none;
}

.content-main {
  flex: 1;
  min-width: 0;
}

.title-line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.title-line strong {
  font-size: var(--font-md);
  color: var(--text-primary);
}

.content-main p {
  margin-top: 4px;
}

.loading-box {
  padding: var(--space-8);
  display: flex;
  justify-content: center;
}
</style>
