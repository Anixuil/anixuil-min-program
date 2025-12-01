# 全局公共参数

**全局Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**全局Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**全局Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**全局认证方式**

> Bearer Token

> 在Header添加参数 Authorization，其值为在Bearer之后拼接空格和访问令牌

> Authorization: Bearer your_access_token

# 状态码说明

| 状态码   | 中文描述 |
| -------- | -------- |
| 暂无参数 |

# AU(Ani-Upms)

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-12 21:09:33

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

# Ani-server

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-12 21:09:33

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## sysUser

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-12 21:09:33

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

### 添加用户

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:56:07

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/addSysUser

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/addSysUser?apipost_id=12338352bcb012

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"userName": "炒粉",
	"userPassword": "123456",
	"userEmail": "1028793552@qq.com"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "用户添加成功",
	"data": {
		"userId": 6,
		"userName": "炒粉",
		"userAge": null,
		"userAlias": null,
		"userEmail": "1028793552@qq.com",
		"userPassword": "$2b$10$3wU7z3bZqxs3m0ePdn6WZeoXyYKCdHOuK8ZEDj1vKdWRL3fgq0UQa",
		"wxOpenId": null,
		"wxUnionId": null,
		"wxAvatarUrl": null,
		"createdAt": "2025-11-13T12:55:55.742Z",
		"updatedAt": "2025-11-13T12:55:55.742Z",
		"createBy": 0,
		"updateBy": 0
	},
	"timestamp": 1763038555845
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "邮箱已存在",
			"message": "邮箱已存在"
		}
	]
}
```

**Query**

### 获取用户信息

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:57:07

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/getUserInfo

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/getUserInfo?apipost_id=123383537cb013

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "获取用户信息成功",
	"data": {
		"userId": 1,
		"userName": "Anixuil",
		"userEmail": "1140040227@qq.com",
		"userAge": null,
		"userAlias": null,
		"wxOpenId": null,
		"wxUnionId": null,
		"wxAvatarUrl": null,
		"createdAt": "2025-06-22T07:34:25.957Z",
		"updatedAt": "2025-06-22T07:34:25.957Z"
	},
	"timestamp": 1763038567278
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 发送邮箱验证码

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:57:05

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/sendEmailCode

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/sendEmailCode?apipost_id=123383537cb014

**请求方式**

> POST

**Content-Type**

> json

**请求Query参数**

| 参数名     | 示例值                 | 参数类型 | 是否必填 | 参数描述 |
| ---------- | ---------------------- | -------- | -------- | -------- |
| userEmail  | 2330602250@qq.com      | string   | 是       | -        |
| emailTitle | 羽球对决补充信息验证码 | string   | 是       | -        |

**请求Body参数**

```javascript
{
	"userEmail": "2330602250@qq.com",
	"emailTitle": "羽球对决验证码"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "发送邮箱验证码成功",
	"data": true,
	"timestamp": 1763038584343
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 验证邮箱验证码

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:57:03

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/verifyEmailCode

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/verifyEmailCode?apipost_id=123383537cb017

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"userEmail": "2330602250@qq.com",
	"code": "179676"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "验证邮箱验证码成功",
	"data": true,
	"timestamp": 1763038613802
}
```

- 失败(404)

```javascript
{
	"code": 200,
	"message": "验证邮箱验证码失败",
	"data": false,
	"timestamp": 1763038594375
}
```

**Query**

### 修改用户信息

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:59:03

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /sys-user/updateUserInfo

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/updateUserInfo?apipost_id=12338353bcb018

**请求方式**

> PUT

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"userEmail": "114004022@qq.com"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "userId:",
			"message": "userId: Required"
		},
		{
			"field": "userName:",
			"message": "userName: Required"
		}
	]
}
```

**Query**

## auth

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-12 21:09:33

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

### 注册

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-21 10:23:45

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/register

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/register?apipost_id=12338353bcb01b

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"userName": "Anixuil",
	"userPassword": "Anixuil",
	"userEmail": "1140040227@qq.com"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "注册成功",
	"data": {
		"userId": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
		"userName": "Anixuil",
		"userAge": null,
		"userAlias": null,
		"userEmail": "1140040227@qq.com",
		"userPhone": null,
		"userGender": null,
		"userAvatar": null,
		"userPassword": "$2b$10$j4jKnuMVRIZwUWu93iV5UecsEm6ME7F1utX9QB9nhOVDEqS9rBQQG",
		"wxOpenId": null,
		"wxUnionId": null,
		"wxAvatarUrl": null,
		"isDeleted": false,
		"createdAt": "2025-11-21T02:01:08.700Z",
		"updatedAt": "2025-11-21T02:01:08.700Z",
		"createBy": "0",
		"updateBy": "0"
	},
	"timestamp": 1763690468941
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 登录

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-27 19:54:12

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/login

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/login?apipost_id=12338353bcb01c

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名        | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| ------------- | ------ | -------- | -------- | -------- |
| Authorization | -      | string   | 是       | -        |

