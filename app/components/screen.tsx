import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { GameStage, Player, Riddle } from "../types";
import { ImCross } from "react-icons/im";
import { TiTick } from "react-icons/ti";
import { setCurrentRiddle, setGameTable, setStage } from "@/redux/slices/gameSlice";
import { useEffect, useState } from "react";
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import { riddles } from "../assets/riddles";
import { modifyPlayer } from "@/redux/slices/playerSlice";
import { modifySelf, setSolving } from "@/redux/slices/selfSlice";

export default function Screen({ spinnedPrize }: any) {
    const game = useAppSelector(state => state.game)
    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const self = useAppSelector(state => state.self)

    const [gameRiddles, setGameRiddles] = useState<Riddle[]>(riddles);

    const dispatch = useAppDispatch();

    useEffect(() => {
        const fadeOutDiv = document.getElementById("fadeOutDiv") as HTMLElement;
        if (fadeOutDiv) {
            fadeOutDiv.classList.add("fadedOut");
            setTimeout(() => {
                fadeOutDiv.remove();
            }, 1000)
        }

        const randomRiddle = pickRandomRiddle();
        displayRidde(randomRiddle);
    }, [])

    useEffect(() => {
        if (self.isSolving === true) {
            const div = (document.querySelectorAll(".solveLetter")[0] as HTMLElement)
            if (div) div.focus();
        }
    }, [self.isSolving])

    const displayRidde = (_riddle: Riddle) => {
        if (_riddle) {
            const riddle = _riddle.riddle;
            const riddleSplit = riddle.split(" ");

            const wordsByLines: string[][] = [[]];
            let currentLine = 0;

            riddleSplit.forEach((word: string) => {
                if ([...wordsByLines[currentLine], word].join(" ").length <= 14) {
                    wordsByLines[currentLine].push(word);
                } else {
                    wordsByLines.push([word]);
                    currentLine++;
                }
            })

            const linesCount = wordsByLines.length;

            let newTable = [...Array(4)].map((row, rowIndex) => ([...Array(14)].map((cell, cellIndex) => ({ x: rowIndex, y: cellIndex, letter: "", known: false, isPlaying: false }))));


            wordsByLines.forEach((lineWords, index) => {
                const currentLine = 2 - Math.ceil(linesCount / 2) + index;
                const lineText = lineWords.join(" ");
                const lineLength = lineWords.join(" ").length;
                const starterY = 7 - Math.ceil(lineLength / 2);
                let x = currentLine;

                if (game.gameTable) {
                    for (let i = 0; i < lineLength; i++) {
                        let _x = x;
                        let _y = starterY + i;


                        if (lineText[i] !== " ") {
                            if (lineText[i] === ",") {
                                newTable[_x][_y] = { x: _x, y: _y, letter: lineText[i], known: true, isPlaying: true }
                            } else {
                                newTable[_x][_y] = { x: _x, y: _y, letter: lineText[i], known: false, isPlaying: true }
                            }
                        }
                    }
                }
            })
            dispatch(setGameTable(newTable))
        }
    }


    const pickRandomRiddle = () => {
        const index = Math.floor(Math.random() * (gameRiddles.length));
        const riddle = gameRiddles[index];
        setGameRiddles(() => gameRiddles.filter((item, itemIndex) => itemIndex !== index));
        dispatch(setCurrentRiddle(riddle));
        return riddle;
    }

    const addPrizeToPlayer = (prize: any, multiplier: number = 1) => {
        if (prize && !isNaN(prize)) {
            let toModify: Player = { ...actualPlayer, points: actualPlayer.points! + (prize * multiplier) }
            dispatch(setActualPlayer(toModify))
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));
        }
    }

    const focusNextInput = (event: any) => {
        event.preventDefault();
        const inputs = Array.prototype.slice.call(document.querySelectorAll('.solveLetter'));
        const currInput = document.activeElement;
        const currInputIndex = inputs.indexOf(currInput);
        const nextInputIndex = Math.min((currInputIndex + 1), inputs.length - 1);
        const prevInputIndex = Math.max((currInputIndex - 1), 0);

        if (event.key.length === 1 && event.key.match(/[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g)) {
            event.target.value = event.key.toUpperCase();
            const input = inputs[nextInputIndex];
            input.focus();
        }
        if (event.key === "Backspace") {
            event.target.value = "";
            const input = inputs[prevInputIndex];
            input.select();
            input.focus();
        }
        if (event.key === "ArrowLeft") {
            const input = inputs[prevInputIndex];
            input.select();
            input.focus();
        }
        if (event.key === "ArrowRight" || event.key === "Tab" || event.key === "Enter") {
            const input = inputs[nextInputIndex];
            input.select();
            input.focus();
        }
    }

    const solveRiddle = () => {
        const inputs: HTMLInputElement[] = Array.prototype.slice.call(document.querySelectorAll('.solveLetter'));
        const alreadyGuessed: string[] = []

        let index = 0;
        let indexInput = 0;

        game.gameTable.forEach(row => row.map(cell => {
            if (cell.isPlaying && cell.known) {
                alreadyGuessed.push(cell.letter);
                index++;
            }

            if (cell.isPlaying && !cell.known) {
                alreadyGuessed.push(inputs[indexInput].value);
                index++;
                indexInput++;
            }
        }))

        const guess = alreadyGuessed.join("");

        if (game.currentRiddle?.riddle.split(" ").join("").toUpperCase() === guess.toUpperCase()) {
            // HA ELTALÁLTA
            let _gameTable = game.gameTable;

            _gameTable = _gameTable.map(row => row.map(cell => {
                if (cell.isPlaying) {
                    return { ...cell, known: true }
                } else {
                    return cell;
                }
            }))

            const borderDivs = document.querySelectorAll(".signal");
            borderDivs.forEach(div => {
                if (div instanceof HTMLElement) {
                    div.animate([{ borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" },], 2000)
                }
            })

            document.getElementById("gameBoard")?.animate([{ backgroundColor: "green" }, { backgroundColor: "#191d4b" }, { backgroundColor: "green" }, { backgroundColor: "#191d4b" }, { backgroundColor: "green" }, { backgroundColor: "#191d4b" }, { backgroundColor: "green" }, { backgroundColor: "#191d4b" }], 2000)

            if (isNaN(spinnedPrize as number)) {
                addPrizeToPlayer(200000, 1)
            } else {
                addPrizeToPlayer(200000 + (spinnedPrize as number), 1)
            }


            setTimeout(() => {
                dispatch(setStage(GameStage.SPINNING))
            }, 2000)
            setTimeout(() => {
                const randomRiddle = pickRandomRiddle()
                displayRidde(randomRiddle);
            }, 3500);

            dispatch(setGameTable(_gameTable));
            dispatch(setSolving(false))
        } else {
            // HA NEM TALÁLTA EL
            const borderDivs = document.querySelectorAll(".signal");
            borderDivs.forEach(div => {
                if (div instanceof HTMLElement) {
                    div.animate([{ borderColor: "red" }, { borderColor: "black" }, { borderColor: "red" }, { borderColor: "black" }, { borderColor: "red" }, { borderColor: "black" }, { borderColor: "red" }, { borderColor: "#00eef0" },], 1500)
                }
            })

            document.getElementById("gameBoard")?.animate([{ backgroundColor: "red" }, { backgroundColor: "#191d4b" }, { backgroundColor: "red" }, { backgroundColor: "#191d4b" }, { backgroundColor: "red" }, { backgroundColor: "#191d4b" }, { backgroundColor: "red" }, { backgroundColor: "#191d4b" }], 2000)

            const toModify: Player = { ...actualPlayer, points: 0 }
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));

            const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
            dispatch(setActualPlayer(players[(currentPlayerIndex + 1) % players.length]))

            setTimeout(() => {
                dispatch(setStage(GameStage.SPINNING))
            }, 2000)

            dispatch(setSolving(false));
        }
    }

    return (
        <div className="gamePanel" id="gamePanel" style={{ transform: game.stage === GameStage.GUESSING ? "translate(-50%,0)" : "translate(-50%,-150%)" }}>
            <div className="gameTitle">
                <div className="screen">
                    {game.currentRiddle?.title.toUpperCase()}
                </div>
            </div>
            <div className="gameBoard signal" id="gameBoard">
                <div id="innerBoard" className="innerBoard signal grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
                    {
                        game.gameTable && game.gameTable.length > 0 && game.gameTable.map((row, rowIndex) => {
                            return row.map((cell, cellIndex) => {
                                const firstAlready = false;
                                return (<div className={`cell ${cell.isPlaying && cell.letter !== " " ? "cellPlaying" : ""}`} key={(rowIndex * 14) + cellIndex}>
                                    {!cell.known && cell.isPlaying && self.isSolving && <input className="solveLetter" onClick={(e) => (e.target as HTMLInputElement).select()} onKeyDown={(e) => focusNextInput(e)} />}
                                    <div className={`purpleDiv ${cell.known ? "fadeInPurple" : ""}`}></div>
                                    <div className={`cellInner ${cell.known ? "slideClass" : ""}`}>{cell.known || cell.letter === "," ? cell.letter.toUpperCase() : ""}</div>
                                </div>)
                            })
                        })
                    }
                </div>
            </div>
            <div className="solveButtonsDiv" style={{ transform: self.isSolving ? "translate(-50%,100%)" : "translate(-50%,0)" }}>
                <div className="solveButton" style={{ color: "red" }} onClick={() => { dispatch(setSolving(false)) }}><ImCross /></div>
                <div className="solveText">Írd be a teljes megfejtést, majd a pipával okézd le.<br />Ha rossz a megfejtés, lenullázódsz.</div>
                <div className="solveButton" style={{ color: "green" }} onClick={() => { solveRiddle() }}><TiTick /></div>
            </div>
        </div>
    )
}