import { useState, useEffect } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('daily')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekOffset, setWeekOffset] = useState(0)
  const [stars, setStars] = useState({})

  // Load stars from localStorage on mount
  useEffect(() => {
    const savedStars = localStorage.getItem('starChart')
    if (savedStars) {
      setStars(JSON.parse(savedStars))
    }
  }, [])

  // Save stars to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('starChart', JSON.stringify(stars))
  }, [stars])

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const addStar = (type) => {
    const dateKey = formatDate(currentDate)
    setStars(prev => ({
      ...prev,
      [dateKey]: {
        good: prev[dateKey]?.good || 0,
        bad: prev[dateKey]?.bad || 0,
        [type]: (prev[dateKey]?.[type] || 0) + 1
      }
    }))
  }

  const changeDay = (offset) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + offset)
    setCurrentDate(newDate)
  }

  const getWeekDates = (offset = 0) => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + (offset * 7))
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getWeekStats = (offset = 0) => {
    const dates = getWeekDates(offset)
    let totalGood = 0
    let totalBad = 0
    const dailyStats = []

    dates.forEach(date => {
      const dateKey = formatDate(date)
      const dayStars = stars[dateKey] || { good: 0, bad: 0 }
      totalGood += dayStars.good
      totalBad += dayStars.bad
      dailyStats.push({
        date,
        good: dayStars.good,
        bad: dayStars.bad
      })
    })

    return { totalGood, totalBad, dailyStats, dates }
  }

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatDateShort = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const currentDayStars = stars[formatDate(currentDate)] || { good: 0, bad: 0 }
  const weekStats = getWeekStats(weekOffset)

  return (
    <div className="app">
      <h1>⭐ Star Chart ⭐</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily View
        </button>
        <button 
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Report
        </button>
      </div>

      {activeTab === 'daily' && (
        <div className="daily-view">
          <div className="date-selector">
            <button onClick={() => changeDay(-1)}>← Previous Day</button>
            <div className="current-date">{formatDateDisplay(currentDate)}</div>
            <button onClick={() => changeDay(1)}>Next Day →</button>
          </div>

          <div className="star-buttons">
            <button className="star-button good" onClick={() => addStar('good')}>
              ⭐ Good Star
            </button>
            <button className="star-button bad" onClick={() => addStar('bad')}>
              ❌ Bad Star
            </button>
          </div>

          <div className="star-count">
            <div className="count-item good">
              <div className="label">Good Stars</div>
              <div className="value">{currentDayStars.good}</div>
            </div>
            <div className="count-item bad">
              <div className="label">Bad Stars</div>
              <div className="value">{currentDayStars.bad}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="weekly-report">
          <div className="week-selector">
            <button onClick={() => setWeekOffset(weekOffset - 1)}>← Previous Week</button>
            <div className="week-range">
              {formatDateShort(weekStats.dates[0])} - {formatDateShort(weekStats.dates[6])}
            </div>
            <button onClick={() => setWeekOffset(weekOffset + 1)}>Next Week →</button>
          </div>

          <div className="week-summary">
            <h2>Week Total</h2>
            <div className="week-totals">
              <div className="count-item good">
                <div className="label">Good Stars</div>
                <div className="value">{weekStats.totalGood}</div>
              </div>
              <div className="count-item bad">
                <div className="label">Bad Stars</div>
                <div className="value">{weekStats.totalBad}</div>
              </div>
            </div>
          </div>

          <div className="daily-breakdown">
            <h3>Daily Breakdown</h3>
            {weekStats.dailyStats.map((day, index) => (
              <div key={index} className="day-row">
                <div className="day-name">{formatDateDisplay(day.date)}</div>
                <div className="day-counts">
                  <div className="day-count good">
                    <span>⭐</span>
                    <span className="value">{day.good}</span>
                  </div>
                  <div className="day-count bad">
                    <span>❌</span>
                    <span className="value">{day.bad}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
