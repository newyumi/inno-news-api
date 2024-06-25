import Parser from "rss-parser";
import { writeToDynamoDB } from "../../../utils/dynamodb";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import "server-only";

const parser = new Parser();

function extractImageUrl(item: any): string | null {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  } else if (item["media:content"] && item["media:content"].$ && item["media:content"].$.url) {
    return item["media:content"].$.url;
  } else {
    const match = item.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  }
}

async function processRSSFeed(feedUrl: string): Promise<any[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    // console.log("feed items::", feed.items);

    const newsItems = feed.items.map((item: any) => ({
      Id: uuidv4(),
      Author: item["author"] ? item["author"] : item["dc:creator"] ? item["dc:creator"] : "",
      Link: item.link ? item.link : "",
      PubDate: item.pubDate ? new Date(item.pubDate).toISOString() : "",
      Source: feed.title ? feed.title : "",
      Title: item.title ? item.title : "",
      Tags: item.categories ? item.categories.join(",") : "",
      CreatedDate: new Date().toISOString(),
      Categories: item.categories ? item.categories : "", // techcrunch array,
      Content: item.content ? item.content : "",
      Image: extractImageUrl(item),
    }));

    console.log("Processed news items:", newsItems);
    writeToDynamoDB("News", newsItems);

    return newsItems;
  } catch (error: any) {
    throw new Error(`Error processing RSS Feed (${feedUrl}): ${error.message}`);
  }
}

export async function GET(req: NextRequest) {
  const feedUrls = ["https://techcrunch.com/feed", "https://www.theverge.com/rss/index.xml"];

  try {
    const processedItems: any[] = [];
    for (const feedUrl of feedUrls) {
      const items = await processRSSFeed(feedUrl);
      processedItems.push(...items);
    }

    return NextResponse.json({ message: "RSS Feeds successfully processed", data: processedItems });
  } catch (error: any) {
    return NextResponse.json({ message: `Error processing RSS Feeds: ${error.message}` });
  }
}
