'use client'

import { useState, useMemo, useEffect } from 'react'
import { CalendarDays, Plus, Activity, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'
import { format, getWeekOfMonth, parseISO } from 'date-fns'

export default function ActivityLoggerClient() {
  const { currentYear, setCurrentYear, specificGoals, activities, addActivity } = useDashboard()
  
  const [action, setAction] = useState('')
  // Track selected goals and their specific scores
  const [selectedImpacts, setSelectedImpacts] = useState<Record<string, number>>({})

  const [realCurrentEthYear, setRealCurrentEthYear] = useState(2018)
  const [todayEthDateStr, setTodayEthDateStr] = useState('')

  // Generate years from 2018 up to 2030 (Ethiopian)
  const availableYears = Array.from({length: 13}, (_, i) => 2018 + i)

  useEffect(() => {
    try {
      const { EthDateTime } = require('ethiopian-calendar-date-converter');
      const ethDate = EthDateTime.fromEuropeanDate(new Date());
      setRealCurrentEthYear(ethDate.year);
      
      const ethMonths = ['', 'Meskerem', 'Tikimt', 'Hidar', 'Tahesas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumē'];
      setTodayEthDateStr(`${format(new Date(), 'EEEE')}, ${ethMonths[ethDate.month]} ${ethDate.date}, ${ethDate.year}`);
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Only show active goals for the current selected Ethiopian year
  const availableGoals = specificGoals.filter(g => g.isActive && g.year === currentYear)

  const handleGoalToggle = (goalId: string) => {
    const newImpacts = { ...selectedImpacts }
    if (newImpacts[goalId] !== undefined) {
      delete newImpacts[goalId]
    } else {
      newImpacts[goalId] = 0 // default neutral score
    }
    setSelectedImpacts(newImpacts)
  }

  const handleScoreChange = (goalId: string, score: number) => {
    setSelectedImpacts({ ...selectedImpacts, [goalId]: score })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!action.trim() || Object.keys(selectedImpacts).length === 0) return

    const impactsList = Object.entries(selectedImpacts).map(([goalId, score]) => {
      const goalName = availableGoals.find(g => g.id === goalId)?.name || 'Custom Goal'
      return { goalId, goalName, score }
    })

    const now = new Date()

    const newActivity = {
      id: Date.now(),
      action,
      impacts: impactsList,
      date: format(now, 'MMM d'),
      dateIso: now.toISOString(),
      ethWeek: `Week ${getWeekOfMonth(now, { weekStartsOn: 1 })}`,
      year: currentYear
    }

    addActivity(newActivity)
    setAction('')
    setSelectedImpacts({})
  }

  // Filter activities by the current selected year and sort by date descending
  const filteredActivities = activities
    .filter(a => a.year === currentYear)
    .sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())

  // Grouping logic: Ethiopian Month -> Week -> Day
  const groupedTimeline = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, any[]>>> = {}
    
    // Ethiopian Months
    const ethMonths = [
      '', 'Meskerem', 'Tikimt', 'Hidar', 'Tahesas', 'Tir', 'Yekatit', 
      'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumē'
    ]

    filteredActivities.forEach(activity => {
      const d = new Date(activity.dateIso)
      
      let ethYear = currentYear;
      let ethMonthName = 'Unknown Month';
      
      try {
        const { EthDateTime } = require('ethiopian-calendar-date-converter');
        const ethDate = EthDateTime.fromEuropeanDate(d);
        ethYear = ethDate.year;
        ethMonthName = `${ethMonths[ethDate.month]} ${ethYear}`;
        
        // Approximate Week in Ethiopian month (1-5)
        const weekOfMonth = Math.ceil(ethDate.date / 7);
        const weekName = `Week ${weekOfMonth}`;
        
        // Use Gregorian day of week name but Ethiopian date number
        const ethDayNumber = ethDate.date;
        const ethDayName = `${format(d, 'EEEE')}, ${ethMonths[ethDate.month]} ${ethDayNumber}`;

        if (!groups[ethMonthName]) groups[ethMonthName] = {}
        if (!groups[ethMonthName][weekName]) groups[ethMonthName][weekName] = {}
        if (!groups[ethMonthName][weekName][ethDayName]) groups[ethMonthName][weekName][ethDayName] = []

        groups[ethMonthName][weekName][ethDayName].push(activity)
      } catch (e) {
        console.error("Error converting date", e)
        // Fallback to Gregorian if converter fails in browser
        const monthName = format(d, 'MMMM yyyy')
        const weekOfMonth = getWeekOfMonth(d, { weekStartsOn: 1 })
        const weekName = `Week ${weekOfMonth}`
        const dayName = format(d, 'EEEE, MMM d')

        if (!groups[monthName]) groups[monthName] = {}
        if (!groups[monthName][weekName]) groups[monthName][weekName] = {}
        if (!groups[monthName][weekName][dayName]) groups[monthName][weekName][dayName] = []

        groups[monthName][weekName][dayName].push(activity)
      }
    })
    return groups
  }, [filteredActivities, currentYear])

  // State to manage which months are expanded
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
    // Expand the most recent month by default
    const firstMonth = Object.keys(groupedTimeline)[0]
    return firstMonth ? { [firstMonth]: true } : {}
  })

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }))
  }

  const isCurrentYear = currentYear === realCurrentEthYear;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daily Activities ({currentYear})</h1>
          <p className="text-slate-500">Log actions to build your Compound Effect. Missing a day incurs a penalty!</p>
        </div>
        
        {/* Year Filter */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <label htmlFor="yearFilter" className="text-sm font-medium text-slate-600 whitespace-nowrap">
            Ethiopian Year:
          </label>
          <select 
            id="yearFilter"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logger Form - Only visible for current Ethiopian Year */}
      {isCurrentYear ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Log New Action</h2>
              <p className="text-sm text-slate-500">Timestamp: {todayEthDateStr || format(new Date(), 'EEEE, MMM d, yyyy')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="action" className="mb-2 block text-sm font-medium text-slate-700">Action Description</label>
                <input
                  id="action"
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="e.g. Read 10 pages of a book..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Which active goals for {currentYear} did this action impact?
                </label>
                
                {availableGoals.length === 0 ? (
                  <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 text-amber-800 text-sm">
                    You don't have any active goals for {currentYear}. Go to Manage Goals to create one!
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {availableGoals.map((g) => {
                      const isSelected = selectedImpacts[g.id] !== undefined
                      return (
                        <div 
                          key={g.id} 
                          className={`rounded-xl border p-4 transition-colors ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                              checked={isSelected}
                              onChange={() => handleGoalToggle(g.id)}
                            />
                            <span className={`font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                              {g.name}
                            </span>
                          </label>
                          
                          {isSelected && (
                            <div className="mt-4 pl-7">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-500">Impact Score:</span>
                                <span className={`text-xs font-bold ${
                                  selectedImpacts[g.id] > 0 ? 'text-emerald-600' : selectedImpacts[g.id] < 0 ? 'text-red-600' : 'text-slate-500'
                                }`}>
                                  {selectedImpacts[g.id] > 0 ? `+${selectedImpacts[g.id]}` : selectedImpacts[g.id]}
                                </span>
                              </div>
                              <input 
                                type="range" 
                                min="-1" 
                                max="1" 
                                step="0.1"
                                value={selectedImpacts[g.id]}
                                onChange={(e) => handleScoreChange(g.id, parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                                <span>-1.0 (Bad)</span>
                                <span>0 (Neutral)</span>
                                <span>+1.0 (Good)</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!action.trim() || Object.keys(selectedImpacts).length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              Save Activity
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 md:p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <CalendarDays className="h-12 w-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Viewing Past Year ({currentYear})</h2>
          <p className="text-slate-500 mt-2 max-w-md">
            You are viewing your activity history for {currentYear}. You can only log new activities for the current Ethiopian Year ({realCurrentEthYear}).
          </p>
        </div>
      )}

      {/* Hierarchical Timeline: Month > Week > Day */}
      <div className="mt-8">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
          <CalendarDays className="h-6 w-6 text-primary" />
          Activity History
        </h3>
        
        {Object.keys(groupedTimeline).length === 0 ? (
          <p className="text-slate-500 italic">No activities logged for {currentYear} yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTimeline).map(([month, weeks]) => (
              <div key={month} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  onClick={() => toggleMonth(month)}
                  className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 text-left transition-colors hover:bg-slate-100"
                >
                  <span className="text-lg font-bold text-slate-900">{month}</span>
                  {expandedMonths[month] ? (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  )}
                </button>
                
                {expandedMonths[month] && (
                  <div className="border-t border-slate-200 p-6 space-y-8">
                    {Object.entries(weeks).map(([week, days]) => (
                      <div key={week} className="relative pl-6 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-[2px] before:bg-slate-200">
                        <div className="absolute left-0 top-2 h-6 w-6 rounded-full border-4 border-white bg-primary"></div>
                        <h4 className="mb-6 text-md font-semibold uppercase tracking-wider text-slate-700">{week}</h4>
                        
                        <div className="space-y-6">
                          {Object.entries(days).map(([day, dayActivities]) => (
                            <div key={day} className="space-y-3">
                              <h5 className="text-sm font-medium text-slate-500 bg-slate-100 inline-block px-3 py-1 rounded-full">{day}</h5>
                              
                              <div className="space-y-3 pl-4 border-l-2 border-slate-100 ml-4">
                                {dayActivities.map(activity => (
                                  <div key={activity.id} className={`flex flex-col rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${activity.isPenalty ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                                    <div className="mb-3 border-b border-slate-100 pb-3 flex items-center gap-2">
                                      {activity.isPenalty && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                      <span className={`font-medium ${activity.isPenalty ? 'text-red-700' : 'text-slate-900'}`}>{activity.action}</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {activity.impacts.map((impact: any, idx: number) => (
                                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${activity.isPenalty ? 'bg-red-100/50' : 'bg-slate-50'}`}>
                                          <span className="text-xs font-medium text-slate-600">{impact.goalName}</span>
                                          <div className={`flex h-6 px-2 items-center justify-center rounded-full text-xs font-bold ${
                                            impact.score > 0 ? 'bg-emerald-100 text-emerald-700' : 
                                            impact.score < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                          }`}>
                                            {impact.score > 0 ? `+${impact.score}` : impact.score}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
