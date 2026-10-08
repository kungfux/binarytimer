import { Routes, Route, useLocation } from "react-router-dom";

import routes from "./routes";
import TimerSetup from "./pages/TimerSetup.page";
import TimerCountdown from "./pages/TimerCountdown.page";
import Footer from "./components/Footer.component";
import { OptionsProvider } from "./contexts/Options.context";
import { MuteButton } from "./components/MuteButton.component";
import { HideButton } from "./components/HideButton.component";
import { ModeButton } from "./components/ModeButton.component";

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const timeParam = queryParams.get("time");

  return (
    <OptionsProvider>
      <main className="flex flex-col items-center justify-between min-h-screen h-screen">
        <div className="flex justify-end w-full p-4">
          <ModeButton />
          <HideButton />
          <MuteButton />
        </div>
        <Routes>
          <Route
            path={routes.root.path}
            element={timeParam ? <TimerCountdown /> : <TimerSetup />}
          />
        </Routes>
        <Footer />
      </main>
    </OptionsProvider>
  );
}

export default App;
