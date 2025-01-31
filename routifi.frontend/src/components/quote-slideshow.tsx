import { useState, useEffect } from "react";

const QuoteSlideshow = () => {
  const quotes = [
    {
      text: "The best way to predict the future is to create it.",
      author: "Alec G",
    },
    {
      text: "A lead is not just a number; it's a potential story waiting to be told.",
      author: "Jeremy A",
    },
    {
      text: "Bomba na",
      author: "James L",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setIsVisible(true);
      }, 1000);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [quotes.length]);

  return (
    <div className="relative z-20 mt-auto mx-auto flex w-full justify-center items-center select-none">
      <div
        className={`transition-opacity duration-1000 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <blockquote className="space-y-2 text-center">
          <p className="text-xl">&#34;{quotes[currentIndex].text}&#34;</p>
          <footer className="text-sm italic">
            - {quotes[currentIndex].author}
          </footer>
        </blockquote>
      </div>
    </div>
  );
};

export default QuoteSlideshow;
