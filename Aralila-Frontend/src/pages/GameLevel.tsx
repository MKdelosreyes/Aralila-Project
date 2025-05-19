// pages/GameLevel.tsx
import { useParams } from "react-router-dom";
import SpellingGame from "../components/games/SpellingGame";
// import SentenceBuilder from "../components/games/SentenceBuilder";
// import GrammarFixer from "../components/games/GrammarFixer";

const GameLevel = () => {
  const { levelId } = useParams();

  const levelData = {
    1: { game: <SpellingGame />, title: "Spelling Game" },
    2: { game: <SpellingGame />, title: "Sentence Builder" },
    3: { game: <SpellingGame />, title: "Grammar Fixer" },
    // Add more mappings as needed
  };

  const selectedGame =
    levelData[Number(levelId) as keyof typeof levelData]?.game;

  return selectedGame || <div>Game not found for level {levelId}</div>;
};

export default GameLevel;
