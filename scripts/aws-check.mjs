import { readFileSync } from "node:fs";
import {
  DescribeTableCommand,
  DynamoDBClient,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DeleteObjectCommand,
  GetBucketLocationCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Verifies the AWS wiring without printing any secret. Values are read from the
 * process environment, falling back to .env.local, and are never echoed.
 */

function loadEnvLocal() {
  const found = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      if (process.env[m[1]] === undefined) {
        found[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env.local; rely on the real environment.
  }
  return { ...found, ...process.env };
}

const env = loadEnvLocal();
const WRITE = process.argv.includes("--write");

const region = env.AWS_REGION;
const tables = {
  wishes: env.DYNAMODB_TABLE ?? env.DYNAMODB_WISHES_TABLE ?? "Wishes",
  contributions: env.DYNAMODB_CONTRIBUTIONS_TABLE ?? "Contributions",
  replies: env.DYNAMODB_REPLIES_TABLE ?? "Replies",
};
const bucket = env.S3_BUCKET ?? env.S3_BUCKET_MEDIA;

let problems = 0;
const ok = (label, detail = "") => console.log(`  ok    ${label}${detail ? ` — ${detail}` : ""}`);
const warn = (label, detail = "") => console.log(`  warn  ${label}${detail ? ` — ${detail}` : ""}`);
const bad = (label, detail = "") => {
  problems += 1;
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
};

/** `name`, HTTP status and a short message. Never includes credentials. */
function detail(error) {
  const name = error?.name ?? "UnknownError";
  const code = error?.Code ?? error?.code;
  const status = error?.$metadata?.httpStatusCode;
  const message = typeof error?.message === "string" ? error.message.slice(0, 300) : "";
  return [name, code && code !== name ? code : null, status ? `HTTP ${status}` : null, message]
    .filter(Boolean)
    .join(" · ");
}

console.log("Wishly AWS check\n");

console.log("configuration");
ok("credentials", env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? "static keys present" : "using the default AWS chain");
if (region) {
  ok("region", region);
} else {
  bad("region", "set AWS_REGION");
}

if (env.AWS_ENDPOINT_URL) {
  warn("endpoint override", "AWS_ENDPOINT_URL is set (LocalStack or VPC endpoint)");
} else {
  ok("endpoint", "AWS default");
}

if (bucket) {
  ok("bucket", "S3_BUCKET is set");
} else {
  bad("bucket", "set S3_BUCKET");
}

const config = {
  region: region ?? "us-east-1",
  endpoint: env.AWS_ENDPOINT_URL || undefined,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
      : undefined,
};

const ddb = new DynamoDBClient(config);
const s3 = new S3Client({ ...config, forcePathStyle: Boolean(config.endpoint) });

function describeIndexes(table) {
  const hash = table.KeySchema?.find((k) => k.KeyType === "HASH")?.AttributeName;
  const range = table.KeySchema?.find((k) => k.KeyType === "RANGE")?.AttributeName;
  const gsis = (table.GlobalSecondaryIndexes ?? []).map((g) => {
    const gh = g.KeySchema?.find((k) => k.KeyType === "HASH")?.AttributeName;
    const gr = g.KeySchema?.find((k) => k.KeyType === "RANGE")?.AttributeName;
    return `${g.IndexName}(${gh}${gr ? `,${gr}` : ""})`;
  });
  return { hash, range, gsis };
}

console.log("\ndynamodb");
try {
  const listed = await ddb.send(new ListTablesCommand({}));
  const names = listed.TableNames ?? [];
  console.log(`  info  ListTables ok — ${names.length} table(s): ${names.join(", ") || "(none)"}`);
  for (const role of ["wishes", "contributions", "replies"]) {
    if (!names.includes(tables[role])) {
      console.log(`  info  ${tables[role]} is not in the visible list (expected name may differ)`);
    }
  }
} catch (error) {
  console.log(`  info  ListTables failed: ${detail(error)}`);
}

const described = {};
for (const [role, name] of Object.entries(tables)) {
  try {
    const { Table } = await ddb.send(new DescribeTableCommand({ TableName: name }));
    described[role] = Table;
    const { hash, range, gsis } = describeIndexes(Table);
    ok(`${role}: ${name}`, `keys ${hash}${range ? ` + ${range}` : ""} · ${Table.TableStatus} · ~${Table.ItemCount ?? 0} items`);
    if (gsis.length) console.log(`        GSI: ${gsis.join(", ")}`);
    else warn(`${role}: no GSI`, "lookups on ownerId/contributorToken will Scan");
    if (!range && role !== "wishes") {
      bad(`${role}: no sort key`, "this table cannot hold more than one record per wish");
    }
    if (role === "wishes" && !(Table.GlobalSecondaryIndexes ?? []).some((g) => g.KeySchema?.some((k) => k.AttributeName === "ownerId"))) {
      warn("wishes: no ownerId index", "listByOwner falls back to Scan");
    }
    if (role === "replies" && !(Table.GlobalSecondaryIndexes ?? []).some((g) => g.KeySchema?.some((k) => k.AttributeName === "ownerId"))) {
      warn("replies: no ownerId index", "the replies inbox falls back to Scan");
    }
  } catch (error) {
    const code = error?.name ?? "unknown";
    if (code === "ResourceNotFoundException") bad(`${role}: ${name}`, "table not found in this region/account");
    else if (code === "AccessDeniedException" || code === "AccessDenied") bad(`${role}: ${name}`, detail(error));
    else bad(`${role}: ${name}`, detail(error));
  }
}

console.log("\ns3");
if (bucket) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    ok("bucket reachable");
    try {
      await s3.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
      ok("list permission");
    } catch (error) {
      bad("list permission", error?.name ?? "unknown");
    }
  } catch (error) {
    bad("bucket", detail(error));
    // S3 hides existence when permission is missing, so probe again explicitly:
    // 404 on both means the name is wrong; AccessDenied means the policy is.
    for (const [label, command] of [
      ["ListObjectsV2", new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 })],
      ["GetBucketLocation", new GetBucketLocationCommand({ Bucket: bucket })],
    ]) {
      try {
        await s3.send(command);
        ok(label);
      } catch (probeError) {
        console.log(`  info  ${label}: ${detail(probeError)}`);
      }
    }
  }

  if (WRITE) {
    const key = `_healthcheck/${Date.now()}.txt`;
    try {
      await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: "wishly-check", ContentType: "text/plain" }));
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      ok("write/read/delete round-trip", "temporary object removed");
    } catch (error) {
      bad("write round-trip", error?.name ?? "unknown");
    }
  } else {
    console.log("  note  write round-trip skipped (re-run with --write)");
  }
}

console.log("\nresult");
if (problems === 0) {
  console.log("All required pieces are in place.");
} else {
  console.log(`${problems} problem(s) found. See docs/AWS_SETUP.md for the fix and the IAM policy.`);
  process.exitCode = 1;
}
