<template>
	<view class="page">
		<view class="hero">
			<view class="hero-main">
				<view class="greeting-row">
					<view class="greeting-copy">
						<text class="hello">你好, {{ loginText }}</text>
						<text class="today">今天是 {{ todayText }}</text>
					</view>
					<view class="avatar" @tap="goMine">
						<text class="avatar-face">☺</text>
					</view>
				</view>

				<view class="predict-card" @tap="goPeriod">
					<view class="predict-icon">滴</view>
					<view class="predict-copy">
						<text class="predict-title">经期预测</text>
						<text class="predict-desc">{{ periodForecastText }}</text>
					</view>
					<text class="arrow">›</text>
				</view>
			</view>
		</view>

		<view class="section-title">
			<text class="star">★</text>
			<text>常用功能</text>
		</view>

		<view class="feature-grid">
			<view class="feature-card" @tap="goWardrobe">
				<view class="feature-icon wardrobe-icon">衣</view>
				<text class="feature-title">{{ wardrobeName }}</text>
				<text class="feature-meta">{{ wardrobeMetaText }}</text>
			</view>

			<view class="feature-card muted" @tap="showComingSoon('美丽账单')">
				<view class="feature-icon bill-icon">卡</view>
				<text class="feature-title muted-title">美丽账单</text>
				<text class="feature-meta">即将上线</text>
			</view>
		</view>

		<view class="wide-card" @tap="showComingSoon('日常打卡')">
			<view class="check-icon">✓</view>
			<text class="wide-title">日常打卡</text>
		</view>

		<view class="bottom-shell">
			<view class="tab-item active">
				<text class="tab-icon">⌂</text>
				<text class="tab-text">首页</text>
			</view>
			<view class="add-button" @tap="goWardrobe">＋</view>
			<view class="tab-item" @tap="goMine">
				<text class="tab-icon user-icon">♙</text>
				<text class="tab-text">我的</text>
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
				latestPeriod: null,
				periodForecast: null,
				periodCount: 0,
				wardrobeCount: 0,
				recentWardrobe: [],
				wardrobeName: '我的衣柜'
			}
		},
		computed: {
			loginText() {
				return this.openId ? '欢迎回来' : '请登录'
			},
			todayText() {
				const date = new Date()
				const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
				return `${date.getMonth() + 1}月${date.getDate()}日 ${weekMap[date.getDay()]}`
			},
			periodForecastText() {
				if (!this.openId) return '登录后查看你的经期预测'
				if (!this.periodForecast) return '添加第一条记录后开始预测'
				if (this.periodForecast.isCurrentPeriod) return '当前经期正在记录中'

				const days = this.periodForecast.daysToNextPeriod
				if (days === null || days === undefined) return '最近开始日期待完善'
				if (days <= 0) return '预计经期已到, 记得更新记录'
				const basisText = this.periodForecast.basisCount ? `按${this.periodForecast.cycleDays}天周期预估` : '按默认28天预估'
				return `距离下次姨妈还有 ${days} 天 · ${basisText}`
			},
			wardrobeMetaText() {
				return `${this.wardrobeCount || 0}件藏品`
			}
		},
		onShow() {
			uni.hideTabBar({ animation: false })
			this.loadSummary()
		},
		onHide() {
			uni.showTabBar({ animation: false })
		},
		methods: {
			async loadSummary() {
				const profile = uni.getStorageSync('wxUserProfile') || {}
				this.openId = profile.openId || ''
				this.wardrobeName = profile.wardrobeName || '我的衣柜'
				if (!this.openId) {
					this.latestPeriod = null
					this.periodForecast = null
					this.periodCount = 0
					this.wardrobeCount = 0
					this.recentWardrobe = []
					return
				}

				const res = await lifeData.getHomeSummary({ openId: this.openId })
				if (res.errCode) {
					uni.showToast({ title: res.errMsg || '获取数据失败', icon: 'none' })
					return
				}
				this.latestPeriod = res.latestPeriod
				this.periodForecast = res.periodForecast || null
				this.periodCount = res.periodCount || 0
				this.wardrobeCount = res.wardrobeCount || 0
				this.recentWardrobe = res.recentWardrobe || []
			},
			goPeriod() {
				this.goAuthPage('/pages/period/period')
			},
			goWardrobe() {
				this.goAuthPage('/pages/wardrobe/wardrobe')
			},
			goMine() {
				uni.switchTab({ url: '/pages/mine/mine' })
			},
			goAuthPage(url) {
				if (!this.openId) {
					uni.showToast({ title: '请先在我的页面登录', icon: 'none' })
					return
				}
				uni.navigateTo({ url })
			},
			showComingSoon(name) {
				uni.showToast({ title: `${name}即将上线`, icon: 'none' })
			}
		}
	}
</script>

