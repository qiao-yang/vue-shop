<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>参数列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片式图 -->
		<el-card>
			<el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
			<el-row class="cat_opt">
				<el-col>
					<span>选择商品分类：</span>
					<el-cascader ref="cascaderRef" popper-class="cascader" expand-trigger="hover" :options="cateList" :props="cateProps" v-model="selectedCateKeys" @change="cateChange" clearable></el-cascader>
				</el-col>
			</el-row>
			<el-tabs v-model="activeName" @tab-click="handleTabClick">
				<!-- 动态参数 -->
				<el-tab-pane label="动态参数" name="many">
					<el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加参数</el-button>
					<el-table :data="manyTableData" border stripe>
						<el-table-column type="expand">
							<template slot-scope="scope">
								<!-- 循环标签 -->
								<el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
								<!-- 添加标签的按钮和输入框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column type="index"></el-table-column>
						<el-table-column label="参数名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
								<el-button type="danger" icon="el-icon-delete" size="mini" @click="deletaParams(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
				<!-- 静态属性 -->
				<el-tab-pane label="静态属性" name="only">
					<el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加属性</el-button>
					<el-table :data="onlyTableData" border stripe>
						<el-table-column type="expand">
							<template slot-scope="scope">
								<!-- 循环标签 -->
								<el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
								<!-- 添加标签的按钮和输入框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column type="index"></el-table-column>
						<el-table-column label="参数名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
								<el-button type="danger" icon="el-icon-delete" size="mini" @click="deletaParams(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-card>
		<!-- 添加参数和属性的对话框 -->
		<el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisible" width="50%" @close="addParamsDialogClosed">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="addForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addParamsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addParams">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 修改参数和属性的对话框 -->
		<el-dialog :title="'修改' + titleText" :visible.sync="editParamsDialogVisible" width="50%" @close="editParamsDialogClosed">
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="editForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editParamsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editParams">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				cateList: [],
				cateProps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children'
				},
				selectedCateKeys: [],
				activeName: 'many',
				manyTableData: [],
				onlyTableData: [],
				// 控制添加参数的对话框显示隐藏
				addParamsDialogVisible: false,
				addForm: {
					attr_name: ''
				},
				addFormRules: {
					attr_name: [
						{ required: true, message: '请输入参数名称', trigger: 'blur' }
					]
				},
				// 控制修改参数的对话框显示隐藏
				editParamsDialogVisible: false,
				editForm: {},
				editFormRules: {
					attr_name: [
						{ required: true, message: '请输入参数名称', trigger: 'blur' }
					]
				}
			}
		},
		created () {
			this.getCateList()
		},
		methods: {
			// 获取分类列表
			async getCateList () {
				const { data: res } = await this.$http.get('categories')
				if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
				this.cateList = res.data
			},
			// 选择器发生改变
			cateChange () {
				this.getParamsList()
			},
			// 点击了选项卡
			handleTabClick () {
				this.getParamsList()
			},
			// 获取参数列表
			async getParamsList () {
				if (this.selectedCateKeys.length !== 3) {
					this.selectedCateKeys = []
					this.manyTableData = []
					this.onlyTableData = []
					return 
				}
				const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
				if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
				res.data.forEach(item => {
					item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
					// 添加控制开关
					item.inputVisible = false
					item.inputValue = ''
				})
				if (this.activeName === 'many') {
					this.manyTableData = res.data
				} else {
					this.onlyTableData = res.data
				}
			},
			// 监听对话框关闭
			addParamsDialogClosed () {
				this.$refs.addFormRef.resetFields()
			},
			// 添加参数
			addParams () {
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) return 
					const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
					{ attr_name: this.addForm.attr_name, attr_sel: this.activeName }) 
					if (res.meta.status !== 201) return this.$message.error('添加参数失败')
					this.$message.success('添加参数成功')
					this.addParamsDialogVisible = false
					this.getParamsList()
				})
			},
			// 修改参数对话框
			async showEditDialog (id) {
				const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
				if (res.meta.status !== 200) return this.$message.error('获取参数失败')
				this.editForm = res.data
				this.editParamsDialogVisible = true
			},
			editParamsDialogClosed () {
				this.$refs.editFormRef.resetFields()
			},
			// 修改参数
			editParams () {
				this.$refs.editFormRef.validate(async valid => {
					if (!valid) return 
					const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
					if (res.meta.status !== 200) return this.$message.error('修改参数失败')
					this.getParamsList()
					this.editParamsDialogVisible = false
					this.$message.success('修改参数成功')
				})
				
			},
			// 删除参数
			async deletaParams (id) {
				const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				// 点击确认按钮，返回字符串 confirm
				// 点击取消按钮，返回字符串 cancel
				if (confirmResult !== 'confirm') return this.$message.info('已取消了删除')
				const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
				if (res.meta.status !== 200) return this.$message.error('删除参数失败')
				this.$message.success('删除参数成功')
				this.getParamsList()
			},
			// 添加新tag的方法
			async handleInputConfirm (row) {
				// 判断输入的值是否为空
				if (row.inputValue.trim().length === 0) {
					row.inputValue = ''
					row.inputVisible = false
					return 
				}
				// 如果没有return，证明输入的值有效，进行上传操作
				row.attr_vals.push(row.inputValue.trim())
				// 发起请求
				this.saveAttrVlas(row)
			},
			// 发起编辑标签的请求
			async saveAttrVlas (row) {
				const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
				if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
				this.$message.success('修改参数项成功')
				row.inputValue = ''
				row.inputVisible = false
			},
			// 显示input
			showInput (row) {
				row.inputVisible = true
				// $nextTick 当元素被重新渲染后执行回调
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus()
				})
			},
			// 删除标签
			handleClose (i, row) {
				row.attr_vals.splice(i, 1)
				this.saveAttrVlas(row)
			}

		},
		computed: {
			isBtnDisabled () {
				if (this.selectedCateKeys.length !== 3) {
					return true
				}
				return false
			},
			cateId () {
				if (this.selectedCateKeys.length === 3) {
					return this.selectedCateKeys[2]
				}
				return null
			},
			titleText () {
				if (this.activeName === 'many') {
					return '动态参数'
				}
				return '静态属性'
			}
		}
	}
</script>

<style lang="less" scoped>
.cat_opt{
	margin: 15px 0;
}
.el-tag{
	margin: 10px;
}
.input-new-tag{
	width: 120px;
}
</style>
