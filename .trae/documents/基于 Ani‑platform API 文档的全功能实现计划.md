## 文档分析

- 全局约定
  - 基础地址：以 `VITE_APP_API_URL + VITE_APP_BASE_API` 拼接；文档示例为 `http://localhost:3000/ani-server` 或 `https://api.anixuil.com/ani-server`
  - 认证：`Authorization: Bearer <token>`；部分接口标注“无需认证”或未校验也可访问
  - 响应通用结构：`{ code, message, data, timestamp, errors? }`；code 文档为数字 200（当前封装比较的是字符串，需要统一处理）
- 模块与端点（摘要）
  - auth/sys-user（认证与用户）
    - POST `/sys-user/register` 注册
    - POST `/sys-user/login` 登录（返回 `access_token` 与 `userInfo`）
    - POST `/sys-user/logout` 注销
    - GET `/sys-user/checkEmailIsExists?userEmail=` 检查邮箱是否存在（无需认证）
    - GET `/sys-user/getUserInfo` 获取当前用户信息
    - POST `/sys-user/sendEmailCode` 发送邮箱验证码（Body：`userEmail,emailTitle`）
    - POST `/sys-user/verifyEmailCode` 校验邮箱验证码（Body：`userEmail,code`）
    - PUT `/sys-user/updateUserInfo` 修改用户信息
    - POST `/sys-user/addSysUser` 添加用户
    - POST `/sys-user/wxLogin` 微信登录
    - GET `/testAuth` Token 检测
    - GET `/getIp` 获取 IP
  - ai（模型对话）
    - POST `/ai/deepseek`（支持 stream）
    - POST `https://api.bltcy.ai/chat/completions`（开发中，外部服务）
  - sysLog（系统日志）
    - POST `/sys-log/addSysLog` 新增系统日志
  - badminton（羽毛球业务）
    - 比赛：
      - POST `/badminton/createMatch` 新建比赛
      - GET `/badminton/listMatch?page&pageSize&name?` 比赛列表
      - GET `/badminton/match/:id` 比赛详情
      - PUT `/badminton/updateMatch` 修改比赛（`id,status` 等）
      - DELETE `/badminton/deleteMatch/:id` 删除比赛
    - 对局：
      - POST `/badminton/batchCreateMatchGame` 批量创建对局（`matchId,matchGameNum`）
      - POST `/badminton/batchMatchGameBindPlayer` 批量选手绑定对局（数组入参）
      - PUT `/badminton/unbindMatchGamePlayer` 选手对局解除绑定（或取消）
      - PUT `/badminton/bindMatchGamePlayer` 选手绑定对局（`playerId` 与 `partnerId` 至少填一个）
      - GET `/badminton/listMatchGame?page&pageSize` 比赛对局列表
    - 选手：
      - POST `/badminton/batchCreatePlayer` 批量创建选手
      - GET `/badminton/listPlayer` 选手列表
      - POST `/badminton/claimPlayer` 认领选手
      - PUT `/badminton/unclaimPlayer` 取消认领
    - 每日：
      - POST `/badminton/dailySign` 每日签到
  - sysDict（字典）
    - GET `/sys-dict/listSysDictType?page&pageSize` 字典类型列表
    - POST `/sys-dict/createSysDictType` 创建字典类型
    - PUT `/sys-dict/updateSysDictType` 修改字典类型
    - DELETE `/sys-dict/deleteSysDictType` 批量删除字典类型
    - POST `/sys-dict/createSysDict` 创建字典
    - GET `/sys-dict/listSysDict?page&pageSize&dictTypeCode` 字典列表
    - PUT `/sys-dict/updateSysDict` 修改字典
    - DELETE `/sys-dict/deleteSysDict` 批量删除字典
    - GET `/sys-dict/commonDictType/:dictTypeCode` 通用字典（非分页）

## 功能梳理

- 功能清单与分组
  - 认证与用户：注册、登录/注销、获取用户信息、邮箱验证码、完善个人信息、邮箱占用校验、微信登录、Token 检测、获取 IP
  - 比赛管理：创建/列表/详情/修改/删除、状态切换
  - 对局管理：批量创建、列表、选手绑定/解除绑定、单边绑定
  - 选手管理：批量创建、列表、选手认领/取消认领（与用户关联）
  - 字典管理：类型与字典的 CRUD、通用字典查询（映射比赛状态）
  - 每日签到：基于登录用户一次性操作
  - 系统日志：操作行为留痕（后端为主，前端可在关键流程打点）
  - AI 对话：深度求解与外部 ChatCompletions（流式）
- 流程标注（示例）
  - 注册流程：检查邮箱占用 → 提交注册 → 引导登录 → 登录后落盘 `token` 与 `userInfo`
  - 完善信息：发送验证码 → 输入验证码并校验 → 更新用户信息
  - 比赛流水：创建比赛 → 列表筛选/分页 → 详情查看 → 修改状态或删除
  - 对局流水：根据比赛批量创建对局 → 绑定选手（或搭档）→ 列表查看 → 解除绑定/单边绑定
  - 选手流水：为比赛批量创建选手 → 列表查看 → 用户认领/取消认领
  - 字典：先创建类型 → 创建字典项 → 列表/修改/删除 → 通用字典读取用于 UI 映射
