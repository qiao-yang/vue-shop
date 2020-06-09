<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>添加商品</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片式图 -->
		<el-card>
			<el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
			<!-- 步骤条 -->
			<el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
				<el-step title="基本信息"></el-step>
				<el-step title="商品参数"></el-step>
				<el-step title="商品属性"></el-step>
				<el-step title="商品图片"></el-step>
				<el-step title="商品内容"></el-step>
				<el-step title="完成"></el-step>
			</el-steps>
			<!-- tab栏 -->
			<!-- el-tab-pane必须是el-tabs的子集，所以有表单验证，需要将el-form标签放在最外层包裹 -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
				<el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
					<el-tab-pane label="基本信息" name="0">
						<el-form-item label="商品分类" prop="goods_cat">
							<el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange" expand-trigger="hover"></el-cascader>
						</el-form-item>
						<el-form-item label="商品名称" prop="goods_name">
							<el-input v-model="addForm.goods_name"></el-input>
						</el-form-item>
						<el-form-item label="商品价格" prop="goods_price">
							<el-input v-model="addForm.goods_price" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品重量" prop="goods_weight">
							<el-input v-model="addForm.goods_weight" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品数量" prop="goods_number">
							<el-input v-model="addForm.goods_number" type="number"></el-input>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品参数" name="1">
						<!-- 渲染动态参数项 -->
						<el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
							<el-checkbox-group v-model="item.attr_vals">
								<el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品属性" name="2">
						<!-- 渲染静态属性项 -->
						<el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
							<el-input v-model="item.attr_vals[0]"></el-input>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品图片" name="3">
						<!-- 上传组件 -->
						<el-upload :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headObj" :on-success="handleSuccess">
							<el-button size="small" type="primary">点击上传</el-button>
						</el-upload>
					</el-tab-pane>
					<el-tab-pane label="商品内容" name="4">
						<!-- 富文本组件 -->
						<quill-editor v-model="addForm.goods_introduce"></quill-editor>
						<el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
					</el-tab-pane>
				</el-tabs>
			</el-form>
		</el-card>
		<el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
		<img class="preview_img" :src="previewPath" alt="">
	</el-dialog>
	</div>
</template>

<script>
import _ from 'lodash'
	export default {
		data () {
			return {
				// 当前选择的 tab项
				activeIndex: '0',
				// 添加商品的数据
				addForm: {
					goods_name: '',
					goods_price: 0,
					goods_weight: 0,
					goods_number: 0,
					goods_cat: [],
					pics: [],
					goods_introduce: '',
					attrs: []
				},
				// 添加商品的验证规则
				addFormRules: {
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
					],
					goods_cat: [
						{ required: true, message: '请选择商品分类', trigger: 'blur' }
					]
				},
				// 分类列表
				cateList: [],
				// 绑定分类列表的对象
				cateProps: {
					label: 'cat_name',
					value: 'cat_id',
					children: 'children',
					checkStrictly: false
				},
				// 动态参数列表
				manyTableData: [],
				onlyTableData: [],
				// 上传路径
				uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
				headObj: {
					Authorization: window.sessionStorage.getItem('token')
				},
				previewPath: '',
				previewVisible: false
			}
		},
		created () {
			this.getCateList()
		},
		methods: {
			async getCateList () {
				const { data: res } = await this.$http.get('categories')
				if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
				this.cateList = res.data
			},
			// 级联菜单发生改变
			handleChange () {
				if (this.addForm.goods_cat.length !== 3) {
					this.addForm.goods_cat = []
				}
			},
			// 监听标签页的切换
			beforeTabLeave (activeName, oldActiveName) {
				// 从基本信息页面切换到其他页面，需要在选择分类之后才能进行
				if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
					this.$message.error('请选择商品分类')
					return false
				}
			},
			async tabClicked () {
				// 证明进入动态参数tab页，进行动态参数的数据请求
				if (this.activeIndex === '1') {
					const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
					console.log(res)
					if(res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')
					res.data.forEach(item => {
						item.attr_vals = item.attr_vals.length === 0 ? '' : item.attr_vals.split(',')
					})
					this.manyTableData = res.data
				}else if (this.activeIndex === '2') {
					const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
					if(res.meta.status !== 200) return this.$message.error('获取静态属性列表失败')
					res.data.forEach(item => {
						item.attr_vals = item.attr_vals.length === 0 ? '' : item.attr_vals.split(',')
					})
					this.onlyTableData = res.data
				}
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
				this.addForm.pics.splice(i, 1)
			},
			// 监听图片上传成功
			handleSuccess (response) {
				if(response.meta.status !== 200) return this.$message.error(response.meta.msg)
				const picInfo = { pic: response.data.tmp_path }
				this.addForm.pics.push(picInfo)
				this.$message.success('上传成功')
			},
			// 添加商品
			addGoods () {
				console.log(this.addForm)
				
				this.$refs.addFormRef.validate(async valid => {
					if(!valid) return this.$message.error('请填写必要的表单项')
					// 添加的操作
					// 因为添加接口中，数据分类的要求是字符串形式，但是数据分类又和级联菜单绑定，所以不能直接转成字符串，需要将addForm进行深拷贝
					// 安装依赖 lodash 使用方法 cloneDeep()
					const addFormCopy = _.cloneDeep(this.addForm)
					addFormCopy.goods_cat = addFormCopy.goods_cat.join(',')
					// 处理动态属性和静态参数
					this.manyTableData.forEach(item => {
						const newInfo = {
							attr_id: item.attr_id,
							attr_value: item.attr_vals
						}
						this.addForm.attrs.push(newInfo)
					})
					this.onlyTableData.forEach(item => {
						const newInfo = {
							attr_id: item.attr_id,
							attr_value: item.attr_vals
						}
						this.addForm.attrs.push(newInfo)
					})
					addFormCopy.attrs = this.addForm.attrs
					//  发起添加商品的请求，商品名称必须唯一
					const { data: res } = await this.$http.post('goods', addFormCopy)
					console.log(res)
					
					if(res.meta.status !== 201) return this.$message.error('添加商品失败')
					this.$message.success('添加商品成功')
					this.$router.push('/goods')
				})
				
			}
		},
		computed: {
			// 计算分类Id
			cateId () {
				if (this.addForm.goods_cat.length === 3) {
					return this.addForm.goods_cat[2]
				}
				return null
			}
		}
	}
</script>

<style lang="less" scoped>
	.el-checkbox{
		margin: 0 10px 0 0 !important;
	}
	.preview_img{
		width: 100%;
	}
	.btnAdd{
		margin-top: 15px;
	}
</style>
