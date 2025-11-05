import React, { useState, useEffect, useRef } from "react";

const customCss = `
  .flip-card-rotated {
    transform: rotateY(180deg);
  }

  .card-face {
    transform: rotateY(180deg);
  }

  @keyframes zoomInFadeIn {
    0% {
      transform: scaleX(0.1) scaleY(1);
      opacity: 0;
    }
    50% {
      transform: scaleX(1.1) scaleY(1.1);
      opacity: 1;
    }
    100% {
      transform: scaleX(1) scaleY(1);
      opacity: 1;
    }
  }

  .zoom-in-fade-in {
    animation: zoomInFadeIn 0.5s ease-out forwards;
  }
`;

const initialCardTemplates = [
  { id: 1, content: "🌙" },
  { id: 2, content: "⭐" },
  { id: 3, content: "🌍" },
  { id: 4, content: "🚀" },
  { id: 5, content: "💎" },
  { id: 6, content: "🌌" },
  { id: 7, content: "☀️" },
  { id: 8, content: "🪐" },
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const initializeGame = () => {
  const allCards = [...initialCardTemplates, ...initialCardTemplates];

  const cardsWithState = allCards.map((card, index) => ({
    ...card,
    uniqueId: index,
    isFlipped: false,
    isMatched: false,
  }));
  return shuffleArray(cardsWithState);
};

const Card = ({ card, onClick }) => {
  const { content, isFlipped, isMatched, uniqueId } = card;

  const matchedClasses = isMatched
    ? "bg-green-700 pointer-events-none shadow-green-500/50"
    : "hover:scale-105 active:scale-95";

  const cardContainerClasses = `
    w-14 h-14 sm:w-16 sm:h-16 lg:w-16 lg:h-16 rounded-xl relative cursor-pointer
    transition-transform duration-500 [transform-style:preserve-3d]
    ${isFlipped ? "flip-card-rotated" : ""}
    ${isMatched ? matchedClasses : "shadow-[0_10px_20px_rgba(80,0,160,0.4)]"}
  `;

  const faceClasses = `
    absolute inset-0 flex items-center justify-center
    bg-white rounded-xl shadow-2xl text-2xl sm:text-3xl font-black
    [backface-visibility:hidden] transform card-face
  `;

  const backClasses = `
    absolute inset-0 bg-gradient-to-br from-indigo-700 to-purple-800
    rounded-xl shadow-2xl flex items-center justify-center
    text-white text-xl font-bold border-4 border-indigo-400
    [backface-visibility:hidden]
  `;

  const handleClick = () => {
    onClick(uniqueId);
  };

  return (
    <div className={cardContainerClasses} onClick={handleClick}>
      <div className={faceClasses}>{content}</div>

      <div className={backClasses}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12.71 6.29l1.41 1.41-5 5-2.12-2.12 1.41-1.41 1.41 1.41 3.54-3.54z" />
        </svg>
      </div>
    </div>
  );
};

const App = () => {
  const [cards, setCards] = useState(initializeGame);
  const [flippedCards, setFlippedCards] = useState([]);
  const [lockBoard, setLockBoard] = useState(false);
  const [matchesFound, setMatchesFound] = useState(0);
  const [moves, setMoves] = useState(0);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const timerRef = useRef(null);

  const totalPairs = cards.length / 2;
  const isGameWon = matchesFound === totalPairs && cards.length > 0;

  useEffect(() => {
    if (isGameStarted && !isGameWon) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameStarted, isGameWon]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const resetGame = () => {
    setCards(initializeGame());
    setFlippedCards([]);
    setLockBoard(false);
    setMatchesFound(0);
    setMoves(0);
    setTimeElapsed(0);
    setIsGameStarted(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves((prevMoves) => prevMoves + 1);

      const [first, second] = flippedCards;
      let isMatch = false;

      if (first.content === second.content) {
        isMatch = true;

        setMatchesFound((prevMatches) => {
          const newMatches = prevMatches + 1;

          if (newMatches === totalPairs) {
            setLockBoard(true);
          }
          return newMatches;
        });

        setCards((prevCards) =>
          prevCards.map((card) =>
            card.content === first.content
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          )
        );
      }

      setFlippedCards([]);

      if (!isMatch || matchesFound + 1 < totalPairs) {
        if (!isMatch) {
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((card) =>
                card.uniqueId === first.uniqueId ||
                card.uniqueId === second.uniqueId
                  ? { ...card, isFlipped: false }
                  : card
              )
            );
            setLockBoard(false);
          }, 1000);
        } else {
          setLockBoard(false);
        }
      }
    }
  }, [flippedCards, totalPairs, matchesFound]);

  const handleCardClick = (clickedId) => {
    if (!isGameStarted) {
      setIsGameStarted(true);
    }

    const clickedCard = cards.find((card) => card.uniqueId === clickedId);

    if (
      !clickedCard ||
      lockBoard ||
      clickedCard.isFlipped ||
      clickedCard.isMatched
    )
      return;

    const newFlippedCount = flippedCards.length + 1;

    if (newFlippedCount === 2) {
      setLockBoard(true);
    }

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.uniqueId === clickedId ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards((prevFlipped) => [
      ...prevFlipped,
      {
        uniqueId: clickedId,
        content: clickedCard.content,
      },
    ]);
  };

  const isButtonDisabled = lockBoard && !isGameWon;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-950 p-2 font-sans">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-500 mb-4 tracking-wider pt-4 drop-shadow-lg">
        ✨ Space Matcher ✨
      </h1>

      <div className="w-full max-w-xl mx-auto flex flex-col items-center px-2 relative">
        <div className="flex justify-around w-full mb-3 p-3 bg-gray-800 border border-purple-600 rounded-2xl shadow-xl">
          <div className="text-base text-yellow-400 font-medium text-center">
            ➡️ Moves:{" "}
            <span className="font-extrabold text-white block">{moves}</span>
          </div>
          <div className="text-base text-yellow-400 font-medium text-center">
            ⏱️ Time:{" "}
            <span className="font-extrabold text-white block">
              {formatTime(timeElapsed)}
            </span>
          </div>
          <div className="text-base text-yellow-400 font-medium text-center">
            🏆 Pairs:{" "}
            <span className="font-extrabold text-white block">
              {matchesFound} / {totalPairs}
            </span>
          </div>
        </div>

        {}
        <div className="grid grid-cols-4 gap-2 p-3 mx-auto w-fit bg-gray-900 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.5)] border-4 border-indigo-500/50 relative">
          {}
          {isGameWon && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80 backdrop-blur-sm rounded-3xl">
              <div className="text-lg sm:text-xl font-extrabold text-white p-3 sm:p-4 bg-gradient-to-r from-green-600 to-teal-500 rounded-xl text-center shadow-2xl shadow-green-400/80 border-4 border-white/50 zoom-in-fade-in max-w-[80%]">
                🎉 SUCCESS! You Won in {moves} Moves and{" "}
                {formatTime(timeElapsed)}! 🎉
              </div>
            </div>
          )}

          {cards.map((card) => (
            <Card key={card.uniqueId} card={card} onClick={handleCardClick} />
          ))}
        </div>

        <button
          onClick={resetGame}
          disabled={isButtonDisabled}
          className={`mt-4 px-6 py-2 text-white text-md font-semibold rounded-full border-2 border-indigo-300 transition duration-300 transform
            ${
              isButtonDisabled
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 shadow-[0_10px_20px_rgba(80,0,160,0.4)] hover:bg-indigo-700 hover:scale-105 active:scale-95"
            }
          `}
        >
          {isGameWon ? "Play Again" : "Start New Game"}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: customCss }} />
    </div>
  );
};

export default App;