**请求Body参数**

```javascript
{
	"userEmail": "1140040227@qq.com",
	"userPassword": "Anixuil"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "登录成功",
	"data": {
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkODhkNTY5MS1iNzkwLTQ1ZTktYWQ5ZS1hYjJkZjljOWNmNmEiLCJ1c2VyTmFtZSI6IkFuaXh1aWwiLCJ1c2VyQWxpYXMiOm51bGwsInVzZXJFbWFpbCI6IjExNDAwNDAyMjdAcXEuY29tIiwidXNlckFnZSI6bnVsbCwiaWF0IjoxNzYzNzMxODg5LCJleHAiOjE3NjM4MTgyODl9.EoucchiK5kwfAx4OVbiimUIq8ZeGlGxlgBmFS8w7jKI",
		"userInfo": {
			"userId": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"userName": "Anixuil",
			"userEmail": "1140040227@qq.com",
			"userAge": null,
			"userAlias": null,
			"wxOpenId": null,
			"wxUnionId": null,
			"wxAvatarUrl": null,
			"createdAt": "2025-11-21T02:01:08.700Z",
			"updatedAt": "2025-11-21T02:01:08.700Z",
			"badmintonInfo": {
				"id": "9f0b5c15-f7f6-4bb9-8486-6f25b59fd0e1",
				"userId": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
				"score": 0,
				"isDeleted": false,
				"createdAt": "2025-11-21T02:01:08.792Z",
				"updatedAt": "2025-11-21T02:01:08.792Z",
				"createBy": "0",
				"updateBy": "0"
			}
		}
	},
	"timestamp": 1763731890003
}
```

- 失败(404)

```javascript
暂无数据;
```

**请求Header参数**

| 参数名        | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| ------------- | ------ | -------- | -------- | -------- |
| Authorization | -      | string   | 是       | -        |

**Query**

### 检查邮箱是否存在

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:57:40

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/checkEmailIsExists?userEmail=1140040227@qq.com

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/checkEmailIsExists?apipost_id=12338353fcb01e

**请求方式**

> GET

**Content-Type**

> json

**请求Query参数**

| 参数名    | 示例值            | 参数类型 | 是否必填 | 参数描述 |
| --------- | ----------------- | -------- | -------- | -------- |
| userEmail | 1140040227@qq.com | string   | 是       | -        |

**请求Body参数**

```javascript
{
	"userName": "anixuil",
	"userPassword": "123456",
	"userEmail": "1140040227@qq.com"
}
```

**认证方式**

> 无需认证

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "邮箱已存在",
	"data": true,
	"timestamp": 1763038646885
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 微信登录

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:45:24

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/wxLogin

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/wxLogin?apipost_id=12338353fcb020

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"code": "0b3ikE1w3TPTI53Os02w3NE98O0ikE1J",
	"avatarUrl": "",
	"nickName": ""
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 注销

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:58:02

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-user/logout

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-user/logout?apipost_id=12338353fcb021

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名        | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| ------------- | ------ | -------- | -------- | -------- |
| Authorization | -      | string   | 是       | -        |

**请求Body参数**

```javascript
{
	"userEmail": "1140040227@qq.com",
	"userPassword": "l20010207"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "注销成功",
	"data": true,
	"timestamp": 1763038660871
}
```

- 失败(404)

```javascript
{
	"code": 401,
	"message": "Unauthorized",
	"data": null,
	"timestamp": 1763038670444,
	"path": "/ani-server/sys-user/logout"
}
```

**请求Header参数**

| 参数名        | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| ------------- | ------ | -------- | -------- | -------- |
| Authorization | -      | string   | 是       | -        |

**Query**

## ai

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-12 21:09:33

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

### deepseek

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:53:42

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /ai/deepseek

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /ai/deepseek?apipost_id=123383543cb024

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"model": "deepseek-reasoner",
	"messages": [
		{
			"role": "system",
			"content": "你是一个智能助手"
		},
		{
			"role": "user",
			"content": "你好!"
		}
	],
	"stream": true
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript

