const db = uniCloud.database()
const users = db.collection('wx-users')

const WEIXIN_APPID = 'wx43f5948811681120'
const WEIXIN_SECRET = 'c6fd8afb120af28457cdf5e9ebad0b1f'

function assertWeixinConfig() {
	if (!WEIXIN_APPID || !WEIXIN_SECRET) {
		throw new Error('请先在 wx-user 云对象中配置微信小程序 appid 和 secret')
	}
}

function normalizeProfile(user) {
	return {
		openId: user.openid,
		nickname: user.nickname || '',
		avatarUrl: user.avatar_url || '',
		wardrobeName: user.wardrobe_name || '',
		createdAt: user.created_at || null,
		updatedAt: user.updated_at || null
	}
}

async function getOpenIdByCode(code) {
	assertWeixinConfig()

	const res = await uniCloud.httpclient.request('https://api.weixin.qq.com/sns/jscode2session', {
		method: 'GET',
		dataType: 'json',
		data: {
			appid: WEIXIN_APPID,
			secret: WEIXIN_SECRET,
			js_code: code,
			grant_type: 'authorization_code'
		}
	})

	const data = res.data || {}
	if (!data.openid) {
		throw new Error(data.errmsg || '微信登录失败')
	}

	return data.openid
}

module.exports = {
	_before: function() {},

	async loginByWeixin(params = {}) {
		const code = params.code
		if (!code) {
			return { errCode: 400, errMsg: '缺少登录 code' }
		}

		try {
			const openid = await getOpenIdByCode(code)
			const now = Date.now()
			const existRes = await users.where({ openid }).limit(1).get()
			let user = existRes.data[0]

			if (!user) {
				const addRes = await users.add({
					openid,
					nickname: '',
					avatar_url: '',
					created_at: now,
					updated_at: now
				})
				user = {
					_id: addRes.id,
					openid,
					nickname: '',
					avatar_url: '',
					wardrobe_name: '',
					created_at: now,
					updated_at: now
				}
			}

			return {
				errCode: 0,
				userInfo: normalizeProfile(user)
			}
		} catch (err) {
			return {
				errCode: 500,
				errMsg: err.message || '登录失败'
			}
		}
	},

	async updateProfile(params = {}) {
		const openid = params.openId
		const nickname = (params.nickname || '').trim()
		const avatarUrl = params.avatarUrl || ''
		const wardrobeName = (params.wardrobeName || '').trim()

		if (!openid) {
			return { errCode: 400, errMsg: '缺少 openId' }
		}

		try {
			const now = Date.now()
			const existRes = await users.where({ openid }).limit(1).get()
			const user = existRes.data[0]
			const payload = {
				nickname,
				avatar_url: avatarUrl,
				wardrobe_name: wardrobeName,
				updated_at: now
			}

			if (user) {
				await users.doc(user._id).update(payload)
				return {
					errCode: 0,
					userInfo: normalizeProfile({ ...user, ...payload })
				}
			}

			const addRes = await users.add({
				openid,
				...payload,
				created_at: now
			})
			return {
				errCode: 0,
				userInfo: normalizeProfile({
					_id: addRes.id,
					openid,
					...payload,
					created_at: now
				})
			}
		} catch (err) {
			return {
				errCode: 500,
				errMsg: err.message || '保存失败'
			}
		}
	}
}
