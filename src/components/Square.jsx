import "../Square.css";

const Square = ({ value, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: 100,
        height: 100,
        fontSize: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid black",
        background: "white",
        cursor: value ? "not-allowed" : "pointer",
      }}
    >
      {value}
    </button>
  );
};

export default Square;