id: 1
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"role":"assistant","content":null,"reasoning_content":""},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"嗯"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 2
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"，"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 3
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"用户"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"发"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 4
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"来"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"一个"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 5
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"简单的"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"问候"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 6
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"“"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"你好"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 7
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"！"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"”。"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 8
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"这是一个"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"非常"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 9
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"基础的"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"社交"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 10
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"开场"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"白"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 11
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"，"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"不需要"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 12
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"复杂"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"分析"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 13
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"。"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 14
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"\n\n"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"考虑到"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"这是"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 15
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"对话"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"的开始"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 16
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"，"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"应该"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 17
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"用"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"友好"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 18
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"热情"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 19
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"的语气"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 20
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"回应"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"，"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 21
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"同时"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"保持"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 22
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"开放"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"态度"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 23
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"引导"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"用户"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 24
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"进一步"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 25
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"表达"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 26
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"需求"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"。"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 27
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"可以用"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"标准"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 28
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"问候"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"语"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 29
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"加上"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"服务"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 30
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"范围"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 31
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"提示"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 32
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"。\n\n"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"想到了"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 33
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"用"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"“"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 34
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"你好"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"！”"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 35
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"直接"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 36
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"回应"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 37
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"，"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"加上"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 38
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"表情"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"符号"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 39
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"增强"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 40
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"亲和"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 41
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"力"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"。"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 42
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"然后"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"说明"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 43
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"自己的"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 44
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"功能"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"定位"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 45
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"，"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"用"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 46
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"“"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"随时"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 47
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"为你"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 48
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"提供"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"帮助"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 49
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"”"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"表达"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 50
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"可用"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 51
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"性"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"，"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 52
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"最后"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"用"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 53
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"开放式"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"提问"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 54
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"引导"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 55
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"对话"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 56
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"继续"},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":null,"reasoning_content":"。"},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 57
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"你好","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 58
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"！","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"很高兴","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 59
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"见到","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"你","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 60
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"！","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"有什么","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 61
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"我可以","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"帮助","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 62
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"你的","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"吗","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 63
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"？","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"无论是","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 64
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"解答","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 65
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"问题","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"、","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 66
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"提供","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"信息","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 67
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"，","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"还是","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 68
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"陪你","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"聊天","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 69
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"，","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"我","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 70
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"都在","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 71
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"这里","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"随时","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 72
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"为你","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"提供","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 73
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"帮助","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"！","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 74
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":" 😊","reasoning_content":null},"logprobs":null,"finish_reason":null}]}
data:
data:

