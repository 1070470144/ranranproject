<template>
	<view class="page">
		<view class="hero">
			<view class="hero-card">
				<view class="hero-copy">
					<text class="hello">{{ heroTitle }}</text>
					<text class="today">{{ heroDesc }}</text>
				</view>
				<view v-if="!isEditing" class="add-action" @tap="startCreate">＋</view>
				<view v-else class="drop-icon">滴</view>
			</view>
		</view>

		<view v-if="!isEditing" class="list-card">
			<view class="section-head">
				<text class="star">★</text>
				<text class="section-title">全部记录</text>
				<text class="record-count">{{ list.length }}条</text>
			</view>

			<view v-if="!list.length" class="empty-state">
				<view class="empty-icon">滴</view>
				<text class="empty-title">还没有经期记录</text>
				<text class="empty-desc">点击右上角新增，默认会选中今天。</text>
			</view>

			<view v-for="item in list" :key="item.id" class="record">
				<view class="record-date">
					<text class="record-day">{{ getDay(item.startDate) }}</text>
					<text class="record-month">{{ getMonth(item.startDate) }}月</text>
				</view>
				<view class="record-main">
					<text class="record-title">{{ formatDateRange(item) }}</text>
					<text class="record-desc">{{ formatRecordDesc(item) }}</text>
				</view>
				<view class="record-actions">
					<text class="edit" @tap="startEdit(item)">编辑</text>
					<text class="delete" @tap="deleteRecord(item)">删除</text>
				</view>
			</view>
		</view>

		<view v-else class="editor-wrap">
			<view class="calendar-card">
				<view class="calendar-head">
					<view class="month-button" @tap="changeMonth(-1)">‹</view>
					<text class="month-title">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
					<view class="month-button" @tap="changeMonth(1)">›</view>
				</view>

				<view class="week-row">
					<text v-for="item in weekLabels" :key="item" class="week-text">{{ item }}</text>
				</view>

				<view class="day-grid">
					<view
						v-for="(day, index) in calendarDays"
						:key="index"
						:class="['day-cell', day.inMonth ? '' : 'dim', isToday(day.date) ? 'today-cell' : '', isSelected(day.date) ? 'selected' : '', hasRecord(day.date) ? 'recorded' : '']"
						@tap="selectDate(day)"
					>
						<text class="day-number">{{ day.day }}</text>
						<view v-if="hasRecord(day.date)" class="record-dot"></view>
					</view>
				</view>
			</view>

			<view class="form-card">
				<view class="section-head">
					<text class="star">★</text>
					<text class="section-title">{{ formTitle }}</text>
				</view>

				<picker mode="date" :value="form.startDate" @change="onStartDateChange">
					<view class="field">
						<text class="label">开始日期</text>
						<text class="value">{{ form.startDate || '请选择' }}</text>
					</view>
				</picker>
				<picker mode="date" :value="form.endDate" @change="onEndDateChange">
					<view class="field">
						<text class="label">结束日期</text>
						<text class="value subtle">{{ form.endDate || '可不填' }}</text>
					</view>
				</picker>

				<view class="chips">
					<text class="chips-title">流量</text>
					<view class="chip-row">
						<text v-for="item in flowOptions" :key="item" :class="['chip', form.flow === item ? 'active' : '']" @tap="form.flow = item">{{ item }}</text>
					</view>
				</view>

				<view class="chips">
					<text class="chips-title">腹痛</text>
					<view class="chip-row">
						<text v-for="item in painOptions" :key="item" :class="['chip', form.pain === item ? 'active' : '']" @tap="form.pain = item">{{ item }}</text>
					</view>
				</view>

				<input class="input" v-model="form.mood" placeholder="今天心情" placeholder-class="placeholder" />
				<textarea class="textarea" v-model="form.note" placeholder="备注，比如身体状态、饮食、休息" placeholder-class="placeholder" />

				<view class="button-row">
					<button class="cancel-button" @tap="cancelEdit">取消</button>
					<button class="save-button" :loading="saving" :disabled="saving" @tap="saveRecord">保存</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const lifeData = uniCloud.importObject('life-data')

	function pad(value) {
		return value < 10 ? `0${value}` : `${value}`
	}

	function formatDate(date) {
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
	}

	function parseDate(value) {
		if (!value) return null
		const date = new Date(`${value.replace(/-/g, '/')} 00:00:00`)
		return Number.isNaN(date.getTime()) ? null : date
	}

	export default {
		data() {
			const today = new Date()
			const todayText = formatDate(today)
			return {
				openId: '',
				saving: false,
				mode: 'list',
				editingId: '',
				list: [],
				currentYear: today.getFullYear(),
				currentMonth: today.getMonth(),
				selectedDate: todayText,
				weekLabels: ['日', '一', '二', '三', '四', '五', '六'],
				flowOptions: ['少', '中', '多'],
				painOptions: ['无', '轻微', '明显'],
				form: this.createEmptyForm(todayText)
			}
		},
		computed: {
			isEditing() {
				return this.mode !== 'list'
			},
			pageTitle() {
				return this.mode === 'create' ? '新增记录' : '编辑记录'
			},
			formTitle() {
				return this.mode === 'create' ? '新增经期信息' : '修改经期信息'
			},
			heroTitle() {
				if (this.mode === 'create') return '记录今天的状态'
				if (this.mode === 'edit') return '修改这条记录'
				if (!this.list.length) return '全部经期记录'
				return `已有 ${this.list.length} 条记录`
			},
			heroDesc() {
				if (this.mode === 'create') return '日历已默认选中今天'
				if (this.mode === 'edit') return '可以修改日期和状态内容'
				if (!this.list.length) return '点击右上角新增第一条记录'
				const latest = this.list[0]
				return latest.endDate ? `最近一次 ${latest.startDate}` : `当前经期开始于 ${latest.startDate}`
			},
			calendarDays() {
				const first = new Date(this.currentYear, this.currentMonth, 1)
				const start = new Date(this.currentYear, this.currentMonth, 1 - first.getDay())
				const days = []
				for (let i = 0; i < 42; i++) {
					const date = new Date(start)
					date.setDate(start.getDate() + i)
					days.push({
						date: formatDate(date),
						day: date.getDate(),
						inMonth: date.getMonth() === this.currentMonth
					})
				}
				return days
			}
		},
		onShow() {
			this.init()
		},
		methods: {
			createEmptyForm(startDate = '') {
				return {
					startDate,
					endDate: '',
					flow: '',
					pain: '',
					mood: '',
					note: ''
				}
			},
			init() {
				const profile = uni.getStorageSync('wxUserProfile') || {}
				this.openId = profile.openId || ''
				if (!this.openId) {
					uni.showToast({ title: '请先登录', icon: 'none' })
					setTimeout(() => uni.navigateBack(), 600)
					return
				}
				this.loadList()
			},
			async loadList() {
				const res = await lifeData.listPeriods({ openId: this.openId })
				if (res.errCode) {
					uni.showToast({ title: res.errMsg || '获取失败', icon: 'none' })
					return
				}
				this.list = res.list || []
			},
			startCreate() {
				const today = new Date()
				const todayText = formatDate(today)
				this.mode = 'create'
				this.editingId = ''
				this.form = this.createEmptyForm(todayText)
				this.selectedDate = todayText
				this.currentYear = today.getFullYear()
				this.currentMonth = today.getMonth()
			},
			startEdit(item) {
				const date = parseDate(item.startDate) || new Date()
				this.mode = 'edit'
				this.editingId = item.id
				this.form = {
					startDate: item.startDate || formatDate(date),
					endDate: item.endDate || '',
					flow: item.flow || '',
					pain: item.pain || '',
					mood: item.mood || '',
					note: item.note || ''
				}
				this.selectedDate = this.form.startDate
				this.currentYear = date.getFullYear()
				this.currentMonth = date.getMonth()
			},
			cancelEdit() {
				this.mode = 'list'
				this.editingId = ''
			},
			changeMonth(offset) {
				const date = new Date(this.currentYear, this.currentMonth + offset, 1)
				this.currentYear = date.getFullYear()
				this.currentMonth = date.getMonth()
			},
			selectDate(day) {
				this.selectedDate = day.date
				this.form.startDate = day.date
				const date = parseDate(day.date)
				if (date && !day.inMonth) {
					this.currentYear = date.getFullYear()
					this.currentMonth = date.getMonth()
				}
			},
			onStartDateChange(event) {
				this.form.startDate = event.detail.value
				this.selectedDate = event.detail.value
				const date = parseDate(event.detail.value)
				if (date) {
					this.currentYear = date.getFullYear()
					this.currentMonth = date.getMonth()
				}
			},
			onEndDateChange(event) {
				this.form.endDate = event.detail.value
			},
			async saveRecord() {
				if (!this.form.startDate) {
					uni.showToast({ title: '请选择开始日期', icon: 'none' })
					return
				}

				this.saving = true
				try {
					const payload = { openId: this.openId, ...this.form }
					const res = this.mode === 'edit'
						? await lifeData.updatePeriod({ ...payload, id: this.editingId })
						: await lifeData.addPeriod(payload)
					if (res.errCode) throw new Error(res.errMsg || '保存失败')
					uni.showToast({ title: '保存成功', icon: 'success' })
					await this.loadList()
					this.cancelEdit()
				} catch (err) {
					uni.showToast({ title: err.message || '保存失败', icon: 'none' })
				} finally {
					this.saving = false
				}
			},
			deleteRecord(item) {
				uni.showModal({
					title: '删除记录',
					content: '确定删除这条经期记录吗？',
					success: async (res) => {
						if (!res.confirm) return
						const delRes = await lifeData.deletePeriod({ openId: this.openId, id: item.id })
						if (delRes.errCode) {
							uni.showToast({ title: delRes.errMsg || '删除失败', icon: 'none' })
							return
						}
						this.loadList()
					}
				})
			},
			formatDateRange(item) {
				return item.endDate ? `${item.startDate} 至 ${item.endDate}` : item.startDate
			},
			formatRecordDesc(item) {
				const parts = [item.flow, item.pain, item.mood, item.note].filter(Boolean)
				return parts.length ? parts.join(' · ') : '没有备注'
			},
			hasRecord(date) {
				return this.list.some((item) => item.startDate === date && item.id !== this.editingId)
			},
			isSelected(date) {
				return this.selectedDate === date || this.form.startDate === date
			},
			isToday(date) {
				return date === formatDate(new Date())
			},
			getMonth(value) {
				const date = parseDate(value)
				return date ? date.getMonth() + 1 : '--'
			},
			getDay(value) {
				const date = parseDate(value)
				return date ? date.getDate() : '--'
			}
		}
	}
