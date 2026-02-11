import { GoogleGenAI } from "@google/genai";
import { Bill } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFinancialInsights = async (bills: Bill[]): Promise<string> => {
  try {
    const billsJson = JSON.stringify(bills, null, 2);
    const prompt = `
      You are a senior financial analyst for a holding group managing multiple companies.
      Analyze the following list of bills and provide a concise executive summary.
      
      Focus on:
      1. Total exposure (upcoming payments).
      2. Identify any companies with disproportionately high expenses.
      3. Flag any potential cash flow issues based on due dates (clustering of payments).
      4. Suggest 1 actionable optimization tip.

      Format the output in clear Markdown with headers and bullet points.
      
      Bills Data:
      ${billsJson}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and precise financial assistant.",
      }
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Error generating insights. Please check your API configuration.";
  }
};