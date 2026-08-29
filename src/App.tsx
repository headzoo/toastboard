import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CreatePage } from "./pages/CreatePage.tsx";
import { GuestPage } from "./pages/GuestPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { ManagePage } from "./pages/ManagePage.tsx";
import { WallPage } from "./pages/WallPage.tsx";
import { Shell } from "./components/ui.tsx";

function NotFound() {
  return (
    <Shell>
      <section className="narrow">
        <h1>That page isn’t on the table</h1>
      </section>
    </Shell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/e/:slug" element={<GuestPage />} />
        <Route path="/e/:slug/wall" element={<WallPage />} />
        <Route path="/e/:slug/manage" element={<ManagePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