<style>
	page {
		background: #e8e8e8;
	}

	.page {
		position: relative;
		min-height: 100vh;
		padding: 40rpx 34rpx 150rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, #fff4f8 0%, #f6f3f4 55%, #eeeeee 100%);
		overflow: hidden;
	}

	.hero {
		margin: 0 -34rpx;
		padding: 0 34rpx 64rpx;
		background: linear-gradient(180deg, #ffe1eb 0%, #ffdce8 100%);
		border-bottom-left-radius: 48rpx;
		border-bottom-right-radius: 48rpx;
	}

	.hero-main {
		padding-top: 46rpx;
	}

	.greeting-row,
	.predict-card,
	.feature-grid,
	.bottom-shell,
	.tab-item {
		display: flex;
		align-items: center;
	}

	.greeting-row {
		justify-content: space-between;
	}

	.greeting-copy,
	.predict-copy {
		min-width: 0;
	}

	.hello,
	.today,
	.predict-title,
	.predict-desc,
	.feature-title,
	.feature-meta,
	.wide-title,
	.tab-icon,
	.tab-text {
		display: block;
	}

	.hello {
		font-size: 34rpx;
		line-height: 42rpx;
		font-weight: 900;
		color: #151923;
	}

	.today {
		margin-top: 8rpx;
		font-size: 21rpx;
		line-height: 28rpx;
		font-weight: 600;
		color: #9c8d93;
	}

	.avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: #ffd0dc;
		border: 4rpx solid rgba(255, 255, 255, 0.75);
		box-shadow: 0 10rpx 20rpx rgba(244, 99, 141, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-face {
		font-size: 40rpx;
		line-height: 1;
		color: #f86c95;
	}

	.predict-card {
		position: relative;
		z-index: 2;
		margin-top: 24rpx;
		min-height: 134rpx;
		padding: 24rpx 26rpx;
		box-sizing: border-box;
		border-radius: 28rpx;
		background: #ffffff;
		box-shadow: 0 18rpx 36rpx rgba(232, 111, 150, 0.13);
	}

	.predict-icon {
		width: 70rpx;
		height: 70rpx;
		margin-right: 22rpx;
		border-radius: 50%;
		background: #ffe3ec;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		font-weight: 900;
		color: #ff6f97;
	}

	.predict-copy {
		flex: 1;
	}

	.predict-title {
		font-size: 26rpx;
		line-height: 34rpx;
		font-weight: 900;
		color: #191b22;
	}

	.predict-desc {
		margin-top: 10rpx;
		font-size: 21rpx;
		line-height: 28rpx;
		color: #9b8f96;
	}

	.arrow {
		margin-left: 18rpx;
		font-size: 44rpx;
		line-height: 1;
		color: #aeb4bf;
	}

	.section-title {
		margin-top: 46rpx;
		display: flex;
		align-items: center;
		font-size: 26rpx;
		line-height: 34rpx;
		font-weight: 900;
		color: #252831;
	}

	.star {
		margin-right: 10rpx;
		font-size: 26rpx;
		color: #ff7fa6;
	}

	.feature-grid {
		margin-top: 24rpx;
		gap: 24rpx;
	}

	.feature-card {
		flex: 1;
		min-width: 0;
		height: 214rpx;
		border-radius: 18rpx;
		background: #ffffff;
		box-shadow: 0 16rpx 34rpx rgba(222, 158, 176, 0.14);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.feature-card.muted {
		background: rgba(255, 255, 255, 0.78);
	}

	.feature-icon,
	.check-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-weight: 900;
	}

	.feature-icon {
		width: 76rpx;
		height: 76rpx;
		font-size: 26rpx;
	}

	.wardrobe-icon {
		background: #ffddea;
		color: #ff7fa6;
	}

	.bill-icon {
		background: #f5f6f8;
		color: #aeb4bf;
	}

	.feature-title {
		margin-top: 28rpx;
		font-size: 26rpx;
		line-height: 34rpx;
		font-weight: 900;
		color: #20232b;
	}

	.muted-title {
		color: #565b66;
	}

	.feature-meta {
		margin-top: 8rpx;
		font-size: 19rpx;
		line-height: 26rpx;
		color: #a2a6ad;
	}

	.wide-card {
		margin-top: 26rpx;
		height: 168rpx;
		border-radius: 18rpx;
		background: rgba(255, 255, 255, 0.86);
		box-shadow: 0 16rpx 34rpx rgba(210, 154, 170, 0.12);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		width: 42rpx;
		height: 42rpx;
		background: #d7dce4;
		font-size: 24rpx;
		color: #ffffff;
	}

	.wide-title {
		margin-top: 20rpx;
		font-size: 26rpx;
		line-height: 34rpx;
		font-weight: 900;
		color: #555963;
	}

	.bottom-shell {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		height: calc(104rpx + env(safe-area-inset-bottom));
		padding: 0 82rpx env(safe-area-inset-bottom);
		box-sizing: border-box;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.94);
		box-shadow: 0 -12rpx 30rpx rgba(90, 78, 85, 0.08);
	}

	.tab-item {
		width: 88rpx;
		height: 88rpx;
		flex-direction: column;
		justify-content: center;
		color: #6e7582;
	}

	.tab-item.active {
		color: #ff7fa6;
	}

	.tab-icon {
		font-size: 34rpx;
		line-height: 34rpx;
	}

	.user-icon {
		font-size: 32rpx;
	}

	.tab-text {
		margin-top: 6rpx;
		font-size: 18rpx;
		line-height: 24rpx;
		font-weight: 700;
	}

	.add-button {
		width: 72rpx;
		height: 72rpx;
		margin-top: -32rpx;
		border-radius: 50%;
		background: #ff7fa6;
		box-shadow: 0 12rpx 24rpx rgba(255, 127, 166, 0.26);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 50rpx;
		line-height: 1;
		font-weight: 300;
		color: #ffffff;
	}
</style>
