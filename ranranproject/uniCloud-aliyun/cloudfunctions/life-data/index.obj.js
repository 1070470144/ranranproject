const db = uniCloud.database()
const periods = db.collection('period-records')
const wardrobe = db.collection('wardrobe-items')

function requireOpenId(openId) {
	if (!openId) {
		throw new Error('请先登录')
	}
}

function normalizePeriod(record) {
	return {
		id: record._id,
		openId: record.openid,
		startDate: record.start_date || '',
		endDate: record.end_date || '',
		flow: record.flow || '',
		pain: record.pain || '',
		mood: record.mood || '',
		note: record.note || '',
		createdAt: record.created_at || null,
		updatedAt: record.updated_at || null
	}
}

function parseDate(dateText) {
	if (!dateText) return null
	const date = new Date(`${dateText.replace(/-/g, '/')} 00:00:00`)
	return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(date) {
	const year = date.getFullYear()
	const month = `${date.getMonth() + 1}`.padStart(2, '0')
	const day = `${date.getDate()}`.padStart(2, '0')
	return `${year}-${month}-${day}`
}

function calculatePeriodForecast(records = []) {
	const sorted = records
		.map(normalizePeriod)
		.filter((item) => parseDate(item.startDate))
		.sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime())

	if (!sorted.length) return null

	const latest = sorted[sorted.length - 1]
	const intervals = []
	for (let i = 1; i < sorted.length; i++) {
		const prev = parseDate(sorted[i - 1].startDate)
		const current = parseDate(sorted[i].startDate)
		const diffDays = Math.round((current.getTime() - prev.getTime()) / 86400000)
		intervals.push(diffDays)
	}

	const cycleDays = intervals.length
		? Math.round(intervals.reduce((sum, item) => sum + item, 0) / intervals.length)
		: 28
	const latestStart = parseDate(latest.startDate)
	const nextStart = new Date(latestStart)
	nextStart.setDate(nextStart.getDate() + cycleDays)

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	return {
		latestPeriod: latest,
		cycleDays,
		basisCount: intervals.length,
		nextStartDate: formatDate(nextStart),
		daysToNextPeriod: Math.ceil((nextStart.getTime() - today.getTime()) / 86400000),
		isCurrentPeriod: !latest.endDate
	}
}

function normalizeWardrobeItem(item) {
	return {
		id: item._id,
		openId: item.openid,
		name: item.name || '',
		category: item.category || '',
		size: item.size || '',
		color: item.color || '',
		brand: item.brand || '',
		price: item.price || '',
		buyDate: item.buy_date || '',
		note: item.note || '',
		originalImages: item.original_images || [],
		wearImages: item.wear_images || [],
		isShared: Boolean(item.is_shared),
		createdAt: item.created_at || null,
		updatedAt: item.updated_at || null
	}
}

