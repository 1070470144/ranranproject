<template>
	<view class="page">
		<view v-if="mode === 'list'" class="closet-page">
			<view class="sidebar">
				<view v-for="item in categories" :key="item" :class="['category-tab', activeCategory === item ? 'active' : '']" @tap="activeCategory = item">
					<text>{{ item }}</text>
				</view>
				<view class="category-add" @tap="showCategoryTip">
					<text class="category-plus">＋</text>
					<text class="category-add-text">新增类型</text>
				</view>
			</view>

			<view class="content">
				<view class="head-row">
					<view>
						<text class="page-desc">{{ activeCategory }} · {{ filteredList.length }}件</text>
					</view>
					<view class="add-button" @tap="startCreate">＋</view>
				</view>

				<view v-if="!filteredList.length" class="empty-state">
					<view class="empty-icon">衣</view>
					<text class="empty-title">这个类型还没有裙子</text>
					<text class="empty-desc">点击右上角新增一件。</text>
				</view>

				<view v-else class="item-grid">
					<view v-for="item in filteredList" :key="item.id" class="closet-card" @tap="openDetail(item)">
						<image v-if="getCover(item)" class="closet-cover" :src="getCover(item)" mode="aspectFill"></image>
						<view v-else class="closet-cover empty-cover">衣</view>
						<view class="status-pill">{{ item.category || '未分类' }}</view>
						<view class="card-info">
							<text class="item-name">{{ item.name }}</text>
							<text class="item-price">{{ formatPrice(item.price) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view v-else-if="mode === 'detail'" class="detail-page">
			<view class="detail-card">
				<view class="detail-head">
					<view class="detail-main">
						<text class="detail-title">{{ currentItem.name }}</text>
						<text class="detail-price">{{ formatPrice(currentItem.price) }}</text>
					</view>
					<text v-if="!sharedItemId" class="edit-action" @tap="startEdit(currentItem)">编辑</text>
				</view>
				<view class="detail-info">
					<view class="info-row">
						<text class="info-label">类型：</text>
						<text class="info-value">{{ currentItem.category || '未填写' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">品牌：</text>
						<text class="info-value">{{ currentItem.brand || '未填写' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">尺码：</text>
						<text class="info-value">{{ currentItem.size || '未填写' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">颜色：</text>
						<text class="info-value">{{ currentItem.color || '未填写' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">价格：</text>
						<text class="info-value">{{ formatPrice(currentItem.price) }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">入手日期：</text>
						<text class="info-value">{{ currentItem.buyDate || '未填写' }}</text>
					</view>
					<view class="info-row note-row">
						<text class="info-label">备注：</text>
						<text class="info-value">{{ currentItem.note || '未填写' }}</text>
					</view>
				</view>
			</view>

			<view class="image-section">
				<view class="section-head">
					<text class="star">★</text>
					<text class="section-title">原图</text>
				</view>
				<view v-if="currentItem.originalImages && currentItem.originalImages.length" class="image-grid">
					<image v-for="(item, index) in currentItem.originalImages" :key="item" class="detail-image" :src="item" mode="aspectFill" @tap="previewImages(currentItem.originalImages, index)"></image>
				</view>
				<view v-else class="image-empty">还没有原图</view>
			</view>

			<view class="image-section">
				<view class="section-head">
					<text class="star">★</text>
					<text class="section-title">实拍图</text>
				</view>
				<view v-if="currentItem.wearImages && currentItem.wearImages.length" class="image-grid">
					<image v-for="(item, index) in currentItem.wearImages" :key="item" class="detail-image" :src="item" mode="aspectFill" @tap="previewImages(currentItem.wearImages, index)"></image>
				</view>
				<view v-else class="image-empty">还没有实拍图</view>
			</view>
		</view>

		<view v-else class="edit-page">
			<view class="form-card">
				<view class="form-head">
					<text class="form-title">{{ mode === 'create' ? '新增裙子' : '编辑裙子' }}</text>
					<text class="cancel-action" @tap="cancelEdit">取消</text>
				</view>
				<input class="input" v-model="form.name" placeholder="裙子名称" placeholder-class="placeholder" />
				<view class="grid">
					<input class="input" v-model="form.category" placeholder="类型，如连衣裙" placeholder-class="placeholder" />
					<input class="input" v-model="form.size" placeholder="尺码，如 S / M" placeholder-class="placeholder" />
				</view>
				<view class="grid">
					<input class="input" v-model="form.color" placeholder="颜色" placeholder-class="placeholder" />
					<input class="input" v-model="form.brand" placeholder="品牌" placeholder-class="placeholder" />
				</view>
				<input class="input" v-model="form.price" type="digit" placeholder="价格" placeholder-class="placeholder" />
				<picker mode="date" :value="form.buyDate" @change="onBuyDateChange">
					<view class="date-row">
						<text>入手日期</text>
						<text>{{ form.buyDate || '请选择' }}</text>
					</view>
				</picker>
				<textarea class="textarea" v-model="form.note" placeholder="备注，比如购买渠道、搭配想法" placeholder-class="placeholder" />

				<view class="upload-block">
					<view class="upload-head">
						<text class="upload-title">原图</text>
						<text class="upload-action" @tap="chooseImages('original')">添加</text>
					</view>
					<view class="image-row">
						<view v-for="(item, index) in form.originalImages" :key="item" class="edit-image-wrap">
							<image class="preview" :src="item" mode="aspectFill" @tap="previewImages(form.originalImages, index)"></image>
							<view class="remove-image" @tap.stop="removeImage('original', index)">×</view>
						</view>
					</view>
				</view>

				<view class="upload-block">
					<view class="upload-head">
						<text class="upload-title">实拍图</text>
						<text class="upload-action" @tap="chooseImages('wear')">添加</text>
					</view>
					<view class="image-row">
						<view v-for="(item, index) in form.wearImages" :key="item" class="edit-image-wrap">
							<image class="preview" :src="item" mode="aspectFill" @tap="previewImages(form.wearImages, index)"></image>
							<view class="remove-image" @tap.stop="removeImage('wear', index)">×</view>
						</view>
					</view>
				</view>

				<view class="button-row">
					<button v-if="mode === 'edit'" class="danger-button" @tap="deleteItem(currentItem)">删除</button>
					<button class="save-button" :loading="saving" :disabled="saving" @tap="saveItem">保存</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const lifeData = uniCloud.importObject('life-data')

	export default {
		data() {
			return {
				openId: '',
				saving: false,
				mode: 'list',
				wardrobeName: '我的衣柜',
				sharedItemId: '',
				activeCategory: '全部',
				currentItem: null,
				list: [],
				form: this.createEmptyForm()
			}
		},
		computed: {
			categories() {
				const names = this.list.map((item) => item.category).filter(Boolean)
				return ['全部', ...Array.from(new Set(names))]
			},
			filteredList() {
				if (this.activeCategory === '全部') return this.list
				return this.list.filter((item) => item.category === this.activeCategory)
			}
		},
		onLoad(options = {}) {
			this.sharedItemId = options.id || ''
		},
		onShow() {
			this.init()
		},
		onBackPress() {
			if (this.sharedItemId) return false
			if (this.mode !== 'list') {
				this.backToList()
				return true
			}
			return false
		},
		onShareAppMessage() {
			const item = this.currentItem
			if (this.mode === 'detail' && item) {
				return {
					title: `${this.wardrobeName}：${item.name || '裙子详情'}`,
					path: `/pages/wardrobe/wardrobe?id=${item.id}`,
					imageUrl: this.getCover(item) || ''
				}
			}
			return {
				title: this.wardrobeName || '我的衣柜',
				path: '/pages/wardrobe/wardrobe'
			}
		},
		methods: {
			createEmptyForm() {
				return {
					name: '',
					category: '',
					size: '',
					color: '',
					brand: '',
					price: '',
					buyDate: '',
					note: '',
					originalImages: [],
					wearImages: []
				}
			},
			init() {
				const profile = uni.getStorageSync('wxUserProfile') || {}
				this.openId = profile.openId || ''
				this.wardrobeName = profile.wardrobeName || '我的衣柜'
				this.updateNavigationTitle()
				this.enableShareMenu()
				if (this.sharedItemId) {
					this.loadSharedItem()
					return
				}
				if (!this.openId) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					setTimeout(() => uni.navigateBack(), 600)
					return
				}
				this.loadList()
			},
			async loadSharedItem() {
				const res = await lifeData.getWardrobeItem({ id: this.sharedItemId })
				if (res.errCode) {
					uni.showToast({ title: res.errMsg || '获取失败', icon: 'none' })
					return
				}
				this.currentItem = res.item
				this.mode = 'detail'
				this.updateNavigationTitle()
			},
			async loadList() {
				const res = await lifeData.listWardrobe({ openId: this.openId })
				if (res.errCode) {
					uni.showToast({ title: res.errMsg || '获取失败', icon: 'none' })
					return
				}
				this.list = res.list || []
				if (!this.categories.includes(this.activeCategory)) {
					this.activeCategory = '全部'
				}
				if (this.currentItem) {
					const latest = this.list.find((item) => item.id === this.currentItem.id)
					if (latest) this.currentItem = latest
				}
			},
			startCreate() {
				this.mode = 'create'
				this.updateNavigationTitle('新增裙子')
				this.currentItem = null
				this.form = this.createEmptyForm()
				if (this.activeCategory !== '全部') this.form.category = this.activeCategory
			},
			openDetail(item) {
				this.currentItem = item
				this.mode = 'detail'
				this.updateNavigationTitle()
			},
			startEdit(item) {
				if (!item) return
				this.currentItem = item
				this.mode = 'edit'
				this.updateNavigationTitle('编辑裙子')
				this.form = {
					name: item.name || '',
					category: item.category || '',
					size: item.size || '',
					color: item.color || '',
					brand: item.brand || '',
					price: item.price || '',
					buyDate: item.buyDate || '',
					note: item.note || '',
					originalImages: (item.originalImages || []).slice(),
					wearImages: (item.wearImages || []).slice()
				}
			},
			backToList() {
				this.mode = 'list'
				this.currentItem = null
				this.updateNavigationTitle()
			},
			cancelEdit() {
				this.mode = this.currentItem ? 'detail' : 'list'
				this.updateNavigationTitle()
			},
			onBuyDateChange(event) {
				this.form.buyDate = event.detail.value
			},
			chooseImages(type) {
				uni.chooseImage({
					count: 6,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (type === 'original') {
							this.form.originalImages = this.form.originalImages.concat(res.tempFilePaths)
						} else {
							this.form.wearImages = this.form.wearImages.concat(res.tempFilePaths)
						}
					}
				})
			},
			removeImage(type, index) {
				const key = type === 'original' ? 'originalImages' : 'wearImages'
				this.form[key].splice(index, 1)
			},
			async uploadImages(paths, folder) {
				const fileIDs = []
				for (let i = 0; i < paths.length; i++) {
					const path = paths[i]
					if (path.indexOf('cloud://') === 0 || path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
						fileIDs.push(path)
						continue
					}
					const suffix = path.split('.').pop() || 'jpg'
					const res = await uniCloud.uploadFile({
						filePath: path,
						cloudPath: `${folder}/${this.openId}_${Date.now()}_${i}.${suffix}`
					})
					fileIDs.push(res.fileID)
				}
				return fileIDs
			},
			async saveItem() {
				if (!this.form.name) {
					uni.showToast({ title: '请输入裙子名称', icon: 'none' })
					return
				}

				this.saving = true
				try {
					const originalImages = await this.uploadImages(this.form.originalImages, 'wardrobe/original')
					const wearImages = await this.uploadImages(this.form.wearImages, 'wardrobe/wear')
					const payload = {
						openId: this.openId,
						...this.form,
						originalImages,
						wearImages
					}
					const res = this.mode === 'edit'
						? await lifeData.updateWardrobeItem({ ...payload, id: this.currentItem.id })
						: await lifeData.addWardrobeItem(payload)
					if (res.errCode) throw new Error(res.errMsg || '保存失败')
					uni.showToast({ title: '保存成功', icon: 'success' })
					await this.loadList()
					if (this.mode === 'edit') {
						this.currentItem = this.list.find((item) => item.id === this.currentItem.id) || this.currentItem
						this.mode = 'detail'
						this.updateNavigationTitle()
					} else {
						this.activeCategory = this.form.category || '全部'
						this.mode = 'list'
						this.updateNavigationTitle()
					}
				} catch (err) {
					uni.showToast({ title: err.message || '保存失败', icon: 'none' })
				} finally {
					this.saving = false
				}
			},
			deleteItem(item) {
				if (!item) return
				uni.showModal({
					title: '删除衣服',
					content: '确定删除这条衣柜记录吗？',
					success: async (res) => {
						if (!res.confirm) return
						const delRes = await lifeData.deleteWardrobeItem({ openId: this.openId, id: item.id })
						if (delRes.errCode) {
							uni.showToast({ title: delRes.errMsg || '删除失败', icon: 'none' })
							return
						}
						uni.showToast({ title: '已删除', icon: 'success' })
						this.currentItem = null
						this.mode = 'list'
						this.loadList()
					}
				})
			},
			previewImages(urls, index) {
				uni.previewImage({ urls, current: urls[index] })
			},
			showCategoryTip() {
				uni.showToast({ title: '新增时填写新的类型即可扩展', icon: 'none' })
			},
			updateNavigationTitle(title) {
				uni.setNavigationBarTitle({ title: title || this.wardrobeName || '我的衣柜' })
			},
			enableShareMenu() {
				// #ifdef MP-WEIXIN
				uni.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage'] })
				// #endif
			},
			getCover(item) {
				return (item.originalImages && item.originalImages[0]) || (item.wearImages && item.wearImages[0]) || ''
			},
			formatPrice(price) {
				return price ? `¥${price}` : '未设置价格'
			}
		}
	}
</script>

<style>
	page {
		background: #f4f5f7;
	}

	.page {
		min-height: 100vh;
		background: #ffffff;
		color: #20232b;
	}

	.closet-page {
		min-height: 100vh;
		display: flex;
		background: #ffffff;
	}

	.sidebar {
		width: 150rpx;
		min-height: 100vh;
		padding-top: 28rpx;
		box-sizing: border-box;
		background: #f7f8fb;
		box-shadow: 10rpx 0 24rpx rgba(120, 128, 140, 0.05);
	}

	.category-tab {
		position: relative;
		height: 84rpx;
		padding-left: 22rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		font-size: 25rpx;
		font-weight: 800;
		color: #7d8490;
	}

	.category-tab.active {
		background: #ffffff;
		color: #ff7fa6;
	}

	.category-tab.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 28rpx;
		width: 6rpx;
		height: 28rpx;
		border-radius: 999rpx;
		background: #ff7fa6;
	}

	.category-add {
		margin-top: 36rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #a2a6ad;
	}

	.category-plus {
		width: 30rpx;
		height: 30rpx;
		border: 2rpx solid #a2a6ad;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		line-height: 1;
	}

	.category-add-text {
		margin-top: 8rpx;
		font-size: 18rpx;
		font-weight: 700;
	}

	.content {
		flex: 1;
		min-width: 0;
		padding: 30rpx 28rpx 50rpx;
		box-sizing: border-box;
	}

	.head-row,
	.detail-head,
	.form-head,
	.section-head,
	.upload-head,
	.date-row,
	.button-row {
		display: flex;
		align-items: center;
	}

	.head-row,
	.detail-head,
	.form-head,
	.upload-head,
	.date-row {
		justify-content: space-between;
	}

	.page-title,
	.page-desc,
	.item-name,
	.item-price,
	.form-title,
	.detail-title,
	.detail-price,
	.section-title,
	.empty-title,
	.empty-desc,
	.upload-title {
		display: block;
	}

	.page-title {
		font-size: 34rpx;
		line-height: 42rpx;
		font-weight: 900;
		color: #20232b;
	}

	.page-desc {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #a2a6ad;
	}

	.add-button,
	.empty-icon,
	.remove-image {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-button {
		width: 62rpx;
		height: 62rpx;
		border-radius: 50%;
		background: #fff2f8;
		font-size: 38rpx;
		line-height: 1;
		font-weight: 300;
		color: #ff7fa6;
	}

	.item-grid {
		margin-top: 28rpx;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 22rpx;
	}

	.closet-card {
		position: relative;
		height: 336rpx;
		border-radius: 18rpx;
		background: #ffffff;
		box-shadow: 0 12rpx 26rpx rgba(222, 158, 176, 0.13);
		overflow: hidden;
	}

	.closet-cover {
		width: 100%;
		height: 236rpx;
		background: #fff2f8;
	}

	.empty-cover {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 42rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.status-pill {
		position: absolute;
		top: 14rpx;
		right: 14rpx;
		max-width: 112rpx;
		padding: 5rpx 12rpx;
		border-radius: 999rpx;
		background: rgba(32, 35, 43, 0.42);
		font-size: 18rpx;
		font-weight: 800;
		color: #ffffff;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-info {
		height: 100rpx;
		padding: 14rpx 16rpx 16rpx;
		box-sizing: border-box;
	}

	.item-name {
		font-size: 25rpx;
		line-height: 32rpx;
		font-weight: 900;
		color: #20232b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-price {
		margin-top: 6rpx;
		font-size: 22rpx;
		line-height: 28rpx;
		font-weight: 900;
		color: #ff7fa6;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty-state {
		padding: 120rpx 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.empty-icon {
		width: 82rpx;
		height: 82rpx;
		border-radius: 50%;
		background: #fff2f8;
		font-size: 28rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.empty-title {
		margin-top: 24rpx;
		font-size: 28rpx;
		font-weight: 900;
	}

	.empty-desc {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #9b8f96;
	}

	.detail-page,
	.edit-page {
		min-height: 100vh;
		padding: 34rpx 34rpx 56rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, #fff4f8 0%, #f6f3f4 54%, #eeeeee 100%);
	}

	.edit-action {
		width: 82rpx;
		text-align: right;
		font-size: 26rpx;
		font-weight: 900;
		color: #ff7fa6;
		flex-shrink: 0;
	}

	.detail-card,
	.image-section,
	.form-card {
		margin-top: 0;
		border-radius: 24rpx;
		background: #ffffff;
		box-shadow: 0 16rpx 34rpx rgba(222, 158, 176, 0.14);
	}

	.detail-card {
		padding: 30rpx;
	}

	.image-section,
	.form-card {
		margin-top: 24rpx;
	}

	.detail-main {
		flex: 1;
		min-width: 0;
	}

	.form-title {
		font-size: 30rpx;
		line-height: 38rpx;
		font-weight: 900;
		color: #20232b;
	}

	.cancel-action {
		font-size: 26rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.detail-title {
		font-size: 36rpx;
		line-height: 44rpx;
		font-weight: 900;
	}

	.detail-price {
		margin-top: 14rpx;
		font-size: 30rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.detail-info {
		margin-top: 24rpx;
		padding: 18rpx 20rpx;
		border-radius: 18rpx;
		background: #fff7fb;
	}

	.info-row {
		min-height: 46rpx;
		display: flex;
		align-items: flex-start;
		font-size: 25rpx;
		line-height: 34rpx;
	}

	.info-row + .info-row {
		margin-top: 10rpx;
	}

	.info-label {
		width: 132rpx;
		flex-shrink: 0;
		font-weight: 900;
		color: #b15b84;
	}

	.info-value {
		flex: 1;
		min-width: 0;
		font-weight: 800;
		color: #20232b;
		word-break: break-all;
	}

	.note-row .info-value {
		line-height: 36rpx;
	}

	.image-section,
	.form-card {
		padding: 28rpx 26rpx;
	}

	.section-head {
		margin-bottom: 18rpx;
	}

	.star {
		margin-right: 10rpx;
		font-size: 26rpx;
		color: #ff7fa6;
	}

	.section-title {
		font-size: 27rpx;
		line-height: 34rpx;
		font-weight: 900;
	}

	.image-grid,
	.image-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.detail-image,
	.preview {
		width: 150rpx;
		height: 150rpx;
		border-radius: 16rpx;
		background: #fff2f8;
	}

	.image-empty {
		padding: 28rpx 0 8rpx;
		font-size: 24rpx;
		color: #9b8f96;
	}

	.input,
	.textarea {
		width: 100%;
		box-sizing: border-box;
		margin-top: 18rpx;
		padding: 22rpx 24rpx;
		border-radius: 16rpx;
		background: #fff7fb;
		font-size: 26rpx;
		color: #20232b;
	}

	.input {
		height: 88rpx;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18rpx;
	}

	.textarea {
		height: 150rpx;
	}

	.placeholder {
		color: #b8c0cc;
	}

	.date-row {
		min-height: 92rpx;
		border-bottom: 1rpx solid #f1e7ed;
		font-size: 26rpx;
		font-weight: 800;
		color: #20232b;
	}

	.upload-block {
		margin-top: 28rpx;
	}

	.upload-title {
		font-size: 27rpx;
		font-weight: 900;
	}

	.upload-action {
		font-size: 25rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.image-row {
		margin-top: 16rpx;
	}

	.edit-image-wrap {
		position: relative;
	}

	.remove-image {
		position: absolute;
		right: -10rpx;
		top: -10rpx;
		width: 34rpx;
		height: 34rpx;
		border-radius: 50%;
		background: #ff7fa6;
		font-size: 28rpx;
		line-height: 1;
		color: #ffffff;
	}

	.button-row {
		margin-top: 30rpx;
		gap: 18rpx;
	}

	.danger-button,
	.save-button {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 999rpx;
		font-size: 29rpx;
		font-weight: 900;
	}

	.danger-button {
		background: #fff2f8;
		color: #b15b84;
	}

	.save-button {
		background: #ff7fa6;
		box-shadow: 0 12rpx 24rpx rgba(255, 127, 166, 0.22);
		color: #ffffff;
	}

	.danger-button::after,
	.save-button::after {
		border: none;
	}

	@media screen and (max-width: 360px) {
		.item-grid {
			gap: 18rpx;
		}

		.closet-card {
			height: 312rpx;
		}

		.closet-cover {
			height: 214rpx;
		}
	}
</style>
