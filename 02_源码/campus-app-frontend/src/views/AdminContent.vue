<template>
  <div class="page">
    <van-nav-bar title="内容审核" left-arrow @click-left="goBack" />
    <div class="body">
      <div class="form-card">
        <h3>校园资讯</h3>
        <van-empty v-if="!news.length" description="暂无资讯" />
        <div v-for="n in news" :key="n.id" class="row">
          <div>
            <strong>{{ n.title }}</strong>
            <p>{{ n.category }} · {{ n.publishTime }}</p>
          </div>
          <van-button size="mini" :type="n.hidden ? 'success' : 'danger'" plain @click="toggle('news', n)">
            {{ n.hidden ? '恢复' : '下架' }}
          </van-button>
        </div>
      </div>
      <div class="form-card">
        <h3>失物招领</h3>
        <van-empty v-if="!lost.length" description="暂无信息" />
        <div v-for="l in lost" :key="l.id" class="row">
          <div>
            <strong>{{ l.title }}</strong>
            <p>{{ l.type }} · {{ l.location }}</p>
          </div>
          <van-button size="mini" :type="l.hidden ? 'success' : 'danger'" plain @click="toggle('lost-found', l)">
            {{ l.hidden ? '恢复' : '下架' }}
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { adminApi } from '../api'

export default {
  name: 'AdminContent',
  setup() {
    const router = useRouter()
    const news = ref([])
    const lost = ref([])
    const load = async () => {
      try {
        const res = await adminApi.getContent()
        news.value = (res.data && res.data.news) || []
        lost.value = (res.data && res.data.lostFound) || []
      } catch (e) {
        showToast(e.message || '加载失败')
      }
    }
    const toggle = async (type, item) => {
      try {
        await adminApi.setContentHidden(type, item.id, !item.hidden)
        showToast(item.hidden ? '已恢复' : '已下架')
        load()
      } catch (e) {
        showToast(e.message || '操作失败')
      }
    }
    onMounted(load)
    return { news, lost, toggle, goBack: () => router.back() }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.body { padding: 12px; display: grid; gap: 12px; }
@media (min-width: 900px) {
  .body { grid-template-columns: 1fr 1fr; }
}
.form-card { background: #fff; border: 1px solid #e8eef5; border-radius: 12px; padding: 14px; }
.form-card h3 { font-size: 15px; color: #2c5282; margin-bottom: 8px; }
.row {
  display: flex; justify-content: space-between; align-items: center;
  gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f4f8;
}
.row p { font-size: 12px; color: #718096; margin-top: 2px; }
</style>
