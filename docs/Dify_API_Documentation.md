# 🧩 Dify API ドキュメント概要

## 1. 基本情報（必須）

- **Base URL**：`https://api.dify.ai/v1`
- **認証方式**：`API-Key（HTTP Header）`

  ```http
  Authorization: Bearer {API_KEY}
  ```

  ※ API キーは **サーバー側で保管（クライアント配布禁止）**

### 共通オブジェクト

| パラメータ         | 説明                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `user`（必須）     | アプリ内でユニークなエンドユーザー識別子（WebApp 会話とは共有されない） |
| `response_mode`    | `streaming`（推奨） or `blocking`                                       |
| `trace_id`（任意） | `X-Trace-Id` ヘッダ / `?trace_id=` / リクエストボディで指定可能         |

> `blocking` は Cloudflare の制限により約 100 秒を超えると切断の可能性あり。

---

## 2. ワークフロー実行フロー（最重要）

### A. ファイル不要の実行

```bash
curl -X POST 'https://api.dify.ai/v1/workflows/run'   -H 'Authorization: Bearer {API_KEY}'   -H 'Content-Type: application/json'   -d '{
    "inputs": { /* ワークフロー入力 */ },
    "response_mode": "streaming",
    "user": "abc-123"
  }'
```

### B. ファイルを使う実行（File Array 変数に投入）

1️⃣ **アップロード**

```bash
curl -X POST 'https://api.dify.ai/v1/files/upload'   -H 'Authorization: Bearer {API_KEY}'   -F 'file=@/path/to/file.pdf;type=application/pdf'   -F 'user=abc-123'
```

レスポンス例：

```json
{ "id": "72fa9618-8f89-4a37-9b33-7e1178a24a67", ... }
```

2️⃣ **実行**

```bash
curl -X POST 'https://api.dify.ai/v1/workflows/run'   -H 'Authorization: Bearer {API_KEY}'   -H 'Content-Type: application/json'   -d '{
    "inputs": {
      "your_variable_name": [
        {
          "transfer_method": "local_file",
          "upload_file_id": "72fa9618-8f89-4a37-9b33-7e1178a24a67",
          "type": "document"
        }
      ]
    },
    "response_mode": "blocking",
    "user": "abc-123"
  }'
```

---

## 3. エンドポイントと要件

### 実行系

| メソッド | エンドポイント                    | 用途                         | 備考                             |
| -------- | --------------------------------- | ---------------------------- | -------------------------------- |
| **POST** | `/workflows/run`                  | 公開済み最新ワークフロー実行 | inputs, response_mode, user 必須 |
| **POST** | `/workflows/:workflow_id/run`     | 特定バージョンを実行         | ドラフト不可、UUID 指定          |
| **POST** | `/workflows/tasks/:task_id/stop`  | ストリーミング停止           | user 必須                        |
| **GET**  | `/workflows/run/:workflow_run_id` | 実行詳細取得                 | status / outputs / tokens など   |

### ファイル系

| メソッド | エンドポイント    | 用途                             |
| -------- | ----------------- | -------------------------------- |
| **POST** | `/files/upload`   | 実行参照用ファイルをアップロード |
| **GET**  | `/workflows/logs` | 実行ログ取得                     |
| **GET**  | `/info`           | アプリ情報                       |
| **GET**  | `/parameters`     | 入力仕様・制限情報取得           |
| **GET**  | `/site`           | WebApp 表示設定                  |

---

## 4. ストリーミング（SSE）仕様

- **Content-Type**：`text/event-stream`

### イベント一覧

| イベント名                        | 内容                     |
| --------------------------------- | ------------------------ |
| `workflow_started`                | ワークフロー開始         |
| `node_started`                    | ノード実行開始           |
| `text_chunk`                      | テキスト断片出力         |
| `node_finished`                   | ノード終了               |
| `workflow_finished`               | ワークフロー完了         |
| `tts_message` / `tts_message_end` | 音声データ（Base64 MP3） |
| `ping`                            | 10 秒ごとキープアライブ  |

停止：`POST /workflows/tasks/:task_id/stop`（`user`必須）

---

## 5. inputs の型とファイル投入書式

