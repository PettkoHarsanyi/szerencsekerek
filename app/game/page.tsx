"use client"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/game.css"
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import Wheel from "../components/wheel";
import Desk from "../components/desk";
import Screen from "../components/screen";
import RoundTable from "../components/roundTable";
import Swap from "../components/swap";
import { GameStage } from "../types";
import PickLetters from "../components/pickLetters";
import Countdown from "../components/countdown";
import Leaderboard from "../components/leaderboard";
import FreeGame from "../components/freeGame";

export default function Game() {
    const players = useAppSelector(state => state.players);
    const self = useAppSelector(state => state.self)
    const game = useAppSelector(state => state.game)
    const endGame = useAppSelector(state => state.endGame)
    const dispatch = useAppDispatch();
    const [spinnedPrize, setSpinnedPrize] = useState<string | number>(0)    // A forgatott érték, osztozik desk és screen (storeba?)
    const [screenShown, setScreenShown] = useState(false);  // Megjelenítse e az összeget
    const [isSwapping, setIsSwapping] = useState(false);
    const [canSpin, setCanSpin] = useState(true);   // Pörgethető e a kerék
    const ENDLETTERS = ["N", "R", "T", "L", "K", "E", "?", "?", "?", "?"]
    const [endGameLetters, setEndGameLetters] = useState(ENDLETTERS);
    const [vovelsShown, setVovelsShown] = useState(false);  // A magánhangzók mutatva vannak-e

    useEffect(() => {
        window.history.pushState(null, document.title, window.location.href);
        window.addEventListener('popstate', function (event) {
            window.history.pushState(null, document.title, window.location.href);
        });
    }, [])


    useEffect(() => {
        dispatch(setActualPlayer(players[0]))
        if (players.length === 1 && game.stage === GameStage.PLACEMENT) {
            redirect("/");
        }
    }, [])

    useEffect(() => {
        console.log(endGameLetters);
    }, [endGameLetters]);



    return (
        <div className="gamePage" style={{ overflow: "hidden" }}>
            <div id="fadeOutDiv" className="fadeOutDark"></div>
            <div className="solveFade" id="solveFade" style={{ opacity: self.isSolving ? "0.9" : "0" }} />
            <Swap isSwapping={isSwapping} setIsSwapping={setIsSwapping} setCanSpin={setCanSpin} />
            <Desk spinnedPrize={spinnedPrize} screenShown={screenShown} endGameLetters={endGameLetters} vovelsShown={vovelsShown} setVovelsShown={setVovelsShown}/>
            <PickLetters />
            <Screen spinnedPrize={spinnedPrize} setCanSpin={setCanSpin} />
            <Wheel setScreenShown={setScreenShown} setSpinnedPrize={setSpinnedPrize} setIsSwapping={setIsSwapping} canSpin={canSpin} setCanSpin={setCanSpin} />
            <RoundTable />
            <Countdown />
            {endGame.finished ?
                <Leaderboard />
                :
                ""
            }
            <FreeGame setVovelsShown={setVovelsShown}/>
        </div >
    )
}