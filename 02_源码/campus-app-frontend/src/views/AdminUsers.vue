<template>
  <div class="page">
    <van-nav-bar title="用户管理" left-arrow @click-left="goBack" />
    <div class="admin-body">
      <div class="toolbar page-card">
        <div class="section-title">账号列表</div>
        <p class="muted">共 {{ users.length }} 个账号 · 可停用/启用、重置密码、任命班长</p>
      </div>

      <div v-if="loading" class="loading-box">
        <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
      </div>
      <van-empty v-else-if="!users.length" description="暂无用户" />
      <div v-else class="user-grid">
        <div v-for="u in users" :key="u.id" class="user-card page-card">
          <div class="user-head">
            <div class="user-id">
              <strong class="name">{{ u.username }}</strong>
              <span class="tag" :class="roleClass(u.role)">{{ roleName(u.role) }}</span>
              <span class="tag" :class="u.status ? 'tag-green' : 'tag-red'">{{ u.status ? '正常' : '禁用' }}</span>
            </div>
            <small class="muted">{{ u.studentId }}</small>
          </div>
          <p class="sub muted">{{ [u.college, u.major].filter(Boolean).join(' · ') || '暂无院系信息' }}</p>
          <div class="actions">
            <van-button
              size="small"
              :type="u.status ? 'danger' : 'primary'"
              plain
              :loading="actingId === u.id && acting === 'status'"
              @click="toggleStatus(u)"
            >
              {{ u.status ? '停用' : '启用' }}
            </van-button>
            <van-button
              size="small"
              type="primary"
              :loading="actingId === u.id && acting === 'pwd'"
              @click="resetPwd(u)"
            >
              重置密码
            </van-button>
            <van-button
              v-if="u.role !== 2"
              size="small"
              type="warning"
              plain
              :loading="actingId === u.id && acting === 'role'"
              @click="toggleRole(u)"
            >
              {{ u.role === 1 ? '取消班长' : '设为班长' }}
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast, showDialog } from 'vant'
import { adminApi } from '../api'

export default {
  name: 'AdminUsers',
  setup() {
    const router = useRouter()
    const store = useStore()
    const users = ref([])
    const loading = ref(true)
    const actingId = ref(null)
    const acting = ref('')
    const isAdmin = computed(() => Number(store.getters.getRole) === 2)

    const roleName = (role) => (role === 2 ? '管理员' : role === 1 ? '班长' : '学生')
    const roleClass = (role) => (role === 2 ? 'tag-gold' : role === 1 ? 'tag-blue' : 'tag-gray')

    const load = async () => {
      loading.value = true
      try {
        const res = await adminApi.getUsers()
        users.value = res.data || []
      } catch (e) {
        showToast(e.message || '加载用户失败')
      } finally {
        loading.value = false
      }
    }

    const toggleStatus = async (u) => {
      if (u.status) {
        try {
          await showDialog({
            title: '确认停用',
            message: `停用后 ${u.username} 将无法登录`,
            showCancelButton: true
          })
        } catch (e) {
          if (e === 'cancel' || e === 'overlay') return
          return
        }
      }
      actingId.value = u.id
      acting.value = 'status'
      try {
        await adminApi.setUserStatus(u.id, u.status ? 0 : 1)
        showToast(u.status ? '已停用' : '已启用')
        await load()
      } catch (e) {
        showToast(e.message || '操作失败')
      } finally {
        actingId.value = null
        acting.value = ''
      }
    }

    const resetPwd = async (u) => {
      try {
        await showDialog({
          title: '重置密码',
          message: `将 ${u.username} 的密码重置为 123456？`,
          showCancelButton: true
        })
      } catch (e) {
        if (e === 'cancel' || e === 'overlay') return
        return
      }
      actingId.value = u.id
      acting.value = 'pwd'
      try {
        await adminApi.resetPassword(u.id)
        showToast('已重置为 123456')
        await load()
      } catch (e) {
        showToast(e.message || '操作失败')
      } finally {
        actingId.value = null
        acting.value = ''
      }
    }

    const toggleRole = async (u) => {
      const next = u.role === 1 ? 0 : 1
      try {
        await showDialog({
          title: next === 1 ? '设为班长' : '取消班长',
          message: next === 1
            ? '班长将获得发布活动、审核证书、内容管理等权限，无需逐项申请'
            : '取消后仅保留学生基础权限',
          showCancelButton: true
        })
      } catch (e) {
        if (e === 'cancel' || e === 'overlay') return
        return
      }
      actingId.value = u.id
      acting.value = 'role'
      try {
        await adminApi.setRole(u.id, next)
        showToast(next === 1 ? '已设为班长' : '已取消班长')
        await load()
      } catch (e) {
        showToast(e.message || '操作失败')
      } finally {
        actingId.value = null
        acting.value = ''
      }
    }

    onMounted(() => {
      if (!isAdmin.value) {
        showToast('仅管理员可访问用户管理')
        router.replace('/profile')
        return
      }
      load()
    })

    return {
      users,
      loading,
      actingId,
      acting,
      roleName,
      roleClass,
      toggleStatus,
      resetPwd,
      toggleRole,
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

.toolbar {
  padding: var(--space-4);
}

.user-grid {
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 900px) {
  .user-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.user-card {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.user-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.user-id {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.user-id .name {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin-right: 4px;
}

.sub {
  margin: 2px 0 var(--space-1);
}

.actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: var(--space-2);
}

.loading-box {
  padding: var(--space-8);
  display: flex;
  justify-content: center;
}
</style>
