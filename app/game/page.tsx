"use client"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/game.css"
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import axios from "axios";
import { riddles } from "../assets/riddles";
import { Riddle } from "../types";

export default function Game() {
    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const dispatch = useAppDispatch();

    const CONSONANTS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "y", "z"];
    const VOWELS = ["a", "á", "e", "é", "i", "í", "u", "ú", "ü", "ű", "o", "ó", "ö", "ő"];
    const TABLE = { width: 14, height: 4 };
    const [gameRiddles, setGameRiddles] = useState<Riddle[]>(riddles);
    const [currentRiddle, setCurrentRiddle] = useState<Riddle>();
    const [gameTable, setGameTable] = useState<BoardCell[][]>([])
    const [roundConsonants, setRoundConsonants] = useState(CONSONANTS);

    type BoardCell = {
        x: number,
        y: number,
        letter: string,
        known: boolean,
        isPlaying: boolean,
    }


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
            const linesCount = riddle.length <= 14 ? 1 : riddle.length <= 28 ? 2 : riddle.length <= 42 ? 3 : 4;
            const wordsByLines: string[][] = [...Array(linesCount)].map(arr => []);
            let currentLine = 0;

            riddleSplit.forEach((word: string) => {
                if ([...wordsByLines[currentLine], word].join(" ").length <= 14) {
                    wordsByLines[currentLine].push(word);
                } else {
                    wordsByLines[currentLine + 1].push(word);
                    currentLine++;
                }
            })

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

                        newTable[_x][_y] = { x: _x, y: _y, letter: lineText[i], known: false, isPlaying: true }
                    }
                }
            })
            setGameTable(newTable);
        }
    }



    const pickRandomRiddle = () => {
        // const index = Math.floor(Math.random() * (gameRiddles.length));
        const index = 30;
        const riddle = gameRiddles[index];
        // setGameRiddles(()=>gameRiddles.filter((item,itemIndex) => itemIndex !== index));
        setCurrentRiddle(() => riddle);
        return riddle;
    }

    const guessLetter = (letter : string) => {
        setGameTable(gameTable.map((row,rowIndex)=> row.map((cell,cellIndex)=> {
            if(cell.letter === letter){
                return {...cell,known: true}
            }else{
                return cell;
            }
        })))
        setRoundConsonants(roundConsonants.filter(cns => cns !== letter));
    }


    return (
        <div className="gamePage">
            {/* <div id="fadeOutDiv" className="fadeOutDark"></div> */}
            <div className="deskAndLetters">
                <div className="gameLetters">
                    {roundConsonants.map((letter, index) => (
                        <div className="gameLetter" onClick={()=>guessLetter(letter)} key={index}>{letter.toUpperCase()}</div>
                    ))}
                </div>
                <div className="gameDesk">
                    <div className="gamePlayers">
                        {players.map(player => (
                            <div className={`gamePlayer ${actualPlayer.id === player.id ? "bg-[#ff00fc]" : "bg-[#191d4b]"}`} key={player.id}><div>{player.name.toUpperCase()}<br /><span>{player.points}</span></div></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="gamePanel">
                <div className="gameTitle">
                    <div className="screen">
                        {currentRiddle?.title.toUpperCase()}
                    </div>
                </div>
                <div className="gameBoard">
                    <div className="innerBoard grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
                        {
                            gameTable && gameTable.length > 0 && gameTable.map((row, rowIndex) => {
                                return row.map((cell, cellIndex) => {
                                    return <div className={`cell ${cell.isPlaying && cell.letter !== " " ? "cellPlaying" : ""}`} key={(rowIndex * 14) + cellIndex}>
                                        <div className={`purpleDiv ${cell.known?"fadeInPurple":""}`}></div>
                                        <div className={`cellInner ${cell.known?"slideClass":""}`}>{cell.known || cell.letter === "," ? cell.letter.toUpperCase() : ""}</div>
                                    </div>
                                })
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}