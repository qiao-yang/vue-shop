<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 搜索、添加 -->
			<el-row :gutter="20">
				<el-col :span="7">
					<el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getGoodsList">
						<el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="goAddPage">添加商品</el-button>
				</el-col>
			</el-row>
			<!-- 商品列表 -->
			<el-table :data="goods_list" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="商品名称" prop="goods_name"></el-table-column>
				<el-table-column label="商品价格(元)" prop="goods_price" width="90px"></el-table-column>
				<el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
				<el-table-column label="创建时间" prop="add_time" width="140px">
					<template slot-scope="scope">
						{{scope.row.add_time | dateFormat}}
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200px">
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoods(scope.row.goods_id)">编辑</el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>
		</el-card> 
		<!-- 编辑商品对话框 -->
		<el-dialog title="编辑商品" :visible.sync="editGoodsDialogVisible" width="50%" @close="editGoodsDialogClosed">
  		<el-form :model="editGoodsInfo" :rules="editGoodsInfoRules" ref="editGoodsFormRef" label-width="100px">
				<div class="sub-title">基本信息</div>
				<el-form-item label="商品名称" prop="goods_name">
					<el-input v-model="editGoodsInfo.goods_name"></el-input>
				</el-form-item>
				<el-form-item label="商品价格" prop="goods_price">
					<el-input v-model="editGoodsInfo.goods_price"></el-input>
				</el-form-item>
				<el-form-item label="商品重量" prop="goods_weight">
					<el-input v-model="editGoodsInfo.goods_weight"></el-input>
				</el-form-item>
				<el-form-item label="商品数量" prop="goods_number">
					<el-input v-model="editGoodsInfo.goods_number"></el-input>
				</el-form-item>
				<div class="sub-title">商品图片</div>
				<!-- 上传组件 -->
				<el-upload :action="uploadUrl" :file-list="editGoodsInfo.pics" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headObj" :on-success="handleSuccess">
					<el-button size="small" type="primary">点击上传</el-button>
				</el-upload>
  		</el-form>
  		<span slot="footer" class="dialog-footer">
				<el-button @click="editGoodsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editGoodsBtn">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				queryInfo: {
					query: '',
					pagenum: 1,
					pagesize: 10
				},
				goods_list: [],
				total: 0,
				// 编辑商品
				editGoodsDialogVisible: false,
				editGoodsInfo: {},
				editGoodsInfoRules: {
					goods_name: [
						{ required: true, message: '请输入商品名称', trigger: 'blur' }
					],
					goods_price: [
						{ required: true, message: '请输入商品价格', trigger: 'blur' }
					],
					goods_weight: [
						{ required: true, message: '请输入商品重量', trigger: 'blur' }
					],
					goods_number: [
						{ required: true, message: '请输入商品数量', trigger: 'blur' }
					]
				},
				uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
				headObj: {
					Authorization: window.sessionStorage.getItem('token')
				},
				previewPath: '',
				previewVisible: false
			}
		},
		created () {
			this.getGoodsList()
		},
		methods: {
			// 获取商品列表
			async getGoodsList () {
				const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
				if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
				this.goods_list = res.data.goods
				this.total = res.data.total
			},
			// 监听页码和每页显示个数变化
			handleSizeChange (newSize) {
				this.queryInfo.pagesize = newSize
				this.getGoodsList()
			},
			handleCurrentChange (newPage) {
				this.queryInfo.pagenum = newPage
				this.getGoodsList()
			},
			// 删除商品
			async removeById (id) {
				const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				// 点击确认按钮，返回字符串 confirm
				// 点击取消按钮，返回字符串 cancel
				if (confirmResult !== 'confirm') return this.$message.info('已取消了删除')
				const { data: res } = await this.$http.delete('goods/' + id)
				if (res.meta.status !== 200) return this.$message.error('删除商品失败')
				this.$message.success('删除商品成功')
				this.getGoodsList()
			},
			// 跳转到添加商品页面
			goAddPage () {
				this.$router.push('/goods/add')
			},
			// 编辑商品
			async editGoods (id) {
				const { data: res } = await this.$http.get('goods/' + id)
				if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
				
				res.data.pics.forEach(item => {
					item.url = item.pics_mid_url
				})
				res.data.pics.forEach(item => {
					item.name = item.pics_id + '.jpg'
				})
				console.log(res)
				this.editGoodsInfo = res.data
				this.editGoodsDialogVisible = true
			},
			editGoodsBtn () {

			},
			editGoodsDialogClosed () {
				
			},
				// 点击预览触发
			handlePreview (file) {
				this.previewPath = file.response.data.url
				this.previewVisible = true
			},
			// 点击删除触发
			handleRemove (file) {
				// 1.接收到临时路径
				const filePath = file.response.data.tmp_path
				// 2.在pic数组中找到对应的索引值
				const i = this.addForm.pics.findIndex(x => x.pic === filePath)
				// 3.用splice删除
				this.editGoodsInfo.pics.splice(i, 1)
			},
			// 监听图片上传成功
			handleSuccess (response) {
				if(response.meta.status !== 200) return this.$message.error(response.meta.msg)
				const picInfo = { pic: response.data.tmp_path }
				this.addForm.pics.push(picInfo)
				this.$message.success('上传成功')
			}
		}
	}
</script>

<style lang="less" scoped>

</style>