module.exports = {
	async getHomeSummary(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)

			const periodRes = await periods.where({ openid: openId }).orderBy('start_date', 'desc').limit(12).get()
			const wardrobeRes = await wardrobe.where({ openid: openId }).orderBy('created_at', 'desc').limit(4).get()
			const allWardrobeRes = await wardrobe.where({ openid: openId }).count()
			const latestPeriod = periodRes.data[0] ? normalizePeriod(periodRes.data[0]) : null

			return {
				errCode: 0,
				periodCount: periodRes.data.length,
				wardrobeCount: allWardrobeRes.total,
				latestPeriod,
				recentWardrobe: wardrobeRes.data.map(normalizeWardrobeItem)
			}
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '获取首页数据失败' }
		}
	},

	async listPeriods(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)

			const res = await periods.where({ openid: openId }).orderBy('start_date', 'desc').limit(100).get()
			return {
				errCode: 0,
				list: res.data.map(normalizePeriod)
			}
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '获取经期记录失败' }
		}
	},

	async addPeriod(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)

			if (!params.startDate) {
				throw new Error('请选择开始日期')
			}

			const now = Date.now()
			await periods.add({
				openid: openId,
				start_date: params.startDate,
				end_date: params.endDate || '',
				flow: params.flow || '',
				pain: params.pain || '',
				mood: params.mood || '',
				note: params.note || '',
				created_at: now,
				updated_at: now
			})

			return { errCode: 0 }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '保存经期记录失败' }
		}
	},

	async updatePeriod(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)
			if (!params.id) {
				throw new Error('缺少记录 ID')
			}
			if (!params.startDate) {
				throw new Error('请选择开始日期')
			}

			const res = await periods.doc(params.id).get()
			const record = res.data[0]
			if (!record || record.openid !== openId) {
				throw new Error('记录不存在')
			}

			await periods.doc(params.id).update({
				start_date: params.startDate,
				end_date: params.endDate || '',
				flow: params.flow || '',
				pain: params.pain || '',
				mood: params.mood || '',
				note: params.note || '',
				updated_at: Date.now()
			})

			return { errCode: 0 }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '更新经期记录失败' }
		}
	},

	async deletePeriod(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)
			if (!params.id) {
				throw new Error('缺少记录 ID')
			}

			const res = await periods.doc(params.id).get()
			const record = res.data[0]
			if (!record || record.openid !== openId) {
				throw new Error('记录不存在')
			}

			await periods.doc(params.id).remove()
			return { errCode: 0 }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '删除经期记录失败' }
		}
	},

	async listWardrobe(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)

			const res = await wardrobe.where({ openid: openId }).orderBy('created_at', 'desc').limit(100).get()
			return {
				errCode: 0,
				list: res.data.map(normalizeWardrobeItem)
			}
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '获取衣柜失败' }
		}
	},

	async getWardrobeItem(params = {}) {
		try {
			if (!params.id) {
				throw new Error('缺少裙子 ID')
			}

			const res = await wardrobe.doc(params.id).get()
			const item = res.data[0]
			if (!item) {
				throw new Error('裙子不存在')
			}
			if (params.ownerOpenId && item.openid !== params.ownerOpenId) {
				throw new Error('裙子不存在')
			}

			return {
				errCode: 0,
				item: normalizeWardrobeItem(item)
			}
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '获取裙子详情失败' }
		}
	},

	async addWardrobeItem(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)

			if (!params.name) {
				throw new Error('请输入裙子名称')
			}

			const now = Date.now()
			await wardrobe.add({
				openid: openId,
				name: params.name,
				category: params.category || '',
				size: params.size || '',
				color: params.color || '',
				brand: params.brand || '',
				price: params.price || '',
				buy_date: params.buyDate || '',
				note: params.note || '',
				original_images: params.originalImages || [],
				wear_images: params.wearImages || [],
				is_shared: Boolean(params.isShared),
				created_at: now,
				updated_at: now
			})

			return { errCode: 0 }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '保存衣柜记录失败' }
		}
	},

	async updateWardrobeItem(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)
			if (!params.id) {
				throw new Error('缺少记录 ID')
			}
			if (!params.name) {
				throw new Error('请输入裙子名称')
			}

			const res = await wardrobe.doc(params.id).get()
			const item = res.data[0]
			if (!item || item.openid !== openId) {
				throw new Error('记录不存在')
			}

			await wardrobe.doc(params.id).update({
				name: params.name,
				category: params.category || '',
				size: params.size || '',
				color: params.color || '',
				brand: params.brand || '',
				price: params.price || '',
				buy_date: params.buyDate || '',
				note: params.note || '',
				original_images: params.originalImages || [],
				wear_images: params.wearImages || [],
				is_shared: Boolean(params.isShared),
				updated_at: Date.now()
			})

			return { errCode: 0 }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '更新衣柜记录失败' }
		}
	},

	async deleteWardrobeItem(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)
			if (!params.id) {
				throw new Error('缺少记录 ID')
			}

			const res = await wardrobe.doc(params.id).get()
			const item = res.data[0]
			if (!item || item.openid !== openId) {
				throw new Error('记录不存在')
			}

			await wardrobe.doc(params.id).remove()
			return { errCode: 0 }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '删除衣柜记录失败' }
		}
	}
}
