import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage.tsx";
import { CreatePage } from "./pages/CreatePage.tsx";
import { EventLandingPage } from "./pages/EventLandingPage.tsx";
import { ExamplesPage } from "./pages/ExamplesPage.tsx";
import { GuestPage } from "./pages/GuestPage.tsx";
import { HelpPage } from "./pages/HelpPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { HostsPage } from "./pages/HostsPage.tsx";
import { ManagePage } from "./pages/ManagePage.tsx";
import { PricingPage } from "./pages/PricingPage.tsx";
import { PrivacyPage } from "./pages/PrivacyPage.tsx";
import { TermsPage } from "./pages/TermsPage.tsx";
import { WallPage } from "./pages/WallPage.tsx";
import { Shell } from "./components/ui.tsx";
import { MARKETING_CONTENT } from "./lib/marketingContent.ts";

function NotFound() {
  return (
    <Shell>
      <section className="max-w-[760px]">
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
        <Route
          path="/weddings"
          element={<EventLandingPage content={MARKETING_CONTENT.wedding} />}
        />
        <Route
          path="/birthdays"
          element={<EventLandingPage content={MARKETING_CONTENT.birthday} />}
        />
        <Route
          path="/graduations"
          element={<EventLandingPage content={MARKETING_CONTENT.graduation} />}
        />
        <Route
          path="/religious-milestones"
          element={<EventLandingPage content={MARKETING_CONTENT["religious-milestone"]} />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/hosts" element={<HostsPage />} />
        <Route path="/examples" element={<ExamplesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/e/:slug" element={<GuestPage />} />
        <Route path="/e/:slug/wall" element={<WallPage />} />
        <Route path="/e/:slug/manage" element={<ManagePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
