import spinner from "../../assets/gif/loading.gif";

const CircleSpinner = () => {
  return (
    <span>
      <img
        src={spinner}
        alt="circle-spinner"
        style={{
          mixBlendMode: "multiply",
          height: "70px",
          padding: "10px",
        }}
      />
    </span>
  );
};

export default CircleSpinner;