id: 75
data: data: {"id":"d9aa97c0-7dd0-4877-bbaf-551034cd4a59","object":"chat.completion.chunk","created":1763038408,"model":"deepseek-reasoner","system_fingerprint":"fp_ffc7281d48_prod0820_fp8_kvcache","choices":[{"index":0,"delta":{"content":"","reasoning_content":null},"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":128,"total_tokens":138,"prompt_tokens_details":{"cached_tokens":0},"completion_tokens_details":{"reasoning_tokens":94},"prompt_cache_hit_tokens":0,"prompt_cache_miss_tokens":10}}
data:
data: data: [DONE]
data:
data:


```

- 失败(404)

```javascript
暂无数据;
```

**Query**

## sysLog

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-12 21:09:33

**系统日志**

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

### 新增系统日志

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:47:28

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-log/addSysLog

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-log/addSysLog?apipost_id=12338354bcb026

**请求方式**

> POST

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

## badminton

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-12 21:09:33

**羽毛球小程序接口**

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

### 比赛

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 09:20:08

> 更新时间: 2025-11-21 09:20:08

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

#### 新建比赛

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-16 21:49:48

> 更新时间: 2025-11-21 15:22:11

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/createMatch

| 环境      | URL                                |
| --------- | ---------------------------------- |
| AP_Server | https://api.anixuil.com/ani-server |

**Mock URL**

> /badminton/createMatch?apipost_id=1722028434402e

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "name": "测试比赛",
    "description": "这是测试比赛描述",
    "planStartTime": "2025-11-21T16:00:00Z",
    "planEndTime": "2025-11-21T18:00:00Z",
    "status": "notStart" // notStart inProgress end
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "比赛创建成功",
	"data": true,
	"timestamp": 1763709720677
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

#### 比赛列表

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 16:25:21

> 更新时间: 2025-11-22 10:39:50

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/listMatch?page=1&pageSize=10

| 环境      | URL                                |
| --------- | ---------------------------------- |
| AP_Server | https://api.anixuil.com/ani-server |

**Mock URL**

> /badminton/listMatch?apipost_id=1d8886237cb133

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| page     | 1      | number   | 是       | -        |
| pageSize | 10     | number   | 是       | -        |
| name     | 测试   | string   | 是       | -        |

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

#### 比赛详情

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 21:32:45

> 更新时间: 2025-11-23 19:46:11

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/match/038031f7-d812-434e-9b52-8222ef564351

| 环境      | URL                                |
| --------- | ---------------------------------- |
| AP_Server | https://api.anixuil.com/ani-server |

**Mock URL**

> /badminton/match/038031f7-d812-434e-9b52-8222ef564351?apipost_id=1dcf0810f44010

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

#### 修改比赛

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 20:28:55

> 更新时间: 2025-11-23 21:02:19

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/updateMatch

| 环境      | URL                                |
| --------- | ---------------------------------- |
| AP_Server | https://api.anixuil.com/ani-server |

**Mock URL**

> /badminton/updateMatch?apipost_id=2053a65e34442a

**请求方式**

> PUT

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "id": "038031f7-d812-434e-9b52-8222ef564351",
    "status": "notStart"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "比赛信息修改成功",
	"data": true,
	"timestamp": 1763901577344
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

#### 删除比赛

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 20:34:46

> 更新时间: 2025-11-23 20:36:22

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/deleteMatch/038031f7-d812-434e-9b52-8222ef564351

| 环境      | URL                                |
| --------- | ---------------------------------- |
| AP_Server | https://api.anixuil.com/ani-server |

**Mock URL**

> /badminton/deleteMatch/038031f7-d812-434e-9b52-8222ef564351?apipost_id=2054f9bab44460

**请求方式**

> DELETE

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "比赛删除成功",
	"data": true,
	"timestamp": 1763901368885
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "比赛不存在:",
			"message": "比赛不存在: 038031f7-d812-434e-9b52-8222ef564351"
		}
	]
}
```

**Query**

### 对局

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 21:33:07

> 更新时间: 2025-11-21 21:33:07

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

#### 批量创建对局

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 21:38:00

> 更新时间: 2025-11-23 16:27:37

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/batchCreateMatchGame

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/batchCreateMatchGame?apipost_id=1dcf41f8344040

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "matchId": "038031f7-d812-434e-9b52-8222ef564351",
    "matchGameNum": 8 // 对局数
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "比赛对局创建成功",
	"data": [
		{
			"id": "057bc0cb-1dbd-465b-9343-34bd2077cb39",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.100Z",
			"updatedAt": "2025-11-23T08:27:12.100Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "28653596-3d03-4981-8456-e10a4d6ac794",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.189Z",
			"updatedAt": "2025-11-23T08:27:12.189Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "2d6156e4-54c2-448f-8433-31bea2a49555",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.233Z",
			"updatedAt": "2025-11-23T08:27:12.233Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "55595e99-8771-4c68-bd8c-4e14954ec314",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.146Z",
			"updatedAt": "2025-11-23T08:27:12.146Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "5d6ee1b9-f630-4482-a97e-f72af63d5612",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.211Z",
			"updatedAt": "2025-11-23T08:27:12.211Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "701e7967-8afd-4ad7-8dd3-fbd522836396",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.123Z",
			"updatedAt": "2025-11-23T08:27:12.123Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "b514a914-424d-421b-a936-e0593a16d560",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.054Z",
			"updatedAt": "2025-11-23T08:27:12.054Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "c7db0e62-878d-43d1-8201-1ef8b747d36c",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"totalOdds": 0,
			"isDeleted": false,
			"createdAt": "2025-11-23T08:27:12.168Z",
			"updatedAt": "2025-11-23T08:27:12.168Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		}
	],
	"timestamp": 1763886432353
}
```

- 失败(404)

```javascript
{
	"code": 404,
	"message": "Cannot POST /ani-server/badminton/batchCreateMatchGame",
	"data": null,
	"timestamp": 1763886307478,
	"path": "/ani-server/badminton/batchCreateMatchGame"
}
```

**Query**

#### 批量选手对局绑定

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 17:28:14

> 更新时间: 2025-11-23 19:32:30

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/batchMatchGameBindPlayer

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/batchMatchGameBindPlayer?apipost_id=2029f48d74417a

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
[
  {
    matchGameId: "057bc0cb-1dbd-465b-9343-34bd2077cb39",
    playerId: "30e03cfc-f9ad-4ee3-a144-290ad7325906",
    partnerId: "", // 非必填
    odds: 0, // 非必填
  },
  {
    matchGameId: "057bc0cb-1dbd-465b-9343-34bd2077cb39",
    playerId: "3937a153-3dcd-43b3-ab5e-7a5e20f546ea",
    partnerId: "", // 非必填
    odds: 0, // 非必填
  },
  // {
  //     "matchGameId": "2d6156e4-54c2-448f-8433-31bea2a49555",
  //     "playerId": "4b43fa71-62dd-46fd-b942-e9b4d3df7281",
  //     "partnerId": "", // 非必填
  //     "odds": 0 // 非必填
  // },
  // {
  //     "matchGameId": "55595e99-8771-4c68-bd8c-4e14954ec314",
  //     "playerId": "",
  //     "partnerId": "", // 非必填
  //     "odds": 0 // 非必填
  // },
  // {
  //     "matchGameId": "5d6ee1b9-f630-4482-a97e-f72af63d5612",
  //     "playerId": "",
  //     "partnerId": "", // 非必填
  //     "odds": 0 // 非必填
  // },
  // {
  //     "matchGameId": "701e7967-8afd-4ad7-8dd3-fbd522836396",
  //     "playerId": "",
  //     "partnerId": "", // 非必填
  //     "odds": 0 // 非必填
  // },
  // {
  //     "matchGameId": "b514a914-424d-421b-a936-e0593a16d560",
  //     "playerId": "",
  //     "partnerId": "", // 非必填
  //     "odds": 0 // 非必填
  // },
  // {
  //     "matchGameId": "c7db0e62-878d-43d1-8201-1ef8b747d36c",
  //     "playerId": "",
  //     "partnerId": "", // 非必填
  //     "odds": 0 // 非必填
  // }
];
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "对局绑定选手成功",
	"data": true,
	"timestamp": 1763895175139
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "对局选手绑定异常:",
			"message": "对局选手绑定异常: 对局ID:057bc0cb-1dbd-465b-9343-34bd2077cb39 选手ID:3937a153-3dcd-43b3-ab5e-7a5e20f546ea 搭档ID: 对局选手数量:3"
		}
	]
}
```

**Query**

#### 选手对局解除绑定

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 18:52:08

> 更新时间: 2025-11-23 19:32:14

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/unbindMatchGamePlayer

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/unbindMatchGamePlayer?apipost_id=203d8797b441bb

**请求方式**

> PUT

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "id": "421603bb-b559-4dc7-9349-2facfbaaab3c",
    "matchGameId": "057bc0cb-1dbd-465b-9343-34bd2077cb39",
    "playerId": "", // 非必填，如果和partnerId一起没填，则是取消
    "partnerId": "" // 非必填
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "对局选手绑定取消成功",
	"data": true,
	"timestamp": 1763897518812
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "当前对局一方未绑定选手",
			"message": "当前对局一方未绑定选手 421603bb-b559-4dc7-9349-2facfbaaab3c"
		}
	]
}
```

**Query**

#### 选手绑定对局

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 19:24:34

> 更新时间: 2025-11-23 19:31:56

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/bindMatchGamePlayer

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/bindMatchGamePlayer?apipost_id=2044f36db441fd

**请求方式**

> PUT

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "id": "421603bb-b559-4dc7-9349-2facfbaaab3c",
    "matchGameId": "057bc0cb-1dbd-465b-9343-34bd2077cb39",
    "playerId": "4b43fa71-62dd-46fd-b942-e9b4d3df7281", // 与partnerId必须填一个
    "partnerId": "" // 与playerId必须填一个
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "对局绑定选手成功",
	"data": true,
	"timestamp": 1763897507740
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "选手和搭档必须绑定一个",
			"message": "选手和搭档必须绑定一个"
		}
	]
}
```

