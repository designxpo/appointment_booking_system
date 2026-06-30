/**
 * FlowBookAI embeddable widget loader.
 *
 * Usage on any website:
 *   <script src="https://app.flowbook.ai/widget.js" data-flowbook="CLINIC_ID" async></script>
 *
 * Injects a floating launcher button that opens the booking chat (the /embed
 * page) in an iframe. Dependency-free; safe to drop on any page.
 */
(function () {
  var script =
    document.currentScript ||
    document.querySelector("script[data-flowbook]");
  if (!script) return;

  var clinicId = script.getAttribute("data-flowbook");
  if (!clinicId) return;

  var origin = new URL(script.src).origin;

  // Floating launcher button.
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Book an appointment");
  btn.textContent = "💬";
  btn.style.cssText =
    "position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;" +
    "border:0;background:#4f46e5;color:#fff;font-size:22px;cursor:pointer;z-index:2147483000;" +
    "box-shadow:0 4px 14px rgba(0,0,0,.25)";

  // Chat iframe (hidden until opened).
  var frame = document.createElement("iframe");
  frame.src = origin + "/embed/" + encodeURIComponent(clinicId);
  frame.title = "Book an appointment";
  frame.style.cssText =
    "position:fixed;bottom:88px;right:20px;width:380px;height:560px;border:0;" +
    "border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.25);z-index:2147483000;display:none;" +
    "max-width:calc(100vw - 40px)";

  var open = false;
  btn.addEventListener("click", function () {
    open = !open;
    frame.style.display = open ? "block" : "none";
    btn.textContent = open ? "✕" : "💬";
  });

  document.body.appendChild(frame);
  document.body.appendChild(btn);
})();
