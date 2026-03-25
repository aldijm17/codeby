"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface ContributionGraphProps {
  dates: string[]; // Array of ISO date strings
}

export default function ContributionGraph({ dates }: ContributionGraphProps) {
  const weeks = 52;
  const daysPerWeek = 7;

  // Compute activity intensity per day
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    dates.forEach((d) => {
      const dateStr = new Date(d).toISOString().split("T")[0];
      map.set(dateStr, (map.get(dateStr) || 0) + 1);
    });
    return map;
  }, [dates]);

  const gridData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid = [];
    let startDay = new Date(today);
    startDay.setDate(today.getDate() - (weeks * daysPerWeek - 1));

    // Align startDay to Monday (1)
    const dayOfWeek = startDay.getDay();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDay.setDate(startDay.getDate() - offset);

    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const currentDate = new Date(startDay);
        currentDate.setDate(startDay.getDate() + w * daysPerWeek + d);

        if (currentDate > today) {
          week.push(null); // Future dates
        } else {
          const dateStr = currentDate.toISOString().split("T")[0];
          const count = activityMap.get(dateStr) || 0;
          week.push({ date: dateStr, count });
        }
      }
      grid.push(week);
    }
    return grid;
  }, [activityMap]);

  return (
    <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden relative group">
      <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10 group-hover:bg-cyan-500/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Snippet Activity
        </h3>
        <p className="text-sm font-medium text-slate-400">
          <span className="text-cyan-400 font-bold">{dates.length}</span> contributions in the last year
        </p>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-4 pt-1">
        <div className="min-w-[700px] flex gap-1.5">
          {gridData.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1.5 flex-1">
              {week.map((day, dIndex) => {
                if (!day) return <div key={dIndex} className="w-full pt-[100%] rounded-sm opacity-0" />;

                let bgClass = "bg-slate-800/60";
                if (day.count > 0) bgClass = "bg-cyan-900/60 border border-cyan-800/80";
                if (day.count > 1) bgClass = "bg-cyan-700/80 border border-cyan-600/80 shadow-[0_0_8px_rgba(6,182,212,0.4)]";
                if (day.count > 3) bgClass = "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]";
                if (day.count > 6) bgClass = "bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.8)] text-cyan-900";

                return (
                  <motion.div
                    key={dIndex}
                    whileHover={{ scale: 1.5, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="relative w-full pt-[100%] rounded-[3px] group/box cursor-help"
                  >
                    <div className={`absolute inset-0 rounded-[3px] transition-colors ${bgClass}`} />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/box:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap bg-slate-900 border border-slate-700 text-slate-200 text-xs py-1.5 px-3 rounded-lg shadow-xl font-medium">
                      <span className="text-cyan-400 font-bold">{day.count}</span> snippets on {new Date(day.date).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-slate-500 font-medium">
        Less
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-slate-800/60" />
          <div className="w-3 h-3 rounded-[2px] bg-cyan-900/60 border border-cyan-800/80" />
          <div className="w-3 h-3 rounded-[2px] bg-cyan-700/80 border border-cyan-600/80" />
          <div className="w-3 h-3 rounded-[2px] bg-cyan-500" />
          <div className="w-3 h-3 rounded-[2px] bg-cyan-300" />
        </div>
        More
      </div>
    </div>
  );
}
