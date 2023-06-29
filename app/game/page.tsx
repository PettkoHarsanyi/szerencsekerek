"use client"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/game.css"
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import axios from "axios";
import { riddles } from "../assets/riddles";
import { BoardCell, Player, Riddle } from "../types";
import { HiOutlineShoppingCart } from "react-icons/hi"
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import Image from "next/image";
import wheel from "../../public/latvanyterv/kerek.png"
import pin from "../../public/pocok.png"
import { modifyPlayer } from "@/redux/slices/playerSlice";
import { modifySelf, setSelf } from "@/redux/slices/selfSlice";

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
    const [solved, setSolved] = useState(false);
    const [spinTime, setSpinTime] = useState(true);
    const [spinZones] = useState<Zone[]>([
        { deg: 0, value: 75000 }, { deg: 15, value: 25000 }, { deg: 30, value: 50000 }, { deg: 45, value: 200000 },
        { deg: 60, value: 10000 }, { deg: 75, value: 100000 }, { deg: 90, value: 25000 }, { deg: 105, value: 50000 },
        { deg: 120, value: 150000 }, { deg: 135, value: 25000 }, { deg: 150, value: "CSŐD" }, { deg: 155, value: 1000000 }, { deg: 160, value: "CSŐD" },
        { deg: 165, value: 75000 }, { deg: 180, value: 10000 }, { deg: 195, value: 100000 }, { deg: 210, value: "DUPLÁZÓ" }, { deg: 225, value: 50000 },
        { deg: 240, value: 10000 }, { deg: 255, value: 250000 }, { deg: 270, value: "FELEZŐ" }, { deg: 285, value: 50000 }, { deg: 300, value: 75000 },
        { deg: 315, value: 100000 }, { deg: 330, value: 50000 }, { deg: 345, value: 150000 }
    ])

    const convertDegToZone = (degree: number) => {
        const zoneIndex = spinZones.findIndex(zone => (degree % 360) < zone.deg) - 1

        const zone = spinZones[Math.max(0, zoneIndex)];

        return zone?.value
    }

    type Zone = {
        deg: number,
        value: string | number;
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

                        if (lineText[i] !== " ") {
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

    const guessLetter = (letter: string) => {

        if (game.local || self.id === actualPlayer.id) {
            if (currentRiddle?.riddle.includes(letter)) {
                // HA VAN BENNE OLYAN BETŰ
                setGameTable(gameTable.map((row) => row.map((cell) => {
                    if (cell.letter === letter) {
                        return { ...cell, known: true }
                    } else {
                        return cell;
                    }
                })))

                let timeOfOccurance = currentRiddle?.riddle.split("").reduce((count, character) => {
                    if (character === letter) {
                        return count + 1;
                    }
                    return count;
                }, 0);

                addPrizeToPlayer(spinnedPrize, timeOfOccurance);
            } else {
                const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
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
            setTimeout(() => {
                setSpinTime(true);
                setCanSpin(true);
            }, 1500)
        }
    }

    const handleBuyVowel = () => {
        setVovelsShown(!vovelsShown)
    }

    const focusNextInput = (event: any) => {
        event.preventDefault();
        const inputs = Array.prototype.slice.call(document.querySelectorAll('.solveLetter'));
        const currInput = document.activeElement;
        const currInputIndex = inputs.indexOf(currInput);
        const nextInputIndex = Math.min((currInputIndex + 1), inputs.length - 1);
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
                    div.animate([{ borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" }, { borderColor: "green" }, { borderColor: "#00eef0" },], 2000)
                }
            })

            document.getElementById("gameBoard")?.animate([{ backgroundColor: "green" }, { backgroundColor: "#191d4b" }, { backgroundColor: "green" }, { backgroundColor: "#191d4b" }, { backgroundColor: "green" }, { backgroundColor: "#191d4b" }, { backgroundColor: "green" }, { backgroundColor: "#191d4b" }], 2000)

            const toModify: Player = { ...actualPlayer, points: actualPlayer.points! + 200000 }
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));

            setGameTable(_gameTable);
            setIsSolving(false);
            setSolved(true);
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

            setIsSolving(false);
        }
    }

    useEffect(() => {
        if (isSolving === true) {
            const div = (document.querySelectorAll(".solveLetter")[0] as HTMLElement)
            if (div) div.focus();
        }
    }, [isSolving])

    const [isWheelDragged, setWheelDragged] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [currentRotation, setCurrentRotation] = useState(0);
    const [wheelRotation, setWheelRotation] = useState(0);

    const getMouseRelCenter = (event: any) => {
        const targetElement = event.currentTarget;
        const targetRect = targetElement.getBoundingClientRect();
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const relativeMouseX = event.clientX - targetCenterX;
        const relativeMouseY = event.clientY - targetCenterY;

        return { x: relativeMouseX, y: relativeMouseY }
    }

    const calculateAngle = (wheelX: number, wheelY: number, mouseStartX: number, mouseStartY: number, mouseStopX: number, mouseStopY: number) => {
        const startRelativeX = mouseStartX - wheelX;
        const startRelativeY = mouseStartY - wheelY;
        const stopRelativeX = mouseStopX - wheelX;
        const stopRelativeY = mouseStopY - wheelY;
        const startAngle = Math.atan2(startRelativeY, startRelativeX);
        const stopAngle = Math.atan2(stopRelativeY, stopRelativeX);
        let angleDifference = stopAngle - startAngle;
        if (angleDifference < 0) {
            angleDifference += 2 * Math.PI;
        }
        const angleInDegrees = (angleDifference * 180) / Math.PI;

        return angleInDegrees;
    };

    const [mouseMovePositions, setMouseMovePositions] = useState<any[]>([]);
    const [spinRotation, setSpinRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);


    const getMouseSpeed = (event: any) => {
        const startPosition = mouseMovePositions[mouseMovePositions.length - 2];
        const endPosition = mouseMovePositions[mouseMovePositions.length - 1];
        const targetElement = event.currentTarget; // A cél elem, amin az esemény történt
        const targetRect = targetElement.getBoundingClientRect();
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const x1 = startPosition.x - targetCenterX;
        const y1 = startPosition.y - targetCenterY;
        const x2 = endPosition.x - targetCenterX;
        const y2 = endPosition.y - targetCenterY
        const crossProduct = (x1 * y2) - (y1 * x2);
        let crossDir = 1;
        if (crossProduct > 0) {
            crossDir = 1;
        }
        if (crossProduct < 0) {
            crossDir = 0;
        }
        const distance = Math.sqrt(Math.pow(endPosition.x - startPosition.x, 2) + Math.pow(endPosition.y - startPosition.y, 2));
        const timeElapsed = endPosition.timestamp - startPosition.timestamp;
        const sqMouseDist = Math.sqrt(Math.pow(mouseX - targetCenterX, 2) + Math.pow(mouseY - targetCenterY, 2));
        const minValue = 0;
        const maxValue = targetElement.offsetWidth;
        const minInterpolatedValue = 1; // Az interpolált tartomány alsó határa
        const maxInterpolatedValue = 2;
        const interpolatedValue = minInterpolatedValue + (maxInterpolatedValue - minInterpolatedValue) * (1 - (sqMouseDist - minValue) / (maxValue - minValue));
        const velocity = (distance / timeElapsed) * interpolatedValue * crossDir;
        setMouseMovePositions([])

        return velocity
    }

    const [spinnedPrize, setSpinnedPrize] = useState<string | number>(0)
    const [screenText, setScreenText] = useState<string | number>("");
    const [canSpin, setCanSpin] = useState(true);

    useEffect(() => {
        if (isSpinning) {
            setTimeout(() => {
                setIsSpinning(false);
                setSpinRotation(0);
                setScreenText(spinnedPrize);

                setTimeout(() => {
                    if (spinnedPrize !== "CSŐD") {
                        setSpinTime(false);
                    }
                }, 1500)
            }, 2000)
        }
    }, [isSpinning])

    const addPrizeToPlayer = (prize: any, multiplier: number = 1) => {
        if (prize && !isNaN(prize)) {
            let toModify: Player = { ...actualPlayer, points: actualPlayer.points! + (prize * multiplier) }
            dispatch(setActualPlayer(toModify))
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));
        }
    }

    useEffect(() => {
        if (spinnedPrize === "CSŐD") {
            let toModify: Player = { ...actualPlayer, points: 0 }
            const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
            dispatch(setActualPlayer(players[(currentPlayerIndex + 1) % players.length]))
            setCanSpin(true);
            setSpinTime(true);
        }
        if (spinnedPrize == "FELEZŐ") {
            let toModify = { ...actualPlayer, points: Math.ceil(actualPlayer.points! / 2) }
            dispatch(setActualPlayer(toModify))
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));
        }
        if (spinnedPrize == "DUPLÁZÓ") {
            let toModify = { ...actualPlayer, points: actualPlayer.points! * 2 }
            dispatch(setActualPlayer(toModify))
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));
        }
    }, [spinnedPrize])


    return (
        <div className="gamePage">
            {/* KELL A JÁTÉK INDÍTÁSAKOR */}
            {/* <div id="fadeOutDiv" className="fadeOutDark"></div> */}
            <div className="solveFade" id="solveFade" style={{ opacity: isSolving ? "0.9" : "0" }} />
            <div className="deskAndLetters">
                <div className={`gameConsonants ${!game.local ? actualPlayer.id === self.id ? "" : "consonantsHidden" : ""} ${vovelsShown ? "consonantsHidden" : ""} ${isSolving ? "consonantsHidden" : ""} ${spinTime ? "consonantsHidden" : ""}`} >
                    {roundConsonants.map((letter, index) => (
                        <div className="gameLetter" onClick={() => guessLetter(letter)} key={index}>{letter.toUpperCase()}</div>
                    ))}
                </div>
                <div className={`gameVowels ${vovelsShown && !isSolving && !spinTime ? "vovelsShown" : ""}`} >
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
                    <div className="prizeScreen">
                        {screenText}
                    </div>
                    <div className="gameButtons">
                        <div className="spinTime" onClick={() => { setSpinTime(!spinTime); }}>KERÉK</div>
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
            <div className="gamePanel" id="gamePanel" style={{ transform: spinTime ? "translate(-50%,-150%)" : "translate(-50%,0)" }}>
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
            <div className="wheelBg" style={{ transform: spinTime ? "translate(-50%,0)" : "translate(-50%,-150%)", }}>
                <div className="wheel"
                    onMouseDown={(event) => {
                        if (!isSpinning && canSpin) {
                            setWheelDragged(true);
                            setStartPoint({ ...getMouseRelCenter(event) })
                        }
                    }}
                    onMouseMove={(event) => {
                        if (isWheelDragged && !isSpinning && canSpin) {

                            const currPoint = getMouseRelCenter(event);

                            const angle = calculateAngle(0, 0, startPoint.x, startPoint.y, currPoint.x, currPoint.y)

                            setCurrentRotation(angle);

                            const { clientX, clientY } = event;
                            const timestamp = performance.now(); // Az aktuális időbélyeg lekérése

                            // Hozzáadás az egérmozgás pozícióit és időbélyegeit tároló tömbhöz
                            setMouseMovePositions([...mouseMovePositions, { x: clientX, y: clientY, timestamp }])
                        }
                    }}
                    onMouseUp={(event) => {
                        if (!isSpinning && isWheelDragged && canSpin) {
                            if (mouseMovePositions.length > 3) {

                                const velocity = getMouseSpeed(event)
                                if (velocity > 0.2) {
                                    setWheelDragged(false);
                                    setCurrentRotation(0);
                                    setSpinRotation(wheelRotation + spinRotation + (velocity * 150))
                                    setWheelRotation(wheelRotation + spinRotation + (velocity * 150))
                                    setIsSpinning(true);

                                    console.log(convertDegToZone(wheelRotation + spinRotation + (velocity * 150)))

                                    setSpinnedPrize(convertDegToZone(wheelRotation + spinRotation + (velocity * 150)))

                                } else {
                                    setWheelDragged(false);
                                    setCurrentRotation(0);
                                    setWheelRotation(wheelRotation + currentRotation)
                                }
                            }
                        }
                    }}
                    style={{ userSelect: "none", pointerEvents: game.local ? "all" : actualPlayer.id === self.id ? "all" : "none" }}>
                    <div className="pin">
                        <Image src={pin} alt="pöcök" />
                    </div>
                    <Image src={wheel} style={{ userSelect: "none", pointerEvents: "none", transition: isSpinning ? `${2}s cubic-bezier(0.000, 0.000, 0.315, 1.000)` : "none", transform: isSpinning ? `rotate(${spinRotation}deg)` : `rotate(${wheelRotation + currentRotation}deg)` }} alt="wheel" />
                </div>
                <div className="spinButtons" style={{ pointerEvents: canSpin ? isSpinning ? "none" : "all" : "none" }}>
                    <div className="soft spinButton" style={{ filter: canSpin ? isSpinning ? "brightness(50%)" : "brightness(1)" : "brightness(50%)" }} onClick={() => {
                        const randomSoft = Math.random() * (170 - 50) + 50;
                        setIsSpinning(true);
                        setSpinRotation(wheelRotation + randomSoft);
                        setWheelRotation(wheelRotation + randomSoft)
                        setCanSpin(false);
                        setSpinnedPrize(convertDegToZone(wheelRotation + randomSoft))

                    }}>GYENGE</div>
                    <div className="medium spinButton" style={{ filter: canSpin ? isSpinning ? "brightness(50%)" : "brightness(1)" : "brightness(50%)" }} onClick={() => {
                        const randomMedium = Math.random() * (400 - 170) + 170;
                        setIsSpinning(true);
                        setSpinRotation(wheelRotation + randomMedium);
                        setWheelRotation(wheelRotation + randomMedium)
                        setCanSpin(false);
                        setSpinnedPrize(convertDegToZone(wheelRotation + randomMedium))

                    }}>KÖZEPES</div>
                    <div className="hard spinButton" style={{ filter: canSpin ? isSpinning ? "brightness(50%)" : "brightness(1)" : "brightness(50%)" }} onClick={() => {
                        const randomHard = Math.random() * (1000 - 500) + 500;
                        setIsSpinning(true);
                        setSpinRotation(wheelRotation + randomHard);
                        setWheelRotation(wheelRotation + randomHard)
                        setCanSpin(false);
                        setSpinnedPrize(convertDegToZone(wheelRotation + randomHard))
                    }}>ERŐS</div>
                </div>
            </div>
        </div >
    )
}