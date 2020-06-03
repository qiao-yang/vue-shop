<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card class="box-card">
			<!-- 搜索、添加 -->
			<el-row :gutter="20">
				<el-col :span="7">
					<el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
				</el-col>
			</el-row>
			<!-- 用户列表 -->
			<el-table :data="userList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="姓名" prop="username"></el-table-column>
				<el-table-column label="邮箱" prop="email"></el-table-column>
				<el-table-column label="电话" prop="mobile"></el-table-column>
				<el-table-column label="角色" prop="role_name"></el-table-column>
				<el-table-column label="状态">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180px">
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
						<el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页区域 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
		</el-card>
		<!-- 添加用户对话框 -->
		<el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
  		<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机号" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
  		</el-form>
  		<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="adduser">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 修改用户对话框 -->
		<el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDIalogClosed">
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
				<el-form-item label="用户名">
					<el-input v-model="editForm.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机号" prop="mobile">
					<el-input v-model="editForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUserInfo">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
  data () {
		// 验证邮箱规则
		var checkEmail = (rule, value, callback) => {
			const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
			if (regEmail.test(value)) {
				return callback()
			}
			callback(new Error('请输入合法邮箱'))
		}
		// 验证手机号规则
		var checkMobile = (rule, value, callback) => {
			const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
			if (regMobile.test(value)) {
				return callback()
			}
			callback(new Error('请输入合法手机号'))
		}
    return {
      // 获取用户列表参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
			total: 0,
			// 控制添加用户对话框的显示隐藏
			addDialogVisible: false,
			addForm: {
				username: '',
				password: '',
				email: '',
				mobile: ''
			},
			addFormRules: {
				username: [
					{ required: true, message: '请输入用户名', trigger: 'blur' },
					{ min: 3, max: 10, message: '长度在3到10个字符之间', trigger: 'blur' }
				],
				password: [
					{ required: true, message: '请输入密码', trigger: 'blur' },
					{ min: 6, max: 15, message: '长度在6到15个字符之间', trigger: 'blur' }
				],
				email: [
					{ required: true, message: '请输入邮箱', trigger: 'blur' },
					{ validator: checkEmail, trigger: 'blur' }
				],
				mobile: [
					{ required: true, message: '请输入手机号', trigger: 'blur' },
					{ validator: checkMobile, trigger: 'blur' }
				]
			},
			// 控制修改用户对话框的显示隐藏
			editDialogVisible: false,
			editForm: {},
			editFormRules: {
				email: [
					{ required: true, message: '请输入邮箱', trigger: 'blur' },
					{ validator: checkEmail, trigger: 'blur' }
				],
				mobile: [
					{ required: true, message: '请输入手机号', trigger: 'blur' },
					{ validator: checkMobile, trigger: 'blur' }
				]
			}
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听分页条数改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
		},
		// 用户状态改变
		async userStateChanged (userInfo) {
			const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
			if (res.meta.status !== 200) {
				userInfo.mg_state = !userInfo.mg_state
				this.$message.error('更新用户状态失败')
			}
			this.$message.success('更新用户状态成功！')
		},
		// 监听关闭添加用户对话框
		addDialogClosed () {
			this.$refs.addFormRef.resetFields()
		},
		// 添加用户
		adduser () {
			this.$refs.addFormRef.validate(async valid => {
				if (!valid) return
				const { data: res } = await this.$http.post('users', this.addForm)
				if (res.meta.status !== 201) {
					this.$message.error('添加用户失败')
				}
				this.$message.success('添加用户成功')
				this.addDialogVisible = false
				this.getUserList()
			})
		},
		// 显示修改用户信息对话框
		async showEditDialog (id) {
			const { data: res } = await this.$http.get('users/' + id)
			if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
			this.editForm = res.data
			this.editDialogVisible = true
		},
		// 监听关闭修改用户信息对话框
		editDIalogClosed () {
			this.$refs.editFormRef.resetFields()
		},
		// 修改用户信息
		editUserInfo () {
			this.$refs.editFormRef.validate(async valid => {
				if (!valid) return
				const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
				if (res.meta.status !== 200) return this.$message.error('修改失败')
				// 将对话框隐藏
				this.editDialogVisible = false
				// 刷新列表
				this.getUserList()
				this.$message.success('修改成功')
			})
		},
		// 跟卤id删除用户
		async removeUserById (id) {
			// 先弹框询问是否删除
			const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 点击确认按钮，返回字符串 confirm
			// 点击取消按钮，返回字符串 cancel
			if (confirmResult !== 'confirm') return this.$message.info('已取消了删除')
			const { data: res } = await this.$http.delete('users/' + id)
			if (res.meta.status !== 200) return this.$message.error('删除用户失败')
			this.$message.success('删除用户成功')
		}
  }
}
</script>

<style lang="less" scoped>

</style>
