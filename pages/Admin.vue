<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuthToken, logout as logoutUtil } from '~/utils/jwt'

interface User {
  _id: string
  username: string
  email: string
  emailVerified?: boolean
  createdAt: string
  loginMethod?: string
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref('')
const success = ref('')

const showEdit = ref(false)
const editUser = ref<User | null>(null)
const editUsername = ref('')
const editEmail = ref('')
const editError = ref('')
const editLoading = ref(false)

const search = ref('')
const page = ref(1)
const pageSize = 10
const totalUsers = ref(0)

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const token = getAuthToken()
    const res = await $fetch<{success: boolean, users: User[], total?: number}>('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` },
      query: { search: search.value, page: page.value, pageSize }
    })
    if (res.success) {
      users.value = res.users
      totalUsers.value = res.total || res.users.length
    } else {
      error.value = 'Failed to fetch users.'
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Unexpected error'
  } finally {
    loading.value = false
  }
}

async function deleteUser(id: string) {
  if (!confirm('Are you sure you want to delete this user?')) return
  try {
    const token = getAuthToken()
    const res = await $fetch<{success: boolean, message: string}>('/api/admin/user.delete', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { id }
    })
    if (res.success) {
      success.value = res.message
      fetchUsers()
    } else {
      error.value = res.message
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Unexpected error'
  }
}

function openEdit(user: User) {
  editUser.value = user
  editUsername.value = user.username
  editEmail.value = user.email
  editError.value = ''
  showEdit.value = true
}
function closeEdit() {
  showEdit.value = false
}
async function handleEdit() {
  editLoading.value = true
  editError.value = ''
  try {
    const token = getAuthToken()
    const res = await $fetch<{success: boolean, message: string}>('/api/admin/user.update', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { id: editUser.value?._id, username: editUsername.value, email: editEmail.value }
    })
    if (res.success) {
      showEdit.value = false
      fetchUsers()
      success.value = res.message
    } else {
      editError.value = res.message
    }
  } catch (e: any) {
    editError.value = e.data?.message || e.message || 'Unexpected error'
  } finally {
    editLoading.value = false
  }
}
function handleSearch() {
  page.value = 1
  fetchUsers()
}
function prevPage() {
  if (page.value > 1) { page.value--; fetchUsers() }
}
function nextPage() {
  if (page.value < Math.ceil(totalUsers.value / pageSize)) { page.value++; fetchUsers() }
}

onMounted(fetchUsers)

function logout() {
  logoutUtil()
  navigateTo('/Login')
}
</script>
<template>
  <div class="container min-h-screen w-full max-w-[1920px] flex flex-rows items-center justify-center mx-auto">
    <div class="bg-orange-100 p-10 flex flex-col items-start justify-center w-full">
      <h1 class="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <div class="flex gap-5 mb-4">
        <button @click="logout" class="border-2 p-2">Logout</button>
        <NuxtLink to="/" class="border-2 p-2">Back to Home</NuxtLink>
      </div>
      <div class="mb-4 flex gap-2 items-center">
        <input v-model="search" @keyup.enter="handleSearch" type="text" placeholder="Search username or email" class="border-2 p-2" />
        <button @click="handleSearch" class="border-2 p-2">Search</button>
      </div>
      <div v-if="loading">Loading users...</div>
      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="success" class="text-green-600">{{ success }}</div>
      <table v-if="!loading && users.length" class="min-w-full bg-white border mt-4">
        <thead>
          <tr>
            <th class="border px-4 py-2">Username</th>
            <th class="border px-4 py-2">Email</th>
            <th class="border px-4 py-2">Email Verified</th>
            <th class="border px-4 py-2">Created At</th>
            <th class="border px-4 py-2">Login Method</th>
            <th class="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td class="border px-4 py-2">{{ user.username }}</td>
            <td class="border px-4 py-2">{{ user.email }}</td>
            <td class="border px-4 py-2">{{ user.emailVerified ? 'Yes' : 'No' }}</td>
            <td class="border px-4 py-2">{{ new Date(user.createdAt).toLocaleString() }}</td>
            <td class="border px-4 py-2">{{ user.loginMethod || 'username' }}</td>
            <td class="border px-4 py-2">
              <button @click="openEdit(user)" class="text-blue-600 underline mr-2">Edit</button>
              <button @click="deleteUser(user._id)" class="text-red-600 underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && !users.length" class="mt-4">No users found.</div>
      <div class="flex gap-2 mt-4" v-if="totalUsers > pageSize">
        <button @click="prevPage" :disabled="page === 1" class="border-2 p-2">Prev</button>
        <span>Page {{ page }} of {{ Math.ceil(totalUsers / pageSize) }}</span>
        <button @click="nextPage" :disabled="page === Math.ceil(totalUsers / pageSize)" class="border-2 p-2">Next</button>
      </div>
      <div v-if="showEdit" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
          <button class="absolute top-2 right-2 text-gray-500" @click="closeEdit">&times;</button>
          <h2 class="text-xl font-bold mb-4">Edit User</h2>
          <form @submit.prevent="handleEdit" class="flex flex-col gap-4">
            <input v-model="editUsername" type="text" placeholder="Username" class="border-2 p-2" required />
            <input v-model="editEmail" type="email" placeholder="Email" class="border-2 p-2" required />
            <button type="submit" :disabled="editLoading" class="border-2 p-2">{{ editLoading ? 'Saving...' : 'Save' }}</button>
          </form>
          <div v-if="editError" class="text-red-600 mt-2">{{ editError }}</div>
        </div>
      </div>
    </div>
  </div>
</template> 