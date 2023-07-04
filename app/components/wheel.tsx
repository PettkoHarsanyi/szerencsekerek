"use client"

import { useAppSelector } from "@/redux/hooks";
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import { setStage } from "@/redux/slices/gameSlice";
import { modifyPlayer } from "@/redux/slices/playerSlice";
import { modifySelf } from "@/redux/slices/selfSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import wheel from "../../public/latvanyterv/kerek.png"
import pin from "../../public/pocok.png"
import { GameStage, Player } from "../types";
import Image from "next/image";

export default function Wheel({setScreenText, setScreenShown, setSpinnedPrize, spinnedPrize}:any) {
    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const game = useAppSelector(state => state.game)
    const self = useAppSelector(state => state.self)

    const [isSpinning, setIsSpinning] = useState(false);
    const [canSpin, setCanSpin] = useState(true);
    const [spinRotation, setSpinRotation] = useState(0);
    const [isWheelDragged, setWheelDragged] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [currentRotation, setCurrentRotation] = useState(0);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [mouseMovePositions, setMouseMovePositions] = useState<any[]>([]);
    const [spinZones] = useState<Zone[]>([
        { deg: 0, value: 75000 }, { deg: 15, value: 25000 }, { deg: 30, value: 50000 }, { deg: 45, value: 200000 },
        { deg: 60, value: 10000 }, { deg: 75, value: 100000 }, { deg: 90, value: 25000 }, { deg: 105, value: 50000 },
        { deg: 120, value: 150000 }, { deg: 135, value: 25000 }, { deg: 150, value: "CSŐD" }, { deg: 155, value: 1000000 }, { deg: 160, value: "CSŐD" },
        { deg: 165, value: 75000 }, { deg: 180, value: 10000 }, { deg: 195, value: 100000 }, { deg: 210, value: "DUPLÁZÓ" }, { deg: 225, value: 50000 },
        { deg: 240, value: 10000 }, { deg: 255, value: 250000 }, { deg: 270, value: "FELEZŐ" }, { deg: 285, value: 50000 }, { deg: 300, value: 75000 },
        { deg: 315, value: 100000 }, { deg: 330, value: 50000 }, { deg: 345, value: 150000 }
    ])

    const dispatch = useDispatch();

    useEffect(() => {
        if (isSpinning) {
            setCanSpin(false);
            setTimeout(() => {
                setIsSpinning(false);
                setSpinRotation(0);
                setScreenText(spinnedPrize);
                setScreenShown(true);
                setTimeout(() => {
                    setScreenShown(false);
                }, 3000)
                setTimeout(() => {
                    if (spinnedPrize !== "CSŐD") {
                        dispatch(setStage(GameStage.GUESSING))
                    }
                }, 1500)
            }, 2000)
        }
    }, [isSpinning])

    useEffect(()=>{
        if(game.stage === GameStage.SPINNING){
            setCanSpin(true);
        }
    },[game])

    useEffect(() => {
        if (spinnedPrize === "CSŐD") {
            let toModify: Player = { ...actualPlayer, points: 0 }
            const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
            dispatch(setActualPlayer(players[(currentPlayerIndex + 1) % players.length]))
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));
            setCanSpin(true);
            dispatch(setStage(GameStage.SPINNING))
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
        setMouseMovePositions([])

        return velocity
    }

    const convertDegToZone = (degree: number) => {
        const zoneIndex = spinZones.findIndex(zone => (degree % 360) < zone.deg) - 1

        const zone = spinZones[Math.max(0, zoneIndex)];

        return zone?.value
    }

    type Zone = {
        deg: number,
        value: string | number;
    }

    return (
        <div className="wheelBg" style={{ transform: game.stage === GameStage.SPINNING ? "translate(-50%,0)" : "translate(-50%,-150%)", }}>
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
            <div className="wheelShadow"></div>
            <div className="spinButtons" style={{ pointerEvents: canSpin ? isSpinning ? "none" : "all" : "none", transform: canSpin ? "translate(100%,-50%)" : "translate(0,-50%)" }}>
                <div className="soft spinButton" onClick={() => {
                    const randomSoft = Math.random() * (170 - 50) + 50;
                    setIsSpinning(true);
                    setSpinRotation(wheelRotation + randomSoft);
                    setWheelRotation(wheelRotation + randomSoft)
                    setSpinnedPrize(convertDegToZone(wheelRotation + randomSoft))

                }}>GYENGE</div>
                <div className="medium spinButton" onClick={() => {
                    const randomMedium = Math.random() * (400 - 170) + 170;
                    setIsSpinning(true);
                    setSpinRotation(wheelRotation + randomMedium);
                    setWheelRotation(wheelRotation + randomMedium)
                    setSpinnedPrize(convertDegToZone(wheelRotation + randomMedium))

                }}>KÖZEPES</div>
                <div className="hard spinButton" onClick={() => {
                    const randomHard = Math.random() * (1000 - 500) + 500;
                    setIsSpinning(true);
                    setSpinRotation(wheelRotation + randomHard);
                    setWheelRotation(wheelRotation + randomHard)
                    setSpinnedPrize(convertDegToZone(wheelRotation + randomHard))
                }}>ERŐS</div>
            </div>
        </div>
    )
}