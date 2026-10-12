<template>
  <div class="page">
    <van-nav-bar title="用户管理" left-arrow @click-left="goBack" />
    <div class="body">
      <van-empty v-if="!users.length" description="暂无用户" />
      <div v-for="u in users" :key="u.id" class="card">
        <div class="head">
          <div>
            <strong>{{ u.username }}</strong>
            <span class="tag" :class="u.role === 2 ? 'admin' : (u.role === 1 ? 'monitor' : '')">{{ u.role === 2 ? '管理员' : (u.role === 1 ? '班长' : '学生') }}</span>
            <span class="tag" :class="u.status ? 'ok' : 'bad'">{{ u.status ? '正常' : '禁用' }}</span>
          </div>
          <small>{{ u.studentId }}</small>
        </div>
        <p class="sub">{{ u.college || '' }} {{ u.major || '' }}</p>
        <div class="actions">
          <van-button size="mini" @click="toggleStatus(u)">{{ u.status ? '禁用' : '启用' }}</van-button>
          <van-button size="mini" type="primary" plain @click="resetPwd(u)">重置密码</van-button>
          <van-button v-if="u.role !== 2" size="mini" type="warning" plain @click="toggleRole(u)">
            {{ u.role === 1 ? '取消班长' : '设为班长' }}
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { adminApi } from '../api'

export default {
  name: 'AdminUsers',
  setup() {
    const router = useRouter()
    const users = ref([])
    const load = async () => {
      try {
        const res = await adminApi.getUsers()
        users.value = res.data || []
      } catch (e) {
        showToast(e.message || '加载失败')
      }
    }
    const toggleStatus = async (u) => {
      try {
        if (u.status) {
          await showDialog({ title: '确认禁用', message: `禁用后 ${u.username} 将无法登录`, showCancelButton: true })
        }
        await adminApi.setUserStatus(u.id, u.status ? 0 : 1)
        showToast(u.status ? '已禁用' : '已启用')
        load()
      } catch (e) {
        if (e && e !== 'cancel') showToast(e.message || '操作失败')
      }
    }
    const resetPwd = async (u) => {
      try {
        await showDialog({ title: '重置密码', message: `将 ${u.username} 密码重置为 123456？`, showCancelButton: true })
        await adminApi.resetPassword(u.id)
        showToast('已重置')
      } catch (e) {
        if (e && e !== 'cancel') showToast(e.message || '操作失败')
      }
    }
    const toggleRole = async (u) => {
      try {
        const next = u.role === 1 ? 0 : 1
        await showDialog({
          title: next === 1 ? '设为班长' : '取消班长',
          message: next === 1
            ? '班长将获得发布活动、审核证书、内容管理等权限，无需逐项申请'
            : '取消后仅保留学生基础权限',
          showCancelButton: true
        })
        await adminApi.setRole(u.id, next)
        showToast(next === 1 ? '已设为班长' : '已取消班长')
        load()
      } catch (e) {
        if (e && e !== 'cancel') showToast(e.message || '操作失败')
      }
    }
    onMounted(load)
    return { users, toggleStatus, resetPwd, toggleRole, goBack: () => router.back() }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.body { padding: 12px; display: grid; gap: 10px; }
@media (min-width: 900px) {
  .body { grid-template-columns: 1fr 1fr; }
}
.card {
  background: #fff; border: 1px solid #e8eef5; border-radius: 12px; padding: 14px;
}
.head { display: flex; justify-content: space-between; align-items: center; }
.tag {
  font-size: 11px; padding: 2px 6px; border-radius: 999px;
  background: #e8f0fb; color: #2c5282; margin-left: 6px;
}
.tag.admin { background: #fef6e4; color: #b7791f; }
.tag.monitor { background: #e6fffa; color: #276749; }
.tag.ok { background: #e6fffa; color: #2f855a; margin-left: 4px; }
.tag.bad { background: #fff5f5; color: #c53030; margin-left: 4px; }
.sub { font-size: 12px; color: #718096; margin: 8px 0; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
