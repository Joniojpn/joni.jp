// app/actions.ts
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecruitmentData } from "../components/types";

export async function generatePdfData(inputText: string): Promise<RecruitmentData | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite", // 高速・安価なモデル
    generationConfig: {
      responseMimeType: "application/json", // JSON形式での出力を強制
    },
  });

  // 生成してほしいJSONのひな形（プロンプトに含めることで精度を上げます）
  const jsonStructure = `{
    "candidate": { "name": "文字列", "furigana": "文字列" },
    "employment": {
      "joiningDate": "YYYY/MM/DD",
      "department": "部署名",
      "position": "役職",
      "employmentType": "正社員/契約社員など",
      "probationPeriod": "期間",
      "workLocation": "勤務地",
      "workHours": "勤務時間"
    },
    "salary": {
      "probation": { "basic": 数値, "allowances": [{"name": "手当名", "amount": 数値}], "totalMonthly": 数値, "commutingAllowance": "通勤手当条件" },
      "official": { "basic": 数値, "allowances": [{"name": "手当名", "amount": 数値}], "totalMonthly": 数値, "commutingAllowance": "通勤手当条件" },
      "bonusStats": "賞与条件",
      "annualIncome": 数値
    },
    "approvalRequest": {
      "applicationDate": "YYYY/MM/DD",
      "applicantName": "申請者名",
      "recruitmentRoute": "応募経路",
      "interviewers": ["面接官名1", "面接官名2"],
      "recruitmentFee": 数値,
      "notes": "備考"
    },
    "notification": {
      "issueDate": "YYYY/MM/DD",
      "companyRep": "代表者名"
    }
  }`;

  const prompt = `
    あなたはプロの人事担当者です。以下の入力テキストから、採用通知書および稟議書に必要な情報を抽出し、指定されたJSON形式で出力してください。

    ## 制約事項
    1. 入力テキストに情報がない項目は、空文字 "" または 数値の 0 を入れてください（nullは避けてください）。
    2. 日付は現在日時を基準に推測してください。今日の日付: ${new Date().toLocaleDateString()}
    3. 計算が必要な項目（年収など）は自動計算して補完してください。
    4. 採用Feeは特に指定がなければ理論年収の35%で計算してください。
    5. 必ず以下のJSON構造を守ってください。

    ## 出力すべきJSON構造
    ${jsonStructure}

    ## 入力テキスト
    ${inputText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // JSONとしてパースして返す
    const data = JSON.parse(responseText) as RecruitmentData;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("データの生成に失敗しました。");
  }
}