---
name: nginx-deploy
description: 部署前端静态站点到 ECS（宝塔/Nginx）并排查 404 与配置报错的实战 SOP。当用户提到 ECS、宝塔、nginx 部署、/md/ 或子路径 404、unknown directive "\n"、alias 配置时使用。
---

# ECS Nginx 静态站点部署与排查

## 适用场景
- 宝塔面板托管的 Nginx，部署前端 `dist` 到 `/www/wwwroot/<site>/`
- 子路径 alias 静态目录（如 `/md/` -> `wechat-md`）、后端反代（`/api/` -> 127.0.0.1:8000）、HTTPS(443)

## 关键坑与对策

### 1. 本地路径用户名拼错导致上传静默失败
- 本机 home 是 `/Users/liulei`，不是 `liurei`。`cd`/`scp`/`tar -C` 用错路径会间歇报 "no such file" 或 stat 失败。
- 先用 `ls <绝对路径>` 验证路径真实存在再操作。
- 单文件最稳：文本管道 `cat <local> | ssh host 'cat > <remote>'`（`cat` 不解析 `$`，远端变量安全保留）。
- 整目录同步：`cd <proj> && tar czf - dist | ssh host 'tar xzf - -C /www/wwwroot/<site> --strip-components=1'`
  - `--strip-components=1` 去掉 `dist/` 前缀；**不要用 rm -rf 整体删目录**，否则丢 `themes/` 等不在 dist 中的目录。
  - tar 的 `LIBARCHIVE.xattr.com.apple.provenance` 警告可忽略。

### 2. nginx 报 `unknown directive "\n"`
- 现象：`nginx -t` 报 `unknown directive "\n" in xxx.conf:NN`。这是配置里混入了**字面反斜杠 n 两字符**（不是真换行），Nginx 把它当指令名。
- 修复：**整体重写该 vhost 文件**（heredoc/管道写入）比 `sed` 删行可靠。
  - `sed "Nd"` 行号常与 nginx 报错行号差 1；若误删了 `location /xx/ {` 起始行，会让 `alias` 落到 server 层报 `alias not allowed here`。
- 重写后必须 `nginx -t && nginx -s reload`。

### 3. /md/ 返回 404 但文件确实存在
- nginx worker 用户（如 `www`）对 `-rw-r--r--` 文件有读权限，404 通常不是权限。
- 真因：用 `curl http://127.0.0.1/md/` 测试会命中**默认 server**（`Host=127.0.0.1` 不在 `server_name` 里）；而 80 server 是 `return 301 https`，https 下 `127.0.0.1` 也不匹配 443 的 `server_name`。
- 正确验证：`curl -k -H "Host: <domain>" https://127.0.0.1/md/` 或 `Host: 47.102.41.227`。
- alias 站点标准写法（可行）：
  ```nginx
  location /md/ {
      alias /www/wwwroot/wechat-md/;
      index index.html;
      try_files $uri $uri/ /md/index.html;
  }
  ```
  直接 `curl /md/index.html` 也应 200。

### 4. 校验与清理
- MD5：`md5 -q <local>` 对比远端 `md5sum <remote>` 关键文件（index.html、assets/*.js|css）。
- 清理 Mac 上传残留：`rm -f /www/wwwroot/<site>/._*`。
- 旧构建残留（不同 hash 的旧 js）不影响运行（index.html 只引用新 hash），一般不删；要干净就删 assets 下未被 index.html 引用的旧文件。

## SOP（部署一次到位）
1. 本地 build 产出 `dist`。
2. 确认本地绝对路径无误（先 `ls`）。
3. 同步：`cd <proj> && tar czf - dist | ssh host 'tar xzf - -C /www/wwwroot/<site> --strip-components=1'`
4. 配置正确后：`nginx -t && nginx -s reload`。
5. 用正确 Host 头验证：`curl -k -H "Host: <domain>" https://127.0.0.1/<path>/` 应为 200。
6. MD5 抽查 + `rm -f /www/wwwroot/<site>/._*`。