**Query**

#### 比赛对局列表

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 19:46:27

> 更新时间: 2025-11-23 19:59:47

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/listMatchGame?page=1&pageSize=10

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/listMatchGame?apipost_id=2049f763744250

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| page     | 1      | number   | 是       | -        |
| pageSize | 10     | number   | 是       | -        |

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
{
	"code": 404,
	"message": "Cannot GET /ani-server/badminton/listMatchGame?page=1&pageSize=10",
	"data": null,
	"timestamp": 1763898428628,
	"path": "/ani-server/badminton/listMatchGame?page=1&pageSize=10"
}
```

**Query**

### 选手

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 21:33:48

> 更新时间: 2025-11-21 21:33:48

```text
暂无描述
```

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

#### 批量创建选手

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 15:30:39

> 更新时间: 2025-11-23 18:11:37

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/batchCreatePlayer

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/batchCreatePlayer?apipost_id=200f6f0a7440d0

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
[
  {
    matchId: "038031f7-d812-434e-9b52-8222ef564351",
    userId: "", // 非必填
    name: "选手1",
  },
  {
    matchId: "038031f7-d812-434e-9b52-8222ef564351",
    userId: "", // 非必填
    name: "选手2",
  },
  {
    matchId: "038031f7-d812-434e-9b52-8222ef564351",
    userId: "", // 非必填
    name: "选手3",
  },
];
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "数据已存在",
			"message": "数据已存在"
		}
	]
}
```

**Query**

#### 选手列表

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 15:51:54

> 更新时间: 2025-11-23 16:12:17

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/listPlayer

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/listPlayer?apipost_id=201447de744100

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "选手列表获取成功",
	"data": [
		{
			"id": "41681b49-1c46-418a-bab2-be4cdb9fcb30",
			"matchId": "038031f7-d812-434e-9b52-8222ef564351",
			"userId": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"name": "选手1",
			"isDeleted": false,
			"createdAt": "2025-11-23T07:35:45.873Z",
			"updatedAt": "2025-11-23T08:11:44.188Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"user": {
				"userId": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
				"userName": "Anixuil",
				"userAge": null,
				"userAlias": null,
				"userEmail": "1140040227@qq.com",
				"userPhone": null,
				"userGender": null,
				"userAvatar": null,
				"userPassword": "******",
				"wxOpenId": null,
				"wxUnionId": null,
				"wxAvatarUrl": null,
				"isDeleted": false,
				"createdAt": "2025-11-21T02:01:08.700Z",
				"updatedAt": "2025-11-21T02:01:08.700Z",
				"createBy": "0",
				"updateBy": "0"
			}
		}
	],
	"timestamp": 1763885512313
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

