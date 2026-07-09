// Tool: VSCode
// Folder: src
// File: App.tsx
// Action: REPLACE entire file with this

import React, { useMemo, useState } from 'react';

type Mode = 'Movie' | 'Work' | 'Relax' | 'Nap';
type Screen = 'Home' | 'Manual' | 'AI' | 'Sensors' | 'History';

interface SofaState {
  backrest: number;
  legrest: number;
  lumbar: number;
  headrest: number;
  cooling: number;
  table: 'Hidden' | 'Deployed';
}

interface SensorState {
  occupancy: boolean;
  user: 'User A' | 'User B' | 'Guest';
  pressureLeft: number;
  pressureRight: number;
  temperature: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  sessionMinutes: number;
}

interface HistoryEntry {
  timestamp: string;
  user: string;
  mode: Mode;
  backrest: number;
  legrest: number;
  cooling: number;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Home');
  const [user, setUser] = useState<'User A' | 'User B' | 'Guest'>('User A');
  const [mode, setMode] = useState<Mode>('Movie');

  const [sofaState, setSofaState] = useState<SofaState>({
    backrest: 135,
    legrest: 40,
    lumbar: 3,
    headrest: 2,
    cooling: 2,
    table: 'Hidden',
  });

  const [sensorState, setSensorState] = useState<SensorState>({
    occupancy: true,
    user: 'User A',
    pressureLeft: 42,
    pressureRight: 58,
    temperature: 28,
    timeOfDay: 'Evening',
    sessionMinutes: 25,
  });

  const [comfortScore, setComfortScore] = useState<number>(8.5);
  const [confidence, setConfidence] = useState<number>(87);
  const [learningOn, setLearningOn] = useState<boolean>(true);
  const [aiSuggestion, setAiSuggestion] = useState<string>(
    'Movie Mode matches your usual evening setup.'
  );
  const [aiReason, setAiReason] = useState<string>('Used 4 times this week at night.');

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const nextPrediction = useMemo(() => {
    if (history.length === 0) {
      return {
        mode: 'Movie' as Mode,
        backrest: 135,
        legrest: 40,
        cooling: 2,
      };
    }
    const last = history[history.length - 1];
    return {
      mode: last.mode,
      backrest: last.backrest,
      legrest: last.legrest,
      cooling: last.cooling,
    };
  }, [history]);

  const navigate = (screen: Screen) => setCurrentScreen(screen);

  const applyModePreset = (newMode: Mode) => {
    setMode(newMode);
    switch (newMode) {
      case 'Work':
        setSofaState((prev) => ({
          ...prev,
          backrest: 110,
          legrest: 0,
          lumbar: 4,
          headrest: 3,
          cooling: 1,
          table: 'Deployed',
        }));
        setAiSuggestion('Work Mode ready with upright posture and deployed table.');
        setAiReason('You often use this setup for focused tasks.');
        break;
      case 'Relax':
        setSofaState((prev) => ({
          ...prev,
          backrest: 150,
          legrest: 70,
          lumbar: 3,
          headrest: 2,
          cooling: 0,
          table: 'Hidden',
        }));
        setAiSuggestion('Relax Mode ready for reading or light browsing.');
        setAiReason('Selected many times between 6–8 PM.');
        break;
      case 'Nap':
        setSofaState((prev) => ({
          ...prev,
          backrest: 165,
          legrest: 90,
          lumbar: 2,
          headrest: 1,
          cooling: 0,
          table: 'Hidden',
        }));
        setAiSuggestion('Nap Mode set with near-flat backrest and full leg support.');
        setAiReason('Usually chosen late at night when session exceeds 45 minutes.');
        break;
      case 'Movie':
      default:
        setSofaState((prev) => ({
          ...prev,
          backrest: 135,
          legrest: 40,
          lumbar: 3,
          headrest: 2,
          cooling: 2,
          table: 'Hidden',
        }));
        setAiSuggestion('Movie Mode matches your usual evening setup.');
        setAiReason('Used 4 times this week at night.');
        break;
    }

    const entry: HistoryEntry = {
      timestamp: new Date().toLocaleString(),
      user,
      mode: newMode,
      backrest: sofaState.backrest,
      legrest: sofaState.legrest,
      cooling: sofaState.cooling,
    };
    setHistory((prev) => [...prev, entry]);
  };

