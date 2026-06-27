const db = uniCloud.database()
const configs = db.collection('ai-configs')
const readings = db.collection('tarot-readings')
const DEFAULT_MODEL = 'deepseek-chat'
const DEFAULT_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_SYSTEM_PROMPT = [
	'你是一个温柔、克制、有陪伴感的心事整理助手。',
	'你可以借助卡牌意象帮助用户观察情绪、关系和行动选择，但不要做命运预测，不要使用绝对化结论，不要制造恐惧。',
	'回答要适合微信小程序场景，重点放在自我觉察、温和提醒和可执行的小行动。'
].join('')

function requireOpenId(openId) {
	if (!openId) throw new Error('请先登录')
}

function normalizeBaseUrl(baseUrl = '') {
	return (baseUrl || DEFAULT_BASE_URL).trim().replace(/\/+$/, '') || DEFAULT_BASE_URL
}

function normalizeModel(model = '') {
	return (model || DEFAULT_MODEL).trim() || DEFAULT_MODEL
}

function buildUserPrompt(params = {}) {
	const cards = (params.cards || [])
		.map((card, index) => `${index + 1}. ${card.position || '牌位'}：${card.name || '未知牌'}，${card.orientation || '正位'}，含义：${card.meaning || '无'}`)
		.join('\n')

	return [
		`用户心事：${params.question || '今天我需要怎样的提醒？'}`,
		`牌阵：${params.spread || '今日指引'}`,
		'抽到的牌：',
		cards,
		'请用中文输出，分为三小段：整体感受、牌位提示、可以尝试的小行动。',
		'语气要温柔具体，像在陪用户整理心事；避免绝对判断、神秘化承诺或让用户恐惧的表达。',
		'总字数控制在 180 到 260 字。'
	].join('\n')
}

function getMessageText(data) {
	const message = data && data.choices && data.choices[0] && data.choices[0].message
	if (!message) return ''
	return message.content || message.reasoning_content || ''
}

function createConfig(params = {}, savedConfig = {}) {
	return {
		api_key: params.apiKey || savedConfig.api_key,
		model: normalizeModel(params.model || savedConfig.model),
		base_url: params.baseUrl || savedConfig.base_url || DEFAULT_BASE_URL,
		system_prompt: params.systemPrompt || savedConfig.system_prompt || ''
	}
}

async function requestDeepSeek(config, params, options = {}) {
	const url = `${normalizeBaseUrl(config.base_url)}/chat/completions`
	const maxTokens = options.maxTokens || 420
	const timeout = options.timeout || 12000
	const startedAt = Date.now()
	let res
	try {
		res = await uniCloud.httpclient.request(url, {
			method: 'POST',
			contentType: 'json',
			dataType: 'json',
			timeout,
			headers: {
				Authorization: `Bearer ${config.api_key}`
			},
			data: {
				model: normalizeModel(config.model),
				messages: [
					{
						role: 'system',
						content: config.system_prompt || DEFAULT_SYSTEM_PROMPT
					},
					{
						role: 'user',
						content: buildUserPrompt(params)
					}
				],
				temperature: 0.65,
				max_tokens: maxTokens,
				stream: false
			}
		})
	} catch (err) {
		const message = err.message || ''
		if (message.toLowerCase().indexOf('timeout') > -1 || message.indexOf('超时') > -1) {
			throw new Error('DeepSeek 连接超时，请稍后再试，或检查 uniCloud 云空间是否能访问 api.deepseek.com')
		}
		throw new Error(`DeepSeek 请求异常：${message || 'unknown'}`)
	}

	if (res.status !== 200 || !res.data) {
		throw new Error(`AI 请求失败：${res.status || 'unknown'}`)
	}
	if (res.data.error) {
		throw new Error(res.data.error.message || 'AI 返回错误')
	}
	return {
		text: getMessageText(res.data),
		model: res.data.model || config.model || DEFAULT_MODEL,
		finishReason: res.data.choices && res.data.choices[0] ? res.data.choices[0].finish_reason : '',
		duration: Date.now() - startedAt
	}
}

module.exports = {
	async read(params = {}) {
		try {
			const openId = params.openId
			requireOpenId(openId)
			if (!params.question) throw new Error('请先输入想整理的问题')
			if (!params.cards || !params.cards.length) throw new Error('请先抽牌')

			const configRes = await configs.where({ openid: openId }).limit(1).get()
			const config = configRes.data[0]
			if (!config || !config.api_key) {
				throw new Error('请先在我的-服务与设置-AI配置中填写 DeepSeek API Key')
			}

			const result = await requestDeepSeek(createConfig({}, config), params)
			const answer = result.text
			if (!answer) throw new Error('AI 没有返回解读内容')

			await readings.add({
				openid: openId,
				question: params.question,
				spread: params.spread || '今日指引',
				cards: params.cards,
				answer,
				created_at: Date.now()
			})

			return { errCode: 0, answer }
		} catch (err) {
			return { errCode: 500, errMsg: err.message || '心事卡牌解读失败' }
		}
	}
}