```json
{
  "inputs": {
    "my_files": [
      {
        "transfer_method": "local_file",
        "upload_file_id": "UPLOAD_ID",
        "type": "document"
      },
      {
        "transfer_method": "remote_url",
        "url": "https://example.com/file.pdf",
        "type": "document"
      }
    ]
  },
  "response_mode": "streaming",
  "user": "abc-123"
}
```

---

## 6. 代表的レスポンス（blocking）

```json
{
  "workflow_run_id": "djflajgkldjgd",
  "task_id": "9da23599-e713-473b-982c-4328d4f5c78a",
  "data": {
    "id": "fdlsjfjejkghjda",
    "workflow_id": "fldjaslkfjlsda",
    "status": "succeeded",
    "outputs": { "text": "Nice to meet you." },
    "error": null,
    "elapsed_time": 0.875,
    "total_tokens": 3562,
    "total_steps": 8,
    "created_at": 1705407629,
    "finished_at": 1727807631
  }
}
```

---

## 7. エラーコード一覧

| ステータス | コード                                | 内容                       |
| ---------- | ------------------------------------- | -------------------------- |
| 400        | invalid_param                         | 入力不正                   |
| 400        | provider_quota_exceeded               | モデル呼び出しクォータ不足 |
| 400        | workflow_request_error                | 実行失敗                   |
| 404        | workflow_not_found                    | ワークフロー未登録         |
| 413        | file_too_large                        | ファイルサイズ超過         |
| 415        | unsupported_file_type                 | 対応外ファイル形式         |
| 500        | Internal server error                 | サーバーエラー             |
| 503        | connection_failed / permission_denied | S3 関連障害                |

---

## 8. 実装ベストプラクティス（落とし穴防止）

- API キーは**必ずサーバー側のみ**で保持。クライアント直叩き禁止。
- `user` は全 API で統一して渡す。
- **ストリーミング（SSE）推奨**。
- `blocking` は 100 秒制限あり → 長処理は SSE または`GET /workflows/run/:id`。
- ファイル利用時：`/files/upload → upload_file_id → inputs`。
- 初回起動で `/parameters` を取得し、UI 構成に反映。
- `trace_id` を活用してログ追跡性を確保。
- ログ API で `status`, `elapsed_time`, `total_tokens` を監視。
- MIME タイプ/拡張子を正しく送信。
- `provider_quota_exceeded` 等の再試行ロジックを実装。

---

## 9. Python 実装例

```python
import requests, json

API = "https://api.dify.ai/v1"
HEADERS_JSON = {"Authorization": "Bearer YOUR_KEY", "Content-Type": "application/json"}
HEADERS_MULTI = {"Authorization": "Bearer YOUR_KEY"}

def upload_file(path, user):
    with open(path, "rb") as f:
        r = requests.post(f"{API}/files/upload",
                          headers=HEADERS_MULTI,
                          files={"file": (path, f)},
                          data={"user": user})
    r.raise_for_status()
    return r.json()["id"]

def run_workflow(inputs, user, response_mode="streaming", workflow_id=None):
    url = f"{API}/workflows/{workflow_id}/run" if workflow_id else f"{API}/workflows/run"
    payload = {"inputs": inputs, "response_mode": response_mode, "user": user}
    return requests.post(url, headers=HEADERS_JSON, data=json.dumps(payload), stream=(response_mode=="streaming"))

# --- 使用例 ---
user = "abc-123"
file_id = upload_file("./sample.pdf", user)
inputs = {
  "your_variable_name": [{
    "transfer_method": "local_file",
    "upload_file_id": file_id,
    "type": "document"
  }]
}
res = run_workflow(inputs, user, response_mode="blocking")
print(res.json())
```

---

## 10. 導入チェックリスト ✅

- [x] API キーを環境変数 or Secret に保存（サーバーのみ）
- [x] 初回起動時に `/parameters` を取得し UI 反映
- [x] ファイル利用時は `/files/upload → upload_file_id → inputs`
- [x] 長処理は `streaming` をデフォルト
- [x] `/tasks/{task_id}/stop` で生成停止を実装
- [x] `/workflows/logs` でログ収集
- [x] エラー分類対応（400 系/413/415/500/503）
- [x] `trace_id` を活用して観測性を確保
