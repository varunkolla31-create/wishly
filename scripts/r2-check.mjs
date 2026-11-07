import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { loadEnv, readVar } from "./lib/load-env.mjs";

/**
 * End-to-end check against the real bucket: presign, put, head, presigned get,
 * delete. Prints variable names and pass/fail only — never a key or a URL.
 */
const fileEnv = loadEnv();
const value = (name) => readVar(name, fileEnv);

const accountId = value("R2_ACCOUNT_ID");
const accessKeyId = value("R2_ACCESS_KEY_ID");
const secretAccessKey = value("R2_SECRET_ACCESS_KEY");
const bucket = value("R2_BUCKET");
const endpoint =
  value("R2_ENDPOINT") ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

let failures = 0;
const ok = (label) => console.log(`  ok    ${label}`);
const fail = (label, detail) => {
  failures += 1;
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
};

function detail(error) {
  const name = error?.name ?? "UnknownError";
  const status = error?.$metadata?.httpStatusCode;
  const message = typeof error?.message === "string" ? error.message.slice(0, 160) : "";
  return [name, status ? `HTTP ${status}` : null, message].filter(Boolean).join(" · ");
}

console.log("Wishly R2 check\n");

console.log("configuration");
for (const [label, present] of [
  ["R2_ACCOUNT_ID", accountId],
  ["R2_ACCESS_KEY_ID", accessKeyId],
  ["R2_SECRET_ACCESS_KEY", secretAccessKey],
  ["R2_BUCKET", bucket],
]) {
  if (present) ok(label);
  else fail(label, "not set in .env.local");
}
if (endpoint) ok("R2_ENDPOINT", value("R2_ENDPOINT") ? "explicit" : "derived from account id");
else fail("R2_ENDPOINT", "set R2_ENDPOINT or R2_ACCOUNT_ID");

if (failures > 0) {
  console.log("\nresult\nMissing configuration. See docs/R2_SETUP.md.");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const key = `tmp/r2-check-${Date.now()}.txt`;
const body = Buffer.from("wishly r2 check", "utf8");

console.log("\nround trip");
try {
  const putUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: "text/plain" }),
    { expiresIn: 600 },
  );
  // The SDK can still add checksum params; strip them exactly as the adapter does.
  const url = new URL(putUrl);
  for (const name of [...url.searchParams.keys()]) {
    if (name.startsWith("x-amz-checksum-") || name === "x-amz-sdk-checksum-algorithm") {
      url.searchParams.delete(name);
    }
  }

  const put = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body,
  });
  if (put.ok) ok("presigned PUT");
  else {
    fail("presigned PUT", `HTTP ${put.status} ${(await put.text()).slice(0, 120)}`);
    throw new Error("stop");
  }

  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  if (head.ContentLength === body.length) ok(`HeadObject (${head.ContentLength} bytes)`);
  else fail("HeadObject", `expected ${body.length}, got ${head.ContentLength ?? "?"}`);

  const getUrl = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 900 },
  );
  const got = await fetch(getUrl);
  const text = got.ok ? await got.text() : "";
  if (got.ok && text === "wishly r2 check") ok("presigned GET returned the bytes");
  else fail("presigned GET", `HTTP ${got.status}`);
} catch (error) {
  if (error?.message !== "stop") fail("round trip", detail(error));
} finally {
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    ok("DeleteObject");
  } catch (error) {
    fail("DeleteObject", detail(error));
  }
}

console.log("\nresult");
if (failures === 0) {
  console.log("R2 is ready.");
} else {
  console.log(`${failures} check(s) failed. See docs/R2_SETUP.md.`);
  process.exitCode = 1;
}