- 边界情况
  - 注册/完善信息：邮箱已存在；验证码错误或过期；参数必填缺失
  - 登录：401/令牌失效；`Authorization` 缺失导致接口失败
  - 比赛删除：比赛不存在；状态切换受限（如进行中不可删除）
  - 对局绑定：`playerId` 与 `partnerId` 至少一个；对局一侧最多两人；批量绑定出现数量异常
  - 认领：选手不存在或已被他人认领；取消认领时未认领
  - 字典：类型或字典项重复；缺少 `dictTypeCode`
  - AI：流式处理的网络中断与重试；外部服务鉴权（敏感信息不可暴露）

## 实现规划

- API 客户端分层
  - 统一响应类型 `ApiResponse<T>`；在请求封装中兼容 `code === 200` 与 `code === '200'`
  - 模块文件：
    - `AuthAPI`：`login/logout/checkTokenActive`
    - `UserAPI`：`register/getUserInfo/sendEmailCode/verifyEmailCode/updateUserInfo/addSysUser/checkEmailIsExists/wxLogin`
    - `BadmintonAPI`：`createMatch/listMatch/getMatch/updateMatch/deleteMatch`；`batchCreateMatchGame/listMatchGame/batchMatchGameBindPlayer/unbindMatchGamePlayer/bindMatchGamePlayer`
    - `PlayerAPI`：`batchCreatePlayer/listPlayer/claimPlayer/unclaimPlayer`
    - `DictAPI`：`listSysDictType/createSysDictType/updateSysDictType/deleteSysDictType/createSysDict/listSysDict/updateSysDict/deleteSysDict/commonDictType`
    - `SysLogAPI`：`addSysLog`
    - `AiAPI`：`deepseek`（流式返回处理）
    - `HealthAPI`：`health`
- 状态管理（Pinia）
  - `userStore`：`token/userInfo`；登录后持久化；注销清理；完善信息与验证码流程
  - `matchStore`：比赛列表分页、详情缓存、状态切换
  - `gameStore`：对局列表、批量创建与绑定操作状态
  - `playerStore`：选手列表、批量创建、认领状态
  - `dictStore`：通用与分页字典缓存，用于 UI 标签映射
- 页面与组件规划
  - 登录/注册：登录页已接入；注册页完善邮箱占用检测与提交；成功后跳转登录
  - 个人信息补充：`complete-info.vue` 接入验证码发送与验证、信息更新
  - 赛程页：
    - Tab“全部/我的/参与”
      - 全部：`listMatch`
      - 我的：`listMatch` + 过滤 `createBy===当前用户` 或拥有认领的选手（需后端或前端筛选）
      - 参与：基于认领选手参与的比赛（通过 `listPlayer` 结合 `matchId` 反推）
    - 点击进详情：`match/:id` + 列出对局 `listMatchGame`；提供绑定/解除绑定操作
  - 管理入口：
    - 比赛创建卡片；对局批量创建弹窗；选手批量创建表格导入；认领/取消认领入口
  - 字典管理：
    - 管理页（可后置）：类型与字典项的 CRUD；通用字典读取到前端常量映射
  - AI：
    - 简单聊天组件，演示 `deepseek` 流式显示（SSE/逐块追加）
- 数据格式与类型
  - 以文档示例定义 TS 接口：`UserInfo/Match/MatchGame/Player/DictType/DictItem` 等
  - 公共分页返回：`{ list, total, page, pageSize }`（根据文档实际）
- 错误处理
  - 业务错误：统一捕获 `code !== 200`；展示 `message`；对 400 的 `errors[]` 展示首条或全部
  - 鉴权错误：401 时清理状态并跳转登录；对“无需认证”接口不附带 Token（或兼容）
  - 网络错误：重试提示与降级；批量操作加防抖/队列提交保护（避免并发过多）
  - AI 流：中断重连提示；进度条/加载提示
- 调用顺序与时序（核心）
  - 初始化：拉取通用字典（比赛状态）→ 缓存；健康检查可在控制台打点
  - 登录后：拉取 `getUserInfo`；进入赛程页初次 `listMatch`
  - 详情：并行获取比赛详情与对局列表；完成后展示绑定入口
  - 批量操作：先校验参数 → 提交 → 刷新相关列表（比赛/对局/选手）

## 开发要求对齐

- 参数校验与前端验证：表单内校验 + 提交前校验，防止无效请求
- 统一代码风格：已有项目风格（Vue3 + TS + uview/wot-design-uni + rpx 单位）
- 早返回与职责分离：拆分 API 客户端、Store 与 UI；避免深层嵌套
- 并发控制：批量绑定/创建引入串行或限流；避免请求风暴
- 安全：不在仓库或日志中暴露外部 API 密钥；`Authorization` 仅在必要时发送

## 测试计划

- API 客户端单元测试：为各模块方法编写入参/出参断言（Mock 返回）
- Store 行为测试：登录→状态更新→注销；比赛/对局/选手的列表与操作后的刷新
- 组件测试：注册/完善信息表单校验；赛程列表与详情交互；AI 流式展示逐块追加
- 错误分支覆盖：400 参数错误、401 认证错误、404 未找到、网络失败

## 交付物

- 代码：完整 API 客户端模块 + Store + 页面与组件实现
- 测试：各模块的单元测试与关键交互用例
- 文档：更新 API 调用说明（包含数据结构、流程与错误处理约定）
- 实现说明：模块结构、状态流转、时序与边界处理策略

## 需要确认

- “我的/参与”的筛选口径：是否以 `createBy` 与“当前用户认领的选手参与的比赛”为准
- 字典管理是否需要在前端提供完整管理 UI，或仅用于读取映射
- AI 外部接口是否纳入本次交付（涉及密钥），若纳入需以后端代理或安全方案处理
