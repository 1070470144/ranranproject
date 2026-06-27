<template>
	<view class="page">
		<view class="card">
			<text class="title">AI配置</text>
			<text class="desc">填写你的 DeepSeek 接口信息，仅当前账号可用。</text>

			<view class="field">
				<text class="label">API Key</text>
				<input class="input" v-model="form.apiKey" password placeholder="sk-..." placeholder-class="placeholder" />
				<text v-if="hasApiKey && !form.apiKey" class="hint">已保存过 API Key，这次不改可以留空。</text>
			</view>

			<view class="field">
				<text class="label">模型</text>
				<input class="input" v-model="form.model" placeholder="deepseek-chat" placeholder-class="placeholder" />
			</view>

			<view class="field">
				<text class="label">接口地址</text>
				<input class="input" v-model="form.baseUrl" placeholder="https://api.deepseek.com" placeholder-class="placeholder" />
			</view>

			<view class="field">
				<text class="label">系统提示词</text>
				<textarea class="textarea" v-model="form.systemPrompt" placeholder="用于控制心事卡牌解读风格" placeholder-class="placeholder" />
			</view>

			<button class="save-button" :loading="saving" :disabled="saving" @tap="saveConfig">保存配置</button>
		</view>
	</view>
</template>

<script>
	const aiConfig = uniCloud.importObject('ai-config', { customUI: true })
	const DEFAULT_PROMPT = '你是一个温和、克制、带有陪伴感的心事整理助手。不要做绝对预言，不要制造恐惧，尽量给出自我反思和行动建议。'

	export default {
		data() {
			return {
				openId: '',
				saving: false,
				hasApiKey: false,
				form: {
					apiKey: '',
					model: 'deepseek-chat',
					baseUrl: 'https://api.deepseek.com',
					systemPrompt: DEFAULT_PROMPT
				}
			}
		},
		onLoad() {
			this.loadProfile()
			this.loadConfig()
		},
		methods: {
			loadProfile() {
				const profile = uni.getStorageSync('wxUserProfile') || {}
				this.openId = profile.openId || ''
				if (!this.openId) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					setTimeout(() => uni.navigateBack(), 600)
				}
			},
			async loadConfig() {
				if (!this.openId) return
				const res = await aiConfig.getConfig({ openId: this.openId })
				if (res.errCode || !res.config) return
				this.hasApiKey = Boolean(res.config.hasApiKey)
				this.form = {
					apiKey: '',
					model: res.config.model || 'deepseek-chat',
					baseUrl: res.config.baseUrl || 'https://api.deepseek.com',
					systemPrompt: res.config.systemPrompt || DEFAULT_PROMPT
				}
			},
			async saveConfig() {
				if (!this.openId) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					return
				}
				if (!this.form.apiKey && !this.hasApiKey) {
					uni.showToast({ title: '请填写 API Key', icon: 'none' })
					return
				}
				this.saving = true
				try {
					const res = await aiConfig.saveConfig({
						openId: this.openId,
						apiKey: this.form.apiKey,
						model: this.form.model,
						baseUrl: this.form.baseUrl,
						systemPrompt: this.form.systemPrompt
					})
					if (res.errCode) throw new Error(res.errMsg || '保存失败')
					this.hasApiKey = true
					this.form.apiKey = ''
					uni.showToast({ title: '保存成功', icon: 'success' })
				} catch (err) {
					uni.showToast({ title: err.message || '保存失败', icon: 'none' })
				} finally {
					this.saving = false
				}
			}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		padding: 32rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, #fff4f8 0%, #f6f3f4 100%);
	}
	.card {
		padding: 28rpx;
		border-radius: 20rpx;
		background: #ffffff;
		box-shadow: 0 16rpx 34rpx rgba(222, 158, 176, 0.14);
	}
	.title {
		display: block;
		font-size: 34rpx;
		font-weight: 900;
		color: #20232b;
	}
	.desc {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #8a94a6;
	}
	.field {
		margin-top: 22rpx;
	}
	.label {
		display: block;
		margin-bottom: 12rpx;
		font-size: 26rpx;
		font-weight: 800;
		color: #20232b;
	}
	.input,
	.textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 22rpx;
		border-radius: 16rpx;
		background: #fff7fb;
		font-size: 26rpx;
		color: #20232b;
	}
	.input {
		height: 88rpx;
	}
	.textarea {
		height: 180rpx;
	}
	.placeholder {
		color: #b8c0cc;
	}
	.hint {
		display: block;
		margin-top: 10rpx;
		font-size: 22rpx;
		color: #b15b84;
	}
	.save-button {
		height: 92rpx;
		line-height: 92rpx;
		margin-top: 30rpx;
		border-radius: 16rpx;
		font-size: 30rpx;
		font-weight: 800;
		background: #ff5fa2;
		color: #ffffff;
	}
	.save-button::after {
		border: none;
	}
</style>
