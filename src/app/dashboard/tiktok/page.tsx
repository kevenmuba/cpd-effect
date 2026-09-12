'use client'

import { useState, useMemo, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar, Plus, Users, Heart, Share2, ChevronDown, ChevronRight } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TikTokPage() {
  const { tiktokLogs, addTikTokLog, currentYear, setCurrentYear } = useDashboard()
  const [isInputOpen, setIsInputOpen] = useState(false)
  const [followers, setFollowers] = useState('')
  const [likes, setLikes] = useState('')
  const [connections, setConnections] = useState('')
  const [actualEthYear, setActualEthYear] = useState(currentYear)
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({})
  
  const availableYears = Array.from({length: 14}, (_, i) => 2017 + i)

  useEffect(() => {
    try {
      const now = new Date()
      const utcNow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
      const { EthDateTime } = require('ethiopian-calendar-date-converter')
      const ethDate = EthDateTime.fromEuropeanDate(utcNow)
      setActualEthYear(ethDate.year)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const { currentFollowers, weeklyGrowth, currentLikes, currentConnections, groupedLogs } = useMemo(() => {
    const ethMonths = ['', 'Meskerem', 'Tikimt', 'Hidar', 'Tahesas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumē']
    const yearLogs = tiktokLogs.filter(log => log.year === currentYear)
    
    // Group by month
    const grouped: { [key: number]: { monthName: string, logs: typeof tiktokLogs } } = {}
    
    yearLogs.forEach(log => {
      if (!grouped[log.month]) {
        grouped[log.month] = { monthName: ethMonths[log.month] || `Month ${log.month}`, logs: [] }
      }
      grouped[log.month].logs.push(log)
    })
    
    // Convert to sorted array (descending month)
    const groupedLogs = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map(monthNum => grouped[monthNum])

    if (tiktokLogs.length === 0) return { currentFollowers: 0, weeklyGrowth: 0, currentLikes: 0, currentConnections: 0, groupedLogs: [] }

    const current = tiktokLogs[0]
    const currentFollowers = current.followers
    const currentLikes = current.likes
    const currentConnections = current.connections

    let weeklyGrowth = 0
    const prevWeekLog = tiktokLogs.find(log => log.year < current.year || (log.year === current.year && log.week < current.week))
    if (prevWeekLog) {
      weeklyGrowth = currentFollowers - prevWeekLog.followers
    }

    return { currentFollowers, weeklyGrowth, currentLikes, currentConnections, groupedLogs }
  }, [tiktokLogs, currentYear])

  const chartData = useMemo(() => {
    // Generate data for the chart by sorting logs ascending
    const yearLogs = tiktokLogs.filter(log => log.year === currentYear).sort((a, b) => {
      if (a.month === b.month) return a.week - b.week
      return a.month - b.month
    })
    
    return yearLogs.map(log => ({
      name: `W${log.week}`,
      month: log.month,
      followers: log.followers,
      likes: log.likes,
      connections: log.connections
    }))
  }, [tiktokLogs, currentYear])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numFollowers = parseInt(followers)
    const numLikes = parseInt(likes)
    const numConnections = parseInt(connections)
    if (isNaN(numFollowers) || isNaN(numLikes) || isNaN(numConnections)) return

    await addTikTokLog(numFollowers, numLikes, numConnections)
    setFollowers('')
    setLikes('')
    setConnections('')
    setIsInputOpen(false)
  }

  const toggleMonth = (monthName: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthName]: prev[monthName] === undefined ? false : !prev[monthName]
    }))
  }

  const isMonthExpanded = (monthName: string, index: number) => {
    if (expandedMonths[monthName] !== undefined) {
      return expandedMonths[monthName]
    }
    return index === 0 // Default to first month expanded
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              TikTok Status
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track your TikTok growth and engagement for {currentYear}
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              <label htmlFor="tiktokYearFilter" className="text-sm font-medium text-slate-600 whitespace-nowrap">
                Year:
              </label>
              <select 
                id="tiktokYearFilter"
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {currentYear === actualEthYear && (
              <button
                onClick={() => setIsInputOpen(!isInputOpen)}
                className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 transition-all"
              >
                <Plus className="h-4 w-4" />
                Log New Stats
              </button>
            )}
          </div>
        </div>

        {isInputOpen && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Log Current Stats</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500" /> Total Followers
                  </label>
                  <input
                    type="number"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" /> Total Likes
                  </label>
                  <input
                    type="number"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-blue-500" /> Total Connections
                  </label>
                  <input
                    type="number"
                    value={connections}
                    onChange={(e) => setConnections(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsInputOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pink-700 transition-all"
                >
                  Save Stats
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Total Followers</p>
            <p className="text-4xl font-black text-slate-900">{currentFollowers.toLocaleString()}</p>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Weekly Follower Growth</p>
            <div className="flex items-center gap-3">
              {weeklyGrowth > 0 ? (
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              ) : weeklyGrowth < 0 ? (
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <div>
                <p className={`text-2xl font-black ${weeklyGrowth > 0 ? 'text-emerald-600' : weeklyGrowth < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">vs last week</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
              Total Likes
            </p>
            <p className="text-4xl font-black text-slate-900">{currentLikes.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Connections</p>
            <p className="text-4xl font-black text-slate-900">{currentConnections.toLocaleString()}</p>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
          <h3 className="text-xl font-bold text-slate-900 mb-6 px-1">Growth Trends ({currentYear})</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="followers" 
                  name="Followers"
                  stroke="#ec4899" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFollowers)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="likes" 
                  name="Likes"
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLikes)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="connections" 
                  name="Connections"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorConnections)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl">
              <p className="text-sm text-slate-500 font-medium">No data available for {currentYear}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 px-1">Historical Logs ({currentYear})</h3>
          
          {groupedLogs.map((group, index) => {
            const expanded = isMonthExpanded(group.monthName, index)
            return (
              <div key={group.monthName} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleMonth(group.monthName)}
                  className="w-full px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{group.monthName}</h3>
                  {expanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                
                {expanded && (
                  <div className="divide-y divide-slate-100">
                    {group.logs.map((log) => (
                      <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Week {log.week}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(log.dateIso).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-8 text-right">
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Followers</p>
                            <p className="text-sm font-black text-slate-900">{log.followers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Likes</p>
                            <p className="text-sm font-black text-slate-900">{log.likes.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connections</p>
                            <p className="text-sm font-black text-slate-900">{log.connections.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {groupedLogs.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-12 text-center">
              <p className="text-sm text-slate-500">No TikTok logs found for {currentYear}.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
