import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const STORAGE_KEY = 'football-dashboard-players'

const SAMPLE_PLAYERS = [
  {
    id: 1,
    name: 'Neymar',
    age: 32,
    position: 'CAM',
    team: 'Santos',
    matches: 20,
    goals: 15,
    assists: 12,
    passPercentage: 89,
    rating: 8.7,
  },
  {
    id: 2,
    name: 'Lionel Messi',
    age: 37,
    position: 'RW',
    team: 'Inter Miami',
    matches: 22,
    goals: 18,
    assists: 14,
    passPercentage: 91,
    rating: 9.1,
  },
  {
    id: 3,
    name: 'Kylian Mbappé',
    age: 25,
    position: 'ST',
    team: 'Real Madrid',
    matches: 21,
    goals: 17,
    assists: 6,
    passPercentage: 83,
    rating: 8.8,
  },
  {
    id: 4,
    name: 'Lamine Yamal',
    age: 17,
    position: 'RW',
    team: 'Barcelona',
    matches: 24,
    goals: 9,
    assists: 11,
    passPercentage: 86,
    rating: 8.4,
  },
  {
    id: 5,
    name: 'Jude Bellingham',
    age: 21,
    position: 'CM',
    team: 'Real Madrid',
    matches: 23,
    goals: 13,
    assists: 8,
    passPercentage: 88,
    rating: 8.9,
  },
  {
    id: 6,
    name: 'Vinícius Júnior',
    age: 24,
    position: 'LW',
    team: 'Real Madrid',
    matches: 20,
    goals: 12,
    assists: 9,
    passPercentage: 84,
    rating: 8.6,
  },
]

const EMPTY_FORM = {
  name: '',
  age: '',
  position: '',
  team: '',
  matches: '',
  goals: '',
  assists: '',
  passPercentage: '',
  rating: '',
}

const toNumberFields = (player) => ({
  ...player,
  age: Number(player.age),
  matches: Number(player.matches),
  goals: Number(player.goals),
  assists: Number(player.assists),
  passPercentage: Number(player.passPercentage),
  rating: Number(player.rating),
})

const validatePlayer = (player) => {
  const errors = {}

  if (!player.name.trim()) errors.name = 'Player name is required.'
  if (!player.position.trim()) errors.position = 'Position is required.'
  if (!player.team.trim()) errors.team = 'Team is required.'

  if (!player.age || Number(player.age) < 15 || Number(player.age) > 45) {
    errors.age = 'Age must be between 15 and 45.'
  }
  if (Number(player.matches) < 0) errors.matches = 'Matches cannot be negative.'
  if (Number(player.goals) < 0) errors.goals = 'Goals cannot be negative.'
  if (Number(player.assists) < 0) errors.assists = 'Assists cannot be negative.'
  if (Number(player.passPercentage) < 0 || Number(player.passPercentage) > 100) {
    errors.passPercentage = 'Pass % must be between 0 and 100.'
  }
  if (Number(player.rating) < 0 || Number(player.rating) > 10) {
    errors.rating = 'Rating must be between 0 and 10.'
  }

  return errors
}

