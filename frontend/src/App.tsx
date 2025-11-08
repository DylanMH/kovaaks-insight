import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Profile from "./pages/Profile";
import Stats from "./pages/Stats";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import GoalNotification from "./components/GoalNotification";
import { useGoalNotifications } from "./hooks/useGoalNotifications";

// Dashboard component for the root route - now shows Profile
function Dashboard() {
  return <Profile />;
}

function AppContent() {
  const { notifications, dismissNotification } = useGoalNotifications();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #0b0f14)' }}>
      <Nav />
      <main className="max-w-[1600px] mx-auto px-4 my-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      
      {/* Goal Achievement Notifications */}
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4">
        {notifications.map((goal, index) => (
          <div key={goal.id} style={{ marginTop: `${index * 10}px` }}>
            <GoalNotification
              goal={goal}
              onClose={() => dismissNotification(goal.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
