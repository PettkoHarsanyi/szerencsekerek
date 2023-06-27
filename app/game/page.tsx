"use client"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/game.css"
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import axios from "axios";
import { riddles } from "../assets/riddles";
import { BoardCell, Riddle } from "../types";
import { HiOutlineShoppingCart } from "react-icons/hi"
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";

export default function Game() {
    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const self = useAppSelector(state => state.self)
    const game = useAppSelector(state => state.game)
    const dispatch = useAppDispatch();

    const CONSONANTS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "y", "z"];
    const VOWELS = ["a", "á", "e", "é", "i", "í", "u", "ú", "ü", "ű", "o", "ó", "ö", "ő"];
    const TABLE = { width: 14, height: 4 };
    const [gameRiddles, setGameRiddles] = useState<Riddle[]>(riddles);
    const [currentRiddle, setCurrentRiddle] = useState<Riddle>();
    const [gameTable, setGameTable] = useState<BoardCell[][]>([])
    const [roundConsonants, setRoundConsonants] = useState(CONSONANTS);
    const [roundVowels, setRoundVowels] = useState(VOWELS);
    const [vovelsShown, setVovelsShown] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [solved,setSolved] = useState(false);

    useEffect(() => {
        if (players.length === 0) {
            redirect("/");
        }
        dispatch(setActualPlayer(players[0]))
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

    const displayRidde = (_riddle: Riddle) => {
        if (_riddle) {
            const riddle = _riddle.riddle;
            const riddleSplit = riddle.split(" ");

            const riddleLengthWithoutSpace = riddleSplit.join('').length;

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

                if (gameTable) {
                    for (let i = 0; i < lineLength; i++) {
                        let _x = x;
                        let _y = starterY + i;

                        if(lineText[i] !== " "){
                            newTable[_x][_y] = { x: _x, y: _y, letter: lineText[i], known: false, isPlaying: true }
                        }
                    }
                }
            })
            setGameTable(newTable);
        }
    }



    const pickRandomRiddle = () => {
        // const index = Math.floor(Math.random() * (gameRiddles.length));
        const index = 18;
        const riddle = gameRiddles[index];
        // setGameRiddles(()=>gameRiddles.filter((item,itemIndex) => itemIndex !== index));
        setCurrentRiddle(() => riddle);
        return riddle;
    }

    const [wellGuessed, setWellGuessed] = useState("");

    const guessLetter = (letter: string) => {

        if (game.local || self.id === actualPlayer.id) {
            if (currentRiddle?.riddle.includes(letter)) {

                setGameTable(gameTable.map((row, rowIndex) => row.map((cell, cellIndex) => {
                    if (cell.letter === letter) {
                        return { ...cell, known: true }
                    } else {
                        return cell;
                    }
                })))

                setWellGuessed(wellGuessed + letter);
            } else {
                const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
                console.log(currentPlayerIndex);
                dispatch(setActualPlayer(players[(currentPlayerIndex + 1) % players.length]))
                const borderDivs = document.querySelectorAll(".signal");
                borderDivs.forEach(div => {
                    if (div instanceof HTMLElement) {
                        div.animate([{ borderColor: "red" }, { borderColor: "#00eef0" }], 2000)
                    }
                })
            }
            setRoundConsonants(roundConsonants.filter(cns => cns !== letter));
            setRoundVowels(roundVowels.filter(cns => cns !== letter));
            setVovelsShown(false);
        }
    }

    const handleBuyVowel = () => {
        setVovelsShown(!vovelsShown)
    }

    const [solveInputIndex, setSolveInputIndex] = useState(0);

    const focusNextInput = (event: any) => {
        event.preventDefault();
        const inputs = Array.prototype.slice.call(document.querySelectorAll('.solveLetter'));
        const currInput = document.activeElement;
        const currInputIndex = inputs.indexOf(currInput);
        const nextInputIndex = Math.min((currInputIndex + 1),inputs.length-1) ;
        const prevInputIndex = Math.max((currInputIndex - 1), 0);

        if (event.key.length === 1 && event.key.match(/[A-zÀ-ú]/i)) {
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

        gameTable.forEach(row => row.map(cell => {
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


        if (currentRiddle?.riddle.split(" ").join("").toUpperCase() === guess.toUpperCase()) {
            // HA ELTALÁLTA
            let _gameTable = gameTable;

            _gameTable.forEach(row => row.map(cell => {
                if (cell.isPlaying) {
                    cell.known = true;
                }
            }))

            const borderDivs = document.querySelectorAll(".signal");
            borderDivs.forEach(div => {
                if (div instanceof HTMLElement) {
                    div.animate([{ borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" }, ], 2000)
                }
            })

            document.getElementById("gameBoard")?.animate([{backgroundColor: "green"},{backgroundColor: "#191d4b"},{backgroundColor: "green"},{backgroundColor: "#191d4b"},{backgroundColor: "green"},{backgroundColor: "#191d4b"},{backgroundColor: "green"},{backgroundColor: "#191d4b"}],2000)

            setGameTable(_gameTable);
            setIsSolving(false);
            setSolved(true);
        } else {
            // HA NEM TALÁLTA EL

            const borderDivs = document.querySelectorAll(".signal");
            borderDivs.forEach(div => {
                if (div instanceof HTMLElement) {
                    div.animate([{ borderColor: "red" }, { borderColor: "black" }, { borderColor: "red" }, { borderColor: "black" }, { borderColor: "red" }, { borderColor: "black" }, { borderColor: "red" }, { borderColor: "#00eef0" }, ], 1500)
                }
            })

            document.getElementById("gameBoard")?.animate([{backgroundColor: "red"},{backgroundColor: "#191d4b"},{backgroundColor: "red"},{backgroundColor: "#191d4b"},{backgroundColor: "red"},{backgroundColor: "#191d4b"},{backgroundColor: "red"},{backgroundColor: "#191d4b"}],2000)

            setIsSolving(false);
        }
    }

    useEffect(() => {
        if (isSolving === true) {
            const div = (document.querySelectorAll(".solveLetter")[0] as HTMLElement)
            if(div) div.focus();
        }
    }, [isSolving])

    return (
        <div className="gamePage">
            {/* KELL A JÁTÉK INDÍTÁSAKOR */}
            {/* <div id="fadeOutDiv" className="fadeOutDark"></div> */}
            <div className="solveFade" id="solveFade" style={{ opacity: isSolving ? "0.9" : "0" }} />
            <div className="deskAndLetters">
                <div className={`gameConsonants ${!game.local ? actualPlayer.id === self.id ? "" : "consonantsHidden" : ""} ${vovelsShown ? "consonantsHidden" : ""} ${isSolving ? "consonantsHidden" : ""}`} >
                    {roundConsonants.map((letter, index) => (
                        <div className="gameLetter" onClick={() => guessLetter(letter)} key={index}>{letter.toUpperCase()}</div>
                    ))}
                </div>
                <div className={`gameVowels ${vovelsShown && !isSolving ? "vovelsShown" : ""}`} >
                    {roundVowels.map((letter, index) => (
                        <div className="gameLetter" onClick={() => guessLetter(letter)} key={index}>{letter.toUpperCase()}</div>
                    ))}
                </div>
                <div className="gameDesk">
                    <div className="gamePlayers">
                        {players.map(player => (
                            <div className={`gamePlayer ${actualPlayer.id === player.id ? "bg-[#ff00fc]" : "bg-[#191d4b]"}`} key={player.id}><div>{player.name.toUpperCase()}<br /><span>{player.points}</span></div></div>
                        ))}
                    </div>
                    <div className="gameButtons">
                        <div className="buyMenu">
                            <HiOutlineShoppingCart style={{ color: "#00eef0", fontSize: "4vh" }} />
                            <div id="buyVowelDiv" className="buyVowel" onClick={handleBuyVowel} >
                                <div>AÁ</div>
                                <div>50.000</div>
                            </div>
                        </div>
                        <div className="startSolve" onClick={() => { setIsSolving(!isSolving); }}>MEGFEJT</div>
                    </div>
                </div>
            </div>
            <div className="gamePanel">
                <div className="gameTitle">
                    <div className="screen">
                        {currentRiddle?.title.toUpperCase()}
                    </div>
                </div>
                <div className="gameBoard signal" id="gameBoard">
                    <div id="innerBoard" className="innerBoard signal grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
                        {
                            gameTable && gameTable.length > 0 && gameTable.map((row, rowIndex) => {
                                return row.map((cell, cellIndex) => {
                                    const firstAlready = false;
                                    return (<div className={`cell ${cell.isPlaying && cell.letter !== " " ? "cellPlaying" : ""}`} key={(rowIndex * 14) + cellIndex}>
                                        {!cell.known && cell.isPlaying && isSolving && <input className="solveLetter" onClick={(e) => (e.target as HTMLInputElement).select()} onKeyDown={(e) => focusNextInput(e)} />}
                                        <div className={`purpleDiv ${cell.known ? "fadeInPurple" : ""}`}></div>
                                        <div className={`cellInner ${cell.known ? "slideClass" : ""}`}>{cell.known || cell.letter === "," ? cell.letter.toUpperCase() : ""}</div>
                                    </div>)
                                })
                            })
                        }
                    </div>
                </div>
                <div className="solveButtonsDiv" style={{ transform: isSolving ? "translate(-50%,100%)" : "translate(-50%,0)" }}>
                    <div className="solveButton" style={{ color: "red" }} onClick={() => { setIsSolving(false) }}><ImCross /></div>
                    <div className="solveText">Írd be a teljes megfejtést, majd a pipával okézd le.<br />Ha rossz a megfejtés, lenullázódsz.</div>
                    <div className="solveButton" style={{ color: "green" }} onClick={() => { solveRiddle() }}><TiTick /></div>
                </div>
            </div>
        </div >
    )
}