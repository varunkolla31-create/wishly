# AWS setup

Wishly stores wishes in **DynamoDB** and media in **S3**, behind the same
repository interfaces as the file adapter. Nothing here is required to run the
app locally — `STORAGE_DRIVER=file` is the default.

## 1. What you need

| Piece | Value |
|---|---|
| Region | one region for both services (e.g. `us-east-1`) |
| DynamoDB | three tables: `Wishes`, `Contributions`, `Replies` |
| S3 | one **private** bucket for photos, videos and voice notes |
| IAM | an access key or role with the policy at the bottom of this page |

The adapters read the table's **actual** key names with `DescribeTable`, so they
work whether your partition key is called `wishId` or `id`. They do assume:

- `Wishes` has a partition key and, ideally, the indexes below.
- `Contributions` and `Replies` have a partition key **and a sort key** — a
  hash-only table cannot hold more than one record per wish. If yours is
  hash-only, `pnpm aws:check` fails with the env var to fix.

## 2. Recommended table shapes

### Wishes

- Partition key: `wishId` (String)
- GSI `OwnerIndex`: `ownerId` (HASH) + `updatedAt` (RANGE) — dashboard list
- GSI `ContributorTokenIndex`: `contributorToken` (HASH) — group invite links

### Contributions

- Partition key: `wishId` (String)
- Sort key: `contributionId` (String)

### Replies

- Partition key: `wishId` (String)
- Sort key: `replyId` (String)
- GSI `OwnerIndex`: `ownerId` (HASH) + `createdAt` (RANGE) — the replies inbox

Without an index, the adapter still returns correct results but falls back to
`Scan` and logs a one-time warning:

```
[dynamodb] Wishes: no index on "ownerId"; falling back to Scan.
```

That is fine for a handful of wishes and expensive at scale. Add the GSI when
the warning appears in production.

## 3. Environment

Everything lives in `.env.local`, which is gitignored (`.env*`), and never in a
tracked file or a commit.

```
STORAGE_DRIVER=aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=…
AWS_SECRET_ACCESS_KEY=…
DYNAMODB_WISHES_TABLE=Wishes
DYNAMODB_CONTRIBUTIONS_TABLE=Contributions
DYNAMODB_REPLIES_TABLE=Replies
S3_BUCKET=…
```

Optional:

```
AWS_ENDPOINT_URL=            # LocalStack or a VPC endpoint
DATA_ADAPTER=dynamodb        # explicit override
MEDIA_ADAPTER=s3             # explicit override
```

Precedence: an explicit `DATA_ADAPTER` / `MEDIA_ADAPTER` wins; otherwise
`STORAGE_DRIVER=aws` selects DynamoDB + S3. With `STORAGE_DRIVER=file` the app
uses the local JSON adapter and the on-disk media store, and no AWS call is made.

In production, prefer an IAM role over static keys: leave
`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` unset and the SDK uses the
instance/task role.

## 4. Verify the connection

```bash
pnpm aws:check          # read-only: describe tables, head bucket, list one key
pnpm aws:check:write    # adds a temporary put/head/delete under _healthcheck/
```

The report is deliberately value-free: it prints variable **names** and
resource facts, never credentials. Exit code is non-zero when something is
missing, and each failure names the env var to fix.

## 5. Bucket configuration

Block all public access. The app only ever talks to the bucket through
short-lived presigned URLs.

Browser uploads and playback need CORS on the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Range", "Accept-Ranges"],
    "MaxAgeSeconds": 3000
  }
]
```

Do not enable static website hosting — the app serves media, not the bucket.

Keys are namespaced `wishes/<wishId>/<kind>/<random>.<ext>` and are validated
against a strict pattern before use, so traversal is impossible.

## 6. IAM policy

Replace `<region>`, `<account>`, `<bucket>` and the table names if you renamed
them.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "WishlyTables",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem",
        "dynamodb:DescribeTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:<region>:<account>:table/Wishes",
        "arn:aws:dynamodb:<region>:<account>:table/Wishes/index/*",
        "arn:aws:dynamodb:<region>:<account>:table/Contributions",
        "arn:aws:dynamodb:<region>:<account>:table/Replies",
        "arn:aws:dynamodb:<region>:<account>:table/Replies/index/*"
      ]
    },
    {
      "Sid": "WishlyMedia",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<bucket>",
        "arn:aws:s3:::<bucket>/wishes/*",
        "arn:aws:s3:::<bucket>/_healthcheck/*"
      ]
    }
  ]
}
```

`dynamodb:Scan` is only needed while an index is missing; you can drop it once
`aws:check` reports no Scan fallback.

## 7. Presigned URLs

- Upload: `PUT`, 15 minutes, content type fixed by the server.
- Read: `GET`, 1 hour, minted only after the receiver unlocks the wish.

The bucket stays private; there is no public object URL anywhere in the code.

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ResourceNotFoundException` | table name or region wrong | check `DYNAMODB_*_TABLE` and `AWS_REGION` |
| `AccessDeniedException` | IAM policy missing an action | add the action from §6 |
| `AccessDeniedException … no identity-based policy allows` | the user simply lacks the grant | attach the policy in §6 to that user |
| `AccessDeniedException … explicit deny in a service control policy` | an AWS Organizations SCP blocks the action; IAM changes cannot override it | an organization admin must allow DynamoDB in the SCP, or use an account whose SCP permits it. Common in AWS Academy / lab accounts |
| `NoSuchBucket` from `HeadBucket`, `ListObjectsV2` and `GetBucketLocation` | the bucket name does not exist in any region (S3 names are global) | fix the spelling in `S3_BUCKET` / `S3_BUCKET_MEDIA`, or create the bucket |
| `PermanentRedirect` / HTTP 301 | bucket exists but in a different region | set `AWS_REGION` to the bucket's region |
| `ValidationException: provided key element does not match schema` | table key names differ from the domain ids | recreate/rename the key, or point the env var at the right table |
| `[dynamodb] … falling back to Scan` | no GSI for that lookup | add `OwnerIndex` / `ContributorTokenIndex` |
| Uploads fail in the browser, `aws:check --write` passes | missing S3 CORS | apply §5 |
| `SignatureDoesNotMatch` | machine clock skew | sync the system clock |
| Empty dashboard list | `updatedAt` not in the GSI sort key | include it in `OwnerIndex`, or rely on the Scan fallback |
| `ConditionalCheckFailedException` swallowed | expected on duplicate create / missing item update | nothing to do |

## 9. LocalStack (optional)

```bash
pnpm localstack:up     # DynamoDB + S3 on :4566 (requires Docker)
pnpm localstack:init   # creates the three tables, indexes and the bucket
```

Point at it with `AWS_ENDPOINT_URL=http://localhost:4566` plus dummy
credentials. This is only for offline work; the real account is the target.

## 10. Contract tests

```bash
AWS_TEST_WRITE=1 pnpm test:aws
```

Creates records under a unique `test_<timestamp>` owner, exercises every
repository method plus a presigned upload/read/delete, then removes everything.
Without the flag the suite reports as skipped, so `pnpm test` never touches
live data.

## 11. Secrets

- Keys belong in `.env.local` only. `.env*` is gitignored and `.env.example`
  holds empty placeholders.
- Nothing in the app or its logs prints a key, a presigned URL, or a raw AWS
  error body.
- Rotate any key that has been shared in a chat or a screenshot, then update
  `.env.local`.
