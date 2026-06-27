const db = uniCloud.database()
const configs = db.collection('ai-configs')
const DEFAULT_MODEL = 'deepseek-chat'

function normalizeModel(model = '') {
	return (model || DEFAULT_MODEL).trim() || DEFAULT_MODEL
}

function requireOpenId(openId) {
	if (!openId) throw new Error('请先登录')
}

function maskKey(key = '') {
	if (!key) return ''
	if (key.length <= 10) return '已配置'
	return `${key.slice(0, 6)}****${key.slice(-4)}`
}

function normalizeBaseUrl(baseUrl = '') {
	const url = (baseUrl || 'https://api.deepseek.com').trim().replace(/\/+$/, '')
	return url || 'https://api.deepseek.com'
}

module.exports = {
	async getConfig(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)

			const res = await configs.where({ openid: openId }).limit(1).get()
			const config = res.data[0]
			if (!config) {
				return {
					errCode: 0,
					config: {
						apiKey: '',
						model: DEFAULT_MODEL,
						baseUrl: 'https://api.deepseek.com',
						systemPrompt: ''
					}
				}
			}

			return {
				errCode: 0,
				config: {
					hasApiKey: Boolean(config.api_key),
					apiKey: maskKey(config.api_key),
					model: normalizeModel(config.model),
					baseUrl: config.base_url || 'https://api.deepseek.com',
					systemPrompt: config.system_prompt || ''
				}
			}
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '获取 AI 配置失败' }
		}
	},

	async saveConfig(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)

			const now = Date.now()
			const old = await configs.where({ openid: openId }).limit(1).get()
			const oldRecord = old.data[0]
			const apiKey = params.apiKey || (oldRecord && oldRecord.api_key) || ''
			if (!apiKey) throw new Error('请填写 API Key')

			const record = {
				openid: openId,
				api_key: apiKey,
				model: normalizeModel(params.model),
				base_url: normalizeBaseUrl(params.baseUrl),
				system_prompt: params.systemPrompt || '',
				updated_at: now
			}

			if (oldRecord) {
				await configs.doc(oldRecord._id).update(record)
			} else {
				await configs.add({ ...record, created_at: now })
			}

			return { errCode: 0 }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '保存 AI 配置失败' }
		}
	}
}
