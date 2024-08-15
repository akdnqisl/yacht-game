import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import "./YachtGame.css";

const YachtGame = () => {
  const gameRef = useRef(null);

  const [rollsRemaining, setRollsRemaining] = useState(3);
  const [round, setRound] = useState(1);
  const [categories, setCategories] = useState({
    aces: null,
    deuces: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    choice: null,
    fourOfAKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    yacht: null,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [diceValues, setDiceValues] = useState(generateRandomDice());
  const [diceHolds, setDiceHolds] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // 주사위를 굴릴 때 랜덤한 값 생성
  function generateRandomDice() {
    return Array(5)
      .fill(0)
      .map(() => Math.floor(Math.random() * 6) + 1);
  }

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      scene: {
        preload,
        create,
        update,
      },
      parent: gameRef.current,
    };

    const game = new Phaser.Game(config);

    function preload() {
      this.load.image("dice1", "./assets/dice1.png");
      this.load.image("dice2", "./assets/dice2.png");
      this.load.image("dice3", "./assets/dice3.png");
      this.load.image("dice4", "./assets/dice4.png");
      this.load.image("dice5", "./assets/dice5.png");
      this.load.image("dice6", "./assets/dice6.png");
    }

    function create() {
      // 주사위 이미지와 기본 값을 초기화
      for (let i = 0; i < 5; i++) {
        const die = this.add
          .image(150 + i * 120, 250, `dice${diceValues[i]}`)
          .setInteractive();
        die.setScale(0.1); // 이미지 크기 줄이기
        die.index = i;

        // 고정된 주사위는 빨간색으로 표시
        if (diceHolds[i]) {
          die.setTint(0xff0000);
        }

        die.on("pointerdown", () => {
          const newHolds = [...diceHolds];
          newHolds[die.index] = !newHolds[die.index];
          setDiceHolds(newHolds);
          die.setTint(newHolds[die.index] ? 0xff0000 : 0xffffff);
        });
      }
    }

    function update() {
      // 주사위 이미지 업데이트
      for (let i = 0; i < 5; i++) {
        const die = this.children.list[i];
        die.setTexture(`dice${diceValues[i]}`);
      }
    }

    return () => {
      game.destroy(true);
    };
  }, [diceValues, diceHolds]);

  function rollDice() {
    if (rollsRemaining > 0) {
      const newDiceValues = diceValues.map((value, index) =>
        diceHolds[index] ? value : Math.floor(Math.random() * 6) + 1
      );
      setDiceValues(newDiceValues);
      setRollsRemaining(rollsRemaining - 1);
    } else {
      alert("Please select a category before continuing.");
    }
  }

  function calculateScore(category) {
    if (category === null || categories[category] !== null) {
      return; // 이미 선택된 카테고리이거나 카테고리 선택이 없으면 처리하지 않음
    }

    const values = diceValues;
    let roundScore = 0;

    switch (category) {
      case "aces":
        roundScore = values
          .filter((v) => v === 1)
          .reduce((acc, val) => acc + val, 0);
        break;
      case "deuces":
        roundScore = values
          .filter((v) => v === 2)
          .reduce((acc, val) => acc + val, 0);
        break;
      case "threes":
        roundScore = values
          .filter((v) => v === 3)
          .reduce((acc, val) => acc + val, 0);
        break;
      case "fours":
        roundScore = values
          .filter((v) => v === 4)
          .reduce((acc, val) => acc + val, 0);
        break;
      case "fives":
        roundScore = values
          .filter((v) => v === 5)
          .reduce((acc, val) => acc + val, 0);
        break;
      case "sixes":
        roundScore = values
          .filter((v) => v === 6)
          .reduce((acc, val) => acc + val, 0);
        break;
      case "choice":
        roundScore = values.reduce((acc, val) => acc + val, 0);
        break;
      case "fourOfAKind":
        roundScore = hasOfAKind(values, 4)
          ? values.reduce((acc, val) => acc + val, 0)
          : 0;
        break;
      case "fullHouse":
        roundScore = hasFullHouse(values) ? 25 : 0;
        break;
      case "smallStraight":
        roundScore = hasSmallStraight(values) ? 30 : 0;
        break;
      case "largeStraight":
        roundScore = hasLargeStraight(values) ? 40 : 0;
        break;
      case "yacht":
        roundScore = values.every((v) => v === values[0]) ? 50 : 0;
        break;
      default:
        break;
    }

    // 점수 업데이트
    setCategories((prevCategories) => ({
      ...prevCategories,
      [category]: roundScore,
    }));
    setScore((prevScore) => prevScore + roundScore); // 총 점수 업데이트
    setSelectedCategory(null);
  }

  function resetTurn() {
    setRollsRemaining(3);
    setDiceHolds([false, false, false, false, false]);
    setDiceValues(generateRandomDice()); // 랜덤한 값으로 주사위를 초기화
    if (round >= 12) {
      setIsGameOver(true);
    } else {
      setRound(round + 1);
    }
  }

  function hasOfAKind(values, count) {
    const counts = {};
    values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
    return Object.values(counts).some((val) => val >= count);
  }

  function hasFullHouse(values) {
    const counts = {};
    values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
    const valuesCount = Object.values(counts);
    return valuesCount.includes(3) && valuesCount.includes(2);
  }

  function hasSmallStraight(values) {
    const uniqueValues = [...new Set(values)].sort();
    return (
      uniqueValues.join("") === "1234" ||
      uniqueValues.join("") === "2345" ||
      uniqueValues.join("") === "3456"
    );
  }

  function hasLargeStraight(values) {
    const uniqueValues = [...new Set(values)].sort();
    return (
      uniqueValues.join("") === "12345" || uniqueValues.join("") === "23456"
    );
  }

  return (
    <div className="game-container">
      {isGameOver ? (
        <div className="game-over">
          <h2>Game Over! Final Score: {score}</h2>
        </div>
      ) : (
        <div>
          <div ref={gameRef} className="phaser-container" />
          <div className="roll-dice-container">
            <button className="roll-dice-button" onClick={rollDice}>
              Roll Dice ({rollsRemaining} left)
            </button>
          </div>
        </div>
      )}
      <div className="score-display">
        <h2>Score: {score}</h2>
        <h3>Round: {round} / 12</h3>
        <div className="categories">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              disabled={categories[cat] !== null || !isValidCategory(cat)}
              onClick={() => {
                calculateScore(cat);
                resetTurn();
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}:{" "}
              {categories[cat] !== null ? categories[cat] : "-"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  function isValidCategory(category) {
    switch (category) {
      case "fourOfAKind":
        return hasOfAKind(diceValues, 4);
      case "fullHouse":
        return hasFullHouse(diceValues);
      case "smallStraight":
        return hasSmallStraight(diceValues);
      case "largeStraight":
        return hasLargeStraight(diceValues);
      case "yacht":
        return diceValues.every((v) => v === diceValues[0]);
      default:
        return true; // Aces, Deuces, etc. are always valid
    }
  }
};

export default YachtGame;