#### 认领选手

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 16:02:05

> 更新时间: 2025-11-23 19:55:17

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/claimPlayer

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/claimPlayer?apipost_id=20169ff0b44134

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "matchId": "038031f7-d812-434e-9b52-8222ef564351",
    "playerId": "4b43fa71-62dd-46fd-b942-e9b4d3df7281",
    "userId": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "选手认领成功",
	"data": true,
	"timestamp": 1763885504302
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

#### 取消认领

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 20:01:20

> 更新时间: 2025-11-23 20:02:48

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/unclaimPlayer

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/unclaimPlayer?apipost_id=204d1cfcf443a4

**请求方式**

> PUT

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "matchId": "038031f7-d812-434e-9b52-8222ef564351",
    "playerId": "4b43fa71-62dd-46fd-b942-e9b4d3df7281"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "选手取消认领成功",
	"data": true,
	"timestamp": 1763899340869
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "选手不存在或未被认领",
			"message": "选手不存在或未被认领"
		}
	]
}
```

**Query**

### 每日签到

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 20:21:06

> 更新时间: 2025-11-23 21:02:30

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /badminton/dailySign

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /badminton/dailySign?apipost_id=20502ebb3443e7

**请求方式**

> POST

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

## 服务健康

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-21 09:21:28

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /health

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /health?apipost_id=12338354bcb028

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

## 认证测试

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-21 09:21:21

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /testAuth

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /testAuth?apipost_id=12338354fcb029

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名        | 示例值                                                                                                                                                                                                                                                            | 参数类型 | 是否必填 | 参数描述 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | -------- |
| Authorization | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwLCJ1c2VyTmFtZSI6IkFuaXh1aWwiLCJ1c2VyQWxpYXMiOm51bGwsInVzZXJFbWFpbCI6IjExNDAwNDAyMjdAcXEuY29tIiwidXNlckFnZSI6bnVsbCwiaWF0IjoxNzQ5MzY5NjQ1LCJleHAiOjE3NDk0NTYwNDV9.0lyM6IbgWnQGWEn6ADIPwvhILOT3Bta1WYpco6XQnaM | string   | 是       | -        |

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**请求Header参数**

| 参数名        | 示例值                                                                                                                                                                                                                                                            | 参数类型 | 是否必填 | 参数描述 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | -------- |
| Authorization | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwLCJ1c2VyTmFtZSI6IkFuaXh1aWwiLCJ1c2VyQWxpYXMiOm51bGwsInVzZXJFbWFpbCI6IjExNDAwNDAyMjdAcXEuY29tIiwidXNlckFnZSI6bnVsbCwiaWF0IjoxNzQ5MzY5NjQ1LCJleHAiOjE3NDk0NTYwNDV9.0lyM6IbgWnQGWEn6ADIPwvhILOT3Bta1WYpco6XQnaM | string   | 是       | -        |

**Query**

## 获取ip地址

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-12 21:09:33

> 更新时间: 2025-11-13 20:53:45

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /getIp

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /getIp?apipost_id=12338354fcb02b

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "操作成功",
	"data": {
		"ip": "127.0.0.1"
	},
	"timestamp": 1763038266476
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

## sysDict

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 21:34:10

> 更新时间: 2025-11-21 21:34:37

### 字典模块

**目录Header参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录Body参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

### 获取字典类型列表

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-21 21:35:03

> 更新时间: 2025-11-22 10:40:01

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/listSysDictType?page=1&pageSize=10

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/listSysDictType?apipost_id=1dcf9e2ef4406f

**请求方式**

> GET

**Content-Type**

> json

**请求Query参数**

| 参数名   | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| -------- | ------ | -------- | -------- | -------- |
| page     | 1      | number   | 是       | -        |
| pageSize | 10     | number   | 是       | -        |

**请求Body参数**

```javascript
暂无数据;
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "字典类型列表获取成功",
	"data": {
		"list": [
			{
				"id": "aa385c5c-0462-4f86-89dd-6715a5ec04d7",
				"dictTypeName": "羽毛球比赛状态",
				"dictTypeCode": "badminton_match_stauts",
				"isDeleted": false,
				"createdAt": "2025-11-22T02:29:58.814Z",
				"updatedAt": "2025-11-22T02:29:58.814Z",
				"createBy": "0",
				"updateBy": "0"
			}
		],
		"total": 1,
		"page": 1,
		"pageSize": 10
	},
	"timestamp": 1763779193035
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 创建字典类型

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-22 10:23:28

