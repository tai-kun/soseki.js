import { createRoot } from "react-dom/client";
import { BrowserRouter } from "soseki";

import * as about from "./about.jsx";
import * as home from "./home.jsx";

createRoot(document.getElementById("root")!).render(<BrowserRouter routes={[home, about]} />);
