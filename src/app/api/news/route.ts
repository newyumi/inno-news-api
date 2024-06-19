import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { NextRequest, NextResponse } from "next/server";

// AWS SDK를 사용하여 DynamoDB 클라이언트 생성
const client = new DynamoDBClient({ region: "ap-northeast-2" });

export async function GET(req: NextRequest) {
  const params = {
    TableName: "News", // 가져올 DynamoDB 테이블 이름
  };

  try {
    const command = new ScanCommand(params);
    const response = await client.send(command);
    console.log("Items from DynamoDB:", response.Items); // 응답에서 가져온 항목들 로그 출력

    // 가져온 항목들을 JSON 형식으로 반환
    return NextResponse.json({ message: "Items from DynamoDB", data: response.Items });
  } catch (error) {
    console.error("Error retrieving items from DynamoDB:", error);
    // 오류 발생 시 오류 메시지를 JSON 형식으로 반환
    return NextResponse.json({ message: `Error retrieving items from DynamoDB: ${error}` });
  }
}
