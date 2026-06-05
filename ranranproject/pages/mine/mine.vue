<template>
	<view class="page">
		<view class="profile-card" @tap="onProfileTap">
			<image v-if="avatarUrl" class="avatar" :src="avatarUrl" mode="aspectFill"></image>
			<view v-else class="avatar empty">{{ isLogin ? '微' : '游' }}</view>

			<view class="profile-main">
				<text class="name">{{ displayName }}</text>
				<text class="desc">{{ isLogin ? '进入设置完善个人资料' : '进入登录同步个人资料' }}</text>
			</view>

			<text class="arrow">›</text>
		</view>

		<text class="section-title">服务与设置</text>
		<view class="menu-card">
			<view class="menu-row last" @tap="goSettings">
				<view class="menu-icon pink">设</view>
				<text class="menu-title">个人设置</text>
				<text class="arrow small">›</text>
			</view>
		</view>

		<button v-if="isLogin" class="logout" @tap="logout">退出登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLogin: false,
				openId: '',
				nickname: '',
				avatarUrl: ''
			}
		},
		computed: {
			displayName() {
				if (!this.isLogin) return '游客用户'
				return this.nickname || '微信用户'
			}
		},
		onShow() {
			this.loadProfile()
		},
		methods: {
			loadProfile() {
				const profile = uni.getStorageSync('wxUserProfile') || {}
				this.isLogin = Boolean(profile.openId)
				this.openId = profile.openId || ''
				this.nickname = profile.nickname || ''
				this.avatarUrl = profile.avatarUrl || ''
			},
			onProfileTap() {
				if (this.isLogin) {
					uni.navigateTo({ url: '/pages/mine/settings' })
					return
				}
				uni.navigateTo({ url: '/pages/mine/login' })
			},
			goSettings() {
				if (!this.isLogin) {
					uni.navigateTo({ url: '/pages/mine/login' })
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
			}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		padding: 40rpx 20rpx 56rpx;
		box-sizing: border-box;
		background: #f3f3f3;
	}

	.profile-card,
	.menu-card {
		background: #ffffff;
		box-shadow: 0 12rpx 30rpx rgba(20, 24, 31, 0.04);
	}

	.profile-card {
		min-height: 168rpx;
		padding: 28rpx 30rpx;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.avatar {
		width: 92rpx;
		height: 92rpx;
		border-radius: 50%;
		background: #f2f4f7;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 34rpx;
		font-weight: 800;
		color: #ff7fab;
	}

	.profile-main {
		flex: 1;
		min-width: 0;
		margin-left: 26rpx;
	}

	.name,
	.desc,
	.section-title,
	.menu-title {
		display: block;
	}

	.name {
		font-size: 32rpx;
		font-weight: 900;
		color: #111827;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.desc {
		margin-top: 8rpx;
		font-size: 23rpx;
		color: #8a94a6;
	}

	.arrow {
		font-size: 38rpx;
		line-height: 1;
		color: #b8c0cc;
		margin-left: 18rpx;
	}

	.arrow.small {
		font-size: 34rpx;
	}

	.section-title {
		margin: 34rpx 0 18rpx 18rpx;
		font-size: 24rpx;
		font-weight: 800;
		color: #7b8494;
	}

	.menu-card {
		border-radius: 16rpx;
		padding: 4rpx 24rpx;
	}

	.menu-row {
		min-height: 96rpx;
		display: flex;
		align-items: center;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.menu-row.last {
		border-bottom: none;
	}

	.menu-icon {
		width: 42rpx;
		height: 42rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 21rpx;
		font-weight: 900;
		margin-right: 22rpx;
	}

	.menu-icon.pink {
		background: #fff1f7;
		color: #ff5fa2;
	}

	.menu-title {
		flex: 1;
		font-size: 27rpx;
		font-weight: 700;
		color: #111827;
	}

	.logout {
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 800;
		margin-top: 40rpx;
		background: #ffffff;
		color: #ff5fa2;
	}

	.logout::after {
		border: none;
	}
</style>
