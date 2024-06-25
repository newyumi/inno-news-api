export type News = {
  Author: string;
  Link: string;
  PubDate: Date;
  Source: string;
  Title: string;
  Tags: string[];
  CreatedDate: Date;
  Categories: string;
  Content: string; // AI 요약
  Image: string;
};

// RSS feed를 파싱하면서 Content에 AI 요약 내용을 넣고
// 본문보기는 바로 Link로 내장 브라우저 띄우기
