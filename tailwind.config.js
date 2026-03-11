/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--main-primary-start)",
        primaryDark: "var(--main-primary-end)",
        surface: "var(--surface)",
        title: "var(--title)",
        card2: "var(--card-2)",
        primary300: "var(--primary-300)",
        boxShadow:"var(--box-shadow)",
        whiteColor: "var(--white-color)",
        darkColor:"var(--dark-color)",
      },
      backgroundImage: {
        mainPrimary:
          "linear-gradient(90deg, var(--main-primary-start) 0%, var(--main-primary-end) 100%)",
      },
    },
  },
  plugins: [],
};