  const applySuggestion = () => {
    applyModePreset(mode);
    setComfortScore((prev) => Math.min(10, prev + 0.2));
    setConfidence((prev) => Math.min(100, prev + 3));
  };

  const ignoreSuggestion = () => {
    setComfortScore((prev) => Math.max(0, prev - 0.3));
    setConfidence((prev) => Math.max(0, prev - 5));
    setAiSuggestion('AI will suggest this setup less often.');
  };

  const saveCurrentSetup = () => {
    const entry: HistoryEntry = {
      timestamp: new Date().toLocaleString(),
      user,
      mode,
      backrest: sofaState.backrest,
      legrest: sofaState.legrest,
      cooling: sofaState.cooling,
    };
    setHistory((prev) => [...prev, entry]);
  };

  const toggleLearning = () => setLearningOn((on) => !on);

  const updateSofaState = (partial: Partial<SofaState>) => {
    setSofaState((prev) => ({ ...prev, ...partial }));
  };

  const updateSensorState = (partial: Partial<SensorState>) => {
    const next = { ...sensorState, ...partial };
    setSensorState(next);

    if (!next.occupancy) {
      setAiSuggestion('Sofa is idle. AI will rest until someone sits.');
      return;
    }

    if (next.sessionMinutes >= 60) {
      setAiSuggestion("You've been sitting for over an hour. Consider a posture break.");
    }

    if (
      next.pressureLeft - next.pressureRight > 15 ||
      next.pressureRight - next.pressureLeft > 15
    ) {
      setAiSuggestion('Detected pressure imbalance. Suggest adjusting your posture.');
    }

    if (next.temperature > 29) {
      setAiSuggestion('Seat feels warm. Cooling Level 3 is recommended.');
      updateSofaState({ cooling: 3 });
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{sensorState.user.slice(-1)}</div>
            <div>
              <div style={styles.userName}>{sensorState.user}</div>
              <div style={styles.seatInfo}>Seat A · Adaptive AI</div>
            </div>
          </div>

          <div style={styles.aiStatus}>
            <span style={styles.aiLabel}>Learning</span>
            <span
              style={{
                ...styles.aiToggle,
                color: learningOn ? '#4CAF50' : '#f44336',
              }}
            >
              {learningOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <nav style={styles.nav}>
          <NavButton label="Home" active={currentScreen === 'Home'} onClick={() => navigate('Home')} />
          <NavButton
            label="Manual Control"
            active={currentScreen === 'Manual'}
            onClick={() => navigate('Manual')}
          />
          <NavButton
            label="AI Comfort"
            active={currentScreen === 'AI'}
            onClick={() => navigate('AI')}
          />
          <NavButton
            label="Sensor Panel"
            active={currentScreen === 'Sensors'}
            onClick={() => navigate('Sensors')}
          />
          <NavButton
            label="Learning History"
            active={currentScreen === 'History'}
            onClick={() => navigate('History')}
          />
        </nav>
      </header>

      <main style={styles.main}>
        {currentScreen === 'Home' && (
          <HomeScreen
            user={sensorState.user}
            mode={mode}
            sofaState={sofaState}
            comfortScore={comfortScore}
            aiSuggestion={aiSuggestion}
            onModeChange={applyModePreset}
            onManual={() => navigate('Manual')}
            onAI={() => navigate('AI')}
          />
        )}

        {currentScreen === 'Manual' && (
          <ManualControlScreen sofaState={sofaState} onChange={updateSofaState} />
        )}

        {currentScreen === 'AI' && (
          <AIComfortScreen
            user={sensorState.user}
            mode={mode}
            confidence={confidence}
            reason={aiReason}
            learningOn={learningOn}
            comfortScore={comfortScore}
            aiSuggestion={aiSuggestion}
            onApply={applySuggestion}
            onSave={saveCurrentSetup}
            onForget={ignoreSuggestion}
            onToggleLearning={toggleLearning}
          />
        )}

        {currentScreen === 'Sensors' && (
          <SensorPanelScreen
            sensorState={sensorState}
            onChange={updateSensorState}
            onUserChange={(u) => {
              setUser(u);
              updateSensorState({ user: u });
            }}
          />
        )}

        {currentScreen === 'History' && (
          <LearningHistoryScreen history={history} nextPrediction={nextPrediction} />
        )}
      </main>
    </div>
  );
};

/* ---------------------- Small Components ---------------------- */

interface NavButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, active, onClick }) => (
  <button
    style={active ? styles.navButtonActive : styles.navButton}
    onClick={onClick}
  >
    {label}
  </button>
);

