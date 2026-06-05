<template>
	<view class="page">
		<view class="account">
			<image v-if="avatarUrl" class="avatar" :src="avatarUrl" mode="aspectFill"></image>
			<view v-else class="avatar empty">{{ isLogin ? '微' : '游' }}</view>

			<view class="account-main">
				<text class="name">{{ displayName }}</text>
				<text class="desc">{{ isLogin ? '当前账号已登录' : '点击登录账号' }}</text>
			</view>

			<button v-if="!isLogin" class="login-small" :loading="loginLoading" :disabled="loginLoading" @tap="loginWithWeixin">
				登录
			</button>
		</view>

		<text v-if="!isLogin" class="hint">登录后可同步头像和名称</text>

		<view class="divider"></view>

		<view class="group">
			<text class="group-title">常用功能</text>
			<view class="menu-item" @tap="goSettings">
				<view class="menu-icon">设</view>
				<view class="menu-main">
					<text class="menu-title">设置</text>
					<text class="menu-desc">设置头像和修改名称</text>
				</view>
				<text class="arrow">›</text>
			</view>
		</view>

		<button v-if="isLogin" class="logout" @tap="logout">退出登录</button>
		<text v-if="isLogin" class="logout-tip">退出后将清除当前登录状态</text>
	</view>
</template>

<script>
	const wxUser = uniCloud.importObject('wx-user')

	export default {
		data() {
			return {
				isLogin: false,
				openId: '',
				nickname: '',
				avatarUrl: '',
				loginLoading: false
			}
		},
		computed: {
			displayName() {
				if (!this.isLogin) {
					return '游客用户'
				}
				return this.nickname || '微信用户'
			}
		},
		onShow() {
			this.loadLocalProfile()
		},
		methods: {
			loadLocalProfile() {
				const profile = uni.getStorageSync('wxUserProfile') || {}
				this.isLogin = Boolean(profile.openId)
				this.openId = profile.openId || ''
				this.nickname = profile.nickname || ''
				this.avatarUrl = profile.avatarUrl || ''
			},
			saveLocalProfile(profile) {
				uni.setStorageSync('wxUserProfile', profile)
				this.isLogin = Boolean(profile.openId)
				this.openId = profile.openId || ''
				this.nickname = profile.nickname || ''
				this.avatarUrl = profile.avatarUrl || ''
			},
			loginWithWeixin() {
				this.loginLoading = true
				uni.login({
					provider: 'weixin',
					success: async (loginRes) => {
						try {
							const res = await wxUser.loginByWeixin({ code: loginRes.code })
							if (res.errCode) {
								throw new Error(res.errMsg || '登录失败')
							}
							this.saveLocalProfile(res.userInfo)
							uni.showToast({ title: '登录成功', icon: 'success' })
						} catch (err) {
							this.showError(err)
						} finally {
							this.loginLoading = false
						}
					},
					fail: (err) => {
						this.loginLoading = false
						this.showError(err)
					}
				})
			},
			goSettings() {
				if (!this.isLogin) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					return
				}
				uni.navigateTo({ url: '/pages/mine/settings' })
			},
			logout() {
				uni.removeStorageSync('wxUserProfile')
				this.isLogin = false
				this.openId = ''
				this.nickname = ''
				this.avatarUrl = ''
				uni.showToast({ title: '已退出登录', icon: 'none' })
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
		padding: 56rpx 44rpx 44rpx;
		box-sizing: border-box;
		background: #ffffff;
	}

	.account {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 112rpx;
		height: 112rpx;
		border-radius: 10rpx;
		background: #fff2f8;
		border: 1rpx solid #ffd9e9;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		font-weight: 800;
		color: #ff5fa2;
	}

	.account-main {
		flex: 1;
		min-width: 0;
		margin-left: 28rpx;
	}

	.name,
	.desc,
	.hint,
	.group-title,
	.menu-title,
	.menu-desc,
	.logout-tip {
		display: block;
	}

	.name {
		font-size: 38rpx;
		font-weight: 800;
		line-height: 1.25;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.desc {
		margin-top: 8rpx;
		font-size: 26rpx;
		line-height: 1.35;
		color: #7a8699;
	}

	.login-small {
		width: 124rpx;
		height: 70rpx;
		line-height: 70rpx;
		padding: 0;
		margin: 0 0 0 18rpx;
		border-radius: 10rpx;
		background: #ff5fa2;
		color: #ffffff;
		font-size: 28rpx;
		font-weight: 700;
	}

	.login-small::after,
	.logout::after {
		border: none;
	}

	.hint {
		margin-top: 28rpx;
		font-size: 26rpx;
		line-height: 1.5;
		color: #7a8699;
	}

	.divider {
		height: 1rpx;
		margin: 48rpx 0 38rpx;
		background: #eceff3;
	}

	.group-title {
		margin-bottom: 18rpx;
		font-size: 28rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.menu-item {
		display: flex;
		align-items: center;
		min-height: 108rpx;
		border-bottom: 1rpx solid #eef1f4;
	}

	.menu-icon {
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

	.menu-main {
		flex: 1;
		min-width: 0;
		margin-left: 26rpx;
	}

	.menu-title {
		font-size: 32rpx;
		font-weight: 800;
		line-height: 1.25;
		color: #0f172a;
	}

	.menu-desc {
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

	.logout {
		height: 92rpx;
		line-height: 92rpx;
		border-radius: 8rpx;
		font-size: 30rpx;
		font-weight: 800;
		margin-top: 80rpx;
		background: #ffffff;
		color: #0f172a;
		border: 1rpx solid #d8dee8;
	}

	.logout-tip {
		margin-top: 18rpx;
		text-align: center;
		font-size: 26rpx;
		color: #9aa4b2;
	}
</style>
