<template>
	<view class="page">
		<view class="login-card">
			<view class="avatar empty">游</view>
			<text class="title">微信登录</text>
			<text class="desc">登录后同步经期记录、衣柜照片和个人资料</text>

			<button class="login-button" :loading="loginLoading" :disabled="loginLoading" @tap="loginWithWeixin">
				微信一键登录
			</button>
			<text class="tip">仅用于账号识别和资料展示</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loginLoading: false
			}
		},
		methods: {
			loginWithWeixin() {
				this.loginLoading = true
				const wxUser = uniCloud.importObject('wx-user')
				uni.login({
					provider: 'weixin',
					success: async (loginRes) => {
						try {
							const res = await wxUser.loginByWeixin({ code: loginRes.code })
							if (res.errCode) {
								throw new Error(res.errMsg || '登录失败')
							}
							uni.setStorageSync('wxUserProfile', res.userInfo)
							uni.showToast({ title: '登录成功', icon: 'success' })
							setTimeout(() => uni.navigateBack(), 600)
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
		padding: 40rpx 20rpx;
		box-sizing: border-box;
		background: #f3f3f3;
	}

	.login-card {
		margin-top: 90rpx;
		padding: 56rpx 42rpx 44rpx;
		border-radius: 20rpx;
		background: #ffffff;
		box-shadow: 0 12rpx 30rpx rgba(20, 24, 31, 0.04);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.avatar {
		width: 104rpx;
		height: 104rpx;
		border-radius: 50%;
		background: #fff1f7;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		font-weight: 900;
		color: #ff7fab;
	}

	.title,
	.desc,
	.tip {
		display: block;
		text-align: center;
	}

	.title {
		margin-top: 28rpx;
		font-size: 42rpx;
		font-weight: 900;
		color: #111827;
	}

	.desc {
		margin-top: 16rpx;
		font-size: 26rpx;
		line-height: 1.5;
		color: #7b8494;
	}

	.login-button {
		width: 100%;
		height: 92rpx;
		line-height: 92rpx;
		margin-top: 54rpx;
		border-radius: 16rpx;
		background: #ff7fab;
		color: #ffffff;
		font-size: 30rpx;
		font-weight: 900;
	}

	.login-button::after {
		border: none;
	}

	.tip {
		margin-top: 24rpx;
		font-size: 24rpx;
		color: #9aa4b2;
	}
</style>