interface HomeProps {
  user: string;
  mode: Mode;
  sofaState: SofaState;
  comfortScore: number;
  aiSuggestion: string;
  onModeChange: (mode: Mode) => void;
  onManual: () => void;
  onAI: () => void;
}

const HomeScreen: React.FC<HomeProps> = ({
  user,
  mode,
  sofaState,
  comfortScore,
  aiSuggestion,
  onModeChange,
  onManual,
  onAI,
}) => {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Comfort Mode</h2>
      <p style={styles.sectionSubtitle}>
        Recognized user: <strong>{user}</strong>
      </p>

      <div style={styles.modeRow}>
        <div style={styles.modeSummary}>
          <span style={styles.modeLabel}>Current Mode</span>
          <span style={styles.modeValue}>{mode}</span>
        </div>

        <div style={styles.modeButtons}>
          <ModeButton label="🎬 Movie" mode="Movie" current={mode} onClick={onModeChange} />
          <ModeButton label="💼 Work" mode="Work" current={mode} onClick={onModeChange} />
          <ModeButton label="📖 Relax" mode="Relax" current={mode} onClick={onModeChange} />
          <ModeButton label="😴 Nap" mode="Nap" current={mode} onClick={onModeChange} />
        </div>
      </div>

      <div style={styles.statusGrid}>
        <StatusCard label="Recline" value={`${sofaState.backrest}°`} icon="🪑" />
        <StatusCard label="Legrest" value={`${sofaState.legrest}°`} icon="🦵" />
        <StatusCard label="Cooling" value={`Level ${sofaState.cooling}`} icon="❄️" />
        <StatusCard label="Lumbar" value={`Level ${sofaState.lumbar}`} icon="🧊" />
        <StatusCard label="Table" value={sofaState.table} icon="📋" />
      </div>

      <div style={styles.aiSuggestionBox}>
        <div style={styles.aiSuggestionHeader}>
          <span style={styles.aiSuggestionIcon}>💡</span>
          <span style={styles.aiSuggestionTitle}>AI Suggestion</span>
        </div>
        <p style={styles.aiSuggestionText}>{aiSuggestion}</p>
        <div style={styles.comfortScoreBox}>
          <span style={styles.comfortScoreLabel}>Comfort score</span>
          <span style={styles.comfortScoreValue}>{comfortScore.toFixed(1)}/10</span>
        </div>
      </div>

      <div style={styles.buttonRow}>
        <button style={styles.primaryButton} onClick={onManual}>
          Manual Control
        </button>
        <button style={styles.secondaryButton} onClick={onAI}>
          AI Comfort
        </button>
      </div>
    </section>
  );
};

interface ModeButtonProps {
  label: string;
  mode: Mode;
  current: Mode;
  onClick: (mode: Mode) => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ label, mode, current, onClick }) => (
  <button
    style={current === mode ? styles.modeButtonActive : styles.modeButton}
    onClick={() => onClick(mode)}
  >
    {label}
  </button>
);

interface StatusCardProps {
  label: string;
  value: string;
  icon: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ label, value, icon }) => (
  <div style={styles.statusCard}>
    <div style={styles.statusIcon}>{icon}</div>
    <div>
      <div style={styles.statusLabel}>{label}</div>
      <div style={styles.statusValue}>{value}</div>
    </div>
  </div>
);

interface ManualProps {
  sofaState: SofaState;
  onChange: (partial: Partial<SofaState>) => void;
}

