<template>
	<view class="page">
		<view class="hero">
			<view>
				<text class="eyebrow">ranranproject</text>
				<text class="title">首页</text>
				<text class="desc">这里先作为功能入口预留，后面可以继续添加业务内容。</text>
			</view>
		</view>

		<view class="placeholder">
			<text class="placeholder-title">功能待定</text>
			<text class="placeholder-desc">底部已分为“首页”和“我的”，微信登录与资料设置在“我的”页。</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		padding: 32rpx;
		box-sizing: border-box;
		background: #f6f7f9;
	}

	.hero {
		min-height: 260rpx;
		padding: 40rpx;
		border-radius: 16rpx;
		box-sizing: border-box;
		background: #ffffff;
		display: flex;
		align-items: flex-end;
		box-shadow: 0 8rpx 24rpx rgba(29, 43, 54, 0.06);
	}

	.eyebrow,
	.title,
	.desc,
	.placeholder-title,
	.placeholder-desc {
		display: block;
	}

	.eyebrow {
		font-size: 24rpx;
		color: #1f7a5f;
		margin-bottom: 12rpx;
	}

	.title {
		font-size: 48rpx;
		font-weight: 700;
		color: #17212b;
		line-height: 1.25;
	}

	.desc {
		margin-top: 16rpx;
		font-size: 28rpx;
		line-height: 1.6;
		color: #5e6670;
	}

	.placeholder {
		margin-top: 24rpx;
		padding: 32rpx;
		border-radius: 16rpx;
		background: #ffffff;
		box-shadow: 0 8rpx 24rpx rgba(29, 43, 54, 0.06);
	}

	.placeholder-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #17212b;
	}

	.placeholder-desc {
		margin-top: 12rpx;
		font-size: 26rpx;
		line-height: 1.6;
		color: #7a7f87;
	}
</style>
