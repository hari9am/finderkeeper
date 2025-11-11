import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Prevent global keyboard shortcuts from interfering when the user is typing
// in form fields. We add a capturing keydown listener that, when an input,
// textarea, or contenteditable element is focused, stops the event from
// propagating to other global handlers. This preserves normal typing and
// deletion (Backspace) behavior inside form controls while allowing
// shortcuts to work when focus is elsewhere.
function _isTypingElement(el: Element | null) {
	if (!el) return false;
	const tag = el.tagName;
	try {
		return (
			tag === "INPUT" ||
			tag === "TEXTAREA" ||
			(el instanceof HTMLElement && el.isContentEditable)
		);
	} catch {
		return false;
	}
}

document.addEventListener(
	"keydown",
	(e) => {
		const active = document.activeElement;
		if (_isTypingElement(active)) {
			// Prevent other global handlers from intercepting typing keys.
			// Do NOT call e.preventDefault() here — we only stop propagation so
			// the default browser behavior (text input, deletion) still occurs.
			e.stopImmediatePropagation();
		}
	},
	/* useCapture */ true,
);

createRoot(document.getElementById("root")!).render(<App />);
