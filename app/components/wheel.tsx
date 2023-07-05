"use client"

import { useAppSelector } from "@/redux/hooks";
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import { setStage } from "@/redux/slices/gameSlice";
import { modifyPlayer, resetPlacements, resetRoundPoints } from "@/redux/slices/playerSlice";
import { modifySelf } from "@/redux/slices/selfSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import wheel from "../../public/kerek.png"
import startwheel from "../../public/kezdes.png"
import pin from "../../public/pocok.png"
import { GameStage, Player, Zone } from "../types";
import Image from "next/image";

export default function Wheel({ setScreenShown, setSpinnedPrize }: any) {
    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const game = useAppSelector(state => state.game)
    const self = useAppSelector(state => state.self)

    const [isSpinning, setIsSpinning] = useState(false);    // Éppen forog e a kerés (felesleges? canSpin kiváltja?)
    const [canSpin, setCanSpin] = useState(true);   // Pörgethető e a kerék
    const [spinRotation, setSpinRotation] = useState(0);    // Milyen forgást tegyen meg a kerék
    const [isWheelDragged, setWheelDragged] = useState(false);  // Le van e nyomva az egér a kereken
    const [startPoint, setStartPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 }); // Egér lenyomás kezdőhelye
    const [currentRotation, setCurrentRotation] = useState(0);  // Amíg húzzuk a kereket (úgymond lódítjuk) addig ez követi
    const [wheelRotation, setWheelRotation] = useState(0);  // Ha elengednénk pörgetés nélkül ez tárolja az aktuálist
    const [mouseMovePositions, setMouseMovePositions] = useState<any[]>([]);    // Egér mozgások
    const [spinZones] = useState<Zone[]>([  // Érték zónák
        { deg: 0, value: 75000 }, { deg: 15, value: 25000 }, { deg: 30, value: 50000 }, { deg: 45, value: 200000 },
        { deg: 60, value: 10000 }, { deg: 75, value: 100000 }, { deg: 90, value: 25000 }, { deg: 105, value: 50000 },
        { deg: 120, value: 150000 }, { deg: 135, value: 25000 }, { deg: 150, value: "CSŐD" }, { deg: 155, value: 1000000 }, { deg: 160, value: "CSŐD" },
        { deg: 165, value: 75000 }, { deg: 180, value: 10000 }, { deg: 195, value: 100000 }, { deg: 210, value: "DUPLÁZÓ" }, { deg: 225, value: 50000 },
        { deg: 240, value: 10000 }, { deg: 255, value: 250000 }, { deg: 270, value: "FELEZŐ" }, { deg: 285, value: 50000 }, { deg: 300, value: 75000 },
        { deg: 315, value: 100000 }, { deg: 330, value: 50000 }, { deg: 345, value: 150000 }, { deg: 360, value: 75000 }
    ])
    const [placementZones] = useState<Zone[]>([ // Kezdésnél zónák
        { deg: 0, value: 1 }, { deg: 36, value: 10 }, { deg: 72, value: 3 }, { deg: 108, value: 6 }, { deg: 144, value: 7 },
        { deg: 180, value: 2 }, { deg: 216, value: 9 }, { deg: 252, value: 4 }, { deg: 288, value: 8 }, { deg: 324, value: 5 }, { deg: 360, value: 1 }
    ])

    const dispatch = useDispatch();

    useEffect(() => {
        if (game.stage === GameStage.SPINNING || game.stage === GameStage.PLACEMENT) {
            setCanSpin(true);
        }
    }, [game])

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
        return velocity
    }

    const convertDegToZone = (degree: number) => {
        const zoneIndex = spinZones.findIndex(zone => (degree % 360) < zone.deg) - 1
        const zone = spinZones[Math.max(0, zoneIndex)];
        return zone?.value
    }

    const convertDegToZone_placement = (degree: number) => {
        const zoneIndex = placementZones.findIndex(zone => (degree % 360) < zone.deg) - 1
        const zone = placementZones[Math.max(0, zoneIndex)];
        return zone?.value
    }

    const handleSpinWheel = (speedDeg: number) => {
        setIsSpinning(true);
        setCanSpin(false);
        setSpinRotation(speedDeg)
        setWheelRotation(speedDeg)

        if (game.stage === GameStage.SPINNING) {

            const _spinnedPrize = convertDegToZone(speedDeg)
            // const _spinnedPrize : string = "DUPLÁZÓ";
            setSpinnedPrize(_spinnedPrize);

            if (_spinnedPrize === "CSŐD") {
                let toModify: Player = { ...actualPlayer, points: 0 }
                const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
                setTimeout(() => {
                    dispatch(setActualPlayer(players[(currentPlayerIndex + 1) % players.length]))
                    dispatch(modifyPlayer(toModify))
                    dispatch(modifySelf(toModify));
                    dispatch(setStage(GameStage.SPINNING))
                }, 5000)
            } else if (_spinnedPrize === "FELEZŐ") {
                let toModify = { ...actualPlayer, points: Math.ceil(actualPlayer.points! / 2) }
                setTimeout(() => {
                    dispatch(setActualPlayer(toModify))
                    dispatch(modifyPlayer(toModify))
                    dispatch(modifySelf(toModify));

                }, 5000)
            } else if (_spinnedPrize == "DUPLÁZÓ") {
                let toModify = { ...actualPlayer, points: actualPlayer.points! * 2 }
                setTimeout(() => {
                    dispatch(setActualPlayer(toModify))
                    dispatch(modifyPlayer(toModify))
                    dispatch(modifySelf(toModify));
                }, 5000)
            }

            setTimeout(() => {
                if (_spinnedPrize !== "CSŐD") {
                    dispatch(setStage(GameStage.GUESSING))
                }
            }, 3500)

            setTimeout(() => {
                setScreenShown(true);
            }, 2000)

            setTimeout(() => {
                setScreenShown(false);
            }, 5000)
        }

        if (game.stage === GameStage.PLACEMENT) {
            const spinnedValue = convertDegToZone_placement(speedDeg)
            const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
            const currentPlayer = players[currentPlayerIndex]
            setTimeout(() => {
                dispatch(modifyPlayer({ ...currentPlayer, points: spinnedValue as number, spinnedPlacement: true }))
            }, 2000)

            if (players.some(player=> !player.spinnedPlacement)) {
                setTimeout(() => {
                    dispatch(setActualPlayer(players[(currentPlayerIndex + 1) % players.length]))
                    dispatch(setStage(GameStage.PLACEMENT))
                }, 3000)
            }
        }

        setTimeout(() => {
            setIsSpinning(false);
            setSpinRotation(0);
        }, 2000)
    }

    useEffect(() => {
        if (game.stage === GameStage.PLACEMENT) {
            if (players.every(player => player.spinnedPlacement)) {
                let starts: Player;
                let max = 0;
                starts = players[0]
                players.forEach(player => {
                    if (player.points >= max) {
                        starts = player;
                        max = player.points;
                    }
                })
                setTimeout(() => {
                    dispatch(setStage(GameStage.PAUSE));
                }, 2000)
                setTimeout(() => {
                    dispatch(resetRoundPoints())
                    dispatch(setStage(GameStage.SPINNING))
                    dispatch(resetPlacements())
                    dispatch(setActualPlayer({ ...starts, points: 0 }));
                }, 3000)
            }
        }
    }, [players])

    return (
        <div className="wheelBg" id="wheelBg" style={{ transform: game.stage === GameStage.SPINNING || game.stage === GameStage.PLACEMENT ? "translate(-50%,0)" : "translate(-50%,-150%)", }}>
            <div className="wheel"
                onMouseDown={(event) => {
                    if (canSpin) {
                        setWheelDragged(true);
                        setStartPoint({ ...getMouseRelCenter(event) })
                        setMouseMovePositions([])
                    }
                }}
                onMouseMove={(event) => {
                    if (isWheelDragged && canSpin) {

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
                    if (isWheelDragged && canSpin) {
                        if (mouseMovePositions.length > 3) {

                            const velocity = getMouseSpeed(event)
                            if (velocity > 0.2) {
                                setWheelDragged(false);
                                setCurrentRotation(0);

                                handleSpinWheel(wheelRotation + spinRotation + (velocity * 150));
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
                <Image src={game.stage === GameStage.PLACEMENT || game.stage === GameStage.PAUSE ? startwheel : wheel} style={{ userSelect: "none", pointerEvents: "none", transition: isSpinning ? `${2}s cubic-bezier(0.000, 0.000, 0.315, 1.000)` : "none", transform: isSpinning ? `rotate(${spinRotation}deg)` : `rotate(${wheelRotation + currentRotation}deg)` }} alt="wheel" />
            </div>
            <div className="wheelShadow"></div>
            <div className="spinButtons" style={{ pointerEvents: canSpin ? isSpinning ? "none" : "all" : "none", transform: canSpin ? "translate(100%,-50%)" : "translate(0,-50%)" }}>
                <div className="soft spinButton" onClick={() => {
                    const randomSoft = Math.random() * (170 - 50) + 50;
                    handleSpinWheel(wheelRotation + randomSoft)
                }}>GYENGE</div>
                <div className="medium spinButton" onClick={() => {
                    const randomMedium = Math.random() * (400 - 170) + 170;
                    handleSpinWheel(wheelRotation + randomMedium)
                }}>KÖZEPES</div>
                <div className="hard spinButton" onClick={() => {
                    const randomHard = Math.random() * (1000 - 500) + 500;
                    handleSpinWheel(wheelRotation + randomHard)
                }}>ERŐS</div>
            </div>
        </div>
    )
}