function App() {
  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEY)

    if (!savedPlayers) return SAMPLE_PLAYERS

    try {
      const parsed = JSON.parse(savedPlayers)
      return Array.isArray(parsed) ? parsed.map(toNumberFields) : SAMPLE_PLAYERS
    } catch {
      return SAMPLE_PLAYERS
    }
  })

  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [sortBy, setSortBy] = useState('goals')
  const [formState, setFormState] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState(SAMPLE_PLAYERS[0].id)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
  }, [players])

  const teams = useMemo(
    () => ['all', ...new Set(players.map((player) => player.team))],
    [players],
  )

  const positions = useMemo(
    () => ['all', ...new Set(players.map((player) => player.position))],
    [players],
  )

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = players.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(normalizedSearch)
      const matchesPosition =
        positionFilter === 'all' || player.position === positionFilter
      const matchesTeam = teamFilter === 'all' || player.team === teamFilter

      return matchesSearch && matchesPosition && matchesTeam
    })

    return filtered.sort((a, b) => b[sortBy] - a[sortBy])
  }, [players, search, positionFilter, teamFilter, sortBy])

  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) ?? filteredPlayers[0]

  const totalGoals = players.reduce((sum, player) => sum + player.goals, 0)
  const totalAssists = players.reduce((sum, player) => sum + player.assists, 0)
  const averageRating =
    players.length === 0
      ? 0
      : players.reduce((sum, player) => sum + player.rating, 0) / players.length

  const topScorer =
    players.length === 0
      ? 'N/A'
      : [...players].sort((a, b) => b.goals - a.goals)[0].name

  const ranking = [...players]
    .sort((a, b) => b.rating - a.rating || b.goals - a.goals)
    .slice(0, 10)

  const topGoals = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5)
  const topAssists = [...players]
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5)

  const averageByPosition = Object.values(
    players.reduce((accumulator, player) => {
      const current = accumulator[player.position] ?? {
        position: player.position,
        total: 0,
        count: 0,
      }

      current.total += player.rating
      current.count += 1
      accumulator[player.position] = current

      return accumulator
    }, {}),
  ).map((entry) => ({
    position: entry.position,
    average: Number((entry.total / entry.count).toFixed(2)),
  }))

  const onFieldChange = (event) => {
    const { name, value } = event.target

    setFormState((previous) => ({ ...previous, [name]: value }))
  }

  const resetForm = () => {
    setFormState(EMPTY_FORM)
    setFormErrors({})
    setEditingId(null)
  }

  const onEdit = (player) => {
    setEditingId(player.id)
    setFormState({
      name: player.name,
      age: String(player.age),
      position: player.position,
      team: player.team,
      matches: String(player.matches),
      goals: String(player.goals),
      assists: String(player.assists),
      passPercentage: String(player.passPercentage),
      rating: String(player.rating),
    })
  }

  const onDelete = (id) => {
    setPlayers((previous) => previous.filter((player) => player.id !== id))

    if (selectedPlayerId === id) {
      const nextPlayer = players.find((player) => player.id !== id)
      setSelectedPlayerId(nextPlayer ? nextPlayer.id : null)
    }

    if (editingId === id) resetForm()
  }

  const onSubmit = (event) => {
    event.preventDefault()

    const errors = validatePlayer(formState)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) return

    const normalizedPlayer = toNumberFields(formState)

    if (editingId) {
      setPlayers((previous) =>
        previous.map((player) =>
          player.id === editingId ? { ...normalizedPlayer, id: editingId } : player,
        ),
      )
      setSelectedPlayerId(editingId)
    } else {
      const newPlayer = {
        ...normalizedPlayer,
        id: Date.now(),
      }

      setPlayers((previous) => [...previous, newPlayer])
      setSelectedPlayerId(newPlayer.id)
    }

    resetForm()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
        <aside className="w-full bg-slate-900 px-6 py-8 lg:min-h-screen lg:w-72 lg:border-r lg:border-slate-800">
          <h1 className="text-2xl font-bold text-emerald-400">Football Stats</h1>
          <p className="mt-2 text-sm text-slate-300">Player Statistics Dashboard</p>
          <nav className="mt-8 space-y-2 text-sm text-slate-200">
            <p>Dashboard</p>
            <p>Players</p>
            <p>Charts</p>
            <p>Top Table</p>
          </nav>
        </aside>

        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">
          <header className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-slate-900">
            <h2 className="text-2xl font-semibold">Football Player Statistics Dashboard</h2>
            <p className="mt-1 text-sm">Track key player performance in one place.</p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Total Players', value: players.length },
              { label: 'Total Goals', value: totalGoals },
              { label: 'Total Assists', value: totalAssists },
              { label: 'Average Rating', value: averageRating.toFixed(2) },
              { label: 'Top Scorer', value: topScorer },
            ].map((card) => (
              <article key={card.label} className="rounded-xl bg-slate-900 p-4 shadow-lg">
                <p className="text-xs text-slate-400">{card.label}</p>
                <p className="mt-2 text-xl font-bold text-emerald-400">{card.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl bg-slate-900 p-4">
              <h3 className="text-lg font-semibold">Search and Filters</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  type="text"
                  placeholder="Search by player name"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  value={positionFilter}
                  onChange={(event) => setPositionFilter(event.target.value)}
                >
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position === 'all' ? 'All positions' : position}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value)}
                >
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team === 'all' ? 'All teams' : team}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="goals">Sort by goals</option>
                  <option value="assists">Sort by assists</option>
                  <option value="rating">Sort by rating</option>
                </select>
              </div>
            </div>

            <article className="rounded-2xl bg-slate-900 p-4">
              <h3 className="text-lg font-semibold">Player Details</h3>
              {selectedPlayer ? (
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  <p className="font-semibold text-emerald-300">{selectedPlayer.name}</p>
                  <p>
                    {selectedPlayer.position} • {selectedPlayer.team}
                  </p>
                  <p>Matches: {selectedPlayer.matches}</p>
                  <p>Goals: {selectedPlayer.goals}</p>
                  <p>Assists: {selectedPlayer.assists}</p>
                  <p>Pass %: {selectedPlayer.passPercentage}</p>
                  <p>Rating: {selectedPlayer.rating}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No player selected.</p>
              )}
            </article>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlayers.map((player) => (
              <article key={player.id} className="rounded-xl bg-slate-900 p-4 shadow-lg">
                <h3 className="text-lg font-semibold text-emerald-400">{player.name}</h3>
                <p className="text-sm text-slate-300">
                  {player.position} • {player.team}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-slate-300">
                  <p>Age: {player.age}</p>
                  <p>Matches: {player.matches}</p>
                  <p>Goals: {player.goals}</p>
                  <p>Assists: {player.assists}</p>
                  <p>Pass %: {player.passPercentage}</p>
                  <p>Rating: {player.rating}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-slate-900"
                    type="button"
                    onClick={() => setSelectedPlayerId(player.id)}
                  >
                    View
                  </button>
                  <button
                    className="rounded-md bg-amber-400 px-3 py-1 text-sm font-medium text-slate-900"
                    type="button"
                    onClick={() => onEdit(player)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md bg-rose-500 px-3 py-1 text-sm font-medium text-white"
                    type="button"
                    onClick={() => onDelete(player.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <form className="rounded-2xl bg-slate-900 p-4" onSubmit={onSubmit}>
              <h3 className="text-lg font-semibold">
                {editingId ? 'Edit Player' : 'Add New Player'}
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { name: 'name', label: 'Name', type: 'text' },
                  { name: 'age', label: 'Age', type: 'number' },
                  { name: 'position', label: 'Position', type: 'text' },
                  { name: 'team', label: 'Team', type: 'text' },
                  { name: 'matches', label: 'Matches', type: 'number' },
                  { name: 'goals', label: 'Goals', type: 'number' },
                  { name: 'assists', label: 'Assists', type: 'number' },
                  { name: 'passPercentage', label: 'Pass %', type: 'number' },
                  {
                    name: 'rating',
                    label: 'Rating',
                    type: 'number',
                    step: '0.1',
                  },
                ].map((field) => (
                  <label key={field.name} className="text-sm">
                    <span className="mb-1 block text-slate-300">{field.label}</span>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                      name={field.name}
                      type={field.type}
                      step={field.step}
                      value={formState[field.name]}
                      onChange={onFieldChange}
                    />
                    {formErrors[field.name] && (
                      <span className="mt-1 block text-xs text-rose-300">
                        {formErrors[field.name]}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900"
                  type="submit"
                >
                  {editingId ? 'Update Player' : 'Add Player'}
                </button>
                {editingId && (
                  <button
                    className="rounded-md border border-slate-700 px-4 py-2 text-sm"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-6">
              <article className="rounded-2xl bg-slate-900 p-4">
                <h3 className="text-lg font-semibold">Top 5 Goal Scorers</h3>
                <Bar
                  data={{
                    labels: topGoals.map((player) => player.name),
                    datasets: [
                      {
                        label: 'Goals',
                        data: topGoals.map((player) => player.goals),
                        backgroundColor: '#10b981',
                      },
                    ],
                  }}
                  options={{ plugins: { legend: { display: false } }, responsive: true }}
                />
              </article>

              <article className="rounded-2xl bg-slate-900 p-4">
                <h3 className="text-lg font-semibold">Top 5 Assist Providers</h3>
                <Bar
                  data={{
                    labels: topAssists.map((player) => player.name),
                    datasets: [
                      {
                        label: 'Assists',
                        data: topAssists.map((player) => player.assists),
                        backgroundColor: '#38bdf8',
                      },
                    ],
                  }}
                  options={{ plugins: { legend: { display: false } }, responsive: true }}
                />
              </article>

              <article className="rounded-2xl bg-slate-900 p-4">
                <h3 className="text-lg font-semibold">Average Rating by Position</h3>
                <Bar
                  data={{
                    labels: averageByPosition.map((item) => item.position),
                    datasets: [
                      {
                        label: 'Avg Rating',
                        data: averageByPosition.map((item) => item.average),
                        backgroundColor: '#f59e0b',
                      },
                    ],
                  }}
                  options={{ plugins: { legend: { display: false } }, responsive: true }}
                />
              </article>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-slate-900 p-4">
            <h3 className="text-lg font-semibold">Top Players Table</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-300">
                    <th className="py-2 pr-4">Rank</th>
                    <th className="py-2 pr-4">Player</th>
                    <th className="py-2 pr-4">Team</th>
                    <th className="py-2 pr-4">Position</th>
                    <th className="py-2 pr-4">Goals</th>
                    <th className="py-2 pr-4">Assists</th>
                    <th className="py-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((player, index) => (
                    <tr key={player.id} className="border-b border-slate-800">
                      <td className="py-2 pr-4">{index + 1}</td>
                      <td className="py-2 pr-4">{player.name}</td>
                      <td className="py-2 pr-4">{player.team}</td>
                      <td className="py-2 pr-4">{player.position}</td>
                      <td className="py-2 pr-4">{player.goals}</td>
                      <td className="py-2 pr-4">{player.assists}</td>
                      <td className="py-2">{player.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
