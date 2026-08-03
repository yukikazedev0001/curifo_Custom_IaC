import { S3Client, ListBucketsCommand, GetBucketLocationCommand, Bucket } from "@aws-sdk/client-s3";
import { loadConfig } from "./config";

export interface GetS3BucketsOptions {
  region?: string;
  filterByRegion?: boolean;
}

export interface BucketWithLocation extends Bucket {
  Location?: string;
  ARN?: string;
}

/**
 * 個別の S3 バケットがどのリージョンに存在するかを取得します。
 * (AWS 仕様上、us-east-1 の LocationConstraint は空文字または undefined になるため 'us-east-1' と判定)
 */
export async function getBucketLocation(bucketName: string, clientRegion: string): Promise<string> {
  const client = new S3Client({ region: clientRegion });
  try {
    const res = await client.send(new GetBucketLocationCommand({ Bucket: bucketName }));
    const location = res.LocationConstraint as string | undefined;
    if (!location) {
      return "us-east-1";
    }
    if (location === "EU") {
      return "eu-west-1";
    }
    return location;
  } catch (error) {
    return "unknown";
  }
}

/**
 * 紐づけられた AWS アカウント内の S3 バケット一覧を取得し、各バケットのリージョン情報および ARN を付与します。
 *
 * @param options リージョン指定およびフィルタリングオプション
 * @returns バケット情報の配列 (BucketWithLocation[])
 */
export async function getAllS3Buckets(options?: GetS3BucketsOptions): Promise<BucketWithLocation[]> {
  const config = loadConfig();
  const targetRegion = options?.region || process.env.AWS_REGION || config.region;
  const client = new S3Client({ region: targetRegion });

  try {
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    const rawBuckets = response.Buckets || [];

    // 並列処理で各バケットの Location (リージョン) および ARN を作成
    const bucketsWithLocation: BucketWithLocation[] = await Promise.all(
      rawBuckets.map(async (bucket) => {
        if (!bucket.Name) return bucket;
        const loc = await getBucketLocation(bucket.Name, targetRegion);
        return {
          ...bucket,
          Location: loc,
          ARN: `arn:aws:s3:::${bucket.Name}`,
        };
      })
    );

    // filterByRegion オプション指定時は対象リージョンのみフィルタ
    if (options?.filterByRegion) {
      return bucketsWithLocation.filter((b) => b.Location === targetRegion);
    }

    return bucketsWithLocation;
  } catch (error) {
    console.error("S3 バケット一覧の取得に失敗しました:", error);
    throw error;
  }
}

/**
 * S3 バケット名のみを文字列配列として取得します。
 */
export async function getAllS3BucketNames(options?: GetS3BucketsOptions): Promise<string[]> {
  const buckets = await getAllS3Buckets(options);
  return buckets.map((bucket) => bucket.Name).filter((name): name is string => Boolean(name));
}

// 直接実行テスト用
if (require.main === module) {
  (async () => {
    try {
      console.log("S3 バケット一覧（ARN・リージョン情報付き）を取得中...");
      const buckets = await getAllS3Buckets();
      console.log(`\n全 ${buckets.length} 件の S3 バケット:\n`);
      buckets.forEach((bucket, index) => {
        console.log(`  [${index + 1}] ${bucket.Name}`);
        console.log(`      ARN: ${bucket.ARN}`);
        console.log(`      リージョン: ${bucket.Location}\n`);
      });
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  })();
}
