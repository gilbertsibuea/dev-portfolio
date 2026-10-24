"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

const GitHubContributions = ({ username = "gilbertsibuea" }: { username?: string }) => {
  const [contributions, setContributions] = useState<ContributionWeek[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContributions();
  }, [username]);

  const fetchContributions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/github-contributions?username=${username}`);
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        throw new Error('Failed to fetch GitHub contributions');
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch GitHub contributions');
      }

      setContributions(data.weeks || []);
      setTotalContributions(data.totalContributions || 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contributions');
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    const weeks: ContributionWeek[] = [];
    const today = new Date();

    for (let week = 0; week < 52; week++) {
      const contributionDays: ContributionDay[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (52 - week) * 7 + day);
        const contributionCount = Math.floor(Math.random() * 5);
        let color = '#161b22';
        if (contributionCount > 0) color = '#0e4429';
        if (contributionCount > 1) color = '#006d32';
        if (contributionCount > 2) color = '#26a641';
        if (contributionCount > 3) color = '#39d353';
        contributionDays.push({
          date: date.toISOString().split('T')[0],
          contributionCount,
          color
        });
      }
      weeks.push({ contributionDays });
    }
    setContributions(weeks);
    setTotalContributions(502);
  };

  const getContributionLevel = (count: number): string => {
    if (count === 0) return '#161b22';
    if (count <= 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 6) return '#26a641';
    return '#39d353';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 rounded-xl border border-white/10 p-8 shadow-lg backdrop-blur-md w-full"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-53 gap-1">
            {Array.from({ length: 371 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(80,80,120,0.15)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 rounded-xl border border-white/10 p-8 shadow-lg backdrop-blur-md w-full"
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2 text-left ">
          GitHub Contributions
        </h3>
        <p className="text-gray-400 text-sm text-left">
          {totalContributions} contributions in the last year
          {error && (
            <span className="text-yellow-500 ml-2">(Using demo data - {error})</span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-53 gap-1 mb-2" style={{ minWidth: '800px' }}>
          {contributions.map((week, weekIndex) =>
            week.contributionDays.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-violet-400"
                style={{
                  backgroundColor: error ? getContributionLevel(day.contributionCount) : day.color
                }}
                title={`${day.contributionCount} contributions on ${day.date}`}
              />
            ))
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getContributionLevel(level) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GitHubContributions;