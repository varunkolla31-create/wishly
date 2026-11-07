# Cloudflare R2 setup

R2 is S3-compatible, so the app uses `@aws-sdk/client-s3` with four R2-specific
differences (below). The bucket stays private: the browser only ever sees
short-lived presigned URLs.

## 1. Create the bucket

Dash → R2 → **Create bucket**. Name it something globally unique (for example
`wishly-media`). Leave **public access disabled** — nothing needs it.

Note the **Account ID** from the R2 overview page; it is the left part of
`https://<account-id>.r2.cloudflarestorage.com`.

## 2. Create an API token

R2 → **Manage R2 API Tokens** → **Create API token**:

- Permissions: **Object Read & Write**
- Scope: **Apply to specific buckets only** → the one bucket above
- Optionally set an expiry

Copy the **Access Key ID** and **Secret Access Key** once. They are shown a
single time. Do not paste them into chat, issues or commits.

## 3. Environment

`.env.local` (gitignored):

```
MEDIA_DRIVER=r2
R2_ACCOUNT_ID=…
R2_ACCESS_KEY_ID=…
R2_SECRET_ACCESS_KEY=…
R2_BUCKET=wishly-media
# Optional. Derived from R2_ACCOUNT_ID when blank.
R2_ENDPOINT=
```

`DB_DRIVER` is independent, so you can run Postgres for data and R2 for media.

## 4. CORS

R2 → bucket → **Settings → CORS Policy**. Browser uploads are `PUT` with a
`Content-Type` header, so that header must be allowed.

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

Without this, uploads fail in the browser with a CORS preflight error even
though `pnpm r2:check` (which runs server-side) passes.

## 5. Lifecycle rules

R2 → bucket → **Settings → Object lifecycle rules**.

| Rule | Prefix | Action |
|---|---|---|
| Abandoned uploads | `tmp/` | Delete objects after **2 days** |
| Incomplete multipart | — | Abort incomplete multipart uploads after **1 day** |

Uploads go straight to their final `wishes/{wishId}/{kind}/…` key, so `tmp/` is
only used by checks and the live test. The rules still keep the bucket clean if
a future flow stages files there.

## 6. Verify

```bash
pnpm r2:check          # config + presign put/head/get/delete round trip
R2_TEST_LIVE=1 pnpm test:r2   # the adapter against the real bucket
```

Both print variable names and pass/fail only — never a key, never a URL.

## 7. What differs from S3 (and why the client is configured this way)

| Difference | Setting |
|---|---|
| No regions | `region: "auto"`. Any other value signs requests R2 rejects. |
| Checksums | Current AWS SDK v3 adds CRC32 checksum parameters to `PutObject`. A presigned PUT signed with them fails once the browser sends the body (`403 SignatureDoesNotMatch`). Fixed with `requestChecksumCalculation: "WHEN_REQUIRED"`, `responseChecksumValidation: "WHEN_REQUIRED"`, and stripping any `x-amz-checksum-*` params from the final URL. |
| Addressing | `forcePathStyle: true`, which avoids DNS/bucket-dot edge cases. |
| ACLs | R2 does not support them. The adapter never sends `ACL`; access is presigned only. |

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `403 SignatureDoesNotMatch` on PUT | checksum params signed, or clock skew | the adapter already disables checksums; sync the system clock |
| `NoSuchBucket` | wrong `R2_BUCKET` or account | check the name and `R2_ACCOUNT_ID` |
| Upload fails in browser, `r2:check` passes | missing CORS | apply §4 |
| `InvalidAccessKeyId` | token deleted or from another account | create a new token |
| `AccessDenied` on GET after a while | presigned GET expired (15 min) | reload the reveal page |
| `RequestTimeTooSkewed` | clock drift > 15 min | sync the clock |
| 413 on upload | file over the cap (10 MB photo / 100 MB video / 5 MB voice) | smaller file |

## 9. Rotating a token

Create a new token, update `.env.local`, restart the app, then delete the old
token. Presigned URLs issued before the rotation stay valid until they expire
(10 minutes for uploads, 15 for downloads), which is fine.
