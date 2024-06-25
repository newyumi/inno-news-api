import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { NextRequest, NextResponse } from "next/server";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import middleware from "../lib/middleware";

const client = new DynamoDBClient({ region: "ap-northeast-2" });

export async function GET(req: NextRequest, res: NextResponse) {
  await middleware();

  const queryParams = req.nextUrl.searchParams;

  let Id = null,
    CreatedDate = null,
    LastEvaluatedKey = null;
  if (queryParams.get("lastId") && queryParams.get("lastDate")) {
    Id = queryParams.get("lastId");
    CreatedDate = queryParams.get("lastDate");
    LastEvaluatedKey = marshall({
      Id,
      CreatedDate,
    });
  }

  const params: any = {
    TableName: "News",
    Limit: 20,
    ScanIndexForward: false, // sort key 내림차순
  };

  if (LastEvaluatedKey) params.ExclusiveStartKey = LastEvaluatedKey;
  console.log("params:", params);

  try {
    const command = new ScanCommand(params);
    const response = await client.send(command);
    // console.log("Items from DynamoDB:", response.Items);

    const formattedItems = response.Items?.map((item) => {
      const formattedItem: any = {};
      for (const [key, value] of Object.entries(item)) {
        if (key === "Categories" && value.L) {
          formattedItem[key] = value.L.map((listItem) => listItem.S);
        } else {
          formattedItem[key] = value.S;
        }
      }
      return formattedItem;
    });

    return NextResponse.json({
      message: "Items from DynamoDB",
      data: formattedItems,
      LastEvaluatedKey: response.LastEvaluatedKey && unmarshall(response.LastEvaluatedKey),
    });
  } catch (error) {
    console.error("Error retrieving items from DynamoDB:", error);
    // 오류 발생 시 오류 메시지를 JSON 형식으로 반환
    return NextResponse.json({ message: `Error retrieving items from DynamoDB: ${error}` });
  }
}