> 更新时间: 2025-11-22 21:03:06

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/createSysDictType

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/createSysDictType?apipost_id=1e7f747e7cb004

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "dictTypeName": "羽毛球比赛状态",
    "dictTypeCode": "badminton_match_stauts"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "字典类型创建成功",
	"data": true,
	"timestamp": 1763815885328
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "dictTypeName:",
			"message": "dictTypeName: Required"
		},
		{
			"field": "dictTypeCode:",
			"message": "dictTypeCode: Required"
		}
	]
}
```

**Query**

### 创建字典详情

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-22 19:33:07

> 更新时间: 2025-11-23 14:55:27

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/createSysDict

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/createSysDict?apipost_id=1efd5345744008

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "dictTypeCode":"badminton_match_status",
    "label": "已结束",
    "value": "end",
    "sort": "0",
    "remark": ""
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "字典创建成功",
	"data": true,
	"timestamp": 1763815900761
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "badminton_match_status该字典下已经有相同的value为notStart的字典了",
			"message": "badminton_match_status该字典下已经有相同的value为notStart的字典了"
		}
	]
}
```

**Query**

### 字典列表

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-22 20:44:07

> 更新时间: 2025-11-22 21:30:09

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/listSysDict?page=1&pageSize=10&dictTypeCode=badminton_match_status

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/listSysDict?apipost_id=1f0d85d8744070

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名       | 示例值                 | 参数类型 | 是否必填 | 参数描述 |
| ------------ | ---------------------- | -------- | -------- | -------- |
| page         | 1                      | number   | 是       | -        |
| pageSize     | 10                     | number   | 是       | -        |
| dictTypeCode | badminton_match_status | string   | 是       | -        |

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "dictTypeCode:",
			"message": "dictTypeCode: Required"
		}
	]
}
```

**Query**

### 批量删除字典类型

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-22 20:56:00

> 更新时间: 2025-11-22 21:30:13

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/deleteSysDictType

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/deleteSysDictType?apipost_id=1f102d6a744167

**请求方式**

> DELETE

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "ids": [
        "7571d47c-60c2-4119-8f52-112c5e7a650e"
    ]
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "字典类型删除成功",
	"data": true,
	"timestamp": 1763817328142
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 批量删除字典

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-22 21:24:50

> 更新时间: 2025-11-22 21:30:02

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/deleteSysDict

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/deleteSysDict?apipost_id=1f16d6e8b441ba

**请求方式**

> DELETE

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "ids": [
        "c82145f2-c947-434b-adae-6aaecc27182b"
    ]
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "字典删除成功",
	"data": true,
	"timestamp": 1763818194152
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 修改字典类型

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 14:13:31

> 更新时间: 2025-11-23 14:32:31

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/updateSysDictType

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/updateSysDictType?apipost_id=1ffd26b4f44002

**请求方式**

> PUT

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "id": "35e0442f-b300-41d1-aea1-7a5b1783161b",
    "dictTypeName": "羽毛球比赛状态",
    "dictTypeCode": "badminton_match_status"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "字典类型修改成功",
	"data": true,
	"timestamp": 1763879507556
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

### 修改字典

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 14:35:39

> 更新时间: 2025-11-23 14:42:01

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/updateSysDict

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/updateSysDict?apipost_id=2002d8ea744043

**请求方式**

> PUT

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "id": "c82145f2-c947-434b-adae-6aaecc27182b",
    "label": "进行中",
    "value": "inProgress"
}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "字典修改成功",
	"data": true,
	"timestamp": 1763880111340
}
```

- 失败(404)

```javascript
{
	"code": 400,
	"message": "参数校验失败",
	"errors": [
		{
			"field": "字典不存在",
			"message": "字典不存在"
		}
	]
}
```

**Query**

### 通用字典接口(非分页)

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-23 14:50:46

> 更新时间: 2025-11-23 15:03:53

```text
暂无描述
```

**接口状态**

> 已完成

**接口URL**

