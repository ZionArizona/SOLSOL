import mascot from "../assets/mascot.png";

const m = {
  wrap: {
    position: "absolute",
    right: "36px",
    bottom: "-8px",
    width: "140px",
    pointerEvents: "none",
    filter: "drop-shadow(0 12px 22px rgba(0,0,0,.18))",
  },
};

export default function Mascot() {
  return <img src={mascot} alt="마스코트" style={m.wrap} />;
}
