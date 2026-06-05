<template>
	<view class="page">
		<view class="profile">
			<image v-if="avatarUrl" class="avatar" :src="avatarUrl" mode="aspectFill"></image>
			<view v-else class="avatar empty">头像</view>
			<text class="title">个人资料</text>
			<text class="sub-title">设置头像和修改名称</text>
		</view>

		<view class="section">
			<text class="section-title">头像</text>
			<button class="action-row" open-type="chooseAvatar" @chooseavatar="onChooseWeixinAvatar">
				<view class="action-icon">微</view>
				<view class="action-main">
					<text class="action-title">选择微信头像</text>
					<text class="action-desc">使用微信资料中的头像</text>
				</view>
				<text class="arrow">›</text>
			</button>

			<view class="action-row" @tap="chooseLocalAvatar">
				<view class="action-icon">图</view>
				<view class="action-main">
					<text class="action-title">自己上传头像</text>
					<text class="action-desc">从相册选择一张图片</text>
				</view>
				<text class="arrow">›</text>
			</view>
		</view>

		<view class="section">
			<text class="section-title">名称</text>
			<view class="field">
				<text class="field-label">名字</text>
				<input class="field-input" type="nickname" v-model="form.nickname" placeholder="请输入名字" placeholder-class="placeholder" />
			</view>
		</view>

		<button class="save-button" :loading="saveLoading" :disabled="saveLoading" @tap="saveProfile">
			保存
		</button>
	</view>
</template>

<script>
	const wxUser = uniCloud.importObject('wx-user')

	export default {
		data() {
			return {
				openId: '',
				avatarUrl: '',
				tempAvatarPath: '',
				saveLoading: false,
				form: {
					nickname: ''
				}
			}
		},
		onLoad() {
			this.loadLocalProfile()
		},
		methods: {
			loadLocalProfile() {
				const profile = uni.getStorageSync('wxUserProfile') || {}
				if (!profile.openId) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					setTimeout(() => uni.navigateBack(), 600)
					return
				}
				this.openId = profile.openId || ''
				this.avatarUrl = profile.avatarUrl || ''
				this.form.nickname = profile.nickname || ''
			},
			saveLocalProfile(profile) {
				uni.setStorageSync('wxUserProfile', profile)
				this.openId = profile.openId || ''
				this.avatarUrl = profile.avatarUrl || ''
				this.form.nickname = profile.nickname || ''
			},
			onChooseWeixinAvatar(event) {
				const avatarUrl = event.detail.avatarUrl
				this.tempAvatarPath = avatarUrl
				this.avatarUrl = avatarUrl
			},
			chooseLocalAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const avatarUrl = res.tempFilePaths[0]
						this.tempAvatarPath = avatarUrl
						this.avatarUrl = avatarUrl
					},
					fail: (err) => {
						if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) {
							return
						}
						this.showError(err)
					}
				})
			},
			async uploadAvatarIfNeeded() {
				if (!this.tempAvatarPath) {
					return this.avatarUrl
				}

				const suffix = this.tempAvatarPath.split('.').pop() || 'png'
				const cloudPath = `avatars/${this.openId}_${Date.now()}.${suffix}`
				const res = await uniCloud.uploadFile({
					filePath: this.tempAvatarPath,
					cloudPath
				})
				this.tempAvatarPath = ''
				return res.fileID
			},
			async saveProfile() {
				if (!this.openId) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					return
				}

				this.saveLoading = true
				try {
					const avatarUrl = await this.uploadAvatarIfNeeded()
					const res = await wxUser.updateProfile({
						openId: this.openId,
						nickname: this.form.nickname,
						avatarUrl
					})
					if (res.errCode) {
						throw new Error(res.errMsg || '保存失败')
					}
					this.saveLocalProfile(res.userInfo)
					uni.showToast({ title: '保存成功', icon: 'success' })
					setTimeout(() => uni.navigateBack(), 600)
				} catch (err) {
					this.showError(err)
				} finally {
					this.saveLoading = false
				}
			},
			showError(err) {
				uni.showToast({
					title: err && err.message ? err.message : '操作失败',
					icon: 'none'
				})
			}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		padding: 48rpx 44rpx;
		box-sizing: border-box;
		background: #ffffff;
	}

	.profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 36rpx 0 48rpx;
	}

	.avatar {
		width: 148rpx;
		height: 148rpx;
		border-radius: 18rpx;
		background: #fff2f8;
		border: 1rpx solid #ffd9e9;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 800;
		color: #ff5fa2;
	}

	.title,
	.sub-title,
	.section-title,
	.action-title,
	.action-desc,
	.field-label {
		display: block;
	}

	.title {
		margin-top: 28rpx;
		font-size: 40rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.sub-title {
		margin-top: 10rpx;
		font-size: 26rpx;
		color: #7a8699;
	}

	.section {
		margin-top: 18rpx;
	}

	.section-title {
		margin-bottom: 14rpx;
		font-size: 28rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.action-row {
		display: flex;
		align-items: center;
		min-height: 108rpx;
		padding: 0;
		margin: 0;
		background: #ffffff;
		border-bottom: 1rpx solid #eef1f4;
		border-radius: 0;
		text-align: left;
	}

	.action-row::after {
		border: none;
	}

	.action-icon {
		width: 52rpx;
		height: 52rpx;
		border-radius: 8rpx;
		background: #fff2f8;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 800;
		color: #ff5fa2;
	}

	.action-main {
		flex: 1;
		min-width: 0;
		margin-left: 26rpx;
	}

	.action-title {
		font-size: 32rpx;
		font-weight: 800;
		line-height: 1.25;
		color: #0f172a;
	}

	.action-desc {
		margin-top: 8rpx;
		font-size: 26rpx;
		line-height: 1.3;
		color: #7a8699;
	}

	.arrow {
		margin-left: 18rpx;
		font-size: 40rpx;
		line-height: 1;
		color: #cbd2dc;
	}

	.field {
		display: flex;
		align-items: center;
		height: 96rpx;
		border-bottom: 1rpx solid #eef1f4;
	}

	.field-label {
		width: 100rpx;
		font-size: 28rpx;
		font-weight: 700;
		color: #0f172a;
	}

	.field-input {
		flex: 1;
		height: 72rpx;
		font-size: 28rpx;
		color: #0f172a;
	}

	.placeholder {
		color: #b8c0cc;
	}

	.save-button {
		height: 92rpx;
		line-height: 92rpx;
		border-radius: 8rpx;
		font-size: 30rpx;
		font-weight: 800;
		margin-top: 56rpx;
		background: #ff5fa2;
		color: #ffffff;
	}

	.save-button::after {
		border: none;
	}

	.save-button[disabled] {
		background: #f3d6e3;
		color: #ffffff;
	}
</style>
