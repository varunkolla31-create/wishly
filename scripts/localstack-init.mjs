import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

/**
 * Creates the three tables this app expects, plus the bucket, against
 * LocalStack. Real AWS users create the same shape by hand (see
 * docs/AWS_SETUP.md) or run this with AWS_* pointed at their account.
 */
const endpoint = process.env.AWS_ENDPOINT_URL ?? "http://localhost:4566";
const region = process.env.AWS_REGION ?? "us-east-1";
const bucket = process.env.S3_BUCKET ?? "wishly-media";

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
};

const ddb = new DynamoDBClient({ endpoint, region, credentials });
const s3 = new S3Client({ endpoint, region, credentials, forcePathStyle: true });

const TABLES = [
  {
    name: process.env.DYNAMODB_WISHES_TABLE ?? "Wishes",
    keys: [{ AttributeName: "wishId", KeyType: "HASH" }],
    indexes: [
      {
        IndexName: "OwnerIndex",
        KeySchema: [
          { AttributeName: "ownerId", KeyType: "HASH" },
          { AttributeName: "updatedAt", KeyType: "RANGE" },
        ],
        attributes: [
          { AttributeName: "ownerId", AttributeType: "S" },
          { AttributeName: "updatedAt", AttributeType: "S" },
        ],
      },
      {
        IndexName: "ContributorTokenIndex",
        KeySchema: [{ AttributeName: "contributorToken", KeyType: "HASH" }],
        attributes: [{ AttributeName: "contributorToken", AttributeType: "S" }],
      },
    ],
  },
  {
    name: process.env.DYNAMODB_CONTRIBUTIONS_TABLE ?? "Contributions",
    keys: [
      { AttributeName: "wishId", KeyType: "HASH" },
      { AttributeName: "contributionId", KeyType: "RANGE" },
    ],
    indexes: [],
  },
  {
    name: process.env.DYNAMODB_REPLIES_TABLE ?? "Replies",
    keys: [
      { AttributeName: "wishId", KeyType: "HASH" },
      { AttributeName: "replyId", KeyType: "RANGE" },
    ],
    indexes: [
      {
        IndexName: "OwnerIndex",
        KeySchema: [
          { AttributeName: "ownerId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        attributes: [
          { AttributeName: "ownerId", AttributeType: "S" },
          { AttributeName: "createdAt", AttributeType: "S" },
        ],
      },
    ],
  },
];

async function exists(name) {
  try {
    await ddb.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (error) {
    if (error?.name === "ResourceNotFoundException") return false;
    throw error;
  }
}

async function ensureTable(spec) {
  if (await exists(spec.name)) {
    console.log(`table ${spec.name} already exists`);
    return;
  }

  const attributes = new Map();
  for (const key of spec.keys) attributes.set(key.AttributeName, "S");
  for (const index of spec.indexes) {
    for (const attr of index.attributes) {
      attributes.set(attr.AttributeName, attr.AttributeType);
    }
  }

  await ddb.send(
    new CreateTableCommand({
      TableName: spec.name,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [...attributes].map(([name, type]) => ({
        AttributeName: name,
        AttributeType: type,
      })),
      KeySchema: spec.keys,
      GlobalSecondaryIndexes: spec.indexes.length
        ? spec.indexes.map((index) => ({
            IndexName: index.IndexName,
            KeySchema: index.KeySchema,
            Projection: { ProjectionType: "ALL" },
          }))
        : undefined,
    }),
  );

  const suffix = spec.indexes.length
    ? ` with ${spec.indexes.map((index) => index.IndexName).join(", ")}`
    : "";
  console.log(`created ${spec.name}${suffix}`);
}

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`bucket ${bucket} already exists`);
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log(`created bucket ${bucket}`);
  }
}

console.log(`LocalStack at ${endpoint}`);
for (const spec of TABLES) await ensureTable(spec);
await ensureBucket();
console.log("ready");
