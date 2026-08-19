// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div>Tiny missions. Big office mischief.</div>
        <p className="mt-8 max-w[480px] leading-5">
          Welcome to Pocket Heist — the game where you plan and execute tiny
          office missions for maximum fun. Assemble your crew, pick your target,
          and pull off the perfect heist before anyone notices.
        </p>
      </div>
    </div>
  );
}