const ManualControlScreen: React.FC<ManualProps> = ({ sofaState, onChange }) => {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Manual Control</h2>
      <p style={styles.sectionSubtitle}>
        Adjust the chair just like physical controls, with live feedback.
      </p>

      <div style={styles.controlsGrid}>
        <ControlSlider
          label="Backrest angle"
          min={90}
          max={170}
          value={sofaState.backrest}
          unit="°"
          onChange={(v) => onChange({ backrest: v })}
        />
        <ControlSlider
          label="Legrest angle"
          min={0}
          max={90}
          value={sofaState.legrest}
          unit="°"
          onChange={(v) => onChange({ legrest: v })}
        />
        <ControlSlider
          label="Lumbar support"
          min={0}
          max={5}
          value={sofaState.lumbar}
          unit=""
          onChange={(v) => onChange({ lumbar: v })}
        />
        <ControlSlider
          label="Headrest"
          min={0}
          max={5}
          value={sofaState.headrest}
          unit=""
          onChange={(v) => onChange({ headrest: v })}
        />
        <ControlSlider
          label="Cooling level"
          min={0}
          max={3}
          value={sofaState.cooling}
          unit=""
          onChange={(v) => onChange({ cooling: v })}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={styles.selectLabel}>
          Table:
          <select
            style={styles.select}
            value={sofaState.table}
            onChange={(e) =>
              onChange({ table: e.target.value as SofaState['table'] })
            }
          >
            <option value="Hidden">Hidden</option>
            <option value="Deployed">Deployed</option>
          </select>
        </label>
      </div>
    </section>
  );
};

interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  unit: string;
  onChange: (value: number) => void;
}

const ControlSlider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  value,
  unit,
  onChange,
}) => {
  return (
    <div style={styles.sliderRow}>
      <div style={styles.sliderLabel}>{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={styles.sliderInput}
      />
      <div style={styles.sliderValue}>
        {value}
        {unit}
      </div>
    </div>
  );
};

interface AIProps {
  user: string;
  mode: Mode;
  confidence: number;
  reason: string;
  learningOn: boolean;
  comfortScore: number;
  aiSuggestion: string;
  onApply: () => void;
  onSave: () => void;
  onForget: () => void;
  onToggleLearning: () => void;
}

const AIComfortScreen: React.FC<AIProps> = ({
  user,
  mode,
  confidence,
  reason,
  learningOn,
  comfortScore,
  aiSuggestion,
  onApply,
  onSave,
  onForget,
  onToggleLearning,
}) => {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>AI Comfort</h2>
      <p style={styles.sectionSubtitle}>
        Adaptive AI uses your history to recommend comfort setups.
      </p>

      <div style={styles.aiInfoGrid}>
        <StatusCard label="User" value={user} icon="👤" />
        <StatusCard label="Suggested mode" value={mode} icon="🎯" />
        <StatusCard label="Confidence" value={`${confidence}%`} icon="📊" />
        <StatusCard label="Comfort score" value={`${comfortScore.toFixed(1)}/10`} icon="⭐" />
      </div>

      <div style={styles.aiSuggestionBox}>
        <div style={styles.aiSuggestionHeader}>
          <span style={styles.aiSuggestionIcon}>💭</span>
          <span style={styles.aiSuggestionTitle}>Reason</span>
        </div>
        <p style={styles.aiSuggestionText}>{reason}</p>
      </div>

      <div style={styles.aiSuggestionBox}>
        <div style={styles.aiSuggestionHeader}>
          <span style={styles.aiSuggestionIcon}>💡</span>
          <span style={styles.aiSuggestionTitle}>AI Suggestion</span>
        </div>
        <p style={styles.aiSuggestionText}>{aiSuggestion}</p>
      </div>

      <div style={styles.learningRow}>
        <span>Learning from manual adjustments:</span>
        <button style={styles.smallButton} onClick={onToggleLearning}>
          {learningOn ? 'Turn Off' : 'Turn On'}
        </button>
      </div>

      <div style={styles.buttonRow}>
        <button style={styles.primaryButton} onClick={onApply}>
          Apply Suggestion
        </button>
        <button style={styles.secondaryButton} onClick={onSave}>
          Save Current Setup
        </button>
        <button style={styles.dangerButton} onClick={onForget}>
          Forget This Pattern
        </button>
      </div>
    </section>
  );
};