> /sys-dict/commonDictType/badminton_match_status

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /sys-dict/commonDictType/badminton_match_status?apipost_id=2005bc6cb44081

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
{
	"code": 200,
	"message": "通用字典类型获取成功",
	"data": [
		{
			"id": "6063a090-cfef-4c8a-912c-754336ffdb00",
			"dictTypeCode": "badminton_match_status",
			"label": "未开始",
			"value": "notStart",
			"sort": 0,
			"remark": null,
			"isDeleted": false,
			"createdAt": "2025-11-23T06:42:40.894Z",
			"updatedAt": "2025-11-23T06:42:40.894Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "c82145f2-c947-434b-adae-6aaecc27182b",
			"dictTypeCode": "badminton_match_status",
			"label": "进行中",
			"value": "inProgress",
			"sort": 1,
			"remark": null,
			"isDeleted": false,
			"createdAt": "2025-11-22T13:19:46.868Z",
			"updatedAt": "2025-11-23T06:41:51.240Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		},
		{
			"id": "719625ef-c2cb-4e5b-952e-84fbe55d972f",
			"dictTypeCode": "badminton_match_status",
			"label": "已结束",
			"value": "end",
			"sort": 2,
			"remark": null,
			"isDeleted": false,
			"createdAt": "2025-11-23T06:43:11.525Z",
			"updatedAt": "2025-11-23T06:43:11.525Z",
			"createBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a",
			"updateBy": "d88d5691-b790-45e9-ad9e-ab2df9c9cf6a"
		}
	],
	"timestamp": 1763881427808
}
```

- 失败(404)

```javascript
暂无数据;
```

**Query**

# 未命名接口

> 创建人: Anixuil

> 更新人: Anixuil

> 创建时间: 2025-11-27 20:31:52

> 更新时间: 2025-11-27 20:31:52

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> https://api.bltcy.ai/chat/completions

| 环境      | URL                              |
| --------- | -------------------------------- |
| AP_Server | http://localhost:3000/ani-server |

**Mock URL**

> /chat/completions?apipost_id=2579d6723cb011

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名             | 示例值                                                                                                                                                  | 参数类型 | 是否必填 | 参数描述 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | -------- |
| accept             | _/_                                                                                                                                                     | string   | 是       | -        |
| accept-language    | zh-CN                                                                                                                                                   | string   | 是       | -        |
| authorization      | Bearer sk-3xxFTiNpBijR4GReXW9ubJbVwFGbzb3rl2JY09LqerJDclMv                                                                                              | string   | 是       | -        |
| content-type       | application/json                                                                                                                                        | string   | 是       | -        |
| http-referer       | https://cherry-ai.com                                                                                                                                   | string   | 是       | -        |
| priority           | u=1, i                                                                                                                                                  | string   | 是       | -        |
| sec-ch-ua          | "Not)A;Brand";v="8", "Chromium";v="138"                                                                                                                 | string   | 是       | -        |
| sec-ch-ua-mobile   | ?0                                                                                                                                                      | string   | 是       | -        |
| sec-ch-ua-platform | "Windows"                                                                                                                                               | string   | 是       | -        |
| sec-fetch-dest     | empty                                                                                                                                                   | string   | 是       | -        |
| sec-fetch-mode     | cors                                                                                                                                                    | string   | 是       | -        |
| sec-fetch-site     | cross-site                                                                                                                                              | string   | 是       | -        |
| user-agent         | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) CherryStudio/1.6.7 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36 | string   | 是       | -        |
| x-title            | Cherry Studio                                                                                                                                           | string   | 是       | -        |

**请求Body参数**

```javascript
{"model":"gemini-3-pro-preview","temperature":0.69,"messages":[{"role":"system","content":"你是一个专业的秘书，负责处理各种事项，你什么都会，你是万能的"},{"role":"user","content":"你好"},{"role":"user","content":"你好"}],"stream":true,"stream_options":{"include_usage":true}}
```

**认证方式**

> 继承父级

**响应示例**

- 成功(200)

```javascript
暂无数据;
```

- 失败(404)

```javascript
暂无数据;
```

**请求Header参数**

| 参数名             | 示例值                                                                                                                                                  | 参数类型 | 是否必填 | 参数描述 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | -------- |
| accept             | _/_                                                                                                                                                     | string   | 是       | -        |
| accept-language    | zh-CN                                                                                                                                                   | string   | 是       | -        |
| authorization      | Bearer sk-3xxFTiNpBijR4GReXW9ubJbVwFGbzb3rl2JY09LqerJDclMv                                                                                              | string   | 是       | -        |
| content-type       | application/json                                                                                                                                        | string   | 是       | -        |
| http-referer       | https://cherry-ai.com                                                                                                                                   | string   | 是       | -        |
| priority           | u=1, i                                                                                                                                                  | string   | 是       | -        |
| sec-ch-ua          | "Not)A;Brand";v="8", "Chromium";v="138"                                                                                                                 | string   | 是       | -        |
| sec-ch-ua-mobile   | ?0                                                                                                                                                      | string   | 是       | -        |
| sec-ch-ua-platform | "Windows"                                                                                                                                               | string   | 是       | -        |
| sec-fetch-dest     | empty                                                                                                                                                   | string   | 是       | -        |
| sec-fetch-mode     | cors                                                                                                                                                    | string   | 是       | -        |
| sec-fetch-site     | cross-site                                                                                                                                              | string   | 是       | -        |
| user-agent         | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) CherryStudio/1.6.7 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36 | string   | 是       | -        |
| x-title            | Cherry Studio                                                                                                                                           | string   | 是       | -        |

**Query**