</script>

<style>
	page {
		background: #eeeeee;
	}

	.page {
		min-height: 100vh;
		padding: 0 34rpx 56rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, #fff4f8 0%, #f6f3f4 52%, #eeeeee 100%);
	}

	.hero {
		margin: 0 -34rpx;
		padding: 42rpx 34rpx 66rpx;
		background: linear-gradient(180deg, #ffe1eb 0%, #ffdce8 100%);
		border-bottom-left-radius: 48rpx;
		border-bottom-right-radius: 48rpx;
	}

	.hero-card,
	.section-head,
	.record,
	.record-actions,
	.calendar-head,
	.week-row,
	.day-grid,
	.field,
	.chip-row,
	.button-row {
		display: flex;
		align-items: center;
	}

	.add-action {
		width: 64rpx;
		height: 64rpx;
	}

	.add-action,
	.month-button,
	.drop-icon,
	.empty-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-action {
		border-radius: 50%;
		background: #ffffff;
		line-height: 1;
		color: #ff7fa6;
		box-shadow: 0 12rpx 24rpx rgba(244, 99, 141, 0.16);
	}

	.add-action {
		font-size: 42rpx;
		font-weight: 300;
	}

	.hero-card {
		justify-content: space-between;
	}

	.hero-copy {
		min-width: 0;
	}

	.hello,
	.today,
	.section-title,
	.record-count,
	.record-day,
	.record-month,
	.record-title,
	.record-desc,
	.empty-title,
	.empty-desc,
	.month-title,
	.week-text,
	.day-number,
	.label,
	.value,
	.chips-title {
		display: block;
	}

	.hello {
		font-size: 38rpx;
		line-height: 46rpx;
		font-weight: 900;
		color: #151923;
	}

	.today {
		margin-top: 10rpx;
		font-size: 23rpx;
		line-height: 30rpx;
		font-weight: 600;
		color: #9c8d93;
	}

	.drop-icon {
		width: 82rpx;
		height: 82rpx;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 12rpx 24rpx rgba(244, 99, 141, 0.16);
		font-size: 24rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.list-card,
	.calendar-card,
	.form-card {
		position: relative;
		z-index: 2;
		border-radius: 24rpx;
		background: #ffffff;
		box-shadow: 0 16rpx 34rpx rgba(222, 158, 176, 0.14);
	}

	.list-card,
	.calendar-card {
		margin-top: -36rpx;
	}

	.list-card,
	.form-card {
		padding: 28rpx 26rpx;
	}

	.section-head {
		margin-bottom: 16rpx;
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
		color: #252831;
	}

	.record-count {
		margin-left: auto;
		font-size: 22rpx;
		font-weight: 800;
		color: #a2a6ad;
	}

	.empty-state {
		padding: 58rpx 24rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.empty-icon {
		width: 78rpx;
		height: 78rpx;
		border-radius: 50%;
		background: #fff2f8;
		font-size: 24rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.empty-title {
		margin-top: 24rpx;
		font-size: 28rpx;
		font-weight: 900;
		color: #20232b;
	}

	.empty-desc {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #9b8f96;
	}

	.record {
		min-height: 124rpx;
		padding: 18rpx 0;
		border-bottom: 1rpx solid #f1e7ed;
	}

	.record:last-child {
		border-bottom: none;
	}

	.record-date {
		width: 76rpx;
		height: 76rpx;
		margin-right: 20rpx;
		border-radius: 18rpx;
		background: #fff2f8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.record-day {
		font-size: 28rpx;
		line-height: 32rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.record-month {
		margin-top: 2rpx;
		font-size: 18rpx;
		line-height: 22rpx;
		font-weight: 800;
		color: #b15b84;
	}

	.record-main {
		flex: 1;
		min-width: 0;
	}

	.record-title {
		font-size: 27rpx;
		line-height: 34rpx;
		font-weight: 900;
		color: #20232b;
	}

	.record-desc {
		margin-top: 8rpx;
		font-size: 23rpx;
		line-height: 30rpx;
		color: #9b8f96;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.record-actions {
		margin-left: 18rpx;
		gap: 18rpx;
		flex-shrink: 0;
	}

	.edit,
	.delete {
		font-size: 25rpx;
		font-weight: 900;
		color: #ff7fa6;
	}

	.delete {
		color: #a2a6ad;
	}

	.calendar-card {
		padding: 28rpx 24rpx 24rpx;
	}

	.form-card {
		margin-top: 26rpx;
	}

	.calendar-head {
		justify-content: space-between;
	}

	.month-button {
		width: 58rpx;
		height: 58rpx;
		border-radius: 50%;
		background: #fff2f8;
		font-size: 38rpx;
		line-height: 1;
		color: #ff7fa6;
	}

	.month-title {
		font-size: 30rpx;
		font-weight: 900;
		color: #20232b;
	}

	.week-row {
		margin-top: 24rpx;
	}

	.week-text {
		width: 14.285%;
		text-align: center;
		font-size: 21rpx;
		line-height: 28rpx;
		font-weight: 800;
		color: #a2a6ad;
	}

	.day-grid {
		margin-top: 14rpx;
		flex-wrap: wrap;
	}

	.day-cell {
		position: relative;
		width: 14.285%;
		height: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #20232b;
	}

	.day-cell.dim {
		color: #c3c8cf;
	}

	.day-cell.today-cell .day-number {
		border-color: #ffd3e2;
	}

	.day-cell.selected .day-number {
		background: #ff7fa6;
		border-color: #ff7fa6;
		color: #ffffff;
	}

	.day-number {
		width: 54rpx;
		height: 54rpx;
		border: 2rpx solid transparent;
		border-radius: 50%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		line-height: 1;
		font-weight: 800;
	}

	.record-dot {
		position: absolute;
		left: 50%;
		bottom: 4rpx;
		width: 8rpx;
		height: 8rpx;
		margin-left: -4rpx;
		border-radius: 50%;
		background: #ff7fa6;
	}

	.day-cell.selected .record-dot {
		background: #ffffff;
	}

	.field {
		height: 92rpx;
		justify-content: space-between;
		border-bottom: 1rpx solid #f1e7ed;
	}

	.label {
		font-size: 26rpx;
		font-weight: 900;
		color: #20232b;
	}

	.value {
		font-size: 26rpx;
		font-weight: 800;
		color: #ff7fa6;
	}

	.value.subtle {
		color: #a2a6ad;
	}

	.chips {
		margin-top: 24rpx;
	}

	.chips-title {
		margin-bottom: 14rpx;
		font-size: 26rpx;
		font-weight: 900;
		color: #20232b;
	}

	.chip-row {
		gap: 16rpx;
	}

	.chip {
		min-width: 100rpx;
		padding: 14rpx 24rpx;
		border-radius: 999rpx;
		box-sizing: border-box;
		background: #fff2f8;
		text-align: center;
		color: #b15b84;
		font-size: 25rpx;
		font-weight: 800;
	}

	.chip.active {
		background: #ff7fa6;
		color: #ffffff;
	}

	.input,
	.textarea {
		width: 100%;
		box-sizing: border-box;
		margin-top: 22rpx;
		padding: 22rpx 24rpx;
		border-radius: 16rpx;
		background: #fff7fb;
		font-size: 26rpx;
		color: #20232b;
	}

	.input {
		height: 88rpx;
	}

	.textarea {
		height: 150rpx;
	}

	.placeholder {
		color: #b8c0cc;
	}

	.button-row {
		margin-top: 30rpx;
		gap: 18rpx;
	}

	.cancel-button,
	.save-button {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 999rpx;
		font-size: 29rpx;
		font-weight: 900;
	}

	.cancel-button {
		background: #fff2f8;
		color: #b15b84;
	}

	.save-button {
		background: #ff7fa6;
		box-shadow: 0 12rpx 24rpx rgba(255, 127, 166, 0.22);
		color: #ffffff;
	}

	.cancel-button::after,
	.save-button::after {
		border: none;
	}
</style>
