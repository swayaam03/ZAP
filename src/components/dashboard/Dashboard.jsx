import { Routes, Route } from 'react-router-dom'
import Layout       from '../layout/Layout'
import TodayView    from './TodayView'
import ProgressView from './ProgressView'
import InsightsView from './InsightsView'
import TaskList     from '../tasks/TaskList'
import AgentsView   from './AgentsView'

export default function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route index          element={<TodayView    />} />
        <Route path="tasks"   element={<TaskList     />} />
        <Route path="progress"element={<ProgressView />} />
        <Route path="insights"element={<InsightsView />} />
        <Route path="agents"  element={<AgentsView   />} />
      </Routes>
    </Layout>
  )
}
