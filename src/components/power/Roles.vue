<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>

		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddRole">添加角色</el-button>
				</el-col>
			</el-row>
			<el-table :data="rolesList" border stripe>
				<el-table-column type="expand">
					<template slot-scope="scope">
						<!-- 一级权限 -->
						<el-row :class="['bdBottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
							<!-- 渲染一级权限 -->
							<el-col :span="5">
								<el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<!-- 渲染耳机2和三级权限 -->
							<el-col :span="19">
								<el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
									<!-- 二级权限 -->
									<el-col :span="6">
										<el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<!-- 三级权限 -->
									<el-col :span="18">
										<el-tag type="warning" v-for="(item3, i3) in item1.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="角色名称" prop="roleName"></el-table-column>
				<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
				<el-table-column label="操作" width="300px">
					 <template slot-scope="scope">
						 <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRole(scope.row.id)">编辑</el-button>
						 <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
						 <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
					 </template>
				</el-table-column>
			</el-table>
		</el-card>
		<!-- 添加角色对话框 -->
		<el-dialog title="添加角色" :visible.sync="addRoleVisible" width="50%" @close="addRoleDialogClosed">
			<el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="90px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="addRoleForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input v-model="addRoleForm.roleDesc"></el-input>
				</el-form-item>
  		</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addRoleVisible = false">取 消</el-button>
				<el-button type="primary" @click="addRole">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 编辑角色对话框 -->
		<el-dialog title="修改角色" :visible.sync="editRoleVisible" width="50%" @close="editRoleDialogClosed">
			<el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="90px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="editRoleForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input v-model="editRoleForm.roleDesc"></el-input>
				</el-form-item>
  		</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editRoleVisible = false">取 消</el-button>
				<el-button type="primary" @click="editRoleInfo">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 分配权限对话框 -->
		<el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
			<el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRightDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="allotRights">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data () {
		return {
			// 控制添加角色对话框的显示隐藏
			addRoleVisible: false,
			addRoleForm: {
				roleName: '',
				roleDesc: ''
			},
			addRoleFormRules: {
				roleName: [
					{ required: true, message: '请输入角色名称', trigger: 'blur' },
					{ min: 1, max: 10, message: '长度在1到10个字符之间', trigger: 'blur' }
				],
				roleDesc: [
					{ required: true, message: '请输入角色描述', trigger: 'blur' }
				]
			},
			// 控制编辑角色对话框的显示隐藏
			editRoleVisible: false,
			editRoleForm: {},
			// 角色列表
			rolesList: [],
			// 权限列表
			rightsList: [],
			// 控制分配权限对话框的显示隐藏
			setRightDialogVisible: false,
			// 树形控件绑定对象
			treeProps: {
				label: 'authName',
				children: 'children'
			},
			// 默认选中的节点数组
			defKeys: [],
			rolesId: ''
		}
	},
	created () {
		this.getRolesList()
	},
	methods: {
		// 获取角色列表
		async getRolesList () {
			const { data: res } = await this.$http.get('roles')
			if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
			this.rolesList = res.data
		},
		//  弹框是否删除权限
		async removeRightById (roles, rightId) {
			const confirmResult = await this.$confirm('此操作将删除该用户的此权限, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 点击确认按钮，返回字符串 confirm
			// 点击取消按钮，返回字符串 cancel
			if (confirmResult !== 'confirm') return this.$message.info('已取消了删除')
			const { data: res } = await this.$http.delete(`roles/${roles.id}/rights/${rightId}`)
			if (res.meta.status !== 200) return this.$message.error('删除权限失败')
			this.$message.success('删除权限成功')
			roles.children = res.data
		},
		// 展开分配权限对话框
		async showSetRightDialog (role) {
			this.rolesId = role.id
			// 获取权限列表
			const { data: res } = await this.$http.get('rights/tree')
			console.log(res)
			if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
			this.rightsList = res.data
			this.getleafKeys(role, this.defKeys)
			this.setRightDialogVisible = true
		},
		// 递归函数获取已有权限
		getleafKeys(node, arr) {
			if (!node.children) {
				return arr.push(node.id)
			}
			node.children.forEach(item => {
				this.getleafKeys(item, arr)
			})
		},
		// 监听分配权限对话框关闭
		setRightDialogClosed () {
			this.defKeys = []
		},
		// 获取选择的权限，并提交
		async allotRights () {
			const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
			const idStr = keys.join(',')
			
			const { data: res } = await this.$http.post(`roles/${this.rolesId}/rights`, { rids: idStr })
			if (res.meta.status !== 200) return this.$message.error('分配权限失败')
			this.$message.success('分配权限成功')
			this.getRolesList()
			this.setRightDialogVisible = false
		},
		// 显示添加角色对话框的显示
		showAddRole () {
			this.addRoleVisible = true
		},
		// 添加角色
		addRole () {
			this.$refs.addRoleFormRef.validate(async valid => {
				if (!valid) return
				const { data: res } = await this.$http.post('roles', this.addRoleForm)
				if (res.meta.status !== 201) return this.$message.error('添加角色失败')
				this.$message.success('添加角色成功')
				this.getRolesList()
				this.addRoleVisible = false
			})
		},
		addRoleDialogClosed () {
			this.$refs.addRoleFormRef.resetFields()
		},
		// 显示编辑角色对话框的显示
		async showEditRole (id) {
			const { data: res } = await this.$http.get('roles/' + id)
			if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
			this.editRoleForm = res.data
			this.editRoleVisible = true
		},
		editRoleInfo () {
			this.$refs.editRoleFormRef.validate(async valid => {
				if (!valid) return
				const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, { roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc })
				if (res.meta.status !== 200) return this.$message.error('修改角色失败')
				this.$message.success('修改角色成功')
				this.getRolesList()
				this.editRoleVisible = false
			})
		},
		editRoleDialogClosed () {
			this.$refs.editRoleFormRef.resetFields()
		},
		// 删除角色
		async deleteRole (id) {
			// 先弹框询问是否删除
			const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 点击确认按钮，返回字符串 confirm
			// 点击取消按钮，返回字符串 cancel
			if (confirmResult !== 'confirm') return this.$message.info('已取消了删除')
			const { data: res } = await this.$http.delete('roles/' + id)
			if (res.meta.status !== 200) return this.$message.error('删除角色失败')
			this.$message.success('删除角色成功')
			this.getRolesList()
		}
	}
}
</script>

<style lang="less" scope>
.el-tag{
	margin: 7px;
}
.bdtop{
	border-top: 1px solid #eee;
}
.bdBottom{
	border-bottom: 1px solid #eee;
}
.vcenter{
	display: flex;
	align-items: center;
}
</style>
