<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片式图 -->
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="showCateDialog">添加分类</el-button>
				</el-col>
			</el-row>
			<!-- 表格 -->
			<tree-table class="treetable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
				<!-- 是否有效模板 -->
				<template slot="isOk" slot-scope="scope">
					<i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
					<i class="el-icon-error" v-else style="color:red"></i>
				</template>
				<!-- 排序模板 -->
				<template slot="order" slot-scope="scope">
					<el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
					<el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
					<el-tag type="warning" size="mini" v-else>三级</el-tag>
				</template>
				<!-- 操作模板 -->
				<template slot="opt" slot-scope="scope">
					<el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
				</template>
			</tree-table>
			<!-- 分页 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
		</el-card>
		<!-- 添加分类对话框 -->
		<el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
  		<el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
				<el-form-item label="分类名称：" prop="cat_name">
					<el-input v-model="addCateForm.cat_name"></el-input>
				</el-form-item>
				<el-form-item label="父级分类：">
					<!-- options 用来指定数据源 -->
					<!-- props 用来指定配置对象 -->
					<el-cascader ref="cascaderRef" popper-class="cascader" expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChange" clearable change-on-select></el-cascader>
				</el-form-item>
  		</el-form>
  		<span slot="footer" class="dialog-footer">
				<el-button @click="addCateDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data () {
		return {
			// 分类列表
			cateList: [],
			// 参数信息
			queryInfo: {
				type: '',
				pagenum: 1,
				pagesize: 5
			},
			// 总数
			total: 0,
			// 树形菜单列设置
			columns: [
				{
					label: '分类名称',
					prop: 'cat_name'
				},
				{
					label: '是否有效',
					// 定义此列为自定义模板
					type: 'template',
					// 模板名称
					template: 'isOk'
				},
				{
					label: '排序',
					type: 'template',
					template: 'order'
				},
				{
					label: '操作',
					type: 'template',
					template: 'opt'
				}
			],
			// 添加分类对话框的显示隐藏
			addCateDialogVisible: false,
			// 添加分类的表单
			addCateForm: {
				cat_name: '',
				cat_pid: 0,
				cat_level: 0
			},
			// 添加分类的表单验证
			addCateFormRules: {
				cat_name: [
					{ required: true, message: '请输入分类名称', trigger: 'blur' }
				]
			},
			// 父级分类列表
			parentCateList: [],
			// 添加分类的表单对象
			cascaderProps: {
				value: 'cat_id',
				label: 'cat_name',
				children: 'children',
				checkStrictly: true
			},
			selectedKeys: []
		}
	},
	created () {
		this.getCateList()
	},
	methods: {
		// 获取商品分类
		async getCateList () {
			const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
			if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
			this.cateList = res.data.result
			this.total = res.data.total
		},
		// 监听分页 条数变化
		handleSizeChange (newSize) {
			this.queryInfo.pagesize = newSize
			this.getCateList()
		},
		// 监听分页页数变化
		handleCurrentChange (newPage) {
			this.queryInfo.pagenum = newPage
			this.getCateList()
		},
		// 显示添加分类对话框
		showCateDialog () {
			this.getParentCateList()
			this.addCateDialogVisible = true
		},
		// 获取父级分类列表
		async getParentCateList () {
			const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
			if (res.meta.status !== 200) return this.$message('获取父级分类失败')
			this.parentCateList = res.data
		},
		// 选择项变化触发
		parentCateChange () {
			// 如果length > 0 证明选中父级分类
			// 如果 > 1证明选中二级分类
			// 反之，没有选中
			if (this.selectedKeys.length > 0) {
				this.addCateForm.cat_id = this.selectedKeys[this.selectedKeys.length - 1]
				this.addCateForm.cat_level = this.selectedKeys.length
				var children = this.$refs.cascaderRef.getCheckedNodes()
				if (children[0].children.length < 1) { // 判断有没有下级
					this.$refs.cascaderRef.dropDownVisible = false // 监听值发生变化就关闭它
				}
				return 
			} else {
				this.addCateForm.cat_id = 0
				this.addCateForm.cat_level = 0
			}
		},
		// 点击添加分类确认按钮
		async addCate () {
			this.$refs.addCateFormRef.validate(async valid => {
				if (!valid) return
				const { data: res } = await this.$http.post('categories', this.addCateForm)
				if (res.meta.status !== 201) return this.$message.error('添加分类失败')
				this.$message.success('添加分类成功')
				this.getCateList()
				this.addCateDialogVisible = false
			})
		
		},
		// 添加分类关闭的回调
		addCateDialogClosed () {
			this.$refs.addCateFormRef.resetFields()
			this.selectedKeys = []
			this.addCateForm.cat_pid = 0
			this.addCateForm.cat_level = 0
		}
	}
}
</script>

<style lang="less" scoped>
.treetable{
	margin-top: 15px;
}
.el-cascader{
	width: 100%;
}
</style>
