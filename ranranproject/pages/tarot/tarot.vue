<template>
	<view class="page">
		<view class="mystic-sky">
			<view class="mystic-moon"></view>
			<view class="mystic-star star-1"></view>
			<view class="mystic-star star-2"></view>
			<view class="mystic-star star-3"></view>
		</view>
		<view class="hero">
			<text class="eyebrow">给心事一点安静的空间</text>
			<text class="title">心事卡牌</text>
			<text class="desc">{{ currentStep.desc }}</text>
		</view>

		<view class="step-bar">
			<view
				v-for="(item, index) in steps"
				:key="item.key"
				:class="['step-dot', index === stepIndex ? 'active' : '', index < stepIndex ? 'done' : '']"
			>
				<text class="step-num">{{ index + 1 }}</text>
				<text class="step-name">{{ item.short }}</text>
			</view>
		</view>

		<view v-if="currentStep.key === 'spread'" class="step-panel">
			<view class="panel-head">
				<text class="panel-title">先选择一个牌阵</text>
				<text class="panel-subtitle">不同牌阵适合不同心事</text>
			</view>
			<view class="spread-list">
				<view
					v-for="item in spreads"
					:key="item.value"
					:class="['spread-item', selectedSpread === item.value ? 'active' : '']"
					@tap="selectSpread(item.value)"
				>
					<view class="spread-mark">{{ item.positions.length }}</view>
					<view class="spread-copy">
						<text class="spread-name">{{ item.label }}</text>
						<text class="spread-desc">{{ item.subtitle }}</text>
					</view>
					<text class="spread-check">{{ selectedSpread === item.value ? '已选' : '选择' }}</text>
				</view>
			</view>
			<button class="primary-button" @tap="goNext">下一步</button>
		</view>

		<view v-else-if="currentStep.key === 'question'" class="step-panel">
			<view class="panel-head">
				<text class="panel-title">写下此刻的心事</text>
				<text class="panel-subtitle">问题越具体，解读越贴近</text>
			</view>
			<textarea
				class="question"
				v-model="question"
				maxlength="120"
				placeholder="比如：我最近在关系里有点不安，想知道可以怎样照顾自己。"
				placeholder-class="placeholder"
				@input="clearReading"
			/>
			<text class="count">{{ question.length }}/120</text>
			<view class="button-row">
				<button class="secondary-button" @tap="goBack">上一步</button>
				<button class="primary-button row-button" @tap="goNext">下一步</button>
			</view>
		</view>

		<view v-else-if="currentStep.key === 'shuffle'" class="step-panel center-panel">
			<view :class="['deck', shuffleAnimating ? 'shuffling' : '']">
				<view class="deck-aura"></view>
				<view class="mystic-orbit orbit-1"></view>
				<view class="mystic-orbit orbit-2"></view>
				<view class="deck-card deck-card-1"></view>
				<view class="deck-card deck-card-2"></view>
				<view class="deck-card deck-card-3">
					<text class="deck-symbol">✦</text>
				</view>
			</view>
			<text class="ritual-title">{{ shuffleAnimating ? '正在洗牌' : '静心洗牌' }}</text>
			<text class="ritual-desc">{{ shuffleAnimating ? '让问题在心里轻轻停留一下。' : '准备好后，轻点按钮开始这一步。' }}</text>
			<view class="button-row">
				<button class="secondary-button" :disabled="shuffleAnimating" @tap="goBack">上一步</button>
				<button class="primary-button row-button" :disabled="shuffleAnimating" @tap="shuffleCards">
					{{ shuffleAnimating ? '洗牌中...' : '开始洗牌' }}
				</button>
			</view>
		</view>

		<view v-else-if="currentStep.key === 'draw'" class="step-panel">
			<view class="panel-head">
				<text class="panel-title">{{ cards.length ? '翻开本次牌面' : '抽取本次指引' }}</text>
				<text class="panel-subtitle">{{ cards.length ? flippedCount + '/' + cards.length + ' 已翻开' : currentSpread.label }}</text>
			</view>

			<view v-if="!cards.length" class="draw-ready">
				<view class="single-deck">
					<view class="deck-aura"></view>
					<view class="mystic-orbit orbit-1"></view>
					<text class="single-symbol">☾</text>
				</view>
				<text class="ritual-title">牌已经准备好了</text>
				<text class="ritual-desc">现在抽出属于这次心事的牌。</text>
			</view>

			<view v-else :class="['tarot-grid', cards.length === 1 ? 'single' : '']">
				<view
					v-for="(item, index) in cards"
					:key="item.position"
					:class="['tarot-card', item.revealed ? 'revealed' : '']"
					@tap="flipCard(index)"
				>
					<view v-if="!item.revealed" class="card-back">
						<view class="back-rune"></view>
						<text class="back-symbol">☾</text>
						<text class="back-text">{{ item.position }}</text>
						<text class="tap-tip">轻点翻开</text>
					</view>
					<view v-else class="card-front">
						<view class="card-glimmer"></view>
						<text class="position">{{ item.position }}</text>
						<text class="card-name">{{ item.name }}</text>
						<text class="card-orientation">{{ item.orientation }}</text>
						<text class="card-meaning">{{ item.meaning }}</text>
					</view>
				</view>
			</view>

			<view class="button-row">
				<button class="secondary-button" @tap="goBack">上一步</button>
				<button v-if="!cards.length" class="primary-button row-button" @tap="drawCards">抽取指引</button>
				<button v-else class="primary-button row-button" :disabled="!allRevealed" @tap="goNext">下一步</button>
			</view>
		</view>

		<view v-else class="step-panel">
			<view class="panel-head">
				<text class="panel-title">生成温柔解读</text>
				<text class="panel-subtitle">仅作心事整理</text>
			</view>

			<view class="summary-card">
				<text class="summary-title">{{ currentSpread.label }}</text>
				<text class="summary-question">{{ question }}</text>
				<view class="summary-list">
					<text v-for="item in cards" :key="item.position" class="summary-item">
						{{ item.position }}：{{ item.name }} {{ item.orientation }}
					</text>
				</view>
			</view>

			<view v-if="answer || loading" class="answer-box">
				<view v-if="loading" class="loading">正在整理牌面，请稍等...</view>
				<text v-else class="answer">{{ answer }}</text>
			</view>

			<view v-if="errorMsg" class="error-card">
				<text class="error-text">{{ errorMsg }}</text>
			</view>

			<view class="button-row">
				<button class="secondary-button" :disabled="loading" @tap="restart">重新开始</button>
				<button class="primary-button row-button" :loading="loading" :disabled="loading" @tap="getReading">
					{{ answer ? '重新生成' : '生成解读' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	const tarotAi = uniCloud.importObject('tarot-ai', { customUI: true })

	const STEPS = [
		{ key: 'spread', short: '牌阵', desc: '先选一个适合此刻心事的牌阵。' },
		{ key: 'question', short: '心事', desc: '把想整理的问题写下来。' },
		{ key: 'shuffle', short: '洗牌', desc: '给自己一点停顿，完成这一步。' },
		{ key: 'draw', short: '翻牌', desc: '抽取并翻开本次牌面。' },
		{ key: 'reading', short: '解读', desc: '让 AI 把牌面整理成温柔提醒。' }
	]

	const SPREADS = [
		{ value: 'daily', label: '今日指引', subtitle: '一张牌，听见今天的提醒', positions: ['今日提醒'] },
		{ value: 'heart', label: '心事整理', subtitle: '现状、提醒和行动建议', positions: ['现状', '提醒', '行动'] },
		{ value: 'choice', label: '选择建议', subtitle: '看见两个选择里的心声', positions: ['选择A', '选择B', '内心建议'] }
	]

	const TAROT_CARDS = [
		{ name: '愚者', meaning: '新的开始、自由、允许自己尝试' },
		{ name: '魔术师', meaning: '行动力、资源、把想法说清楚' },
		{ name: '女祭司', meaning: '直觉、等待、倾听内在答案' },
		{ name: '女皇', meaning: '滋养、关系、温柔照顾自己' },
		{ name: '皇帝', meaning: '秩序、边界、稳定地做决定' },
		{ name: '恋人', meaning: '关系、选择、靠近真实心意' },
		{ name: '战车', meaning: '推进、意志、把方向握在手里' },
		{ name: '力量', meaning: '温柔的坚持、耐心、内在勇气' },
		{ name: '隐士', meaning: '独处、沉淀、暂时向内寻找' },
		{ name: '命运之轮', meaning: '变化、转折、顺势调整节奏' },
		{ name: '正义', meaning: '平衡、事实、清晰判断' },
		{ name: '倒吊人', meaning: '暂停、换角度、放下执念' },
		{ name: '死神', meaning: '结束、更新、旧模式松动' },
		{ name: '节制', meaning: '调和、修复、慢慢靠近平衡' },
		{ name: '星星', meaning: '希望、疗愈、给未来一点信任' },
		{ name: '月亮', meaning: '不安、想象、看清模糊情绪' },
		{ name: '太阳', meaning: '明朗、热情、被看见的快乐' },
		{ name: '审判', meaning: '回应、觉察、重新选择' },
		{ name: '世界', meaning: '完成、整合、阶段性成果' }
	]

	export default {
		data() {
			return {
				openId: '',
				stepIndex: 0,
				question: '',
				selectedSpread: 'daily',
				cards: [],
				answer: '',
				errorMsg: '',
				loading: false,
				shuffleAnimating: false,
				steps: STEPS,
				spreads: SPREADS
			}
		},
		computed: {
			currentStep() {
				return this.steps[this.stepIndex] || this.steps[0]
			},
			currentSpread() {
				return this.spreads.find((item) => item.value === this.selectedSpread) || this.spreads[0]
			},
			allRevealed() {
				return this.cards.length > 0 && this.cards.every((item) => item.revealed)
			},
			flippedCount() {
				return this.cards.filter((item) => item.revealed).length
			}
		},
		onLoad() {
			const profile = uni.getStorageSync('wxUserProfile') || {}
			this.openId = profile.openId || ''
			if (!this.openId) {
				uni.showToast({ title: '请先登录', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 600)
			}
		},
		methods: {
			selectSpread(value) {
				if (this.loading) return
				this.selectedSpread = value
				this.cards = []
				this.clearReading()
			},
			goBack() {
				if (this.loading || this.shuffleAnimating || this.stepIndex <= 0) return
				this.stepIndex -= 1
			},
			goNext() {
				if (this.loading || this.shuffleAnimating) return
				if (this.currentStep.key === 'question' && !this.question.trim()) {
					uni.showToast({ title: '先写下想整理的问题', icon: 'none' })
					return
				}
				if (this.currentStep.key === 'draw' && !this.allRevealed) {
					uni.showToast({ title: '请先翻开全部卡牌', icon: 'none' })
					return
				}
				if (this.stepIndex < this.steps.length - 1) this.stepIndex += 1
			},
			clearReading() {
				if (this.loading) return
				this.answer = ''
				this.errorMsg = ''
			},
			shuffleCards() {
				if (!this.openId) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					return
				}
				if (!this.question.trim()) {
					uni.showToast({ title: '先写下想整理的问题', icon: 'none' })
					return
				}
				this.cards = []
				this.clearReading()
				this.shuffleAnimating = true
				setTimeout(() => {
					this.shuffleAnimating = false
					this.stepIndex = 3
				}, 900)
			},
			drawCards() {
				const pool = TAROT_CARDS.slice()
				this.cards = this.currentSpread.positions.map((position) => {
					const index = Math.floor(Math.random() * pool.length)
					const card = pool.splice(index, 1)[0]
					return {
						position,
						name: card.name,
						meaning: card.meaning,
						orientation: Math.random() > 0.5 ? '正位' : '逆位',
						revealed: false
					}
				})
				this.clearReading()
			},
			flipCard(index) {
				if (this.loading || !this.cards[index] || this.cards[index].revealed) return
				this.cards[index].revealed = true
			},
			async getReading() {
				if (!this.allRevealed) {
					uni.showToast({ title: '请先翻开全部卡牌', icon: 'none' })
					return
				}
				this.loading = true
				this.answer = ''
				this.errorMsg = ''
				try {
					const payloadCards = this.cards.map((item) => ({
						position: item.position,
						name: item.name,
						orientation: item.orientation,
						meaning: item.meaning
					}))
					const res = await tarotAi.read({
						openId: this.openId,
						question: this.question.trim(),
						spread: `${this.currentSpread.label}：${this.currentSpread.positions.join(' / ')}`,
						cards: payloadCards
					})
					if (res.errCode) throw new Error(res.errMsg || '解读失败')
					this.answer = res.answer
				} catch (err) {
					this.errorMsg = this.formatCloudError(err)
					uni.showToast({ title: '解读失败，请查看提示', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			restart() {
				if (this.loading) return
				this.stepIndex = 0
				this.question = ''
				this.cards = []
				this.answer = ''
				this.errorMsg = ''
				this.shuffleAnimating = false
			},
			formatCloudError(err = {}) {
				const message = err.message || err.errMsg || '解读失败'
				if (message.indexOf('请求云函数超时') > -1 || message.toLowerCase().indexOf('timeout') > -1) {
					return 'AI 解读响应超时，请稍后再试，或在 AI 配置中确认接口地址、模型和 API Key 是否正确。'
				}
				return message
			}
		}
	}
</script>

<style>
	page {
		background: #fff4f8;
	}

	.page {
		position: relative;
		min-height: 100vh;
		padding: 32rpx 30rpx 54rpx;
		box-sizing: border-box;
		overflow: hidden;
		background:
			radial-gradient(circle at 78% 10%, rgba(103, 77, 176, 0.18) 0, rgba(103, 77, 176, 0) 210rpx),
			radial-gradient(circle at 16% 26%, rgba(255, 184, 216, 0.52) 0, rgba(255, 184, 216, 0) 260rpx),
			linear-gradient(180deg, #ffe7f0 0%, #fff6fa 46%, #f4f1f3 100%);
		color: #25232d;
	}

	.mystic-sky {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 520rpx;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.mystic-sky::before,
	.mystic-sky::after {
		content: '';
		position: absolute;
		width: 520rpx;
		height: 520rpx;
		border-radius: 50%;
		background:
			radial-gradient(circle, rgba(255, 255, 255, 0.88) 0 3rpx, transparent 4rpx),
			radial-gradient(circle, rgba(106, 82, 174, 0.2) 0 2rpx, transparent 3rpx);
		background-size: 94rpx 92rpx, 138rpx 126rpx;
		opacity: 0.42;
		animation: star-drift 16s linear infinite;
	}

	.mystic-sky::before {
		right: -120rpx;
		top: -130rpx;
	}

	.mystic-sky::after {
		left: -180rpx;
		top: 120rpx;
		opacity: 0.28;
		animation-duration: 22s;
		animation-direction: reverse;
	}

	.mystic-moon {
		position: absolute;
		right: 68rpx;
		top: 54rpx;
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: #fff8d7;
		box-shadow: 0 0 36rpx rgba(255, 237, 166, 0.56);
		opacity: 0.74;
	}

	.mystic-moon::after {
		content: '';
		position: absolute;
		left: 28rpx;
		top: -4rpx;
		width: 92rpx;
		height: 100rpx;
		border-radius: 50%;
		background: #ffe7f0;
	}

	.mystic-star {
		position: absolute;
		width: 9rpx;
		height: 9rpx;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 0 18rpx rgba(255, 255, 255, 0.9);
		animation: star-twinkle 2.8s ease-in-out infinite;
	}

	.star-1 {
		left: 94rpx;
		top: 88rpx;
	}

	.star-2 {
		right: 190rpx;
		top: 190rpx;
		animation-delay: 0.7s;
	}

	.star-3 {
		left: 55%;
		top: 58rpx;
		animation-delay: 1.3s;
	}

	.hero,
	.step-bar,
	.step-panel {
		position: relative;
		z-index: 1;
	}

	.hero {
		padding: 24rpx 4rpx 18rpx;
	}

	.eyebrow,
	.title,
	.desc,
	.step-num,
	.step-name,
	.panel-title,
	.panel-subtitle,
	.spread-name,
	.spread-desc,
	.spread-check,
	.count,
	.ritual-title,
	.ritual-desc,
	.position,
	.card-name,
	.card-orientation,
	.card-meaning,
	.summary-title,
	.summary-question,
	.summary-item,
	.answer,
	.error-text {
		display: block;
	}

	.eyebrow {
		font-size: 22rpx;
		line-height: 30rpx;
		font-weight: 800;
		color: #d25a86;
	}

	.title {
		margin-top: 10rpx;
		font-size: 46rpx;
		line-height: 56rpx;
		font-weight: 900;
		color: #211f29;
	}

	.desc {
		margin-top: 12rpx;
		font-size: 25rpx;
		line-height: 38rpx;
		color: #8f7d86;
	}

	.step-bar {
		margin-top: 18rpx;
		padding: 16rpx 12rpx;
		border-radius: 22rpx;
		background: rgba(255, 255, 255, 0.72);
		display: flex;
		justify-content: space-between;
		box-shadow: 0 12rpx 26rpx rgba(222, 158, 176, 0.1);
	}

	.step-dot {
		width: 112rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #b498a5;
	}

	.step-num {
		width: 42rpx;
		height: 42rpx;
		border-radius: 50%;
		background: #fff1f7;
		text-align: center;
		line-height: 42rpx;
		font-size: 22rpx;
		font-weight: 900;
	}

	.step-name {
		margin-top: 8rpx;
		font-size: 19rpx;
		line-height: 26rpx;
		font-weight: 800;
	}

	.step-dot.active,
	.step-dot.done {
		color: #ff5f9b;
	}

	.step-dot.active .step-num,
	.step-dot.done .step-num {
		background: #ff7fa6;
		color: #ffffff;
	}

	.step-panel {
		min-height: 690rpx;
		margin-top: 24rpx;
		padding: 28rpx;
		border-radius: 24rpx;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 16rpx 34rpx rgba(222, 158, 176, 0.14);
		box-sizing: border-box;
	}

	.center-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.panel-head {
		margin-bottom: 22rpx;
	}

	.panel-title {
		font-size: 32rpx;
		line-height: 42rpx;
		font-weight: 900;
		color: #24212a;
	}

	.panel-subtitle {
		margin-top: 8rpx;
		font-size: 23rpx;
		line-height: 32rpx;
		color: #9f8491;
	}

	.spread-list {
		display: flex;
		flex-direction: column;
		gap: 18rpx;
	}

	.spread-item {
		min-height: 134rpx;
		padding: 22rpx;
		box-sizing: border-box;
		border-radius: 20rpx;
		background: #fff7fb;
		border: 2rpx solid transparent;
		display: flex;
		align-items: center;
	}

	.spread-item.active {
		background: #ffeff6;
		border-color: #ff8eb5;
		box-shadow: 0 12rpx 26rpx rgba(255, 127, 166, 0.16);
	}

	.spread-mark {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: #ffd9e8;
		color: #d25a86;
		text-align: center;
		line-height: 64rpx;
		font-size: 28rpx;
		font-weight: 900;
		flex-shrink: 0;
	}

	.spread-copy {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
	}

	.spread-name {
		font-size: 28rpx;
		line-height: 36rpx;
		font-weight: 900;
		color: #342b34;
	}

	.spread-desc {
		margin-top: 8rpx;
		font-size: 22rpx;
		line-height: 31rpx;
		color: #9f8491;
	}

	.spread-check {
		margin-left: 18rpx;
		font-size: 22rpx;
		font-weight: 900;
		color: #d25a86;
	}

	.question {
		width: 100%;
		height: 300rpx;
		box-sizing: border-box;
		padding: 24rpx;
		border-radius: 20rpx;
		background: #fff7fb;
		font-size: 27rpx;
		line-height: 40rpx;
		color: #25232d;
	}

	.placeholder {
		color: #b9a9b1;
	}

	.count {
		margin-top: 12rpx;
		text-align: right;
		font-size: 21rpx;
		color: #b78a9d;
	}

	.button-row {
		margin-top: 28rpx;
		display: flex;
		gap: 18rpx;
		align-items: center;
	}

	.primary-button,
	.secondary-button {
		height: 88rpx;
		line-height: 88rpx;
		margin-top: 28rpx;
		border-radius: 999rpx;
		font-size: 29rpx;
		font-weight: 900;
	}

	.button-row .primary-button,
	.button-row .secondary-button {
		margin-top: 0;
	}

	.primary-button {
		width: 100%;
		background: linear-gradient(90deg, #ff70a4 0%, #ff9cbd 100%);
		color: #ffffff;
		box-shadow: 0 14rpx 28rpx rgba(255, 112, 164, 0.22);
	}

	.secondary-button {
		width: 210rpx;
		background: #fff0f6;
		color: #d25a86;
	}

	.row-button {
		flex: 1;
	}

	.primary-button::after,
	.secondary-button::after {
		border: none;
	}

	.deck {
		position: relative;
		width: 170rpx;
		height: 210rpx;
		margin-bottom: 24rpx;
	}

	.deck-aura {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 230rpx;
		height: 230rpx;
		border-radius: 50%;
		background:
			radial-gradient(circle, rgba(255, 234, 170, 0.4) 0, rgba(255, 234, 170, 0.08) 42%, rgba(109, 78, 171, 0) 68%);
		transform: translate(-50%, -50%);
		filter: blur(1rpx);
		animation: aura-pulse 2.6s ease-in-out infinite;
		z-index: 0;
	}

	.mystic-orbit {
		position: absolute;
		left: 50%;
		top: 50%;
		border: 2rpx solid rgba(126, 92, 186, 0.28);
		border-left-color: rgba(255, 213, 136, 0.76);
		border-bottom-color: rgba(255, 143, 189, 0.2);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		z-index: 1;
	}

	.orbit-1 {
		width: 210rpx;
		height: 210rpx;
		animation: orbit-spin 7s linear infinite;
	}

	.orbit-2 {
		width: 250rpx;
		height: 250rpx;
		animation: orbit-spin 10s linear infinite reverse;
	}

	.deck-card {
		position: absolute;
		left: 24rpx;
		top: 12rpx;
		width: 120rpx;
		height: 172rpx;
		border-radius: 20rpx;
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.28) 0 2rpx, transparent 3rpx 100%),
			linear-gradient(160deg, #6f4db0 0%, #ff7faa 52%, #ffd4e4 100%);
		border: 4rpx solid #fff7fb;
		box-shadow: 0 14rpx 26rpx rgba(105, 70, 155, 0.22);
		z-index: 2;
	}

	.deck-card-1 {
		transform: rotate(-10deg);
	}

	.deck-card-2 {
		transform: rotate(4deg);
	}

	.deck-card-3 {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.deck-symbol {
		font-size: 52rpx;
		color: #fffdf6;
	}

	.deck.shuffling .deck-card-1 {
		animation: shuffle-left 0.9s cubic-bezier(0.2, 0.72, 0.18, 1);
	}

	.deck.shuffling .deck-card-2 {
		animation: shuffle-right 0.9s cubic-bezier(0.2, 0.72, 0.18, 1);
	}

	.deck.shuffling .deck-card-3 {
		animation: shuffle-top 0.9s cubic-bezier(0.2, 0.72, 0.18, 1);
	}

	.deck.shuffling .deck-aura {
		animation: aura-pulse 0.9s ease-in-out infinite;
	}

	.deck.shuffling .mystic-orbit {
		border-left-color: rgba(255, 239, 171, 0.95);
		box-shadow: 0 0 18rpx rgba(255, 210, 126, 0.28);
	}

	@keyframes shuffle-left {
		0%, 100% { transform: rotate(-10deg) translateX(0) translateY(0); }
		34% { transform: rotate(-24deg) translateX(-48rpx) translateY(12rpx); }
		64% { transform: rotate(-4deg) translateX(22rpx) translateY(-16rpx); }
	}

	@keyframes shuffle-right {
		0%, 100% { transform: rotate(4deg) translateX(0) translateY(0); }
		34% { transform: rotate(18deg) translateX(50rpx) translateY(-10rpx); }
		64% { transform: rotate(-8deg) translateX(-18rpx) translateY(16rpx); }
	}

	@keyframes shuffle-top {
		0%, 100% { transform: rotate(0deg) translateY(0) scale(1); }
		42% { transform: rotate(12deg) translateY(-34rpx) scale(1.04); }
		70% { transform: rotate(-6deg) translateY(10rpx) scale(0.98); }
	}

	.ritual-title {
		font-size: 31rpx;
		line-height: 40rpx;
		font-weight: 900;
		color: #29232d;
	}

	.ritual-desc {
		margin-top: 10rpx;
		font-size: 24rpx;
		line-height: 36rpx;
		color: #9b818d;
	}

	.draw-ready {
		min-height: 420rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.single-deck {
		position: relative;
		width: 140rpx;
		height: 192rpx;
		margin-bottom: 24rpx;
		border-radius: 22rpx;
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.24) 0 2rpx, transparent 3rpx 100%),
			linear-gradient(160deg, #6f4db0 0%, #ff7faa 52%, #ffd4e4 100%);
		border: 5rpx solid #fff9fc;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 18rpx 30rpx rgba(105, 70, 155, 0.22);
	}

	.single-symbol {
		position: relative;
		z-index: 2;
		font-size: 58rpx;
		color: #ffffff;
	}

	.tarot-grid {
		display: flex;
		gap: 16rpx;
	}

	.tarot-grid.single {
		justify-content: center;
	}

	.tarot-card {
		flex: 1;
		min-width: 0;
		height: 300rpx;
		border-radius: 18rpx;
		overflow: hidden;
		perspective: 900rpx;
		transform-style: preserve-3d;
	}

	.tarot-card.revealed {
		animation: card-reveal 0.56s cubic-bezier(0.2, 0.72, 0.18, 1) both;
	}

	.tarot-grid.single .tarot-card {
		flex: 0 0 240rpx;
		height: 330rpx;
	}

	.card-back,
	.card-front {
		position: relative;
		height: 100%;
		box-sizing: border-box;
		border-radius: 18rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.card-back {
		padding: 18rpx;
		overflow: hidden;
		background:
			radial-gradient(circle at 50% 36%, rgba(255, 244, 196, 0.3) 0, rgba(255, 244, 196, 0) 56rpx),
			linear-gradient(155deg, #60429d 0%, #bd5f9d 54%, #ffd4e4 100%);
		border: 4rpx solid #fff9fc;
		color: #ffffff;
		box-shadow: inset 0 0 24rpx rgba(255, 255, 255, 0.18);
	}

	.back-rune {
		position: absolute;
		left: 50%;
		top: 42%;
		width: 104rpx;
		height: 104rpx;
		border: 2rpx solid rgba(255, 242, 184, 0.58);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		opacity: 0.7;
	}

	.back-rune::before,
	.back-rune::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.back-rune::before {
		width: 64rpx;
		height: 64rpx;
		border: 2rpx solid rgba(255, 255, 255, 0.48);
		border-radius: 16rpx;
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.back-rune::after {
		width: 2rpx;
		height: 88rpx;
		background: rgba(255, 242, 184, 0.46);
		box-shadow: 0 0 14rpx rgba(255, 242, 184, 0.6);
	}

	.back-symbol {
		position: relative;
		z-index: 2;
		font-size: 44rpx;
		line-height: 52rpx;
		text-shadow: 0 0 18rpx rgba(255, 246, 198, 0.88);
	}

	.back-text {
		position: relative;
		z-index: 2;
		margin-top: 18rpx;
		font-size: 24rpx;
		line-height: 32rpx;
		font-weight: 900;
	}

	.tap-tip {
		position: relative;
		z-index: 2;
		margin-top: 10rpx;
		font-size: 19rpx;
		line-height: 26rpx;
		color: rgba(255, 255, 255, 0.82);
	}

	.card-front {
		padding: 16rpx 14rpx;
		overflow: hidden;
		background:
			radial-gradient(circle at 50% 10%, rgba(255, 240, 174, 0.42) 0, rgba(255, 240, 174, 0) 92rpx),
			#fffafc;
		border: 2rpx solid #ffd7e5;
		box-shadow: inset 0 0 24rpx rgba(255, 219, 236, 0.72);
	}

	.card-front::before {
		content: '';
		position: absolute;
		left: 16rpx;
		right: 16rpx;
		top: 16rpx;
		bottom: 16rpx;
		border: 1rpx solid rgba(210, 90, 134, 0.18);
		border-radius: 14rpx;
		pointer-events: none;
	}

	.card-glimmer {
		position: absolute;
		left: -72%;
		top: -28%;
		width: 48%;
		height: 156%;
		background: linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.78) 50%, transparent 100%);
		transform: rotate(18deg);
		animation: glimmer-sweep 0.9s ease-out both;
		pointer-events: none;
	}

	.position,
	.card-name,
	.card-orientation,
	.card-meaning {
		position: relative;
		z-index: 2;
	}

	.position {
		font-size: 20rpx;
		line-height: 28rpx;
		font-weight: 800;
		color: #d25a86;
	}

	.card-name {
		margin-top: 8rpx;
		font-size: 27rpx;
		line-height: 34rpx;
		font-weight: 900;
		color: #28232b;
	}

	.card-orientation {
		margin-top: 6rpx;
		font-size: 21rpx;
		line-height: 28rpx;
		font-weight: 800;
		color: #ff7fa6;
	}

	.card-meaning {
		margin-top: 10rpx;
		font-size: 20rpx;
		line-height: 29rpx;
		color: #8e7d86;
	}

	.summary-card,
	.answer-box,
	.error-card {
		margin-top: 18rpx;
		padding: 22rpx;
		border-radius: 20rpx;
		background: #fff7fb;
	}

	.summary-title {
		font-size: 27rpx;
		line-height: 36rpx;
		font-weight: 900;
		color: #29232d;
	}

	.summary-question {
		margin-top: 12rpx;
		font-size: 24rpx;
		line-height: 36rpx;
		color: #7f7078;
	}

	.summary-list {
		margin-top: 14rpx;
	}

	.summary-item {
		font-size: 23rpx;
		line-height: 34rpx;
		color: #d25a86;
	}

	.loading {
		padding: 18rpx 0;
		font-size: 25rpx;
		line-height: 36rpx;
		color: #d25a86;
	}

	.answer {
		font-size: 26rpx;
		line-height: 42rpx;
		color: #30313a;
		white-space: pre-wrap;
	}

	.error-card {
		background: #fff1f7;
	}

	.error-text {
		font-size: 25rpx;
		line-height: 38rpx;
		color: #c64f85;
	}

	@keyframes star-drift {
		0% { transform: translate3d(0, 0, 0) rotate(0deg); }
		100% { transform: translate3d(42rpx, 28rpx, 0) rotate(10deg); }
	}

	@keyframes star-twinkle {
		0%, 100% { opacity: 0.32; transform: scale(0.82); }
		48% { opacity: 1; transform: scale(1.16); }
	}

	@keyframes orbit-spin {
		0% { transform: translate(-50%, -50%) rotate(0deg); }
		100% { transform: translate(-50%, -50%) rotate(360deg); }
	}

	@keyframes aura-pulse {
		0%, 100% { opacity: 0.54; transform: translate(-50%, -50%) scale(0.9); }
		50% { opacity: 1; transform: translate(-50%, -50%) scale(1.14); }
	}

	@keyframes card-reveal {
		0% {
			opacity: 0.72;
			transform: rotateY(18deg) translateY(18rpx) scale(0.96);
			filter: brightness(1.12);
		}
		62% {
			opacity: 1;
			transform: rotateY(-5deg) translateY(-6rpx) scale(1.02);
			filter: brightness(1.04);
		}
		100% {
			opacity: 1;
			transform: rotateY(0) translateY(0) scale(1);
			filter: brightness(1);
		}
	}

	@keyframes glimmer-sweep {
		0% { left: -72%; opacity: 0; }
		18% { opacity: 0.9; }
		100% { left: 128%; opacity: 0; }
	}
</style>
