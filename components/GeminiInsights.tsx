import React from 'react';
import { Bill } from '../types';

interface GeminiInsightsProps {
  bills: Bill[];
}

export const GeminiInsights: React.FC<GeminiInsightsProps> = ({ bills }) => {
  return (
    <div className="p-8 text-center text-gray-500">
      AI Features have been disabled.
    </div>
  );
};