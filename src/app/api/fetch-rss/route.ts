import { parseString } from "xml2js";
import { writeToDynamoDB } from "../../../utils/dynamodb";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

import "server-only";

export async function GET(req: NextRequest) {
  const rssFeedUrl = "https://techcrunch.com/feed";

  try {
    const response = await fetch(rssFeedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
    }

    const xmlData = await response.text();
    let newsItems: any[] = [];
    parseString(xmlData, (err, result) => {
      if (err) {
        throw new Error(`Failed to parse XML: ${err.message}`);
      }

      const channel = result.rss.channel[0];
      if (!channel || !channel.item || !Array.isArray(channel.item)) {
        throw new Error("RSS 채널 데이터가 올바르게 구성되지 않았습니다.");
      }

      newsItems = channel.item.map((item: any) => ({
        Id: uuidv4(),
        Author: item["dc:creator"] ? item["dc:creator"][0] : "", // dc.creator RSS 확장
        Link: item.link ? item.link[0] : "",
        PublishedDate: item.pubDate ? new Date(item.pubDate[0]).toISOString() : "",
        Source: channel.title ? channel.title[0] : "",
        Title: item.title ? item.title[0] : "",
        Tags: item.category ? item.category.join(",") : "",
        CreatedDate: new Date().toISOString(),
        Categories: item.category ? item.category[0] : "",
        Content: "",
      }));

      console.log("Processed news items:", newsItems);
      writeToDynamoDB("News", newsItems);
    });
    return NextResponse.json({ message: "RSS Feed successfully processed", data: newsItems });
  } catch (error: any) {
    return NextResponse.json({ message: `Error processing RSS Feed: ${error.message}` });
  }
}
