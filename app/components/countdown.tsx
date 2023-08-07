import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/countdown.css"
import { useEffect, useState } from "react";
import { GameStage } from "../types";
import { setFinished, setWon, startEndGame } from "@/redux/slices/endGameSlice";
import { setStage } from "@/redux/slices/gameSlice";
import { setSolving } from "@/redux/slices/selfSlice";

export default function Countdown() {
    const game = useAppSelector(state => state.game)
    const [timeLeft, setTimeLeft] = useState(25);
    const endGame = useAppSelector(state => state.endGame);
    const dispatch = useAppDispatch();
    const [notYet, setNotYet] = useState(true);

    useEffect(() => {
        if (endGame.started) {
            setTimeout(() => {
                let time = 25;
                const interval = setInterval(() => {
                    if (time === 0 || endGame.finished) {
                        clearInterval(interval);
                        dispatch(setFinished());
                        dispatch(setStage(GameStage.OVER));
                        dispatch(setSolving(false))
                        dispatch(setWon(false));
                    } else {
                        time = time - 1;
                        setTimeLeft(time)
                    }
                }, 1000)
            }, 1000)
        }
    }, [endGame.started])

    return (
        <div className="countDown" style={{ transform: game.stage === GameStage.ENDGAME_SOLVING ? "translate(0,0)" : "translate(200%,0)", backgroundColor: timeLeft > 10 ? "#191d4b" : timeLeft > 5 ? "orange" : "red" }}>
            <div>{timeLeft}</div>
        </div>)
}