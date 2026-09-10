'use client'

import { useState, useMemo, useEffect } from 'react'
import { Landmark, TrendingUp, TrendingDown, Plus, X, Calendar } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'

export default function BankWidgetClient() {
  const { bankLogs, addBankLog } = useDashboard()
  const [isInputOpen, setIsInputOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [isSunday, setIsSunday] = useState(false)

  useEffect(() => {
    // Check if today is Sunday (0)
    const today = new Date()
    const isSun = today.getDay() === 0
    setIsSunday(isSun)
    
    // Auto-open if it's Sunday and no log has been made today
    if (isSun) {
      const hasLoggedToday = bankLogs.some(log => {
        const logDate = new Date(log.dateIso)
        return logDate.toDateString() === today.toDateString()
      })
      if (!hasLoggedToday) {
        setIsInputOpen(true)
      }
    }
  }, [bankLogs])

  const { currentBalance, weeklyGrowth, monthlyGrowth } = useMemo(() => {
    if (bankLogs.length === 0) return { currentBalance: 0, weeklyGrowth: 0, monthlyGrowth: 0 }

    // Logs are sorted descending by dateIso
    const current = bankLogs[0]
    const currentBalance = current.amount

    // Find the first log from a previous week
    let weeklyGrowth = 0
    const prevWeekLog = bankLogs.find(log => log.year < current.year || (log.year === current.year && log.week < current.week))
    if (prevWeekLog) {
      weeklyGrowth = currentBalance - prevWeekLog.amount
    }

    // Find the first log from a previous month
    let monthlyGrowth = 0
    const prevMonthLog = bankLogs.find(log => log.year < current.year || (log.year === current.year && log.month < current.month))
    if (prevMonthLog) {
      monthlyGrowth = currentBalance - prevMonthLog.amount
    }

    return { currentBalance, weeklyGrowth, monthlyGrowth }
  }, [bankLogs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return

    await addBankLog(numAmount)
    setAmount('')
    setIsInputOpen(false)
  }

  return (
    <div className="mx-4 mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50/80 px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Bank Status</h3>
        </div>
        {!isInputOpen && (
          <button 
            onClick={() => setIsInputOpen(true)}
            className="text-slate-400 hover:text-primary transition-colors"
            title="Log new amount"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {isInputOpen ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-600 flex items-center justify-between">
              <span>{isSunday ? 'Sunday Log' : 'Log Amount'}</span>
              <button 
                type="button" 
                onClick={() => setIsInputOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-300 pl-7 pr-3 py-1.5 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                autoFocus
                step="any"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white text-xs font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Save Balance
            </button>
          </form>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Current Balance</p>
              <p className="text-2xl font-black text-slate-900">${currentBalance.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Week</span>
                <div className="flex items-center gap-1">
                  {weeklyGrowth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : weeklyGrowth < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-slate-300" />
                  )}
                  <span className={`text-xs font-bold ${weeklyGrowth > 0 ? 'text-emerald-600' : weeklyGrowth < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Month</span>
                <div className="flex items-center gap-1">
                  {monthlyGrowth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : monthlyGrowth < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-slate-300" />
                  )}
                  <span className={`text-xs font-bold ${monthlyGrowth > 0 ? 'text-emerald-600' : monthlyGrowth < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            {bankLogs.length === 0 && (
              <div className="text-[10px] text-center text-slate-400 mt-2 italic flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                No logs yet. Start today!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