interface SensorProps {
  sensorState: SensorState;
  onChange: (partial: Partial<SensorState>) => void;
  onUserChange: (user: 'User A' | 'User B' | 'Guest') => void;
}

const SensorPanelScreen: React.FC<SensorProps> = ({
  sensorState,
  onChange,
  onUserChange,
}) => {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Sensor Panel</h2>
      <p style={styles.sectionSubtitle}>
        Simulate sensor inputs and see how the system reacts.
      </p>

      <div style={styles.sensorGrid}>
        <div style={styles.sensorCard}>
          <h3>Occupancy & User</h3>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={sensorState.occupancy}
              onChange={(e) => onChange({ occupancy: e.target.checked })}
            />
            <span>Occupancy: {sensorState.occupancy ? 'ON' : 'OFF'}</span>
          </label>

          <div style={{ marginTop: 8 }}>
            <label style={styles.selectLabel}>
              User detected:
              <select
                style={styles.select}
                value={sensorState.user}
                onChange={(e) =>
                  onUserChange(e.target.value as SensorState['user'])
                }
              >
                <option value="User A">User A</option>
                <option value="User B">User B</option>
                <option value="Guest">Guest</option>
              </select>
            </label>
          </div>
        </div>

        <div style={styles.sensorCard}>
          <h3>Pressure & Temperature</h3>
          <ControlSlider
            label="Pressure left (%)"
            min={0}
            max={100}
            value={sensorState.pressureLeft}
            unit="%"
            onChange={(v) => onChange({ pressureLeft: v })}
          />
          <ControlSlider
            label="Pressure right (%)"
            min={0}
            max={100}
            value={sensorState.pressureRight}
            unit="%"
            onChange={(v) => onChange({ pressureRight: v })}
          />
          <ControlSlider
            label="Seat temperature (°C)"
            min={20}
            max={35}
            value={sensorState.temperature}
            unit="°C"
            onChange={(v) => onChange({ temperature: v })}
          />
        </div>

        <div style={styles.sensorCard}>
          <h3>Session Context</h3>
          <label style={styles.selectLabel}>
            Time of day:
            <select
              style={styles.select}
              value={sensorState.timeOfDay}
              onChange={(e) =>
                onChange({ timeOfDay: e.target.value as SensorState['timeOfDay'] })
              }
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </label>

          <ControlSlider
            label="Session duration (min)"
            min={0}
            max={120}
            value={sensorState.sessionMinutes}
            unit=" min"
            onChange={(v) => onChange({ sessionMinutes: v })}
          />
        </div>

        <div style={styles.sensorCard}>
          <h3>System Reactions</h3>
          <ul style={styles.list}>
            <li>Change user → loads different profile.</li>
            <li>60+ min sitting → wellness reminder appears.</li>
            <li>Pressure imbalance → posture warning appears.</li>
            <li>High temperature → AI recommends cooling level 3.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

interface HistoryProps {
  history: HistoryEntry[];
  nextPrediction: {
    mode: Mode;
    backrest: number;
    legrest: number;
    cooling: number;
  };
}

const LearningHistoryScreen: React.FC<HistoryProps> = ({
  history,
  nextPrediction,
}) => {
  const avgBackrest =
    history.length === 0
      ? 0
      : history.reduce((sum, h) => sum + h.backrest, 0) / history.length;
  const avgLegrest =
    history.length === 0
      ? 0
      : history.reduce((sum, h) => sum + h.legrest, 0) / history.length;
  const avgCooling =
    history.length === 0
      ? 0
      : history.reduce((sum, h) => sum + h.cooling, 0) / history.length;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Learning History</h2>
      <p style={styles.sectionSubtitle}>
        See how the AI improves its suggestions over time.
      </p>

      <div style={styles.cardRow}>
        <div style={styles.card}>
          <h3>User comfort statistics</h3>
          <p>Sessions logged: {history.length}</p>
          <p>Average backrest angle: {avgBackrest.toFixed(1)}°</p>
          <p>Average legrest angle: {avgLegrest.toFixed(1)}°</p>
          <p>Preferred cooling level: {avgCooling.toFixed(1)}</p>
        </div>

        <div style={styles.card}>
          <h3>Next prediction</h3>
          <p>
            Mode: <strong>{nextPrediction.mode}</strong>
          </p>
          <p>Backrest: {nextPrediction.backrest}°</p>
          <p>Legrest: {nextPrediction.legrest}°</p>
          <p>Cooling: level {nextPrediction.cooling}</p>
          <p style={{ marginTop: 8 }}>
            <em>What AI would suggest based on history.</em>
          </p>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>History log</h3>
      {history.length === 0 ? (
        <p>No saved setups yet. Use “Save Current Setup” in AI Comfort.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Mode</th>
              <th>Backrest</th>
              <th>Legrest</th>
              <th>Cooling</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, idx) => (
              <tr key={idx}>
                <td>{h.timestamp}</td>
                <td>{h.user}</td>
                <td>{h.mode}</td>
                <td>{h.backrest}°</td>
                <td>{h.legrest}°</td>
                <td>Level {h.cooling}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

/* ---------------------- Styles ---------------------- */

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#e8e8e8',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(15, 15, 25, 0.9)',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  userName: {
    fontSize: 18,
    fontWeight: 600,
  },
  seatInfo: {
    fontSize: 12,
    color: '#999',
  },
  aiStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
  },
  aiLabel: {
    fontSize: 13,
    color: '#ccc',
  },
  aiToggle: {
    fontSize: 13,
    fontWeight: 600,
  },
  nav: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '8px 16px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: 13,
  },
  navButtonActive: {
    padding: '8px 16px',
    borderRadius: 999,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
  },
  main: {
    padding: 24,
    maxWidth: 1200,
    margin: '0 auto',
  },
  section: {
    background: 'rgba(10, 10, 20, 0.9)',
    borderRadius: 16,
    padding: 24,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 20,
  },
  modeRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  modeSummary: {
    flex: '0 0 200px',
    padding: 16,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.03)',
  },
  modeLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#999',
  },
  modeValue: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 8,
  },
  modeButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
    flex: 1,
  },
  modeButton: {
    padding: '12px 10px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: '#eee',
    cursor: 'pointer',
    fontSize: 13,
  },
  modeButtonActive: {
    padding: '12px 10px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #00bcd4 0%, #2196f3 100%)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    boxShadow: '0 4px 10px rgba(33,150,243,0.5)',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 20,
  },
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
  },
  statusIcon: {
    fontSize: 24,
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 600,
  },
  aiSuggestionBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.02)',
  },
  aiSuggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiSuggestionIcon: {
    fontSize: 18,
  },
  aiSuggestionTitle: {
    fontSize: 14,
    fontWeight: 600,
  },
  aiSuggestionText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 1.5,
  },
  comfortScoreBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    background: 'rgba(0, 150, 136, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
  },
  comfortScoreLabel: {
    fontSize: 13,
    color: '#b2dfdb',
  },
  comfortScoreValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
  },
  buttonRow: {
    marginTop: 20,
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '10px 18px',
    borderRadius: 999,
    border: 'none',
    background: '#2196f3',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  secondaryButton: {
    padding: '10px 18px',
    borderRadius: 999,
    border: '1px solid #2196f3',
    background: 'transparent',
    color: '#2196f3',
    cursor: 'pointer',
    fontSize: 13,
  },
  dangerButton: {
    padding: '10px 18px',
    borderRadius: 999,
    border: 'none',
    background: '#f44336',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 12,
    marginTop: 12,
  },
  sliderRow: {
    padding: 10,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
  },
  sliderLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  sliderInput: {
    width: '100%',
  },
  sliderValue: {
    marginTop: 4,
    fontSize: 13,
    color: '#ccc',
  },
  selectLabel: {
    fontSize: 13,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  select: {
    padding: 6,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8e8e8',
  },
  aiInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 16,
  },
  learningRow: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  smallButton: {
    padding: '6px 12px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: 12,
  },
  sensorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12,
  },
  sensorCard: {
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  list: {
    marginTop: 8,
    fontSize: 13,
    color: '#ccc',
    paddingLeft: 18,
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 8,
    fontSize: 12,
  },
};

export default App;
