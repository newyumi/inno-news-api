import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-northeast-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const writeToDynamoDB = async (tableName: string, items: any[]) => {
  const putRequests = items.map((item) => ({
    PutRequest: {
      Item: item,
    },
  }));

  const params = {
    RequestItems: {
      [tableName]: putRequests,
    },
  };

  try {
    await ddbDocClient.send(new BatchWriteCommand(params));
    console.log("Items successfully written to DynamoDB");
  } catch (err) {
    console.error("Error writing items to DynamoDB:", err);
  }
};
